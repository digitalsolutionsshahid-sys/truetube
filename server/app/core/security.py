import ipaddress
import re
import socket
import urllib.parse
from urllib.parse import urlparse

class SecurityValidationError(ValueError):
    """Raised when URL or input fails security validation."""
    pass

class SSRFBlockedError(SecurityValidationError):
    """Raised when URL attempts to target loopback or private network."""
    pass

# Forbidden IP networks for SSRF protection
BLOCKED_NETWORKS = [
    ipaddress.ip_network("0.0.0.0/8"),
    ipaddress.ip_network("10.0.0.0/8"),
    ipaddress.ip_network("100.64.0.0/10"),
    ipaddress.ip_network("127.0.0.0/8"),
    ipaddress.ip_network("169.254.0.0/16"),
    ipaddress.ip_network("172.16.0.0/12"),
    ipaddress.ip_network("192.0.0.0/24"),
    ipaddress.ip_network("192.0.2.0/24"),
    ipaddress.ip_network("192.88.99.0/24"),
    ipaddress.ip_network("192.168.0.0/16"),
    ipaddress.ip_network("198.18.0.0/15"),
    ipaddress.ip_network("198.51.100.0/24"),
    ipaddress.ip_network("203.0.113.0/24"),
    ipaddress.ip_network("224.0.0.0/4"),
    ipaddress.ip_network("240.0.0.0/4"),
    ipaddress.ip_network("::1/128"),
    ipaddress.ip_network("fc00::/7"),
    ipaddress.ip_network("fe80::/10"),
]

# Dangerous ports commonly used for internal services, management, or databases
DANGEROUS_PORTS = {
    21, 22, 23, 25, 53, 69, 110, 135, 137, 138, 139, 143, 445,
    1433, 1521, 2375, 2376, 3306, 3389, 5432, 5900, 6379, 9200, 11211, 27017,
}

WINDOWS_RESERVED_NAMES = {
    "CON", "PRN", "AUX", "NUL",
    "COM1", "COM2", "COM3", "COM4", "COM5", "COM6", "COM7", "COM8", "COM9",
    "LPT1", "LPT2", "LPT3", "LPT4", "LPT5", "LPT6", "LPT7", "LPT8", "LPT9",
}

def is_ip_blocked(ip_obj: ipaddress.IPv4Address | ipaddress.IPv6Address) -> bool:
    """Check if IP address is private, loopback, link-local, or reserved."""
    if (
        ip_obj.is_private
        or ip_obj.is_loopback
        or ip_obj.is_link_local
        or ip_obj.is_multicast
        or ip_obj.is_reserved
        or ip_obj.is_unspecified
    ):
        return True

    for net in BLOCKED_NETWORKS:
        if ip_obj in net:
            return True
    return False

def validate_and_sanitize_url(raw_url: str) -> str:
    """
    Validates URL scheme, domain, port, and prevents SSRF attacks.
    Returns cleaned URL or raises SecurityValidationError or SSRFBlockedError.
    """
    if not raw_url or not isinstance(raw_url, str):
        raise SecurityValidationError("URL cannot be empty.")

    clean_url = raw_url.strip()

    parsed = urlparse(clean_url)

    if parsed.scheme.lower() not in ("http", "https"):
        raise SecurityValidationError(f"Invalid URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted.")

    # Disallow URLs with embedded credentials (e.g. http://user:pass@example.com)
    if parsed.username or parsed.password:
        raise SecurityValidationError("URLs with embedded credentials (user:password@) are strictly prohibited.")

    hostname = parsed.hostname
    if not hostname:
        raise SecurityValidationError("URL must include a valid hostname.")

    # Block disallowed ports
    if parsed.port and parsed.port in DANGEROUS_PORTS:
        raise SecurityValidationError(f"Port {parsed.port} is blocked for security reasons.")

    hostname_lower = hostname.lower()

    # Block obvious local keywords and special TLDs
    if hostname_lower in ("localhost", "127.0.0.1", "::1", "0.0.0.0", "::", "localhost.localdomain") or \
       hostname_lower.endswith(".localhost") or \
       hostname_lower.endswith(".local") or \
       hostname_lower.endswith(".internal"):
        raise SSRFBlockedError("Access to local network resources is strictly prohibited.")

    # Check for integer/hex IPv4 representation (e.g. http://2130706433 or 0x7f000001)
    ip_int = None
    if hostname_lower.isdigit():
        try:
            ip_int = int(hostname_lower)
        except ValueError:
            pass
    elif hostname_lower.startswith("0x"):
        try:
            ip_int = int(hostname_lower, 16)
        except ValueError:
            pass

    if ip_int is not None and 0 <= ip_int <= 0xFFFFFFFF:
        try:
            ip_obj = ipaddress.IPv4Address(ip_int)
            if is_ip_blocked(ip_obj):
                raise SSRFBlockedError(f"Access to private/loopback IP {ip_obj} is prohibited.")
            return clean_url
        except ipaddress.AddressValueError:
            pass

    # Check if hostname is an IP literal
    try:
        ip_obj = ipaddress.ip_address(hostname_lower)
        if is_ip_blocked(ip_obj):
            raise SSRFBlockedError(f"Access to private/loopback IP {hostname} is prohibited.")
        return clean_url
    except ValueError:
        # Hostname is a domain name, not an IP literal
        pass

    # Resolve domain to IP to detect DNS rebinding / internal routing with strict timeout
    try:
        orig_timeout = socket.getdefaulttimeout()
        socket.setdefaulttimeout(3.0)
        try:
            addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
            for _, _, _, _, sockaddr in addr_info:
                ip_str = sockaddr[0]
                ip_obj = ipaddress.ip_address(ip_str)
                if is_ip_blocked(ip_obj):
                    raise SSRFBlockedError(f"Domain resolves to private/loopback IP {ip_str}, request denied.")
        finally:
            socket.setdefaulttimeout(orig_timeout)
    except SSRFBlockedError:
        raise
    except (socket.gaierror, socket.herror, TimeoutError, OSError, UnicodeError):
        # Allow extraction flow to proceed or fail downstream gracefully
        pass

    return clean_url

def sanitize_filename(filename: str, fallback_ext: str = "mp4") -> str:
    """
    Sanitizes filename removing directory traversal characters, invalid OS symbols,
    and Windows reserved device names (CON, NUL, AUX, etc.).
    """
    if not filename:
        return f"truetube_download.{fallback_ext}"

    name = filename.replace("\0", "")

    # Strip directory traversal sequences
    name = re.sub(r'\.{2,}', '', name)

    # Replace path separators
    name = name.replace("/", "_").replace("\\", "_")

    # Remove dangerous Windows/Unix forbidden characters: <>:"/\|?*
    name = re.sub(r'[<>:"/\\|?*]', "", name)

    # Strip control characters
    name = re.sub(r'[\x00-\x1f\x7f-\x9f]', "", name)

    # Trim leading/trailing whitespace, underscores, and dots
    name = name.strip(". _")

    if not name:
        name = "truetube_media"

    # Check for Windows reserved names (CON, PRN, AUX, NUL, COM1-9, LPT1-9)
    stem = name.split(".")[0].upper()
    if stem in WINDOWS_RESERVED_NAMES:
        name = f"truetube_{name}"

    # Truncate to maximum 200 characters to prevent filesystem limits
    if len(name) > 200:
        base, sep, ext = name.rpartition(".")
        if sep and len(ext) <= 6:
            name = base[:190] + "." + ext
        else:
            name = name[:200]

    return name

def make_content_disposition(filename: str, disposition_type: str = "attachment") -> str:
    """
    Constructs an RFC 6266 / RFC 5987 compliant Content-Disposition header value
    that safely supports non-ASCII characters, emojis, and international titles
    without crashing Starlette's latin-1 HTTP header encoder.
    """
    # 1. ASCII fallback for legacy HTTP clients: remove non-ASCII chars and quotes
    ascii_name = re.sub(r"[^\x20-\x7E]", "", filename).replace('"', "").strip()
    if not ascii_name or ascii_name.startswith("."):
        ascii_name = "media_download"
        if "." in filename:
            ext = filename.rsplit(".", 1)[-1]
            ascii_name = f"media_download.{ext}"

    # 2. RFC 5987 percent-encoded UTF-8 filename for all modern browsers
    encoded_name = urllib.parse.quote(filename, encoding="utf-8")

    if encoded_name != filename:
        return f'{disposition_type}; filename="{ascii_name}"; filename*=UTF-8\'\'{encoded_name}'
    return f'{disposition_type}; filename="{ascii_name}"'


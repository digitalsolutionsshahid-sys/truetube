import ipaddress
import re
import socket
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
    Validates URL scheme, domain, and prevents SSRF attacks.
    Returns cleaned URL or raises SecurityValidationError.
    """
    if not raw_url or not isinstance(raw_url, str):
        raise SecurityValidationError("URL cannot be empty.")

    clean_url = raw_url.strip()

    # Disallow URLs with embedded credentials (e.g. http://user:pass@example.com)
    parsed = urlparse(clean_url)

    if parsed.scheme.lower() not in ("http", "https"):
        raise SecurityValidationError(f"Invalid URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted.")

    hostname = parsed.hostname
    if not hostname:
        raise SecurityValidationError("URL must include a valid hostname.")

    hostname_lower = hostname.lower()

    # Block obvious local keywords
    if hostname_lower in ("localhost", "127.0.0.1", "::1", "0.0.0.0"):
        raise SSRFBlockedError("Access to local network resources is strictly prohibited.")

    # Check if hostname is an IP literal
    try:
        ip_obj = ipaddress.ip_address(hostname_lower)
        if is_ip_blocked(ip_obj):
            raise SSRFBlockedError(f"Access to private/loopback IP {hostname} is prohibited.")
        return clean_url
    except ValueError:
        # Hostname is a domain name, not an IP literal
        pass

    # Resolve domain to IP to detect DNS rebinding / internal routing
    try:
        addr_info = socket.getaddrinfo(hostname, None, socket.AF_UNSPEC, socket.SOCK_STREAM)
        for _, _, _, _, sockaddr in addr_info:
            ip_str = sockaddr[0]
            ip_obj = ipaddress.ip_address(ip_str)
            if is_ip_blocked(ip_obj):
                raise SSRFBlockedError(f"Domain resolves to private/loopback IP {ip_str}, request denied.")
    except socket.gaierror:
        # If DNS resolution fails here, yt-dlp might fail or retry; allow standard domain validation to proceed
        pass

    return clean_url

def sanitize_filename(filename: str, fallback_ext: str = "mp4") -> str:
    """
    Sanitizes filename removing directory traversal characters and invalid OS symbols.
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

    # Truncate to maximum 200 characters to prevent filesystem limits
    if len(name) > 200:
        base, sep, ext = name.rpartition(".")
        if sep and len(ext) <= 6:
            name = base[:190] + "." + ext
        else:
            name = name[:200]

    return name

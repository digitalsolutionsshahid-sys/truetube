import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  z: number;
  baseX: number;
  baseY: number;
  baseZ: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  color: string;
}

export const ThreeDScene: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };

    window.addEventListener('resize', handleResize);

    // 3D Camera / Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    let targetRotX = 0;
    let targetRotY = 0;
    let rotX = 0;
    let rotY = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const normX = (e.clientX - rect.left) / width - 0.5;
      const normY = (e.clientY - rect.top) / height - 0.5;
      mouseX = normX * 2;
      mouseY = normY * 2;
      targetRotY = mouseX * 0.35;
      targetRotX = -mouseY * 0.35;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Generate 3D Particles
    const PARTICLE_COUNT = 65;
    const particles: Particle[] = [];
    const colors = ['#6366F1', '#8B5CF6', '#A855F7', '#38BDF8', '#818CF8'];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const x = (Math.random() - 0.5) * 800;
      const y = (Math.random() - 0.5) * 500;
      const z = (Math.random() - 0.5) * 600;
      particles.push({
        x,
        y,
        z,
        baseX: x,
        baseY: y,
        baseZ: z,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 2 + 1.2,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }

    const fov = 420;

    // Render loop
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth camera interpolation
      rotX += (targetRotX - rotX) * 0.05;
      rotY += (targetRotY - rotY) * 0.05;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const projected: { x2d: number; y2d: number; scale: number; p: Particle }[] = [];

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // Animate drift
        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        if (Math.abs(p.x - p.baseX) > 50) p.vx *= -1;
        if (Math.abs(p.y - p.baseY) > 50) p.vy *= -1;
        if (Math.abs(p.z - p.baseZ) > 50) p.vz *= -1;

        // Rotate around Y axis
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;

        // Rotate around X axis
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;

        // 3D Perspective Projection
        const distance = fov + z2;
        if (distance > 10) {
          const scale = fov / distance;
          const x2d = width / 2 + x1 * scale;
          const y2d = height / 2 + y2 * scale;

          projected.push({ x2d, y2d, scale, p });
        }
      }

      // Draw connection lines between nearby particles in 3D
      ctx.lineWidth = 0.8;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const p1 = projected[i];
          const p2 = projected[j];

          const dx = p1.x2d - p2.x2d;
          const dy = p1.y2d - p2.y2d;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            const alpha = (1 - dist / 110) * 0.25 * Math.min(p1.scale, p2.scale);
            ctx.strokeStyle = `rgba(99, 102, 241, ${alpha.toFixed(3)})`;
            ctx.beginPath();
            ctx.moveTo(p1.x2d, p1.y2d);
            ctx.lineTo(p2.x2d, p2.y2d);
            ctx.stroke();
          }
        }
      }

      // Draw glowing 3D nodes
      for (let i = 0; i < projected.length; i++) {
        const { x2d, y2d, scale, p } = projected[i];
        const r = Math.max(p.radius * scale, 0.8);
        const alpha = Math.min(Math.max((scale - 0.2) * 1.2, 0.2), 0.9);

        // Glow ring
        ctx.beginPath();
        ctx.arc(x2d, y2d, r * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(99, 102, 241, ${alpha * 0.25})`;
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(x2d, y2d, r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.fill();
        ctx.globalAlpha = 1.0;
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
      <canvas
        ref={canvasRef}
        className="w-full h-full opacity-60 transition-opacity duration-1000"
      />
    </div>
  );
};

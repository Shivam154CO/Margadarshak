import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    opacity: number;
}

interface ParticleBackgroundProps {
    particleCount?: number;
    particleColor?: string;
    particleSpeed?: number;
    className?: string;
}

export default function ParticleBackground({
    particleCount = 50,
    particleColor = '99, 102, 241',
    particleSpeed = 0.5,
    className = '',
}: ParticleBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number>();

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Set canvas size
        const resizeCanvas = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        // Initialize particles
        particlesRef.current = Array.from({ length: particleCount }, () => ({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * particleSpeed,
            vy: (Math.random() - 0.5) * particleSpeed,
            radius: Math.random() * 2 + 1,
            opacity: Math.random() * 0.5 + 0.2,
        }));

        // Mouse move handler
        const handleMouseMove = (e: MouseEvent) => {
            // Calculate mouse position relative to canvas
            const rect = canvas.getBoundingClientRect();
            // Check if mouse is near or inside canvas area (optional optimization)
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                mouseRef.current = {
                    x: e.clientX - rect.left,
                    y: e.clientY - rect.top,
                };
            } else {
                // If mouse is outside, move the target far away so particles don't react
                mouseRef.current = { x: -1000, y: -1000 };
            }
        };
        window.addEventListener('mousemove', handleMouseMove);

        // Animation loop
        const animate = () => {
            if (!canvasRef.current) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            // Optimization: Limit connection distance calculations
            for (let i = 0; i < particles.length; i++) {
                const particle = particles[i];

                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;

                // Bounce off edges
                if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
                if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;

                // Mouse interaction
                const dx = mouse.x - particle.x;
                const dy = mouse.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.x -= (dx / distance) * force * 2;
                    particle.y -= (dy / distance) * force * 2;
                }

                // Draw particle
                ctx.beginPath();
                ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(${particleColor}, ${particle.opacity})`;
                ctx.fill();

                // Draw connections - Optimized loop
                for (let j = i + 1; j < particles.length; j++) {
                    const otherParticle = particles[j];
                    const dx = particle.x - otherParticle.x;
                    const dy = particle.y - otherParticle.y;
                    // Avoid sqrt if possible for distance check, but we need it for opacity
                    const distSq = dx * dx + dy * dy;

                    if (distSq < 10000) { // 100 * 100
                        const dist = Math.sqrt(distSq);
                        ctx.beginPath();
                        ctx.moveTo(particle.x, particle.y);
                        ctx.lineTo(otherParticle.x, otherParticle.y);
                        ctx.strokeStyle = `rgba(${particleColor}, ${(1 - dist / 100) * 0.2})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                    }
                }
            }

            animationFrameRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove); // Removed from canvas, added to window
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, [particleCount, particleColor, particleSpeed]);

    return (
        <canvas
            ref={canvasRef}
            className={`absolute inset-0 ${className}`}
            style={{ pointerEvents: 'none' }}
        />
    );
}

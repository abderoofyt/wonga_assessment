import { useEffect, useRef } from "react";

export default function Confetti({ active }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!active) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const width = (canvas.width = window.innerWidth);
    const height = (canvas.height = window.innerHeight);

    const confettiColors = ["#1a56db", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6"];

    let particles = Array.from({ length: 100 }, () => ({
      x: Math.random() * width,
      y: -20,
      size: 5 + Math.random() * 8,
      color: confettiColors[Math.floor(Math.random() * confettiColors.length)],
      velocityX: Math.random() * 4 - 2,
      velocityY: 2 + Math.random() * 5,
      rotation: Math.random() * 360,
    }));

    let animationFrame;

    const renderLoop = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.setTransform(new DOMMatrix().translate(p.x, p.y).rotate(p.rotation));
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size / 2);

        p.x += p.velocityX;
        p.y += p.velocityY;
        p.rotation += 5;
      });

      ctx.setTransform(1, 0, 0, 1, 0, 0); 

      if (active) {
        animationFrame = requestAnimationFrame(renderLoop);
      }
    };

    renderLoop();
    return () => cancelAnimationFrame(animationFrame);
  }, [active]);

  return active ? (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        pointerEvents: "none",
        zIndex: 9999,
      }}
    />
  ) : null;
}
import React, { useEffect, useRef } from 'react';

interface WaveformVisualizerProps {
  color?: string;
  isExpanded?: boolean;
}

export const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({
  color = '#D4FF00',
  isExpanded = false,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let phase = 0;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerY = height / 2;

      ctx.beginPath();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = color;

      for (let x = 0; x < width; x++) {
        const normX = x / width;
        const envelope = Math.sin(normX * Math.PI);
        const y = centerY + Math.sin(x * 0.15 + phase) * (height * 0.35) * envelope;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      phase += 0.08;
      animId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animId);
  }, [color]);

  return (
    <canvas
      ref={canvasRef}
      width={isExpanded ? 140 : 36}
      height={18}
      className="opacity-80 transition-all duration-300"
    />
  );
};

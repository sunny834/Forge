import { useEffect, useMemo } from "react";

const COLORS = ["#e63946", "#ffd166", "#80ed99", "#4361ee", "#f72585", "#fb8500", "#9d4edd"];

/** Confetti burst + "Great job!" badge. Motion is dropped when the user prefers reduced motion (via CSS). */
export default function Celebration({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDone, 2600);
    return () => clearTimeout(t);
  }, [onDone]);

  const pieces = useMemo(
    () =>
      Array.from({ length: 36 }, (_, i) => ({
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 1.4 + Math.random() * 0.9,
        color: COLORS[i % COLORS.length],
        rotate: Math.random() * 360,
        round: i % 3 === 0,
      })),
    [],
  );

  return (
    <div className="celebration" role="status" aria-live="polite">
      {pieces.map((p, i) => (
        <span
          key={i}
          className="confetti"
          style={{
            left: `${p.left}%`,
            background: p.color,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            transform: `rotate(${p.rotate}deg)`,
            borderRadius: p.round ? "50%" : "3px",
          }}
        />
      ))}
      <div className="great-job">🌟 Great job! 🌟</div>
    </div>
  );
}

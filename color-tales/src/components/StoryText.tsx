import { useEffect, useMemo, useRef, useState } from "react";
import { splitWords, wordAt } from "../lib/words";

const canSpeak = typeof window !== "undefined" && "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;

/** Story text with a "Read to me" button that highlights each word as it is spoken. */
export default function StoryText({ text }: { text: string }) {
  const words = useMemo(() => splitWords(text), [text]);
  const [active, setActive] = useState(-1);
  const [speaking, setSpeaking] = useState(false);
  const utterance = useRef<SpeechSynthesisUtterance | null>(null);

  // Stop talking when the page changes or the reader closes.
  useEffect(() => {
    return () => {
      if (canSpeak) window.speechSynthesis.cancel();
    };
  }, [text]);

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setActive(-1);
  };

  const speak = () => {
    if (speaking) return stop();
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1.1;
    u.onboundary = (e) => {
      if (e.name === undefined || e.name === "word") setActive(wordAt(words, e.charIndex));
    };
    u.onend = u.onerror = () => {
      if (utterance.current === u) {
        setSpeaking(false);
        setActive(-1);
      }
    };
    utterance.current = u;
    setSpeaking(true);
    setActive(0);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="story-text">
      <p>
        {words.map((w, i) => (
          <span key={i} className={i === active ? "word active" : "word"}>
            {w.word}{" "}
          </span>
        ))}
      </p>
      {canSpeak && (
        <button className={`read-btn ${speaking ? "active" : ""}`} onClick={speak} aria-pressed={speaking}>
          <span aria-hidden="true">{speaking ? "⏹️" : "🔊"}</span> {speaking ? "Stop" : "Read to me"}
        </button>
      )}
    </div>
  );
}

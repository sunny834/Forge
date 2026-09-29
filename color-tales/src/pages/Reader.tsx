import { useEffect, useRef } from "react";
import { Link, Navigate, useNavigate, useParams } from "react-router-dom";
import { findBook } from "../content/books";
import ColoringBoard from "../components/ColoringBoard";
import StoryText from "../components/StoryText";

const SWIPE_MIN = 60;

export default function Reader() {
  const { slug, page: pageParam } = useParams();
  const navigate = useNavigate();
  const book = findBook(slug);
  const pageNum = Number(pageParam);
  const swipeStart = useRef<{ x: number; y: number } | null>(null);

  const total = book?.pages.length ?? 0;
  const valid = book && Number.isInteger(pageNum) && pageNum >= 1 && pageNum <= total;

  const go = (n: number) => {
    if (book && n >= 1 && n <= total) navigate(`/book/${book.slug}/${n}`, { replace: true });
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") go(pageNum + 1);
      if (e.key === "ArrowLeft") go(pageNum - 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  if (!book) return <Navigate to="/" replace />;
  if (!valid) return <Navigate to={`/book/${book.slug}/1`} replace />;

  const page = book.pages[pageNum - 1];

  return (
    <main className="reader">
      <header className="reader-header">
        <Link to="/" className="icon-btn" aria-label="Back to library">
          <span aria-hidden="true">🏠</span>
        </Link>
        <h1>{book.title}</h1>
        <span className="page-count">
          {pageNum} / {total}
        </span>
      </header>

      <div
        className="story-panel"
        onPointerDown={(e) => (swipeStart.current = { x: e.clientX, y: e.clientY })}
        onPointerUp={(e) => {
          const s = swipeStart.current;
          swipeStart.current = null;
          if (!s) return;
          const dx = e.clientX - s.x;
          if (Math.abs(dx) > SWIPE_MIN && Math.abs(dx) > Math.abs(e.clientY - s.y)) go(dx < 0 ? pageNum + 1 : pageNum - 1);
        }}
      >
        <StoryText key={`${book.slug}-${pageNum}`} text={page.text} />
      </div>

      <ColoringBoard key={`${book.slug}-${pageNum}`} book={book} page={page} />

      <nav className="page-nav" aria-label="Pages">
        <button className="nav-btn" onClick={() => go(pageNum - 1)} disabled={pageNum === 1} aria-label="Previous page">
          ◀
        </button>
        <div className="dots">
          {book.pages.map((p, i) => (
            <button
              key={p.index}
              className={`dot ${i + 1 === pageNum ? "active" : ""}`}
              onClick={() => go(i + 1)}
              aria-label={`Page ${i + 1}`}
              aria-current={i + 1 === pageNum ? "page" : undefined}
            />
          ))}
        </div>
        {pageNum < total ? (
          <button className="nav-btn" onClick={() => go(pageNum + 1)} aria-label="Next page">
            ▶
          </button>
        ) : (
          <Link to="/" className="nav-btn done" aria-label="The end: back to library">
            🏁
          </Link>
        )}
      </nav>
    </main>
  );
}

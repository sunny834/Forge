import { Link } from "react-router-dom";
import { BOOKS } from "../content/books";
import { completedPages, loadArtwork } from "../lib/storage";
import { ArtThumb } from "../components/Art";

export default function Library() {
  return (
    <main className="library">
      <header className="library-header">
        <h1>
          <span aria-hidden="true">🎨</span> Color Tales
        </h1>
        <p>Pick a story, then color every page!</p>
      </header>
      <ul className="book-grid">
        {BOOKS.map((book) => {
          const done = completedPages(book);
          const cover = book.pages[book.coverPage];
          const coverFills = loadArtwork(book.slug, cover.index).fills;
          const colored = Object.keys(coverFills).length > 0;
          return (
            <li key={book.id}>
              <Link to={`/book/${book.slug}/1`} className="book-card" style={{ background: book.coverColor }}>
                <div className="book-cover">
                  <ArtThumb page={cover} fills={colored ? coverFills : undefined} preview={!colored} />
                </div>
                <div className="book-info">
                  <h2>{book.title}</h2>
                  <div className="book-tags">
                    <span className="tag">
                      Ages {book.ageMin}–{book.ageMax}
                    </span>
                    <span className="tag progress-tag" aria-label={`${done} of ${book.pages.length} pages colored`}>
                      {done === book.pages.length ? "⭐ " : "🖍️ "}
                      {done}/{book.pages.length}
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}

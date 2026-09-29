import { HashRouter, Navigate, Route, Routes } from "react-router-dom";
import Library from "./pages/Library";
import Reader from "./pages/Reader";

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Library />} />
        <Route path="/book/:slug/:page" element={<Reader />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}

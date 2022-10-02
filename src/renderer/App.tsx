import * as React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { List, Tree, Line } from "./pages";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route index element={<List />} />
        <Route path=":repoName/q" element={<Line />} />
        <Route path=":repoName" element={<Tree />} />
      </Routes>
    </Router>
  );
}

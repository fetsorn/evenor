import * as React from "react";
import { HashRouter as Router, Routes, Route } from "react-router-dom";
import { Observatory } from "..";

export default function Root() {
  return (
    <Router>
      <Routes>
        <Route index element={<Observatory />} />
        <Route path=":repoRoute" element={<Observatory />} />
      </Routes>
    </Router>
  );
}

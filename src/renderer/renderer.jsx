import React from "react";
import { createRoot } from "react-dom/client";
import App from "./app";
// import "normalize.css";
// import "./index.css";  // fails with esm
import "./i18n/config";

const container = document.getElementById("root");

if (container) {
  const root = createRoot(container);

  root.render(<App />);
}

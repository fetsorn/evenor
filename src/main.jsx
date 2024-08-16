import React from "react";
import ReactDOM from "react-dom/client";
import { Root } from "./layout/root.jsx";
import "./index.css";
import "core-js/stable";
import "normalize.css";
import "./i18n/config.js";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
);

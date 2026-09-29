import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./style.css";
import "./mobile.css";
import "@fontsource/mina/700.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

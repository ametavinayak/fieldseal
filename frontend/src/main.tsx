import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { DevicePreview } from "./DevicePreview";
import { STANDALONE } from "./mode";
import "./style.css";
import "./mobile.css";
import "@fontsource/mina/700.css";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {(STANDALONE ? window.parent === window && !new URLSearchParams(window.location.search).has("workspace") : new URLSearchParams(window.location.search).has("phone-preview")) ? <DevicePreview /> : <App />}
  </React.StrictMode>,
);

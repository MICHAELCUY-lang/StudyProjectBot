import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { register } from "./serviceWorkerRegistration";

// Impor icon material design
const materialIconsLink = document.createElement("link");
materialIconsLink.href =
  "https://fonts.googleapis.com/icon?family=Material+Icons";
materialIconsLink.rel = "stylesheet";
document.head.appendChild(materialIconsLink);

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById("root")
);

// Registrasi service worker untuk PWA
register();
  
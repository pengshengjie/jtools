import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { invoke } from "@tauri-apps/api/tauri";
import "./styles.css";

import { register } from '@tauri-apps/api/globalShortcut';

register('CmdOrControl+Space', () => {
  invoke("unsize")
  if(typeof window.__resetInputValue === 'function') {
    window.__resetInputValue()
  }
  
  // onChange("")
  console.log('Shortcut triggered');
});

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

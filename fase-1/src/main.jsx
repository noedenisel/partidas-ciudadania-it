import fontURL from "./assets/inter.woff2?inline";
const font=new FontFace("Inter","url("+fontURL+")");font.load().then(f=>document.fonts.add(f)).catch(()=>{});
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
createRoot(document.getElementById("root")).render(<App />);

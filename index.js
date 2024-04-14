import React from "react";
import { createRoot } from 'react-dom/client';
import App from "./src/app/index.js";


const container = document.getElementById("root");
const root = createRoot(container); 
root.render(<App />);
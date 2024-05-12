import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./i18nextInit";
import "bootstrap/dist/css/bootstrap.min.css";
import "antd/dist/antd.min.css";

const container = document.getElementById("root");
const root = createRoot(container); // createRoot(container!) if you use TypeScript

root.render(<App />);

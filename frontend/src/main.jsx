import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./css/index.css";
import "@mantine/core/styles.layer.css";
import App from "./App.jsx";
import { MantineProvider } from "@mantine/core";
//import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById("app")).render(
  <StrictMode>
    <BrowserRouter>
      <MantineProvider withGlobalStyles withNormalizeCSS>
        <App />
      </MantineProvider>
    </BrowserRouter>
  </StrictMode>
);

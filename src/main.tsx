import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { App } from "./App";
import { Provider } from "./state";
import "./styles.css";

const root = document.getElementById("root");
if (root) {
  createRoot(root).render(
    <StrictMode>
      <Provider>
        <App />
      </Provider>
      <SpeedInsights />
    </StrictMode>,
  );
}

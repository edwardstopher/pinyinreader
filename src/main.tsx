import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
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
    </StrictMode>,
  );
}

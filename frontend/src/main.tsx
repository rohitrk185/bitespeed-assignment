import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router";
import App from "./App";
import "./index.css";
import "@xyflow/react/dist/style.css";
import { NodeProvider } from "./contexts/NodesContext";

const root = document.getElementById("root");

if (!root) {
  throw new Error("Root element not found");
}

ReactDOM.createRoot(root).render(
  <BrowserRouter>
    <NodeProvider>
      <App />
    </NodeProvider>
  </BrowserRouter>
);

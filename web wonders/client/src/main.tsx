import { createRoot } from "react-dom/client";
import Root from "./app/Root.tsx";
import { AuthProvider } from "./context/AuthContext.tsx";
import "./styles/index.css";

createRoot(document.getElementById("root")!).render(
  <AuthProvider>
    <Root />
  </AuthProvider>
);

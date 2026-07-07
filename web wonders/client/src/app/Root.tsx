import { useAuth } from "../context/AuthContext";
import AuthPage from "./AuthPage";
import App from "./App";

export default function Root() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!user) return <AuthPage />;

  return <App />;
}

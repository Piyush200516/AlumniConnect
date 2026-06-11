import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/layout/AuthProvider";
import { AuthRoutes } from "./routes/AuthRoutes";
import { Toaster } from "sonner";

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AuthRoutes />
        <Toaster position="top-right" />
      </AuthProvider>
    </Router>
  );
}

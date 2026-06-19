import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/layout/AuthProvider";
import { AuthRoutes } from "./routes/AuthRoutes";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <AuthRoutes />
          <Toaster position="top-right" />
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

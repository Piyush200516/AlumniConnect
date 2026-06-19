import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/layout/AuthProvider";
import { SocketProvider } from "./components/layout/SocketProvider";
import { AuthRoutes } from "./routes/AuthRoutes";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <AuthProvider>
          <SocketProvider>
            <AuthRoutes />
            <Toaster position="top-right" />
          </SocketProvider>
        </AuthProvider>
      </Router>
    </QueryClientProvider>
  );
}

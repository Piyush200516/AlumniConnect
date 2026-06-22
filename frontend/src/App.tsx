import { BrowserRouter as Router } from "react-router-dom";
import { AuthProvider } from "./components/layout/AuthProvider";
import { SocketProvider } from "./components/layout/SocketProvider";
import { AuthRoutes } from "./routes/AuthRoutes";
import { Toaster } from "sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false, // Prevents duplicate API calls on window focus
      retry: 2, // Auto-retry failed queries twice
      staleTime: 5 * 60 * 1000, // 5 minutes default cache stale time
    },
  },
});

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

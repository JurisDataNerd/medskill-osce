import React from "react";
import ReactDOM from "react-dom/client";

import "./index.css";

import App from "@/app/App";
import { AuthProvider } from "@/context/AuthProvider";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <QueryClientProvider client={queryClient}>
      <AuthProvider>

        <App />

      </AuthProvider>

    </QueryClientProvider>
  </React.StrictMode>
);
import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App.tsx";
// Asumiendo que ThemeProvider se creará en esta ruta
// import { ThemeProvider } from "./components/theme-provider.tsx";
import "./core/lib/i18n.ts"; // Asumiendo que este archivo existe
import "./index.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
]);

import { ThemeProvider } from "@/context/theme.context.tsx";

import { Toaster } from "@/components/ui/sonner";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Suspense fallback="...loading">
      <ThemeProvider>
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </Suspense>
  </StrictMode>,
);

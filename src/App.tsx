import MainLayout from "./layouts/MainLayout";
import { useVaultStore } from "./store/vault.store";
import HomePage from "./pages/HomePage";
import NotesDashboard from "./features/notes/components/NotesDashboard";

import { useEffect } from "react";

function App() {
  const { isAuthenticated, initialize } = useVaultStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (isAuthenticated) {
    return (
      <MainLayout>
        <HomePage />
      </MainLayout>
    );
  }

  return <NotesDashboard />;
}

export default App;

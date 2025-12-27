import MainLayout from "./layouts/MainLayout";
import { useVaultStore } from "./store/vault.store";
import HomePage from "./pages/HomePage";
import NotesDashboard from "./features/notes/components/NotesDashboard";

import { useEffect } from "react";
import { ChameleonRemote } from "./features/chameleon/logic/ChameleonRemote";
import { ProposalOverlay } from "@/features/proposal/components/ProposalOverlay";
import { useEternitySync } from "@/features/proposal/hooks/useEternitySync";
import { notificationService } from "./services/NotificationService";

function App() {
  const { isAuthenticated, initialize } = useVaultStore();

  useEffect(() => {
    initialize();

    // Initialize Notifications (Android focus)
    notificationService.initialize();

    // GLOBAL SYNC: Listen to Supabase for identity changes
    ChameleonRemote.subscribe();
  }, [initialize]);

  // ETERNITY PROTOCOL: Initialize Proposal Sync
  useEternitySync();

  if (isAuthenticated) {
    return (
      <MainLayout>
        <HomePage />
      </MainLayout>
    );
  }

  return (
    <>
      <ProposalOverlay />
      <NotesDashboard />
    </>
  );
}

export default App;

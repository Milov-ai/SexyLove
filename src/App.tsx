import BiometricGuard from "./components/common/BiometricGuard";
import { useVaultStore } from "./store/vault.store";
import MainLayout from "./layouts/MainLayout";
import HomePage from "./pages/HomePage";
import AuthScreen from "./features/auth/components/AuthScreen";

import { useEffect, useState } from "react";
import { ChameleonRemote } from "./features/chameleon/logic/ChameleonRemote";
import { ProposalOverlay } from "@/features/proposal/components/ProposalOverlay";
import { useEternitySync } from "@/features/proposal/hooks/useEternitySync";
import { notificationService } from "./services/NotificationService";
import { App as CapacitorApp } from "@capacitor/app";
import { supabase } from "@/lib/supabase";

function App() {
  const { isAuthenticated, initialize } = useVaultStore();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    const init = async () => {
      await initialize();
      setIsInitializing(false);
    };
    init();

    // Initialize Notifications (Android focus)
    notificationService.initialize();

    // GLOBAL SYNC: Listen to Supabase for identity changes
    ChameleonRemote.subscribe();

    // CAPACITOR DEEP LINK HANDLER: OAuth Callback Support
    // This listener handles URLs when the app is opened via deep link (e.g., OAuth redirect)
    const setupDeepLinkListener = async () => {
      const { remove } = await CapacitorApp.addListener(
        "appUrlOpen",
        async (data) => {
          console.log("[App] Deep link opened:", data.url);

          // Check if this is an OAuth callback
          // Supabase OAuth redirects look like: com.sexylove.app://login-callback#access_token=...
          // Or: https://yourapp.com/auth/callback#access_token=...
          if (
            data.url.includes("access_token") ||
            data.url.includes("refresh_token")
          ) {
            try {
              // Extract the fragment (everything after #)
              const url = new URL(
                data.url.replace(
                  "com.sexylove.app://",
                  "https://placeholder.com/",
                ),
              );
              const hashParams = new URLSearchParams(url.hash.substring(1));

              const accessToken = hashParams.get("access_token");
              const refreshToken = hashParams.get("refresh_token");

              if (accessToken && refreshToken) {
                // Set the session in Supabase
                const { error } = await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

                if (error) {
                  console.error(
                    "[App] Error setting session from deep link:",
                    error,
                  );
                } else {
                  console.log(
                    "[App] Successfully authenticated via deep link!",
                  );
                  // The auth state change listener in vault.store will handle the rest
                }
              }
            } catch (err) {
              console.error("[App] Error parsing deep link:", err);
            }
          }
        },
      );

      // Return cleanup function
      return remove;
    };

    let cleanupDeepLink: (() => Promise<void>) | undefined;
    setupDeepLinkListener().then((cleanup) => {
      cleanupDeepLink = cleanup;
    });

    return () => {
      cleanupDeepLink?.();
    };
  }, [initialize]);

  // ETERNITY PROTOCOL: Initialize Proposal Sync
  useEternitySync();

  // Show nothing while initializing (prevents flash)
  if (isInitializing) {
    return null;
  }

  // SECURITY: Login First - No data/UI until authenticated
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // Authenticated: Show Vault with Biometric Guard
  return (
    <>
      <ProposalOverlay />
      <BiometricGuard>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </BiometricGuard>
    </>
  );
}

export default App;

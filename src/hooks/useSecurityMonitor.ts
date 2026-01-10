/**
 * Security Monitor Hook
 * Detects tampering with security-critical DOM components (e.g., BiometricGuard).
 * If the security overlay is removed via DevTools or other means, forces logout and cache clear.
 */

import { useEffect, useRef, useCallback } from "react";
import { supabase } from "@/lib/supabase";

interface SecurityMonitorOptions {
  /** CSS selector for the critical security element to monitor */
  targetSelector: string;
  /** Whether the monitor is currently active */
  enabled?: boolean;
  /** Callback to execute before forced lockdown */
  onTamperDetected?: () => void;
}

/**
 * Monitors a critical security DOM element for removal/tampering.
 * If the element is removed from the DOM (e.g., via DevTools), forces security lockdown.
 */
export const useSecurityMonitor = (options: SecurityMonitorOptions) => {
  const { targetSelector, enabled = true, onTamperDetected } = options;
  const observerRef = useRef<MutationObserver | null>(null);
  const targetRef = useRef<Element | null>(null);
  const hasLoggedWarning = useRef(false);

  const forceLockdown = useCallback(async () => {
    console.error("[SECURITY] 🚨 TAMPERING DETECTED! Forcing lockdown...");

    // Execute custom callback first
    onTamperDetected?.();

    try {
      // Sign out the user
      await supabase.auth.signOut();

      // Clear all storage
      localStorage.clear();
      sessionStorage.clear();

      // Clear all cookies
      document.cookie.split(";").forEach((cookie) => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
      });

      // Clear IndexedDB if available
      if ("indexedDB" in window) {
        const databases = await indexedDB.databases?.();
        if (databases) {
          for (const db of databases) {
            if (db.name) indexedDB.deleteDatabase(db.name);
          }
        }
      }

      // Force reload to clean slate
      window.location.reload();
    } catch (error) {
      console.error("[SECURITY] Error during lockdown:", error);
      // Force reload even on error
      window.location.reload();
    }
  }, [onTamperDetected]);

  useEffect(() => {
    // If not enabled, don't set up monitoring
    if (!enabled) {
      observerRef.current?.disconnect();
      return;
    }

    // Find the target element
    const target = document.querySelector(targetSelector);
    if (!target) {
      // Only log the warning once to prevent spam
      if (!hasLoggedWarning.current) {
        console.debug(
          `[SECURITY] Waiting for target element "${targetSelector}"...`,
        );
        hasLoggedWarning.current = true;
      }
      return;
    }

    // Reset warning flag when element is found
    hasLoggedWarning.current = false;
    targetRef.current = target;

    // Create mutation observer to watch for removal
    observerRef.current = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        // Check if our target was removed
        for (const removedNode of mutation.removedNodes) {
          if (
            removedNode === targetRef.current ||
            (removedNode instanceof Element &&
              removedNode.contains(targetRef.current))
          ) {
            console.error("[SECURITY] 🚨 Security component removed from DOM!");
            forceLockdown();
            return;
          }
        }
      }
    });

    // Observe the document body for child list changes
    observerRef.current.observe(document.body, {
      childList: true,
      subtree: true,
    });

    return () => {
      observerRef.current?.disconnect();
    };
  }, [targetSelector, enabled, forceLockdown]);

  return { forceLockdown };
};

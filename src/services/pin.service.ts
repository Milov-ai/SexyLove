/**
 * PIN Authentication Service
 * Stores PIN in Supabase user_metadata for server-side security
 */

import { supabase } from "@/lib/supabase";

// Simple hash function for PIN (client-side obfuscation)
// Note: Server-side Supabase handles actual encryption at rest
async function hashPin(pin: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + "SexyLove_Salt_2024");
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export interface PinMetadata {
  pin?: string;
  pin_attempts?: number;
  pin_total_attempts?: number;
  lockout_until?: string;
  biometric_enabled?: boolean;
}

class PinService {
  /**
   * Get the current user's PIN metadata
   */
  async getPinMetadata(): Promise<PinMetadata | null> {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      pin: user.user_metadata?.pin,
      pin_attempts: user.user_metadata?.pin_attempts || 0,
      pin_total_attempts: user.user_metadata?.pin_total_attempts || 0,
      lockout_until: user.user_metadata?.lockout_until,
      biometric_enabled: user.user_metadata?.biometric_enabled ?? true,
    };
  }

  /**
   * Check if user has a PIN set
   */
  async hasPin(): Promise<boolean> {
    const metadata = await this.getPinMetadata();
    return !!metadata?.pin;
  }

  /**
   * Set or update the user's PIN
   */
  async setPin(pin: string): Promise<boolean> {
    try {
      const hashedPin = await hashPin(pin);

      const { error } = await supabase.auth.updateUser({
        data: {
          pin: hashedPin,
          pin_attempts: 0,
          pin_total_attempts: 0,
          lockout_until: null,
        },
      });

      if (error) {
        console.error("[PinService] Error setting PIN:", error);
        return false;
      }

      return true;
    } catch (error) {
      console.error("[PinService] Error setting PIN:", error);
      return false;
    }
  }

  /**
   * Verify a PIN against the stored hash
   * @returns { valid: boolean, forceLogout: boolean }
   */
  async verifyPin(
    inputPin: string,
  ): Promise<{ valid: boolean; forceLogout: boolean }> {
    const metadata = await this.getPinMetadata();
    if (!metadata?.pin) return { valid: false, forceLogout: false };

    // Check if locked out
    if (await this.isLockedOut()) {
      return { valid: false, forceLogout: false };
    }

    const inputHash = await hashPin(inputPin);
    const isValid = inputHash === metadata.pin;

    if (isValid) {
      // Reset attempts on success
      await this.resetAttempts();
      return { valid: true, forceLogout: false };
    } else {
      // Increment failed attempts - may return forceLogout signal
      const shouldForceLogout = await this.incrementFailedAttempts();
      return { valid: false, forceLogout: shouldForceLogout };
    }
  }

  /**
   * Check if user is currently locked out
   */
  async isLockedOut(): Promise<boolean> {
    const metadata = await this.getPinMetadata();
    if (!metadata?.lockout_until) return false;

    const lockoutTime = new Date(metadata.lockout_until);
    return lockoutTime > new Date();
  }

  /**
   * Get remaining lockout time in seconds
   */
  async getLockoutRemaining(): Promise<number> {
    const metadata = await this.getPinMetadata();
    if (!metadata?.lockout_until) return 0;

    const lockoutTime = new Date(metadata.lockout_until);
    const now = new Date();
    const remaining = Math.max(
      0,
      Math.ceil((lockoutTime.getTime() - now.getTime()) / 1000),
    );
    return remaining;
  }

  /**
   * Get current failed attempt count
   */
  async getFailedAttempts(): Promise<number> {
    const metadata = await this.getPinMetadata();
    return metadata?.pin_attempts || 0;
  }

  /**
   * Increment failed attempts (called on wrong PIN)
   * @returns true if user should be forced to logout (max failures reached)
   */
  async incrementFailedAttempts(): Promise<boolean> {
    const metadata = await this.getPinMetadata();
    const attempts = (metadata?.pin_attempts || 0) + 1;
    const totalAttempts = (metadata?.pin_total_attempts || 0) + 1;

    const MAX_TOTAL_FAILURES = 10;

    // Check if max total failures reached
    if (totalAttempts >= MAX_TOTAL_FAILURES) {
      // Reset counters before logout
      await supabase.auth.updateUser({
        data: {
          pin_attempts: 0,
          pin_total_attempts: 0,
          lockout_until: null,
        },
      });
      return true; // Signal to force logout
    }

    // Lockout after 5 attempts (30 seconds)
    let lockoutUntil = null;
    if (attempts >= 5) {
      const lockoutDuration = 30 * 1000; // 30 seconds
      lockoutUntil = new Date(Date.now() + lockoutDuration).toISOString();
    }

    await supabase.auth.updateUser({
      data: {
        pin_attempts: attempts,
        pin_total_attempts: totalAttempts,
        lockout_until: lockoutUntil,
      },
    });

    return false;
  }

  /**
   * Reset attempts (called on successful PIN)
   */
  private async resetAttempts(): Promise<void> {
    await supabase.auth.updateUser({
      data: {
        pin_attempts: 0,
        lockout_until: null,
      },
    });
  }

  /**
   * Enable or disable biometric authentication
   */
  async setBiometricEnabled(enabled: boolean): Promise<void> {
    await supabase.auth.updateUser({
      data: {
        biometric_enabled: enabled,
      },
    });
  }

  /**
   * Check if biometric is enabled for this user
   */
  async isBiometricEnabled(): Promise<boolean> {
    const metadata = await this.getPinMetadata();
    return metadata?.biometric_enabled ?? true;
  }
}

export const pinService = new PinService();

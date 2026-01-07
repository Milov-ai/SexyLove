import { NativeBiometric } from "capacitor-native-biometric";

export interface BiometricAvailability {
  available: boolean;
  biometryType?: string;
  error?: string;
}

class BiometricService {
  /**
   * Check if biometric hardware is present and user has enrolled
   */
  async checkAvailability(): Promise<BiometricAvailability> {
    try {
      const result = await NativeBiometric.isAvailable();
      return {
        available: result.isAvailable,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        biometryType: result.biometryType as any,
      };
    } catch (error) {
      console.error("Biometric availability check failed:", error);
      return { available: false, error: "Biometric unavailable" };
    }
  }

  /**
   * Prompt user for biometric authentication
   */
  async verifyIdentity(): Promise<boolean> {
    try {
      // Optional: Check availability first to avoid errors
      const { available } = await this.checkAvailability();
      if (!available) return false;

      await NativeBiometric.verifyIdentity({
        reason: "Verificación de seguridad requerida",
        title: "Acceso Seguro",
        subtitle: "Verifica tu identidad para acceder al Vault",
        description: "Usa tu huella o rostro para continuar",
      });

      return true;
    } catch (error) {
      console.warn("Biometric verification failed or cancelled:", error);
      return false;
    }
  }

  /**
   * Get formatted name of the biometric type (e.g., "Face ID", "Touch ID", "Fingerprint")
   */
  async getBiometryName(): Promise<string> {
    try {
      const { biometryType } = await this.checkAvailability();
      // Compare with string values if NativeBiometric enum is not directly available/compatible
      const type = String(biometryType);

      if (type === "TOUCHID") return "Touch ID";
      if (type === "FACEID") return "Face ID";
      if (type === "FINGERPRINT") return "Huella Digital";
      if (type === "FACE_AUTHENTICATION") return "Desbloqueo Facial";
      if (type === "IRIS_AUTHENTICATION") return "Escáner de Iris";

      return "Biometría";
    } catch {
      return "Biometría";
    }
  }
}

export const biometricService = new BiometricService();

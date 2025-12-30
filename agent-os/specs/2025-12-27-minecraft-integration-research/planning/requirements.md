# Spec Requirements: Minecraft Integration Research

## Initial Description

> Verificar posibilidad de integrar minecraft a la app, sin que sea invasivo o inseguro y que pueda jugar mi novia y yo en disferentes dispositivos en la misma app pero diferente dispositivo, sin registrarse o etc

**Refined (English):**
Investigate integrating a Minecraft-like game into the SexyLove app. Requirements: Non-invasive, secure, multiplayer (2 players on separate devices), no external registration required, ability to set a custom username, and data persistence.

**User-specified Library:**
`https://github.com/zardoy/minecraft-web-client.git`

---

## Security Assessment

### 1. Repository Overview

| Metric              | Value               |
| ------------------- | ------------------- |
| **License**         | MIT                 |
| **Stars**           | 213 ⭐              |
| **Forks**           | 137                 |
| **Releases**        | 100                 |
| **Last Commit**     | Actively Maintained |
| **CVEs/Advisories** | **None published**  |

### 2. Dependency Stack Analysis

| Dependency              | Purpose                       | Notes                                          |
| ----------------------- | ----------------------------- | ---------------------------------------------- |
| **React**               | UI Framework                  | ✅ Standard, well-audited                      |
| **Three.js**            | 3D Rendering                  | ✅ Mature, widely used                         |
| **PeerJS**              | P2P WebRTC Signaling          | ⚠️ Uses external signaling server              |
| **Mineflayer**          | Minecraft Protocol (Node.js)  | ⚠️ For connecting to **external** Java servers |
| **Flying Squid (Fork)** | Integrated offline/P2P server | ✅ Runs locally in browser                     |

### 3. Security Verdict

| Risk Category         | Rating      | Justification                                                                   |
| --------------------- | ----------- | ------------------------------------------------------------------------------- |
| **Code Injection**    | ✅ Low      | TypeScript, standard web tooling. No `eval()` or dynamic code execution.        |
| **Data Privacy**      | ✅ Low      | All game data stored locally (IndexedDB, LocalStorage). No mandatory telemetry. |
| **Network Traffic**   | ⚠️ Moderate | P2P uses PeerJS public signaling. Custom signaling possible.                    |
| **3rd Party Servers** | ⚠️ Moderate | Allows connecting to external Minecraft Java servers (optional, not required).  |

**Overall Recommendation:** **SAFE FOR INTEGRATION** with customizations:

1.  **Disable or hide external server connection UI** to prevent uncontrolled network requests.
2.  **Self-host PeerJS signaling** (or use Supabase Realtime) for P2P discovery instead of public relays.
3.  **Audit resource pack loading** if enabled, as it can load external assets.

---

## Requirements Discussion (Finalized)

| #   | Pregunta                   | Respuesta                                                                                                         |
| --- | -------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| 1   | **Controles Táctiles**     | Usar los controles integrados de la librería (joysticks/botones). Ajustar después si es necesario.                |
| 2   | **Nombre de Usuario**      | Mostrar un campo de texto para ingresar el nombre **al iniciar el juego**.                                        |
| 3   | **Persistencia de Mundos** | Guardado **local** en el dispositivo. El enfoque principal es conectarse a servidores externos (Aternos).         |
| 4   | **Ubicación en la App**    | Acceso desde la **Fachada Pública**: escribir `minecraft` en el buscador de notas (similar a Chameleon).          |
| 5   | **Conexión a Servidores**  | ✅ **Habilitada**. Conexión a servidores de Minecraft Java (como Aternos) a través del proxy WebSocket integrado. |

### Detalles Adicionales

- **Trigger de Acceso:** Igual que el Chameleon, buscar "minecraft" en la barra de búsqueda de notas mostrará la opción de abrir el juego.
- **Servidores Externos:** El usuario planea usar **Aternos** (servidores gratuitos de Minecraft Java). La librería soporta esto nativamente vía proxy.
- **P2P:** No es necesario para el caso de uso actual (Aternos actúa como servidor central).

---

## Visual Assets

_Folder checked: `agent-os/specs/2025-12-27-minecraft-integration-research/planning/visuals/`_

**Status:** No visual assets provided.

---

## Technical Feasibility Summary

### Pros of `minecraft-web-client`

- ✅ **MIT License:** Full commercial use allowed.
- ✅ **React-based:** Aligns with SexyLove's tech stack.
- ✅ **Built-in P2P:** Uses PeerJS for multiplayer over internet without a dedicated server.
- ✅ **Mobile Controls:** First-class touch support with on-screen joysticks/buttons.
- ✅ **Offline Mode:** Runs entirely in-browser with no backend required.
- ✅ **World Export/Import:** Users can save/load `.zip` world files.

### Cons / Integration Challenges

- ⚠️ **Large Codebase:** Full clone is significant (many dependencies).
- ⚠️ **External Server UI:** Needs to be disabled/hidden to prevent "escape hatch" to public internet.
- ⚠️ **PeerJS Signaling:** Relies on `peerjs.com` for WebRTC discovery; should self-host or use Supabase channels.
- ⚠️ **Versioning:** Tracks Minecraft version changes; may need updates.

---

## Existing Code to Reference

- **`Geografía del Deseo` (Maps):** Uses MapLibre GL + real-time state. Potential P2P sync patterns.
- **`Eternity Sync Protocol`:** Offline queue + optimistic updates. Could sync world save metadata.
- **`Chameleon Identity`:** If the game needs to hide, activity alias patterns apply.

---

## Scope Boundaries

**In Scope (MVP):**

- Clonar e integrar `minecraft-web-client` en una subcarpeta del proyecto.
- **Trigger de acceso**: Buscar "minecraft" en el buscador de notas → muestra opción para abrir el juego.
- **Pantalla de inicio**: Campo de texto para ingresar nombre de usuario antes de jugar.
- **Conexión a servidores externos**: Habilitar conexión a Aternos u otros servidores Java (vía proxy WebSocket).
- **Controles móviles**: Usar los joysticks/botones táctiles integrados.
- **Guardado local**: Mundos de un jugador guardados en IndexedDB/LocalStorage.

**Out of Scope (Mejoras Futuras):**

- Sincronización de mundos a Supabase/Vault.
- UI táctiles personalizadas (glassmórficas).
- Servidor P2P propio (no se necesita con Aternos).
- Shaders o mods.

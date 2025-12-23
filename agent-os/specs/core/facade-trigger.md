# Atomic Spec: Facade Trigger (The Gateway)

## Overview

The gateway to the Hidden Vault is a non-standard, obfuscated gesture implemented on the "Superficial" Public Facade. It ensures that the secure area remains invisible to casual users.

## Logic Specification

### Trigger Mechanism

- **Target element**: The main title (e.g., `h1` with text "Notas") in the Navigation Header.
- **Action**: Rapid sequential clicks.
- **Threshold**: **3 clicks**.
- **Time Window**: Each click must occur within **500ms** of the previous one.
- **State Reset**: If the time between clicks exceeds the window, the counter resets to 1.

### Post-Trigger Flow

1. Upon successful 3-click sequence, the `AuthScreen` is triggered.
2. The `AuthScreen` is rendered as an overlay (Dialog/Modal).
3. The temporary click counter state is reset to 0.

## Implementation Details

### React State Management

- `clickCount`: Integer tracking active sequence.
- `lastClickTime`: Timestamp of the last interaction.
- `showAuthScreen`: Boolean controlling the `AuthScreen` visibility.

### Code Pattern

```typescript
const handleTitleClick = () => {
  const now = Date.now();
  if (now - lastClickTime < 500) {
    const newCount = clickCount + 1;
    if (newCount >= 3) {
      setShowAuthScreen(true);
      setClickCount(0);
    } else {
      setClickCount(newCount);
    }
  } else {
    setClickCount(1);
  }
  setLastClickTime(now);
};
```

## Security Considerations

- **Obfuscation**: No visual feedback is provided during the click sequence to avoid telegraphing the existence of a hidden feature.
- **Input Neutrality**: The gesture must not interfere with standard accessibility or interactions on the header.

# Getting Started

# Getting Started

Welcome to the **SexyLove** project! Follow this guide to set up your development environment.

## Prerequisites

- **Node.js**: v18 or higher
- **Package Manager**: `pnpm` (recommended) or `npm`
- **Supabase Account**: For backend services.

## Installation

1.  **Clone the repository**:

    ```bash
    git clone <repository-url>
    cd SexyLove
    ```

2.  **Install dependencies**:
    ```bash
    pnpm install
    ```

## Environment Setup

1.  Copy the example environment file (if available) or create a `.env` file in the root directory.
2.  Add your Supabase credentials:

    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

## Running Locally

Start the development server:

```bash
pnpm run dev
```

The app will be available at `http://localhost:5173`.

## Mobile Development (Android)

To run the app on an Android device or emulator:

1.  **Sync web assets to native**:

    ```bash
    pnpm run sync:android
    ```

    _(This runs the build and copies it to the `android/` folder)_

2.  **Open in Android Studio**:

    ```bash
    npx cap open android
    ```

3.  Run the app from Android Studio.

## Common Commands

| Command            | Description                      |
| :----------------- | :------------------------------- |
| `pnpm run dev`     | Start dev server                 |
| `pnpm run build`   | Build for production             |
| `pnpm run lint`    | Run ESLint                       |
| `pnpm run preview` | Preview production build locally |
| `pnpm run docs`    | Generate API documentation       |

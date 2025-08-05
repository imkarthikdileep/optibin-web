# Frontend: OptiBin AI Dashboard

This is the user-facing interface for the OptiBin AI project, built with React, TypeScript, and Vite. It provides an interactive map to visualize the bin network and the dynamically calculated collection routes.

![OptiBin AI Final UI](https://i.imgur.com/k2E8s5k.png)

## Core Technologies

-   **Framework:** [React](https://reactjs.org/)
-   **Language:** [TypeScript](https://www.typescriptlang.org/)
-   **Build Tool:** [Vite](https://vitejs.dev/)
-   **Mapping Library:** [Leaflet](https://leafletjs.com/) & [React-Leaflet](https://react-leaflet.js.org/)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) & [Shadcn/UI](https://ui.shadcn.com/) (for components)

## Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ControlPanel.tsx     # The left sidebar with buttons and statistics.
│   │   ├── OptiBinDashboard.tsx # The main container component, manages state and logic.
│   │   └── OptiBinMap.tsx         # The interactive map component powered by Leaflet.
│   ├── App.tsx                  # Main application component.
│   └── main.tsx                 # Application entry point.
└── package.json                 # Project dependencies and scripts.
```

## Key Concepts & Logic Flow

The application follows a clean, component-based architecture with a centralized state management approach.

1.  **State Management:** The primary state (list of all bins, current route coordinates, and route statistics) is managed within the `OptiBinDashboard.tsx` component using React's `useState` hook. This makes it the "single source of truth."

2.  **Data Flow:**
    *   **On Load:** `OptiBinDashboard` uses a `useEffect` hook to make a `GET` request to the backend's `/api/bins` endpoint. The fetched data populates the `bins` state.
    *   **Props Drilling:** The `bins` state is passed down as props to `OptiBinMap` (to render the markers) and `ControlPanel` (to display stats like "Total Bins").
    *   **User Action:** The user clicks the "Optimize Collection Route" button in the `ControlPanel`. This triggers the `onOptimizeRoute` function, which was passed down as a prop from `OptiBinDashboard`.
    *   **API Call:** The `handleOptimizeRoute` function in `OptiBinDashboard` filters for the "red" bins and makes a `POST` request to the backend's `/api/optimize-route` endpoint.
    *   **State Update & Re-render:** Upon receiving a successful response, `OptiBinDashboard` updates its `routeCoordinates` and `routeStats` state. This triggers a re-render, and the new data flows down to `OptiBinMap`, which then draws the optimized route on the map.

3.  **Interactive Mapping (`OptiBinMap.tsx`):**
    *   **Dynamic Layers:** To solve a common issue with `react-leaflet` where dynamic data doesn't render correctly, we use a child component (`MapLayers`). This component receives the `bins` and `routeCoordinates` as props and re-renders whenever they change, ensuring the markers and polylines are always up-to-date.
    *   **`useMap` Hook:** The `MapLayers` component uses the `useMap()` hook to get access to the map instance. This allows it to programmatically call `map.flyToBounds()` to automatically zoom and pan the view to fit the optimized route, creating a smooth user experience.
    *   **Custom Theming:** The map uses a clean, professional tile layer from CARTO (`voyager`) that is less cluttered than default road maps and fits the application's aesthetic.

## Setup and Running

**Prerequisite:** Ensure the [backend server](#backend-readme.md) is running first.

1.  **Install Dependencies:**
    Navigate to the `frontend` directory in your terminal and run:
    ```bash
    npm install
    ```

2.  **Run the Development Server:**
    ```bash
    npm run dev
    ```

3.  Open your browser to the URL provided (usually `http://localhost:5173`).
# Inventory system

This inventory system is built as a ReactJS application using Vite.

The `index.html` file is only the required Vite browser entry shell. The actual application UI, routes, and inventory logic are implemented in React/TypeScript under `src/`, starting from `src/main.tsx` and `src/app/App.tsx`.

Current data persistence uses browser `localStorage` through `src/app/lib/localStorage.ts`, so the modules continue to share the same inventory, purchase order, goods received, POS, transfer, report, and user-management data flow.

## Tech stack

- ReactJS
- TypeScript
- Vite
- React Router
- localStorage-based prototype data layer

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

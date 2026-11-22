# CGMK React migration

An incremental static migration of the existing CGMK website to React 19, TypeScript, Vite and Tailwind CSS v4.

## Run

```bash
cd react-app
npm install
npm run dev
npm run build
```

## Status

This lives on `feat/react-vite-typescript` and does not replace the existing production site. Tailwind utilities are enabled without Preflight to protect current styling. Static sections are temporarily imported from the original page markup to preserve visual fidelity; the navbar, calendar, media browsing and mission tab switcher run as React components. The long-term refactor is to replace each preserved static section with native TSX components. No backend or authenticated admin is introduced. The existing admin preview is copied as a separate static path.

## Deployment

Create a separate Vercel preview project, or set a preview-only build with Root Directory `react-app`, Framework Vite, Output Directory `dist`. Do not change the production site's root directory until approved.

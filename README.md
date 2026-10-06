# MESOB — Digital Restaurant Operating System & Smart Dining Platform

A modern, multi-tenant digital restaurant operating system designed for real-world restaurants.

---

## Overview

MESOB transforms dining into an interactive, digital experience while giving restaurant owners and staff a complete operational back-office. It connects Guests, Waiters, Kitchen Staff, and Managers through a single unified source of truth without requiring code changes.

- **Guest Portal:** Scan table QR / NFC to browse published dishes, interact with an AI Concierge, place orders, track kitchen status, and view thermal animated receipts.
- **Manager Portal:** Self-serve onboarding wizard, menu OCR/text ingestion, draft vs. published menu versioning, table management, live stock 86-ing, and analytics.
- **Kitchen Display System (KDS):** 3-column ticket pipeline (`NEW`, `PREPARING`, `READY`) with status transitions, reject modals, and synthesized audio chimes.
- **Waiter Order Pad:** Fast handheld interface for staff to take orders table-side (`TABLES`, `NEW ORDER`, `ACTIVE ORDERS`).

---

## Key Features

### 1. Guest Experience (No Login Required)
- **Table-Aware Routing:** Canonical QR format (`/r/:restaurantSlug/t/:tableToken`) with instant restaurant & table resolution.
- **Strict Published Menu Isolation:** Guests only ever see published dishes. Changes made in the manager portal stay in draft until explicitly published.
- **AI Food Guide / Concierge:** Multilingual culinary guide (English, Amharic, Tigrinya, Afaan Oromoo) explaining dishes, flavor profiles, and pairings without hallucinating non-existent ingredients.
- **Cart & Server-Side Anti-Tamper Pricing:** Prices are validated against the active published menu to prevent tampering.
- **Interactive Digital & Thermal Receipt:** Animated thermal kitchen printer simulation with live audio effects, plus formal luxury receipt card view with QR verification.
- **Offline Failsafe:** Detects network drops, displays a clear "Your order has not been sent" banner, and provides a "Show to Waiter" emergency screen.

### 2. Manager Portal & Operations
- **Menu Ingestion Engine:** Upload menus as raw text, scans, or PDFs. Automatically categorizes items, extracts prices in ETB/USD/EUR, flags fasting/vegan dishes, and marks uncertain items as `NEEDS REVIEW`.
- **Draft vs. Published Versioning:** Edit prices and descriptions safely in draft; publish updates in one click. Existing historical orders retain their original purchase prices.
- **Live Stock (86-List):** Mark dishes sold out in real-time (for today, a custom duration, or indefinite). Sold-out dishes are blocked from being ordered immediately.
- **Table & QR Code Generator:** Add tables, assign seating capacities, and generate ready-to-print branded table standees.
- **Multi-Tenant Architecture:** Full tenant isolation keyed by `restaurantId`.

### 3. Kitchen Display System (KDS)
- **3-Column Ticket Board:** `NEW / SUBMITTED` -> `PREPARING` -> `READY`
- **Kitchen Controls:** One-tap status advancement, order rejection modal with structured reason codes.
- **Audio Chimes:** Synthesized Web Audio API sound alerts for incoming orders.

### 4. Waiter Order Pad
- Rapid table assignment and seat count configuration.
- One-tap quick adds with special instructions and spice-level adjustments.
- Direct routing to kitchen tickets.

---

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Styling:** Tailwind CSS, Lucide Icons
- **State & Storage:** Reactive Repository Pattern with universal `SafeStorage` (localStorage + SSR/headless memory fallback)
- **Audio:** Web Audio API synthesizer for kitchen & printer chimes
- **Internationalization:** Multi-language engine (English, Amharic, Tigrinya, Afaan Oromoo)
- **Testing:** 36-step automated acceptance test suite

---

## Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
git clone https://github.com/sawirosabiy-ui/mesob-menu.git
cd mesob-menu
npm install
```

### Local Development
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Tests
```bash
./node_modules/.bin/jiti src/tests/acceptance.ts
```
Executes all 36 end-to-end acceptance tests.

### Build for Production
```bash
npm run build
```

---

## Deploy to Vercel

1. Push your repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import `mesob-menu`.
3. Vercel automatically detects Vite. Click **Deploy**.

---

## License

MIT License.

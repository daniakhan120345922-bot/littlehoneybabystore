# Little Honey Baby Store

Internal POS and inventory management system built with **Next.js App Router** (`src/app`).

## Getting started

```bash
npm install
cp .env.example .env.local   # optional: set OWNER_PIN
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

| Route | Role |
| ----- | ---- |
| `/cashier` | Barcode scanning, cart, checkout |
| `/owner` | Inventory CRUD (PIN: `honey2024` by default) |

## API

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/api/products` | List inventory |
| GET | `/api/products/[barcode]` | Lookup by barcode |
| POST | `/api/products` | Create/update (requires `ownerPin`) |
| POST | `/api/checkout` | Complete sale, deduct stock |

Inventory persists in `data/inventory.json`.

## Test barcodes

- `8901234567890` — Organic Cotton Onesie
- `8901234567891` — Silicone Baby Bib
- `8901234567892` — Plush Honey Bear Rattle
- `8901234567893` — Bamboo Nursing Pads
- `8901234567894` — Hypoallergenic Diapers

## Scripts

| Command | Description |
| ------- | ----------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server |
| `npm run lint` | ESLint |

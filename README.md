# PrintDash

Upload a document, pay PKR 10/page with JazzCash, and collect a printed copy
at the nearest print shop in the network using a 6-digit claim number.

## Setup

```bash
npm install
cp .env.example .env
# edit .env with your API base URL + key
npm run dev
```

Open http://localhost:5173

## Build

```bash
npm run build
npm run preview
```

## Structure

- `src/pages` — `Home`, `Upload`, `Checkout`, `Receipt` (thank-you), `Lookup`
- `src/components` — `Header`, `Footer`, `Dropzone`, `Ticket`
- `src/lib/api.js` — client for the Cloud PDF Service API (upload, get file, bill payment)
- `src/lib/kiosksApi.js` — client for the **separate** Print Shop Locator API (`VITE_KIOSKS_API_BASE_URL`), used only for `GET /api/kiosks/nearby`
- `src/lib/cart.js` — sessionStorage-backed cart + receipt state
- `src/global.css` — design tokens and shared utility classes

## Flow

1. **Home** (`/`) — intro + sample ticket.
2. **Upload** (`/upload`) — drag/drop or browse files; each uploads independently and gets its own claim ticket.
3. **Checkout** (`/checkout`) — enter JazzCash mobile number + CNIC last 6 digits, pay for everything in the cart.
4. **Checkout** (`/checkout`) — choose **JazzCash** (enter mobile + CNIC, calls `billPayment`) or **Cash at print shop** (skips payment entirely — for testing the flow without JazzCash). Both paths end the same way: build a receipt, clear the cart, go to `/receipt`.
5. **Receipt** (`/receipt`) — large claim tickets to note down or screenshot, plus the 5 closest print shops (by distance) pulled from the Print Shop Locator API using the browser's geolocation. Only location and a computed waiting time (queue minutes + walking minutes) are shown for each.
6. **Lookup** (`/lookup`) — check the status of a claim number later.

## Notes

- `VITE_API_KEY` ships in the client bundle since this is a static front end — see `api.js` for why, and consider a small server-side proxy before using this beyond a demo.
- The Print Shop Locator API (`kiosksApi.js`) is a **separate backend** with its own `VITE_KIOSKS_API_BASE_URL` / `VITE_KIOSKS_API_KEY` — it's not related to the Cloud PDF Service.
- The Receipt page asks for the browser's location to find nearby print shops; if location is denied, it shows a retry button instead of blocking the rest of the page.
- The locator API returns extra fields (`distanceKm`, `totalPpm`, its own `waitingTimeMinutes`, `estimatedCompletionMinutes`) that are deliberately not shown — the UI only displays name/address and a waiting time computed client-side as `queueMinutes + walkingTimeMinutes`.
- "Cash at print shop" checkout is a test-only shortcut — it marks the ticket `cash_pending` without calling any payment API, so the JazzCash integration can be skipped while developing.
- Cart/receipt state lives in `sessionStorage`, so it survives a refresh mid-flow but clears when the tab closes.

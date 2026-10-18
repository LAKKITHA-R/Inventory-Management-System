# StockLeaf — Green Inventory Frontend

This package contains a redesigned React/Vite frontend for the existing Spring Boot inventory application.

## What changed
- Fresh forest-green and soft-green theme
- Responsive sidebar navigation on desktop and compact navigation on mobile
- Redesigned login page with password visibility toggle
- Dashboard cards, stock alerts, and quick links
- Product catalogue with search, stock filters, add, edit, and delete controls
- Low-stock watchlist
- Stock IN / OUT page
- Transaction history page

## Existing backend APIs kept
- `POST http://localhost:8080/users/login`
- `GET http://localhost:8080/api/product`
- `POST http://localhost:8080/api/product`
- `PUT http://localhost:8080/api/product/{id}`
- `DELETE http://localhost:8080/api/product/{id}`
- `GET http://localhost:8080/api/product/low-stock`
- `PUT http://localhost:8080/api/stock/{productId}/{in|out}?quantity={quantity}`
- `GET http://localhost:8080/api/product/{productId}/stock-history`

## Install / run
1. Stop the current Vite server with `Ctrl + C`.
2. Back up your current `src` folder.
3. Copy this package's `src` folder and `index.html` into your existing `inventory-frontend` folder, replacing the old versions.
4. Keep your existing `package.json`, `package-lock.json`, and `node_modules`.
5. Start Spring Boot as usual.
6. In the frontend terminal, run:
   ```bash
   npm run dev
   ```
7. Open the Vite URL shown in the terminal, usually `http://localhost:5173`.

## Notes
- API base URL remains `http://localhost:8080`.
- JWT is stored in `localStorage` as `token`; username and role are stored as `username` and `role`.
- The UI only shows product add/edit/delete controls when the saved role is `ADMIN` or `ROLE_ADMIN`. Backend authorization remains the actual security boundary.
- The dashboard stock value is calculated from the existing product list (`price × quantity`) and is a frontend estimate.

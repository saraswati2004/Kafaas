# KaFaaS Frontend — Architecture & Developer Guide

The web frontend is a **React 19 + TypeScript** single-page application built with **Vite**, styled with **Tailwind CSS v4**, and served by **TanStack Query** + **Zustand**.

> **Quick start:** `npm install && npm run dev` → <http://localhost:5173>
> Build (type-check + bundle): `npm run build`.

---

## Tech stack

| Concern | Library |
| :--- | :--- |
| Framework | React 19 |
| Language | TypeScript (~6.0) |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 (`@tailwindcss/vite`), `clsx` + `tailwind-merge` |
| Routing | react-router-dom v7 |
| Data fetching / server state | `@tanstack/react-query` |
| Client state | zustand |
| HTTP | axios |
| Icons | lucide-react |

---

## Directory map

```
src/
├── main.tsx                 # React entry point (mounts <App/>)
├── App.tsx                  # Router, route table, global ErrorBoundary, QueryClient
├── index.css / style.css    # global stylesheets
│
├── api/                     # typed axios clients + mock fallbacks
│   ├── client.ts            # axios instance, interceptors, API_BASE_URL
│   ├── auth.api.ts          # login, register, me, forgot/reset password, SSO
│   ├── cart.api.ts          # authoritative cart/price calculation
│   ├── products.api.ts      # catalog, featured, related
│   ├── orders.api.ts        # orders, lifecycle, tracking
│   ├── inventory.api.ts     # vendor/admin inventory + adjustments
│   ├── users.api.ts         # profile, addresses, preferences, vendor requests
│   ├── recommendations.api.ts
│   └── mockData.ts          # offline/mock fallback data
│
├── components/
│   ├── common/              # Badge, Button, Card, Input, Modal, Pagination, Skeleton, ToastContainer, EmptyState
│   ├── auth/                # ProtectedRoute, RoleProtectedRoute
│   ├── layout/              # Navbar, Footer, MobileNav, RoleSwitcher
│   ├── orders/              # OrderStatusTimeline, OrderSummaryCard
│   ├── recommendations/     # CropSelector, DiseaseCard, RecommendedProductList
│   └── shop/                # ProductCard, ProductGrid, ProductFilters, RecommendationBadge
│
├── hooks/                   # domain hooks using TanStack Query
│   ├── useAuth.ts
│   ├── useCart.ts
│   ├── useInventory.ts
│   ├── useOrders.ts
│   ├── useProducts.ts
│   └── useRecommendations.ts
│
├── layouts/                 # per-role shells
│   ├── PublicLayout.tsx     # public storefront shell
│   ├── FarmerLayout.tsx     # farmer portal shell
│   ├── VendorLayout.tsx     # vendor portal shell
│   └── AdminLayout.tsx      # admin portal shell
│
├── pages/                   # route components grouped by area
│   ├── public/              # Home, Shop, ProductDetail, Cart, Checkout, Recommendations, About
│   ├── auth/                # Login, Register, ForgotPassword, ResetPassword
│   ├── farmer/              # Dashboard, MyOrders, OrderDetail, SavedAddresses, Recommendations, ScanHistory, Profile
│   ├── vendor/              # Dashboard, Inventory, Orders, Sales, Profile
│   └── admin/              # Dashboard, Products, Inventory, Orders, Recommendations, Users, VendorRequests, AuditLogs, Settings
│
├── stores/                  # zustand slices
│   ├── authStore.ts         # auth state (token, user)
│   ├── cartStore.ts         # cart line items, kisan-subsidy toggle
│   └── uiStore.ts           # toasts, modals, page-level UI state
│
├── types/                   # TypeScript domain types
│   ├── auth.types.ts        # User, Address, UserRole, AuthResponse…
│   ├── user.types.ts
│   ├── product.types.ts
│   ├── order.types.ts
│   ├── inventory.types.ts
│   └── recommendation.types.ts
│
└── utils/
    └── caseTransform.ts     # camelCase ↔ snake_case conversion
```

---

## How data flows

1. **API client** (`src/api/client.ts`) creates an axios instance with:
   - `baseURL = VITE_API_BASE_URL || '/api/v1'`
   - a **request interceptor** that attaches the bearer token from
     `localStorage['kafaas_auth_token']` and converts payloads to `snake_case`;
   - a **response interceptor** that converts responses to `camelCase` and
     normalizes errors to `Error` instances using the backend `message`.
2. **API modules** (`src/api/*.api.ts`) define typed functions per domain.
   They branch on `API_BASE_URL`:
   - if set → call the real axios client;
   - if empty → return **mock data** (with `mockDelay`) so the UI works standalone.
3. **Hooks** (`src/hooks/*`) wrap these calls in TanStack Query, exposing loading/error/data.
4. **Stores** (zustand) hold client-side state (auth session, cart items, UI toasts).

### Auth persistence

- Token lives in `localStorage['kafaas_auth_token']`.
- `authStore` holds the current user object (parsed `fullName`, `email`, `role`, `addresses`, …).
- `useAuth` exposes `user`, `login`, `register`, `logout`, `updateUser`, and
  address CRUD / default helpers.

### Cart

- `cartStore` tracks line items locally.
- On checkout, `cartApi.calculateTotals` posts to `/cart/calculate` for the **authoritative** price
  (real volume discounts, Kisan subsidy, delivery fees, 5% GST) — the client never computes totals itself.

---

## Routing table (`src/App.tsx`)

| Route | Component | Access |
| :--- | :--- | :--- |
| `/` | HomePage | public |
| `/shop` | ShopPage | public |
| `/products/:id` | ProductDetailPage | public |
| `/cart` | CartPage | public |
| `/checkout` | CheckoutPage | authenticated |
| `/recommendations` | RecommendationsPage | public |
| `/about` | AboutPage | public |
| `/login` `/register` `/forgot-password` `/reset-password` | auth pages | public |
| `/farmer/*` | Farmer portal (dashboard, orders, orders/:id, addresses, recommendations, scans, profile/preferences) | `farmer`, `admin` |
| `/vendor/*` | Vendor portal (dashboard, inventory, orders, sales, profile/preferences) | `vendor`, `admin` |
| `/admin/*` | Admin portal (dashboard, products, inventory, orders, recommendations, users, vendor-requests, audit-logs, settings) | `admin` |

Routing protection is implemented by:
- `ProtectedRoute` — requires an authenticated user.
- `RoleProtectedRoute` — requires one of the given roles.

A catch-all route (`*`) redirects to `/`.

---

## Styling & design system

- **Tailwind CSS v4** configured via the `@tailwindcss/vite` plugin (see `vite.config.ts`).
- Reusable design primitives live in `src/components/common/`:
  `Button`, `Input`, `Badge`, `Card`, `Modal`, `EmptyState`, `Pagination`, `Skeleton`, `ToastContainer`.
- `clsx` + `tailwind-merge` compose conditional class names.

---

## Adding a new page

1. Create the component under `src/pages/<area>/<Name>Page.tsx`.
2. Import it in `src/App.tsx` and add a `<Route>` (nested under the right layout).
3. If it needs server data, add/extend a hook in `src/hooks/` and an API function in `src/api/`.
4. Add any types to `src/types/`.

---

## Scripts (`package.json`)

| Script | Description |
| :--- | :--- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Type-check (`tsc`) then production build to `dist/` |
| `npm run preview` | Preview the production build locally |

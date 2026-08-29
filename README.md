# Enterprise Multi-Category Marketplace Monorepo

This repository hosts a production-ready, high-performance E-Commerce Marketplace supporting **Beverages** (drinks) and **Books**. It is designed as a TypeScript monorepo using npm Workspaces.

---

## 1. Technologies Used & Architectural Decisions

### Frontend

- **Next.js (App Router, v16)**: Chosen for its Server-Side Rendering (SSR), search optimization (SEO), and optimized build performance (e.g., standalone output configuration for Docker).
- **React (v19)**: The core UI library. Utilizes concurrent React features such as `useTransition` to guarantee a non-blocking UI during typing or filter switching.
- **Zustand**: A lightweight, fast state-management library used to manage shopping cart state (`useCartStore`) with minimal boilerplate.
- **TanStack React Query (v5)**: Handles server-state caching, automatic refetching, mutations (adding/removing cart items), and network loading states.
- **Zod**: Used strictly on the client side to define schemas and validate forms (registration, login, checkout details) before sending payloads over the network.
- **Tailwind CSS (v4)**: Modern utility-first CSS framework combined with custom CSS modules for high-end glassmorphism styling and hover micro-animations.

### Backend

- **Node.js & Express**: A lightweight, robust runtime and framework for building high-performance REST APIs.
- **TypeScript**: Enforces static type safety across both frontend and backend configurations to eliminate runtime bugs.
- **PostgreSQL**: Relational SQL database chosen for transactional operations (orders and inventory consistency) and JSONB support (storing dynamic specifications for different categories).
- **Prisma ORM**: A type-safe ORM that maps Postgres tables to TypeScript models, handles migrations, and handles safe data queries.
- **Redis**: Used for key performance optimization features:
  1. **Shopping Cart Cache**: Cart items are cached in Redis with a 7-day expiration time so they load instantly without querying the SQL database.
  2. **Rate Limiter**: Tracks client IPs to prevent DDoS attacks and spam (rate limited at 100 requests/minute).
- **JWT (JSON Web Tokens)**: Used for stateless user authentication.
- **Bcryptjs**: Used for securely hashing user passwords before database storage.

---

## 2. Folder Structure Breakdown

```markdown
soft_drink/ # Monorepo Workspace Root
├── apps/ # Standalone Executable Applications
│ ├── frontend/ # Next.js Frontend Application
│ │ ├── app/ # App Router layout, pages, and providers
│ │ ├── components/ # UI components (SupermarketFilter.tsx, styles)
│ │ ├── store/ # Zustand state store (useCartStore.ts)
│ │ ├── types/ # Frontend TypeScript interfaces
│ │ └── validation/ # Zod validation schemas
│ └── backend/ # Express REST API Server
│ ├── prisma/ # Prisma database schema, seeds, and migrations
│ ├── src/
│ │ ├── controllers/ # API handlers (Auth, Cart, Products, Orders)
│ │ ├── middleware/ # JWT auth and Redis rate limiting middlewares
│ │ ├── services/ # DB (Prisma) and Redis connection singletons
│ │ ├── routes.ts # REST endpoints mapping
│ │ └── server.ts # Express application startup
├── docker-compose.production.yml # Orchestrates local Postgres & Redis databases
└── package.json # Root Workspace package configuration
```

---

## 3. API Routes

All endpoints are prefix-versioned under `/api/v1`.

| Endpoint                      | Method | Auth | Description                                                             |
| :---------------------------- | :----- | :--- | :---------------------------------------------------------------------- |
| `/api/v1/auth/register`       | `POST` | None | Registers a customer, hashes password, and returns a JWT token.         |
| `/api/v1/auth/login`          | `POST` | None | Validates credentials and returns a JWT token.                          |
| `/api/v1/products`            | `GET`  | None | Fetches products. Supports search, min/max price, and category filters. |
| `/api/v1/products/categories` | `GET`  | None | Fetches parent categories (Beverages, Books) and nested subcategories.  |
| `/api/v1/cart`                | `GET`  | JWT  | Fetches the user's cart from Redis, enriched with Postgres details.     |
| `/api/v1/cart`                | `POST` | JWT  | Saves the current shopping cart items list to Redis cache.              |
| `/api/v1/orders`              | `POST` | JWT  | Places an order inside a safe database transaction, reserving stock.    |
| `/api/v1/orders`              | `GET`  | JWT  | Returns order history for the authenticated user.                       |

---

## 4. Navigation & User Flow

1. **Filtering & Category Navigation**:
   - The home page fetches parent categories. Users click on **Beverages** or **Books** pills to switch lists.
   - Selecting **Beverages** dynamically loads subcategories (_Soft Drinks_, _Energy Drinks_). Clicking **Books** renders _Technology & Software_.
   - State updates are wrapped in `useTransition` to keep the UI smooth and responsive during queries.
2. **Dynamic Spec Rendering**:
   - The catalog renders card metadata dynamically depending on the product category:
     - **Drinks** show volume in milliliters, packaging type (CAN/BOTTLE), sugar, and caffeine.
     - **Books** show author name, publisher, page count, publication year, and ISBN.
3. **Cart Sync**:
   - Adding to cart triggers an **optimistic UI update** in the Zustand store (instantly visible in the UI).
   - If logged in, a background task automatically syncs the updated cart list to the backend Redis cache.
4. **Checkout Transaction**:
   - Checking out executes a Postgres database transaction. The backend locks the requested product variant rows, decrements inventory stock atomically, registers the order, and purges the Redis cart session key.

---

## 5. Getting Started

### Local Setup (Development)

1. **Start Postgres and Redis** using Docker Compose:

   ```bash
   docker compose -f docker-compose.production.yml up postgres redis -d
   ```

2. **Generate schema and run Prisma migrations**:

   ```bash
   npm run prisma:migrate --workspace=backend
   ```

3. **Seed database** with mock categories (Beverages, Books) and products:

   ```bash
   npm run db:seed --workspace=backend
   ```

4. **Boot both dev servers** inside the root directory:
   - Backend API: `npm run dev:backend`
   - Frontend: `npm run dev:frontend`

5. Open [http://localhost:3000](http://localhost:3000) to view the application catalog.

# Medical Sale System

Internal sales system for a medical test kit distributor, built with **Next.js (App Router)**,
**Prisma**, and **Neon Postgres**. It manages products, customers, sales representatives,
warehouse inventory, and order tracking, with authentication and role-based permissions for
**Sales Representatives** and **Sales Managers**.

## Features

- **Products** — add / view / edit / delete medical test kit products (Manager only for writes).
- **Customers** — add / view / edit / delete; each customer belongs to a sales rep. Reps can only
  manage their own customers; managers can manage all.
- **Sales Representatives** — add / view / edit / delete rep/manager user accounts (Manager only).
- **Inventory (Warehouse)** — track stock on hand, reorder level and warehouse location per
  product (Manager only for writes; everyone can view, with low-stock highlighting).
- **Order Tracking** — create an order for a customer, then "Fulfill" it to deduct the ordered
  quantities from warehouse inventory in a single transaction (blocked if stock is insufficient).
- **Sales Rep Tracking** — manager-only dashboard that ranks reps by kits sold (completed orders),
  with search by name/email and revenue/order stats.
- **Auth & Roles** — email/password login (NextAuth credentials provider, JWT sessions).
  `SALES_MANAGER` has full access; `SALES_REP` has limited access scoped to their own
  customers/orders and read-only access to products/inventory.

## Screenshots

| Login | Dashboard |
| --- | --- |
| ![Login](docs/screenshots/login.png) | ![Dashboard](docs/screenshots/dashboard.png) |

| Products | Customers |
| --- | --- |
| ![Products](docs/screenshots/products.png) | ![Customers](docs/screenshots/customers.png) |

| Orders | Sales Rep Tracking |
| --- | --- |
| ![Orders](docs/screenshots/orders.png) | ![Sales Rep Tracking](docs/screenshots/rep-tracking.png) |

## Tech Stack

- [Next.js](https://nextjs.org) (App Router, Server Actions)
- [Prisma ORM](https://www.prisma.io) + [Neon Postgres](https://neon.tech)
- [NextAuth (Auth.js) v5](https://authjs.dev) — Credentials provider, JWT sessions
- Tailwind CSS
- Zod for input validation, bcryptjs for password hashing

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.example` to `.env` and fill in your [Neon](https://neon.tech) Postgres connection
strings and an auth secret:

```bash
cp .env.example .env
```

```env
DATABASE_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
DIRECT_URL="postgresql://<user>:<password>@<host>/<db>?sslmode=require"
AUTH_SECRET="generate-with-npx-auth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

You can generate a secret with `npx auth secret`.

**Prefer a local database?** Start PostgreSQL with Docker Compose and use the local connection
strings instead — see [DOCKER.md](DOCKER.md):

```bash
docker compose up -d
```

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/medical_sales?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/medical_sales?schema=public"
```

### 3. Push the schema and seed sample data

```bash
npm run db:push   # creates tables in your database (Neon or local Docker)
npm run db:seed   # seeds realistic demo data (products, customers, reps, orders)
```

Seeded demo accounts (password for all: `Password123!`):

| Role    | Email                      |
| ------- | --------------------------- |
| Manager | manager@medtest.com         |
| Rep     | alice.rep@medtest.com       |
| Rep     | ben.rep@medtest.com         |
| Rep     | carla.rep@medtest.com       |
| Rep     | david.rep@medtest.com       |

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in.

## Useful scripts

| Script             | Description                                   |
| ------------------ | ---------------------------------------------- |
| `npm run dev`       | Start the development server                   |
| `npm run build`     | Build for production                           |
| `npm run start`     | Run the production build                       |
| `npm run lint`      | Run ESLint                                     |
| `npm run db:push`   | Push `prisma/schema.prisma` to the database     |
| `npm run db:migrate`| Create/apply a Prisma migration                |
| `npm run db:seed`   | Seed the database with sample data             |
| `npm run db:studio` | Open Prisma Studio to browse data              |

## Data model

- `User` (role: `SALES_REP` \| `SALES_MANAGER`) has an optional one-to-one `SalesRep` profile.
- `SalesRep` has many `Customer`s and `Order`s.
- `Customer` belongs to one `SalesRep` and has many `Order`s.
- `Product` has one `InventoryItem` (warehouse stock) and many `OrderItem`s.
- `Order` belongs to a `Customer` and a `SalesRep`, and has many `OrderItem`s. Fulfilling an order
  (`PENDING` → `COMPLETED`) decrements `InventoryItem.quantityOnHand` for each item in a database
  transaction.

## Permissions summary

| Area          | Sales Manager       | Sales Representative                          |
| ------------- | ------------------- | ---------------------------------------------- |
| Products      | Full CRUD            | View only                                       |
| Inventory     | Full CRUD (adjust stock) | View only                                    |
| Customers     | Full CRUD (any rep)   | CRUD limited to their own customers            |
| Sales Reps    | Full CRUD             | View own profile only (no access to the page)  |
| Orders        | Full CRUD (any rep)   | Create/view/fulfill/cancel their own orders    |
| Rep Tracking  | Full access, ranking & search | No access                              |

# Running PostgreSQL locally with Docker

Spin up a local PostgreSQL instance for development instead of using Neon. The setup is defined in [docker-compose.yml](docker-compose.yml).

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) with Docker Compose v2 (`docker compose`)

## Start the database

```bash
docker compose up -d
```

- Image: `postgres:16`, container name `medical-sales-db`.
- Host port `5433` maps to the container's `5432` (avoids clashing with a local Postgres install).
- The named volume `medical-sales-data` keeps data across restarts and `docker compose down`.
- A healthcheck reports `healthy` once Postgres accepts connections (`docker compose ps`).

## Configure the app

Set these in `.env`:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/medical_sales?schema=public"
DIRECT_URL="postgresql://postgres:postgres@localhost:5433/medical_sales?schema=public"
AUTH_SECRET="replace-with-a-long-random-string"
NEXTAUTH_URL="http://localhost:3000"
```

## Initialize the schema and seed data

```bash
npm run db:push    # or: npm run db:migrate
npm run db:seed
```

Optionally browse the data with `npm run db:studio`.

## Common commands

| Task                    | Command                                                    |
| ----------------------- | ---------------------------------------------------------- |
| Start                   | `docker compose up -d`                                     |
| Check status            | `docker compose ps`                                        |
| View logs               | `docker compose logs -f db`                                |
| Stop (data kept)        | `docker compose stop`                                      |
| Remove container        | `docker compose down`                                      |
| Open `psql` shell       | `docker compose exec db psql -U postgres -d medical_sales` |
| Remove data (destroys!) | `docker compose down -v`                                   |

## Without Docker Compose

```bash
docker run -d \
  --name medical-sales-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=medical_sales \
  -p 5433:5432 \
  -v medical-sales-data:/var/lib/postgresql/data \
  postgres:16
```

Manage it with `docker logs`, `docker stop`, `docker start`, and `docker rm -f medical-sales-db`.

## Troubleshooting

- **Port already in use:** change the left side of `"5433:5432"` in `docker-compose.yml` and update the port in `DATABASE_URL` and `DIRECT_URL`.
- **Connection refused right after start:** wait until `docker compose ps` shows `healthy`.
- **Credentials changed but not applied:** `POSTGRES_*` variables only apply on first initialization; run `docker compose down -v` to re-initialize.

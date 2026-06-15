# Solution4All Backend

Express + MongoDB backend for the Solution4All e-commerce platform.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy `.env.example` to `.env` and configure:
   ```bash
   cp .env.example .env
   ```

3. Start MongoDB locally or update `MONGODB_URI` in `.env`

4. Seed the database:
   ```bash
   npm run seed
   ```

5. Start the server:
   ```bash
   npm start
   ```

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | /api/v1/auth/signin | Public | Admin login |
| POST | /api/v1/auth/refresh | Admin | Refresh token |
| GET | /api/v1/products | Public | List products |
| GET | /api/v1/products/slug/:slug | Public | Get product by slug |
| GET | /api/v1/products/:id | Public | Get product by ID |
| POST | /api/v1/products | Admin | Create product |
| PUT | /api/v1/products/:id | Admin | Update product |
| DELETE | /api/v1/products/:id | Admin | Delete product |
| GET | /api/v1/services | Public | List services |
| GET | /api/v1/services/:id | Public | Get service |
| POST | /api/v1/services | Admin | Create service |
| PUT | /api/v1/services/:id | Admin | Update service |
| DELETE | /api/v1/services/:id | Admin | Delete service |
| POST | /api/v1/orders | Public | Create order |
| GET | /api/v1/orders | Admin | List orders |
| GET | /api/v1/orders/:id | Admin | Get order |
| PATCH | /api/v1/orders/:id | Admin | Update order |
| POST | /api/v1/contact-submissions | Public | Submit contact form |
| GET | /api/v1/contact-submissions | Admin | List submissions |
| GET | /api/v1/contact-submissions/count | Admin | Count submissions |
| PATCH | /api/v1/contact-submissions/:id | Admin | Update submission |
| DELETE | /api/v1/contact-submissions/:id | Admin | Delete submission |
| POST | /api/v1/analytics-events | Public | Track event |
| GET | /api/v1/analytics-events | Admin | List events |
| GET | /api/v1/analytics-events/count | Admin | Count events |
| GET | /api/v1/users | Admin | List users |
| GET | /api/v1/users/:id | Admin | Get user |
| PUT | /api/v1/users/:id | Admin | Update user |
| DELETE | /api/v1/users/:id | Admin | Delete user |
| PATCH | /api/v1/users/:id | Admin | Change password |

## Query Parameters

### Pagination
- `page` - Page number (default: 1)
- `perPage` - Items per page (default: 30)

### Sorting
- `sort` - Comma-separated sort fields (prefix with `-` for descending)
  - Example: `sort=-created,price_dzd`
  - Mapped fields: `created` → `createdAt`, `updated` → `updatedAt`

### Filtering (Products)
- `category` - Filter by category
- `active` - Filter by active status (`true`/`false`)
- `featured` - Filter by featured status (`true`/`false`)
- `search` - Search in name_fr and description_fr

### Filtering (Orders)
- `status` - Filter by order status

### Filtering (Contact Submissions)
- `status` - Filter by submission status
- `department` - Filter by department
- `search` - Search in full_name, email, subject

### Filtering (Analytics Events)
- `event_type` - Filter by event type
- `device_type` - Filter by device type
- `dateFrom` - Filter from date (ISO string)
- `dateTo` - Filter to date (ISO string)

## Authentication

All admin endpoints require a Bearer token in the Authorization header:
```
Authorization: Bearer <token>
```

Get a token via `POST /api/v1/auth/signin` with `{ email, password }`.

## Environment Variables

See `.env.example` for all configuration options.

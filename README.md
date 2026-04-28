# Nelysah Beauty Boutique

A modern, full-stack e-commerce platform for beauty products, featuring a React frontend and a robust Laravel backend with built-in admin and driver management capabilities.

## Project Architecture

This repository uses a decoupled architecture:
- **Frontend**: A React application built with Vite, TypeScript, Tailwind CSS, and shadcn/ui. (Located in the root directory)
- **Backend**: A Laravel PHP REST API. (Located in the `/backend` directory)
- **Database**: SQLite (for local development) / PostgreSQL (for production).

## Features

- **User Authentication**: Secure login and registration using Laravel Sanctum (JWT/Token-based).
- **Product Catalog**: Browse products, view details, and manage shopping carts.
- **Order Management**: Customers can place orders and track their status.
- **Admin Dashboard**: Full administrative access for managing products, users, and orders.
- **Driver Role**: Dedicated driver views to see assigned orders and update delivery status.
- **Responsive Design**: Mobile-friendly interfaces across all views.

## User Roles

1. **Customers**: Browse products, manage carts, place orders, and track deliveries.
2. **Drivers**: View assigned delivery routes and update order statuses.
3. **Admins**: Full control over the platform, inventory, and users.

## Local Setup Instructions

### 1. Backend Setup (Laravel)
Ensure you have PHP and Composer installed on your system.

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan serve
```
*The API will be available at `http://localhost:8000`. The seeder creates a default admin account: `admin@admin.com` / `password`.*

### 2. Frontend Setup (React/Vite)
Ensure you have Node.js (16+) installed.

Open a new terminal window in the project root:
```bash
npm install
npm run dev
```
*The frontend will be available at `http://localhost:8080` (or `http://localhost:5173`) and will proxy `/api` requests to your local Laravel server.*

## Deployment

- **Frontend**: Can be deployed to static hosting platforms like Vercel, Netlify, or Cloudflare Pages.
- **Backend**: Can be deployed to any PHP-capable hosting (e.g., Laravel Forge, Heroku, Render).

## Future Changes & Changelog

*(Please document any future architectural changes, new features, or dependency updates here)*

- **[2026-04-28]**: 
  - Connected the frontend to the local Laravel backend (`http://localhost:8000`).
  - Fixed `process.env` errors by converting environment variables to Vite's `import.meta.env`.
  - Corrected authentication token storage logic to read `access_token` from Laravel.
  - Added full name validation to the signup flow.
  - Displayed logged-in user initials in the navigation header.
  - Seeded default admin account (`admin@admin.com`).

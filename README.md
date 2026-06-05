# RotaSphere 🎪
### Event Showcase & Booking Platform (Rotaract District 3192)

RotaSphere is a premium, high-performance event management web application custom-built for **Rotaract District 3192**. It enables clubs to showcase local initiatives, manage attendee registrations, check-in guests, and book ticket passes.

---

## 🚀 Hosting on DigitalOcean App Platform

This repository contains a pre-configured DigitalOcean App Specification [app.yaml](file:///.do/app.yaml) that automates the deployment of this Next.js project.

### Step-by-Step Deployment Guide

1. **Push Changes to GitHub**:
   Ensure all changes are committed and pushed to your branch (e.g. `master`).

2. **Launch App Platform on DigitalOcean**:
   * Navigate to the [DigitalOcean Apps Console](https://cloud.digitalocean.com/apps).
   * Click **Create App** and choose **GitHub** as the source.
   * Authorize your account and select the repository: `techrotaract3192/digital-ocean-nodeJS-Rotaract3192`.
   * Set the branch to `master` (or the branch you pushed to).
   * DigitalOcean will automatically detect the `.do/app.yaml` file and parse the app specifications.

3. **Configure Environment Variables**:
   You will be prompted to enter the values for key environment variables. Provide the values from your dashboards:

   | Variable Name | Scope | Type | Description |
   | :--- | :--- | :--- | :--- |
   | `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | Build & Run | Secret | Clerk dashboard Publishable Key |
   | `CLERK_SECRET_KEY` | Run Time | Secret | Clerk dashboard Secret Key |
   | `NEXT_PUBLIC_SUPABASE_URL` | Build & Run | Secret | Supabase API connection URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Build & Run | Secret | Supabase anon/public API Key |
   | `SUPABASE_SERVICE_ROLE_KEY` | Run Time | Secret | Supabase service role key (for admin actions) |
   | `NEXT_PUBLIC_OLA_MAPS_API_KEY` | Build & Run | Secret | Ola Maps client API Key |
   | `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | Build & Run | Plain | `/sign-in` |
   | `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | Build & Run | Plain | `/sign-up` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | Build & Run | Plain | `/dashboard` |
   | `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | Build & Run | Plain | `/dashboard` |

   > [!IMPORTANT]
   > Ensure that all variables prefixed with `NEXT_PUBLIC_` are set with the **Build & Run** scope. Next.js inlines these variables during the build stage (`next build`); leaving them as Run-only will prevent them from being bundled in the frontend.

4. **Review & Deploy**:
   * Choose the **Basic** plan with **basic-xxs** container size ($5.00/mo) for standard testing or light workloads.
   * Click **Launch App** to initiate the build.
   * Once finished, DigitalOcean will provide a live public HTTPS URL for your application.

---

## 🗄️ Supabase Database Schema

Before users can successfully create events and book tickets, make sure your Supabase Database has the required table structure. Run the following migration script in your **Supabase Dashboard -> SQL Editor**:

```sql
-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Create Events Table
CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT,
    date TEXT NOT NULL,
    time TEXT NOT NULL,
    location TEXT NOT NULL,
    category TEXT NOT NULL,
    price TEXT NOT NULL,
    capacity INTEGER NOT NULL DEFAULT 100,
    attendees_count INTEGER NOT NULL DEFAULT 0,
    image TEXT NOT NULL,
    organizer_name TEXT NOT NULL,
    organizer_email TEXT,
    type TEXT NOT NULL DEFAULT 'free', -- 'free' or 'paid'
    google_maps_url TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Create Tickets Table
CREATE TABLE IF NOT EXISTS tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    user_id TEXT NOT NULL, -- Clerk User ID
    ticket_code TEXT UNIQUE NOT NULL,
    price_paid NUMERIC NOT NULL DEFAULT 0.00,
    status TEXT NOT NULL DEFAULT 'active', -- 'active' or 'cancelled'
    payment_id TEXT, -- Paytm Payment / Order Transaction ID
    order_id TEXT,
    purchased_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. Create Attendees Table
CREATE TABLE IF NOT EXISTS attendees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_id UUID REFERENCES events(id) ON DELETE CASCADE NOT NULL,
    clerk_id TEXT NOT NULL,
    email TEXT NOT NULL,
    full_name TEXT NOT NULL,
    ticket_id UUID REFERENCES tickets(id) ON DELETE SET NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(event_id, clerk_id)
);
```

---

## 🛠️ Local Development

To run the project locally:

1. Clone your repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file with the configuration variables shown above.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

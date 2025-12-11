# Kali Jhota - Traditional Indian Marble Game

## Overview

Kali Jhota is a traditional Indian marble guessing game reimagined as a full-stack web application. Players engage in a marble-hiding and guessing game, competing against AI, friends, or random opponents in real-time. The application integrates a marble-based economy for purchases and rewards, leaderboards, referral systems, and tournament play with entry fees and prize pools. The project aims to blend a premium gaming experience, inspired by platforms like Chess.com, with rich traditional Indian cultural aesthetics.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### UI/UX Decisions

The application features a dark gradient background theme with gold and neon accents for a premium and vibrant feel, inspired by "Kanche" (marbles) aesthetics. Success states are glowing green, errors red, and UI elements utilize translucent overlays with backdrop blur. Typography uses a system font stack, and spacing is based on Tailwind units. The design incorporates custom CSS for neon glows, glassmorphism, and decorative marble orb styles.

### Technical Implementations

The frontend is built with React and TypeScript, using Vite for development and Wouter for routing. UI components are from `shadcn/ui` (Radix UI primitives) styled with Tailwind CSS, following a "new-york" design variant. State management and data fetching are handled by TanStack Query, with local storage for player data.

The backend uses Express.js for HTTP and API routes, with Drizzle ORM for type-safe interaction with a PostgreSQL database (Neon serverless). WebSocket support is configured for real-time multiplayer functionality. The API provides RESTful endpoints for catalog management, marble purchases, user transactions, game points, and tournament windows. Storage is designed with an interface to allow multiple backends, currently supporting an in-memory implementation.

### Feature Specifications

*   **Admin Panel:** Secure login with OTP, dashboard for catalog management, quarterly updates, and password changes.
*   **Profile System:** Dedicated page for display name editing, profile picture upload, and stats display (marbles, points, games played/won, tournament winnings).
*   **Payment Gateway:** Stripe integration for marble purchases, checkout sessions, and customer management.
*   **OTP Security:** 6-digit, 5-minute expiry OTP for admin login, leveraging Twilio for SMS delivery in production.
*   **Multiplayer Game Improvements:** Catalog items stored in PostgreSQL, traditional role-switching rules, and 3-second auto-restart between rounds.
*   **Referral System:** Unique per-player referral codes, share options, and tracking of referred friends and earned marbles.
*   **Onboarding:** Age verification (10+ to play, 15+ for purchases) and ad interest selection with 9 categories.
*   **Marble Accounting System:** A four-bucket model (`freeMarbles`, `purchasedMarbles`, `pvpWinMarbles`, `aiWinMarbles`) determining tournament eligibility and tracking sources of marbles.
*   **Multi-Language Support:** Implemented for 9 Indian languages (English, Hindi, Tamil, Telugu, Kannada, Bengali, Marathi, Gujarati, Punjabi) with a context-based translation system.

### System Design Choices

A shared schema (`shared/schema.ts`) is used for consistency between frontend and backend, validated with Drizzle-Zod. The system uses a modular approach for storage and services, enabling flexibility and scalability. WebSocket communication is central to real-time multiplayer, with custom hooks for game state synchronization.

## External Dependencies

*   **Database:** Neon Serverless PostgreSQL (`@neondatabase/serverless`), Drizzle ORM, Drizzle Kit for migrations.
*   **Real-time Communication:** `ws` package for WebSocket support.
*   **UI & Components:** React, TypeScript, Vite, Wouter, `shadcn/ui`, Radix UI primitives, Tailwind CSS, Lucide React (icons), `class-variance-authority`, `cmdk`.
*   **Form & Validation:** React Hook Form, Hookform Resolvers, Zod.
*   **Date Handling:** `date-fns`.
*   **Payment Processing:** Stripe (`stripe` package, `stripe-replit-sync`).
*   **SMS & OTP:** Twilio (`twilio` package).
*   **Session Management:** `connect-pg-simple` for PostgreSQL-based session storage.
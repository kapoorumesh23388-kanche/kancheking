# Kali Jhota - Traditional Indian Marble Game

## Overview

Kali Jhota is a traditional Indian marble guessing game built as a full-stack web application. Players compete by hiding marbles in their fist and challenging opponents to guess whether the count is odd or even. The application supports multiple game modes including AI opponents, friend challenges via room codes, random player matchmaking, and tournament play with entry fees and prize pools.

The game features a marble-based economy where players can purchase marbles, earn points through gameplay, and redeem rewards from a catalog. It includes real-time multiplayer functionality, leaderboards, referral systems, and a premium gaming aesthetic inspired by platforms like Chess.com combined with traditional Indian cultural elements.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type-safe component development
- Vite as the build tool and development server
- Wouter for client-side routing (lightweight alternative to React Router)
- Client-side code organized in `client/src/` directory

**UI Component System**
- shadcn/ui component library (Radix UI primitives with custom styling)
- Design system based on "new-york" style variant
- Tailwind CSS for utility-first styling with custom color variables
- Component configuration in `components.json` with path aliases (`@/components`, `@/lib`, etc.)

**State Management & Data Fetching**
- TanStack Query (React Query) for server state management and API caching
- Custom query client with disabled refetching by default (infinite stale time)
- Local storage for persisting player data (marbles, game stats)
- Custom hooks for game-specific logic (e.g., `useGameSocket` for WebSocket connections)

**Design System**
- Dark gradient background theme (`#0F2027` → `#203A43` → `#2C5364`)
- Gold accent colors (`#FFD700` primary, `#FFA500` secondary) for premium feel
- Success states in glowing green (`#00FF88`), errors in red (`#FF4444`)
- Translucent overlays with backdrop blur for cards and UI elements
- Typography using system font stack for performance
- Custom spacing system based on Tailwind units (2, 4, 6, 8, 10, 12, 15, 20, 25, 30)

### Backend Architecture

**Server Framework**
- Express.js for HTTP server and API routes
- HTTP server created for potential WebSocket upgrades
- Custom middleware for request logging and JSON body parsing
- Routes organized in `server/routes.ts` with async/await pattern

**Data Layer**
- Drizzle ORM for type-safe database operations
- PostgreSQL database via Neon serverless
- Schema defined in `shared/schema.ts` (shared between client and server)
- WebSocket support configured for real-time features

**Storage Implementation**
- In-memory storage implementation (`MemStorage` class) for development/fallback
- Interface-based design (`IStorage`) allowing multiple storage backends
- Support for users, catalog items, transactions, game points, tournaments, and game rooms

**API Structure**
- RESTful endpoints under `/api` prefix
- Catalog management (`GET/POST /api/catalog`)
- Marble purchases (`POST /api/marbles/purchase`)
- User transactions and game points tracking
- Tournament window management
- Real-time game room creation and matchmaking

### Database Schema

**Users Table**
- UUID primary keys with auto-generation
- Username/password authentication fields
- Marble and points balance tracking
- Game statistics (games played, games won)
- Referral system (referral code and referredBy fields)
- Timestamp for account creation
- Stripe integration fields: `stripeCustomerId`, `stripeSubscriptionId`

**Game Economy Tables**
- `catalogItems`: Rewards catalog with points cost and descriptions
- `marbleTransactions`: Purchase history and transaction tracking
- `gamePoints`: Points earned from individual games with opponent tracking

**Multiplayer Tables**
- `tournamentWindows`: Tournament brackets with player counts and prize pools
- `gameRooms`: Room-based multiplayer sessions (implied from storage interface)

**Schema Validation**
- Drizzle-Zod integration for runtime type validation
- Shared schema types between frontend and backend for consistency

### External Dependencies

**Database & Infrastructure**
- Neon Serverless PostgreSQL (`@neondatabase/serverless`)
- WebSocket support via `ws` package for Neon connection
- Drizzle Kit for database migrations (`drizzle-kit push`)

**UI & Component Libraries**
- Radix UI primitives (18+ components: accordion, alert-dialog, avatar, checkbox, dialog, dropdown-menu, etc.)
- shadcn/ui component system
- Lucide React for icons
- class-variance-authority for component variants
- cmdk for command palette/search interfaces

**Form & Validation**
- React Hook Form with Hookform Resolvers
- Zod for schema validation (via drizzle-zod)
- date-fns for date formatting and manipulation

**Development Tools**
- tsx for TypeScript execution in development
- esbuild for production builds
- Replit-specific plugins (vite-plugin-runtime-error-modal, vite-plugin-cartographer, vite-plugin-dev-banner)

**Session Management**
- connect-pg-simple for PostgreSQL-based session storage
- Configured for persistent sessions across server restarts

**Real-time Communication**
- WebSocket implementation for multiplayer games
- Custom `useGameSocket` hook for game state synchronization
- Message types: join, move, guess, result, chat, sync

**Payment Processing**
- Stripe integration (`stripe` package, `stripe-replit-sync`)
- Handles marble purchases and customer management
- Stripe webhook synchronization with PostgreSQL database

**SMS & OTP**
- Twilio integration (`twilio` package) for SMS OTP delivery
- OTP generation and verification (5-minute expiry)
- Graceful fallback to console logging in development

## Feature Implementation Status

### ✅ Completed Features

**Admin Panel System:**
- Admin login page with credentials (admin/admin123)
- OTP-based double security authentication
- Admin dashboard for catalog management (add/delete items)
- Quarterly catalog updates
- Admin password change functionality
- Lock icon button in header for quick access

**Profile System:**
- Dedicated `/profile` page for user profile management
- Display name editing
- Profile picture upload (base64 data URL storage)
- Stats display (marbles, points, games played/won, tournament winnings)
- API endpoints: `GET /api/user/:userId`, `POST /api/profile/update`

**Payment Gateway:**
- Stripe integration for marble purchases
- Checkout session creation
- Customer management with Stripe IDs
- Test mode ready (use card: 4242 4242 4242 4242)

**OTP Security:**
- OTP generation and verification (6-digit, 5-minute expiry)
- Phone number configuration (currently: 9211979518)
- Development mode: OTP printed to server logs
- Production ready: Twilio SMS integration configured
- Admin login flow: Credentials → OTP → Dashboard access

## Recent Changes (Latest Session)

### 🆕 Payment Gateway Integration
- Created `server/stripeClient.ts` - Stripe API client with credential management
- Created `server/stripeService.ts` - Stripe service layer for customer and checkout operations
- Added `/api/marble-purchase` endpoint for checkout sessions
- Added `stripeCustomerId` and `stripeSubscriptionId` to user schema
- Integrated with Replit Stripe connection (already configured)

### 🆕 OTP & SMS Setup
- Created `server/twilioClient.ts` - Twilio SMS client
- Integrated Twilio into `/api/admin/send-otp` endpoint
- OTP gracefully falls back to console logging if Twilio not configured
- SMS format: "Your Kanche King Admin OTP is: {otp}. Valid for 5 minutes."

### 🆕 Admin Lock Icon
- Added Lock icon (🔒) button in GameHeader for easy admin panel access
- Direct navigation to admin login on click

### 🆕 Documentation
- Created `TESTING_GUIDE.md` with step-by-step testing instructions
- Covers: Publishing, Admin Login/OTP Testing, Payment Testing, Twilio Setup

## Deployment Status

### Ready for Publishing:
✅ Game logic complete
✅ Admin panel with OTP
✅ Stripe payment integration
✅ User profile system
✅ All core features functional

### How to Publish:
1. Click "Publish" button (top right of Replit)
2. Choose "Autoscale Deployment"
3. Add payment method if prompted
4. Wait 5-10 minutes for deployment
5. Game will be live on `.replit.app` domain

## Testing Instructions

See `TESTING_GUIDE.md` for complete testing procedures:
- Admin login with OTP (logs to console in dev, SMS when Twilio configured)
- Payment gateway testing (use Stripe test card: 4242 4242 4242 4242)
- Admin dashboard functionality
- Catalog management

## Default Admin Credentials

- **Admin ID:** admin
- **Password:** admin123 (CHANGE in Settings!)
- **Phone:** +91-9211979518
- **OTP:** Check server logs (development) or receive via SMS (with Twilio)

## Future Enhancements

- Multi-language support for 10 languages (English + 9 Indian regional languages)
- Gender-based animated player avatars
- Support/feedback system (partially implemented)
- Age-based ads filtering (15+ for purchases)
- Admin OTP via Twilio SMS (currently prints to logs)
- Tournament system with prize pools
- Leaderboards and ranking system

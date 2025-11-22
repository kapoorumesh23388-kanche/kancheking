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
## Profile System (COMPLETED)

### Features Added
- **Profile Page**: Dedicated `/profile` page for editing user profile
- **Display Name**: Edit personalized display name (shown to other players)
- **Profile Image**: Upload custom profile picture (stored as base64 data URL)
- **Stats Display**: View marbles, points, games played/won, purchased marbles, and tournament winnings
- **API Endpoints**:
  - `GET /api/user/:userId` - Fetch user profile data
  - `POST /api/profile/update` - Save profile changes (name + image)

### Database Fields
- `displayName` - Player's display name (optional)
- `profileImage` - Player's profile picture URL (optional, supports data URLs)
- `purchasedMarbles` - Tracks marbles from cash purchases (for tournament entry)
- `tournamentWinnings` - Temporary marbles shown during tournament

### How It Works
1. User clicks profile icon in header → navigates to `/profile`
2. Profile page loads user data via `/api/user/:userId`
3. Player can edit:
   - Display name (visible to other players)
   - Upload profile image (as JPG/PNG)
4. Click "Save Changes" → API calls `/api/profile/update`
5. Changes saved to backend and displayed immediately

### Frontend Components
- `client/src/pages/Profile.tsx` - Full profile management page
- Image upload with preview
- Real-time character counter for display name
- All user stats displayed in cards
- Proper error handling and loading states

### Storage/Backend
- `server/storage.ts` - Added `updateUserProfile()` method
- `server/routes.ts` - Added two new API endpoints
- Data persisted to database (using MemStorage for dev)


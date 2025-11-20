# Kali Jhota Game - Design Guidelines

## Design Approach
**Reference-Based**: Drawing from gaming platforms like Chess.com and mobile game aesthetics, combined with traditional Indian cultural elements. The existing frontend establishes a premium gaming aesthetic that must be maintained across all backend-integrated features.

## Core Visual Identity

### Color System
- **Primary Background**: Dark gradient (`#0F2027` → `#203A43` → `#2C5364`)
- **Accent Gold**: `#FFD700` (primary), `#FFA500` (secondary) for premium feel
- **Success/Active**: `#00FF88` (marble gains, active states)
- **Error/Loss**: `#FF4444` (marble losses, warnings)
- **Translucent Overlays**: `rgba(255,255,255,0.1)` for cards, `rgba(0,0,0,0.3)` for headers

### Typography Hierarchy
- **Hero/Title**: 3rem (48px), weight 700, gold gradient text with glow effect
- **Section Headers**: 2.5rem (40px), weight 700, gold color
- **Subsections**: 1.8rem (29px), weight 700
- **Body Text**: 1rem (16px), weight 400-600
- **Small Text/Labels**: 0.9rem (14px), weight 600
- **Font Stack**: System UI fonts (`-apple-system, BlinkMacSystemFont, 'Segoe UI'`)

### Spacing System
Use Tailwind units: **2, 4, 6, 8, 10, 12, 15, 20, 25, 30**
- Card padding: `p-6` to `p-8`
- Section margins: `my-8`
- Grid gaps: `gap-6`
- Button padding: `px-8 py-4`

## Layout Patterns

### Header (Fixed)
- Fixed top bar with translucent dark background and backdrop blur
- Left: Back button (when applicable), Right: Settings/Profile icons
- Height: 60-70px with bottom gold border
- Circular icon buttons (45px) with gold accents

### Content Structure
- Main container: `max-w-7xl` with `px-5` horizontal padding
- Top padding: `pt-20` (to account for fixed header)
- Cards: Rounded corners (20px), translucent backgrounds, gold borders
- Grid layouts: Auto-fit with minimum 280px cards

### Game-Specific Components

**Player Cards**
- Circular avatars (80-120px) with gold gradient borders and glow
- Name display with editable indicator
- Marble count in large, glowing green numbers (2rem)
- Role/status badges with rounded pill shapes
- Active state: Green glow with subtle pulse animation

**VS Screen Layout**
- Two player boxes side-by-side with central VS divider
- Active player gets green highlight glow
- Translucent card backgrounds with border highlights

**Game Board Area**
- Central focus with dark translucent backdrop
- Betting controls at bottom with large, clear buttons
- Marble animation overlays for wins/losses

## Component Library

### Buttons
**Primary Action** (Start Game, Place Bet):
- Large size: `px-15 py-6`, 2rem text
- Gradient background: Red to orange (`#FF6B6B` → `#FF8E53`)
- Strong shadow with hover lift effect
- Uppercase, letter-spacing: 2px

**Secondary Action** (Mode Selection):
- Medium size: `px-8 py-4`, 1rem text
- Gold translucent background
- Gold border (2px)
- Hover: Increased opacity and scale

**Icon Buttons**:
- Circular 45px, gold translucent background
- Single icon, centered
- Hover: Scale 1.1 with glow

### Cards
**Standard Game Cards**:
- Background: `rgba(255,255,255,0.1)` with gradient overlay
- Border: 2px gold at 0.2-0.3 opacity
- Border-radius: 20px
- Padding: 30px
- Hover: Lift effect (-10px) with stronger glow

**Stat Badges**:
- Inline display, rounded-full (20px radius)
- Gold gradient background
- Small text (0.9rem), weight 600
- Minimal padding: `px-5 py-2`

### Modals/Overlays
- Full-screen overlays with same gradient background
- Content cards centered with max-width constraints
- Close button (X) top-right corner
- Smooth fade-in transitions

## Page-Specific Layouts

### Leaderboard Page
- Header with title and filter tabs (Global/Tournament/Friends)
- Ranked list with position numbers, avatars, names, marble counts
- Top 3 players get special gold/silver/bronze highlighting
- Infinite scroll or pagination

### Tournament Page
- Tournament brackets visualization (tree structure)
- Current match highlighted
- Entry requirements badge prominently displayed
- Prize pool display with gold styling
- Join/Watch buttons based on status

### Profile/Settings Page
- Large centered avatar with edit overlay
- Stats grid (2-3 columns): Games Played, Win Rate, Total Marbles
- Transaction history table with alternating row backgrounds
- Edit fields with gold focus states

## Special Effects

### Animations (Minimal Use)
- Marble change overlay: Large number appearing, scaling up then fading
- Pulse effect for active player indicator
- Smooth transitions (0.3s ease) for hover states
- NO complex scroll animations or excessive motion

### Visual Feedback
- Glow effects using `text-shadow` and `box-shadow` with gold color
- Gradient text for headers using `-webkit-background-clip`
- Backdrop blur (10px) for overlays and header

## Images
- **Avatar System**: Circular profile images (user uploads) OR emoji/icon fallbacks
- **Tournament Banners**: NO hero images needed - focus on data visualization
- **Background Patterns**: Subtle texture overlays acceptable but not required

## Accessibility
- Maintain 4.5:1 contrast ratio between text and backgrounds
- All interactive elements minimum 44x44px touch targets
- Focus states with gold outline (2px)
- Clear visual hierarchy with size and weight differentiation
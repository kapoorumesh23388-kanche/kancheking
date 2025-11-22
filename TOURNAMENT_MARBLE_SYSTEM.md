# Tournament Marble System - Kali Jhota

## 🎯 Overview

Tournament system with strict marble type separation:
- **Entry**: Requires 2500 **PURCHASED** marbles only (not earned/free marbles)
- **During Tournament**: Winning marbles show temporarily in player account
- **After Tournament**: Winnings convert to redeemable **POINTS** for shop items

---

## 💎 Marble Types Explained

### **Total Marbles** (`user.marbles`)
- Sum of all marbles (purchased + earned)
- Used for regular gameplay
- Displayed prominently in UI

### **Purchased Marbles** (`user.purchasedMarbles`)
- Only from ₹ purchases via Stripe
- **ONLY these can be used for tournament entry**
- Tracked separately for revenue verification
- Cannot be earned from gameplay

### **Tournament Winnings** (`user.tournamentWinnings`)
- Temporary marbles awarded when player wins tournament
- Visible ONLY during active tournament
- Converted to points after tournament ends
- Disappear from account after conversion

### **Points** (`user.points`)
- Earned from tournament conversion, ad revenue share, game achievements
- **Redeemable** in shop for exclusive items
- Permanent part of player account

---

## 📊 Database Schema

### **User Table Updates**
```typescript
{
  id: UUID (primary key)
  username: string
  password: string
  marbles: integer              // Total marbles (purchased + earned)
  purchasedMarbles: integer     // Only from cash purchases
  tournamentWinnings: integer   // Temporary - during tournament only
  points: integer               // Redeemable points
  gamesWon: integer
  gamesPlayed: integer
  referralCode: string
  referredBy: string
  createdAt: timestamp
}
```

### **Tournament Windows Table Updates**
```typescript
{
  id: UUID (primary key)
  windowNumber: integer
  playerCount: integer
  status: varchar               // "waiting" | "active" | "completed" | "converted"
  maxPlayers: integer (default 100)
  entryFee: integer (default 2500)
  prizePool: integer
  winnerId: UUID               // NEW: Winner's user ID
  winnerMarblesAwarded: integer // NEW: Marbles given to winner
  createdAt: timestamp
  endedAt: timestamp           // NEW: When tournament ended
}
```

### **Tournament Conversions Table** (NEW)
```typescript
{
  id: UUID (primary key)
  userId: UUID                 // Winner's ID
  tournamentWindowId: UUID     // Which tournament
  marblesWon: integer          // How many marbles won
  pointsAwarded: integer       // How many points awarded
  status: varchar              // "pending" | "completed"
  createdAt: timestamp
  convertedAt: timestamp       // When conversion happened
}
```

---

## 🔄 Flow Diagram

```
STEP 1: PLAYER PURCHASES MARBLES
  ↓
User sends ₹100 via Stripe
  ↓
100 marbles added to:
  - user.marbles (total) ← now 250
  - user.purchasedMarbles ← now 100
  ↓
Transaction recorded: "Purchased 100 marbles"

═══════════════════════════════════════════════

STEP 2: TOURNAMENT ENTRY
  ↓
Player clicks "Join Tournament"
System checks: user.purchasedMarbles >= 2500
  ↓
IF NO: ❌ Error "Need 2500 purchased marbles"
IF YES:
  ↓
  - user.purchasedMarbles: 100 → -2500 (deduct)
  - user.marbles: 250 → -2500 (deduct total)
  ↓
  Transaction recorded: "Tournament entry (2500 PURCHASED marbles)"
  Player confirmed in tournament

═══════════════════════════════════════════════

STEP 3: TOURNAMENT PROGRESS
  ↓
Tournament happens (1-7 days)
Player wins games, advances in bracket
  ↓
User.tournamentWinnings visible in account
Shows: "🏆 250,000 Winning Marbles - Temp Display"
Message: "Will convert to points when tournament ends"

═══════════════════════════════════════════════

STEP 4: TOURNAMENT ENDS
  ↓
Admin/System calls: POST /api/tournament/convert-winnings
  ↓
System checks: user.tournamentWinnings = 250,000
  ↓
  1. Remove 250,000 from user.marbles
  2. Set user.tournamentWinnings = 0
  3. Add 250,000 to user.points
  ↓
Transaction recorded: "Tournament conversion: 250,000 marbles → 250,000 points"
  ↓
User notification: "✅ Winnings converted! 250,000 points ready to redeem!"

═══════════════════════════════════════════════

STEP 5: REDEMPTION
  ↓
Player goes to Shop
Sees 250,000 points balance
Selects items to redeem (Premium items, bonuses, etc.)
  ↓
Points deducted, items added to inventory
```

---

## 🚀 API Endpoints

### **1. Marble Purchase**
```
POST /api/marbles/purchase
Content-Type: application/json

{
  "userId": "user-uuid",
  "marblesAmount": 100,
  "transactionId": "stripe-txn-12345"
}

Response:
{
  "success": true,
  "marbles": 250,
  "purchasedMarbles": 100
}
```

### **2. Join Tournament (Entry)**
```
POST /api/tournament/join
Content-Type: application/json

{
  "userId": "user-uuid",
  "windowId": "tournament-uuid"
}

Response SUCCESS:
{
  "success": true,
  "marbles": 0,
  "purchasedMarbles": -2400,
  "message": "Tournament entry confirmed. Entry fee (2500 purchased marbles) deducted."
}

Response ERROR (Insufficient Purchased Marbles):
{
  "error": "Insufficient purchased marbles. Tournament entry requires 2500 purchased marbles only (not earned/free marbles).",
  "purchasedMarblesAvailable": 100
}
```

### **3. Record Tournament Winner (During Tournament)**
```
POST /api/tournament/winner
Content-Type: application/json

{
  "userId": "user-uuid",
  "windowId": "tournament-uuid"
}

Response:
{
  "success": true,
  "marbles": 250000,
  "tournamentWinnings": 250000,
  "message": "🏆 Tournament Win! 250,000 marbles awarded. Will convert to 250,000 redeemable points when tournament ends.",
  "note": "These marbles will disappear after tournament conversion - you'll receive points instead"
}
```

### **4. Convert Winnings to Points (After Tournament Ends)**
```
POST /api/tournament/convert-winnings
Content-Type: application/json

{
  "userId": "user-uuid",
  "windowId": "tournament-uuid"
}

Response SUCCESS:
{
  "success": true,
  "message": "✅ Tournament winnings converted to redeemable points!",
  "marblesConverted": 250000,
  "pointsAwarded": 250000,
  "marbles": 0,
  "tournamentWinnings": 0,
  "points": 250000,
  "details": "You can now redeem these points in the Shop for exclusive items"
}

Response ERROR (No Winnings):
{
  "error": "No tournament winnings to convert",
  "tournamentWinnings": 0
}
```

---

## 📋 Implementation Checklist

### ✅ COMPLETED
- [x] Database schema updated with `purchasedMarbles` and `tournamentWinnings`
- [x] Tournament entry API validates purchased marbles only
- [x] Winner API awards temporary marbles during tournament
- [x] Conversion API converts marbles to points after tournament
- [x] Transaction history tracks all events
- [x] Type exports added for new tables

### ⏳ NEXT STEPS
- [ ] Integrate with Stripe (track purchase source)
- [ ] Frontend: Show purchased vs earned marbles separately
- [ ] Frontend: Display tournament winnings prominently during tournament
- [ ] Frontend: Show conversion notification when tournament ends
- [ ] Admin Dashboard: Trigger tournament end & conversions manually
- [ ] Automated: Cron job for auto-converting after tournament ends

---

## 💡 Example Scenario

```
November 15, 2025 - Player: Rajesh Kumar

Initial Account:
  Marbles: 150 (earned from gameplay)
  Purchased Marbles: 0
  Points: 0
  Tournament Winnings: 0

ACTION 1: Buys 2500 Marbles
  Stripe transaction: ₹250 → 2500 marbles
  ↓
Updated Account:
  Marbles: 2650 (150 earned + 2500 purchased)
  Purchased Marbles: 2500
  Points: 0
  Tournament Winnings: 0

ACTION 2: Enters Tournament (November 16)
  Pays entry fee: 2500 purchased marbles
  ↓
Updated Account:
  Marbles: 150 (back to just earned)
  Purchased Marbles: 0 (all used for entry)
  Points: 0
  Tournament Winnings: 0 (not yet won)
  Status: "In Tournament"

ACTION 3: Wins Tournament (November 18)
  System records winner
  ↓
Updated Account:
  Marbles: 250150 (150 earned + 250000 temporary winnings)
  Purchased Marbles: 0
  Points: 0
  Tournament Winnings: 250000
  Status: "Won Tournament - Waiting for conversion"
  Display: "🏆 250,000 Winning Marbles (Temporary)"

ACTION 4: Tournament Ends (November 20)
  Admin calls: POST /api/tournament/convert-winnings
  ↓
Updated Account:
  Marbles: 150 (back to earned only)
  Purchased Marbles: 0
  Points: 250000 (NEW - converted from winnings)
  Tournament Winnings: 0 (cleared)
  Status: "Ready to Redeem"
  Display: "✅ 250,000 Points Available to Redeem!"

ACTION 5: Redeems Points in Shop
  Buys: "Premium Weapon Set" (₹10000 = 100000 points)
  ↓
Updated Account:
  Marbles: 150
  Purchased Marbles: 0
  Points: 150000 (250000 - 100000)
  Tournament Winnings: 0
  Inventory: +Premium Weapon Set
```

---

## 🔐 Security Rules

1. **Entry Verification**: Always check `purchasedMarbles >= 2500` before allowing tournament entry
2. **Type Separation**: Never mix purchased and earned marbles
3. **Temporary Marbles**: Always clear `tournamentWinnings` after conversion
4. **Point Safety**: Points are permanent and cannot be reversed
5. **Audit Trail**: Every transaction logged with type ("tournament_entry", "tournament_winning_marbles", "tournament_conversion")

---

## 📱 Frontend Display

### **Account Summary Section**
```
Total Marbles: 250,000
├─ Earned Marbles: 150
├─ Purchased Marbles: 2,500
└─ Tournament Winnings: 247,350 🏆 (Temporary)

Points: 0
└─ Redeemable: 0
```

### **During Tournament**
```
🎮 TOURNAMENT IN PROGRESS
Your Status: Winner! 🏆
Winning Marbles: 250,000 (Temporary)
⏱️ Tournament Ends: November 20, 5:00 PM
These marbles will convert to points when tournament ends
```

### **After Conversion**
```
✅ TOURNAMENT COMPLETED
Congratulations!
250,000 points awarded to your account
👉 Visit Shop to redeem exclusive items
```

---

## 💰 Revenue Impact

```
Player Journey:
1. Buys ₹250 marbles
2. Enters tournament for free (uses purchased marbles)
3. Wins tournament, gets 250,000 points
4. Redeems points for items/boosts
5. Repeat: Buy more marbles → enter tournaments → redeem

Your Revenue:
- ₹250 marble purchase = ₹180 (after Stripe 28% cut)
- Tournament entry fee = 2500 marbles (no extra cost)
- Player spend on redemptions = Additional revenue potential
```

---

## ❓ FAQ

**Q: Can player use earned marbles for tournament entry?**
A: NO. Only purchased marbles qualify for tournament entry.

**Q: What if player has 2000 purchased + 500 earned marbles?**
A: Cannot enter tournament. System checks `purchasedMarbles >= 2500` only.

**Q: Can winning marbles be traded or transferred?**
A: NO. They are temporary display only and automatically clear after conversion.

**Q: What if tournament is cancelled?**
A: Winning marbles return to 0, entry fee is NOT refunded (they used purchased marbles, tournament was earned).

**Q: How long does conversion take?**
A: Instant when admin/cron calls `/api/tournament/convert-winnings`. Points available immediately.

**Q: Can player see conversion history?**
A: YES. Check transaction history - shows "Tournament conversion: X marbles → Y points"

**Q: What about taxation or regulations?**
A: Track all in transactions table for compliance/audits. Points are not money - they're digital items.

---

## 📞 Support

All endpoints are live and ready to use:
- ✅ Purchase tracking
- ✅ Entry validation
- ✅ Winner recording
- ✅ Conversion system
- ✅ Transaction history

**Next:** Connect to Stripe and set up admin tournament management!

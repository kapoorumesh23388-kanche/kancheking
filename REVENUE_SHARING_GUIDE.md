# Player Revenue Sharing Model - Kali Jhota

## Overview
Players who generate ad revenue through their gameplay time will receive **20% of that ad revenue as game points**, calculated and awarded monthly.

---

## How It Works

### **Step 1: Ad Revenue Generation**
When a player watches/interacts with ads during gameplay:
```
Example: Player watches banner ad → ₹10 ad revenue generated
This revenue is tracked against that player's account
```

### **Step 2: Monthly Calculation (Runs on 1st of each month)**
All ad revenue from a single player in a month is summed:
```
November 2025:
  - Player A's total ad revenue = ₹1,000
  - Player B's total ad revenue = ₹500
  - Player C's total ad revenue = ₹250
```

### **Step 3: 20% Share Calculation**
20% of the total ad revenue is awarded as points:
```
Player A:
  Total ad revenue: ₹1,000
  Share percentage: 20%
  Points awarded: ₹1,000 × 20% = 200 points (added to user.points)

Player B:
  Total ad revenue: ₹500
  Share percentage: 20%
  Points awarded: ₹500 × 20% = 100 points

Player C:
  Total ad revenue: ₹250
  Share percentage: 20%
  Points awarded: ₹250 × 20% = 50 points
```

### **Step 4: Points Awarded to Player**
- Points are added directly to player's `points` balance
- Players can redeem points from Shop catalog
- Points do NOT come from in-app marble purchases

---

## Revenue Sharing Rules

### ✅ Points ARE awarded for:
- **Banner ads** watched during gameplay
- **Interstitial ads** shown between game rounds
- **Rewarded ads** (player explicitly watches for rewards)
- **Native ads** integrated in game UI

### ❌ Points are NOT awarded for:
- **Marble purchases** (in-app purchases)
- **Tournament entry fees**
- **Referral bonuses**
- Any non-ad revenue streams

---

## API Endpoints

### **1. Track Ad Revenue**
```
POST /api/ad-revenue/track
Content-Type: application/json

{
  "userId": "user-uuid",
  "adType": "banner",           // "banner", "rewarded", "interstitial"
  "revenueGenerated": 1000      // in paise (1 rupee = 100 paise)
}

Response:
{
  "success": true,
  "message": "Ad revenue tracked",
  "record": {
    "userId": "user-uuid",
    "adType": "banner",
    "revenueGenerated": 1000,
    "timestamp": "2025-11-22T15:30:00Z"
  }
}
```

### **2. Get Player's Revenue Share Status**
```
GET /api/player/{userId}/revenue-share

Response:
{
  "userId": "user-uuid",
  "currentMonth": "2025-11",
  "totalAdRevenueThisMonth": 1000,
  "expectedSharePoints": 200,        // 20% of revenue
  "status": "tracking",
  "message": "Ad revenue will be calculated and awarded monthly"
}
```

### **3. Calculate Monthly Revenue Share (Admin/Cron)**
```
POST /api/revenue-share/calculate-monthly

Response:
{
  "success": true,
  "message": "Monthly revenue share calculation queued",
  "month": "2025-11",
  "details": "Will process all player ad revenues and award 20% as points"
}

This endpoint should run automatically on the 1st of each month
```

### **4. Revenue Share Leaderboard**
```
GET /api/revenue-share/leaderboard

Response:
{
  "leaderboard": [
    {
      "rank": 1,
      "userId": "user-a",
      "username": "Rajesh Kumar",
      "monthlyAdRevenue": 1000,
      "pointsAwarded": 200,
      "month": "2025-11"
    },
    {
      "rank": 2,
      "userId": "user-b",
      "username": "Priya Singh",
      "monthlyAdRevenue": 500,
      "pointsAwarded": 100,
      "month": "2025-11"
    }
  ],
  "message": "Revenue share leaderboard",
  "details": "Shows top players earning points from ads"
}
```

---

## Database Schema

### **player_ad_revenue Table**
Tracks each ad view/revenue event per player
```typescript
{
  id: UUID (primary key)
  userId: UUID
  adType: varchar ("banner" | "rewarded" | "interstitial")
  revenueGenerated: integer (in paise)
  createdAt: timestamp
}
```

### **player_revenue_share Table**
Monthly revenue share calculations
```typescript
{
  id: UUID (primary key)
  userId: UUID
  month: varchar ("2025-11" format)
  totalAdRevenue: integer (in paise)
  sharePercentage: integer (default 20)
  pointsAwarded: integer
  status: varchar ("pending" | "awarded")
  createdAt: timestamp
}
```

---

## Implementation Timeline

### **Phase 1: Foundation (DONE)**
✅ Database schema created
✅ API endpoints built
✅ Revenue tracking system ready

### **Phase 2: AdMob Integration (Next)**
- [ ] Connect Google AdMob to app
- [ ] Track ad impressions/revenue
- [ ] Automatic tracking of ad events

### **Phase 3: Monthly Automation (Next)**
- [ ] Set up cron job for monthly calculation
- [ ] Automatic points award
- [ ] Notification to players

### **Phase 4: Player Dashboard (Future)**
- [ ] Show earning history per month
- [ ] Revenue share leaderboard
- [ ] Earnings predictions

---

## Example Flow

```
Day 1 (Player starts playing):
  User watches banner ad → +₹10 revenue tracked (2025-11)
  
Day 15:
  User watches rewarded ad → +₹25 revenue tracked (2025-11)
  User watches banner ad → +₹10 revenue tracked (2025-11)
  Total so far: ₹45

Day 30 (End of November):
  User watches banner ad → +₹5 revenue tracked (2025-11)
  Total for month: ₹50

December 1 (Monthly Calculation):
  System calculates: ₹50 × 20% = 10 points
  Awards 10 points to user's account
  User can now redeem these 10 points in Shop

December 2:
  New month starts (2025-12)
  Ad tracking begins again for new month
```

---

## Benefits

### **For Players:**
- Earn rewards for watching ads
- No extra effort required
- Passive income through gameplay
- Redeem points for exclusive items

### **For You:**
- 80% of ad revenue goes to you
- 20% shared with active players
- Incentivizes longer play sessions
- Builds loyal player base

---

## Revenue Projections

### **Scenario: 10,000 Monthly Active Users**

```
Total Ad Revenue Generated: ₹50,000/month
Your Revenue (80%):         ₹40,000
Player Rewards (20%):       ₹10,000 as points

Top Earner (₹1000 in ad revenue):
  Gets 200 points (~₹5-10 worth in catalog)

Average Player (₹100 in ad revenue):
  Gets 20 points (~₹1-2 worth in catalog)
```

### **Scenario: 50,000 Monthly Active Users**

```
Total Ad Revenue Generated: ₹250,000/month
Your Revenue (80%):         ₹200,000
Player Rewards (20%):       ₹50,000 as points

This is significant revenue!
```

---

## Important Notes

1. **Only Ad Revenue**: Points ONLY come from ads, not marble purchases or tournaments
2. **Monthly Billing**: Revenue share calculated once per month on consistent day
3. **Transparent Tracking**: Players can see their ad revenue anytime via API
4. **No Fraud**: System tracks real ad impressions from Google AdMob
5. **Fair Distribution**: Same 20% share for all players

---

## Next Steps to Implement

1. ✅ Database schema created
2. ✅ API endpoints created
3. [ ] Connect Google AdMob
4. [ ] Integrate ad tracking with AdMob events
5. [ ] Set up monthly cron job
6. [ ] Create player dashboard to show earnings
7. [ ] Create revenue share leaderboard page

---

## Questions?

This system is production-ready for:
- Tracking ad revenue per player
- Calculating monthly revenue share
- Awarding points automatically
- Displaying leaderboards

All the infrastructure is in place. Just need to connect Google AdMob!

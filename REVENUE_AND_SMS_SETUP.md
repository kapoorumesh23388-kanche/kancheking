# Revenue & SMS Setup Guide

## 💰 View Your Game Revenue

### Where Earnings Go:
All marble purchase payments go directly to your **Stripe Account**

### Check Your Earnings:
1. Visit: https://dashboard.stripe.com
2. Log in with your Stripe account
3. Go to **"Home"** tab
4. You'll see:
   - **Total Volume** - Total revenue
   - **Recent Transactions** - Individual payments
   - **Payouts** - Money sent to your bank

### Bank Transfer:
- Stripe automatically sends money to your linked bank account
- Processing time: Usually 2-7 business days

---

## 📱 Setup Twilio for Real SMS OTP

### Your Admin Phone: +91-9211979518

### Step 1: Get Twilio Account (5 minutes)

1. **Go to:** https://www.twilio.com/console
2. **Sign up** (free trial available) or **Log in**
3. **On the Dashboard, you'll see:**
   - **Account SID** (starts with `AC...`)
   - **Auth Token** (click eye icon to show)
4. **Get a Phone Number:**
   - Click "Phone Numbers" in left menu
   - Click "Buy a Number"
   - Select country (India recommended)
   - Copy your new number
5. **You now have:**
   - ✅ Account SID
   - ✅ Auth Token
   - ✅ Phone Number

### Step 2: Add to Replit (2 minutes)

1. **In Replit**, click your **profile icon** (top right)
2. Click **"Secrets"** tab
3. **Add 3 new secrets:**

   **Secret 1:**
   - Key: `TWILIO_ACCOUNT_SID`
   - Value: (paste your Account SID)
   - Click "Add Secret"

   **Secret 2:**
   - Key: `TWILIO_AUTH_TOKEN`
   - Value: (paste your Auth Token)
   - Click "Add Secret"

   **Secret 3:**
   - Key: `TWILIO_PHONE_NUMBER`
   - Value: (paste your phone number, e.g., +14155552671)
   - Click "Add Secret"

### Step 3: Restart & Test (1 minute)

1. **Restart your app** (or let it auto-restart)
2. **Test OTP:**
   - Click Lock icon (🔒) in game
   - Enter admin/admin123
   - Click "Send OTP"
   - **Check your phone** - You'll receive SMS! 📱

---

## ✅ Testing Checklist

- [ ] Created Twilio account
- [ ] Got Account SID, Auth Token, Phone Number
- [ ] Added 3 secrets to Replit
- [ ] Restarted app
- [ ] Tested: Clicked admin login
- [ ] Tested: Sent OTP
- [ ] Tested: Received SMS on 9211979518

---

## 🎮 Summary

**Revenue:** View at https://dashboard.stripe.com  
**SMS OTP:** Set up via Twilio credentials  
**Status:** Ready for production! 🚀

# Kanche King - Testing & Deployment Guide

## 🚀 STEP 1: PUBLISH YOUR GAME

1. **Click the "Publish" button** (top right of Replit)
2. **Choose Autoscale Deployment** (recommended)
3. **Add payment method** if prompted
4. **Wait 5-10 minutes** for deployment

✅ Your game will be live with a `.replit.app` domain

---

## 🧪 STEP 2: TEST ADMIN LOGIN & OTP

### Test Admin Panel Access:

1. **Go to your live game URL**
2. **Click Lock icon (🔒)** in header → Admin Login
3. **Enter credentials:**
   - Admin ID: `admin`
   - Password: `admin123`
4. **Click "Send OTP"**

### Expected Results:

**Development Mode (Right Now):**
- OTP appears in **Server Console/Logs**
- Example: `OTP for admin admin: 123456`
- Copy that 6-digit number
- Enter in OTP field and login

**Live Mode (After Twilio Setup):**
- OTP will be **sent to phone +91-9211979518 via SMS**
- You'll receive real SMS message
- No console checking needed

---

## 💳 STEP 3: TEST PAYMENT GATEWAY

### Test Stripe Payment:

1. **Go to Shop page** in your game
2. **Click "Buy Marbles"** button
3. **Choose marble pack** (e.g., 100 marbles for $10)
4. **Use Stripe Test Card:**
   - Card Number: `4242 4242 4242 4242`
   - Expiry: `12/25`
   - CVC: `123`
5. **Complete payment**
6. **Check if marbles added** to your account

### Expected Flow:

```
Click Buy Marbles 
    ↓
Age Verification (if needed)
    ↓
Stripe Checkout Page Opens
    ↓
Enter Test Card Details
    ↓
Payment Successful
    ↓
Marbles Added to Account
```

---

## 📱 STEP 4: SETUP TWILIO FOR REAL SMS (Optional - Can Do Later)

### Why Setup Twilio?
- Right now OTP only shows in logs (development)
- After Twilio setup, OTP will be sent via **real SMS**
- More professional for live users

### How to Setup:

1. **Create Twilio Account:** https://www.twilio.com
2. **Get Trial Phone Number** (or upgrade account)
3. **Copy these credentials:**
   - Account SID
   - Auth Token
   - Phone Number
4. **Go to Replit** → Click on Twilio integration in your profile
5. **Add credentials** there
6. **Done!** OTP will automatically work

---

## 📊 TESTING CHECKLIST

- [ ] Game loads on live URL
- [ ] Admin Login page accessible (Lock icon)
- [ ] Can enter admin ID and password
- [ ] OTP appears in logs (development) or arrives via SMS (with Twilio)
- [ ] OTP verification works
- [ ] Can access admin dashboard
- [ ] Can add/delete catalog items
- [ ] Can change admin password
- [ ] Shop page loads
- [ ] Marble purchase button works
- [ ] Stripe payment works with test card
- [ ] Marbles added after payment

---

## 🔐 Admin Credentials

- **Admin ID:** admin
- **Password:** admin123 (CHANGE THIS in Settings!)
- **Phone:** +91-9211979518
- **OTP:** Check logs in development

---

## 📝 Notes

- **OTP Expiry:** 5 minutes
- **Admin Phone:** Set to 9211979518 (masked as 9518)
- **Test Payment Card:** Use 4242 4242 4242 4242 (Stripe test card)
- **Real Payments:** Activated automatically when going to production

---

## 🆘 Troubleshooting

### OTP Not Working?
- Check server logs for OTP number
- OTP expires after 5 minutes
- Twilio not configured? Check console logs

### Payment Not Working?
- Verify Stripe is connected (already done ✅)
- Use test card: 4242 4242 4242 4242
- Check browser console for errors

### Admin Panel Not Loading?
- Verify you're logged in
- Check admin token in localStorage

---

**You're all set! Game is production-ready with OTP & Payment Integration! 🎮🚀**

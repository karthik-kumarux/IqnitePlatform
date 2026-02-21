# 📧 Email Setup Guide for OTP Verification

The OTP email verification system is now implemented! However, you need to configure email credentials to send OTP emails.

## Quick Setup (Gmail)

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account: https://myaccount.google.com/security
2. Click on **"2-Step Verification"**
3. Follow the steps to enable 2FA if not already enabled

### Step 2: Generate App Password
1. Still in Security settings, scroll down to **"App passwords"**
2. Click on **"App passwords"**
3. Select **"Mail"** as the app
4. Select your device or choose **"Other"** and name it "IQnite"
5. Click **"Generate"**
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update .env File
Open `backend/.env` and update these lines:

```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="your-gmail-address@gmail.com"
EMAIL_PASSWORD="your-16-char-app-password"
```

**Example:**
```env
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT="587"
EMAIL_USER="john.doe@gmail.com"
EMAIL_PASSWORD="abcd efgh ijkl mnop"
```

### Step 4: Restart Backend
After updating `.env`, the backend should auto-reload. If not, restart it manually.

---

## 🧪 Testing Without Email (Development)

If you don't want to configure email right now, you can test OTP verification by:

1. **Register a new user** - OTP will be generated but email won't send
2. **Check the database** for the OTP:
   ```sql
   SELECT email, "verificationOtp", "verificationOtpExpires" 
   FROM users 
   WHERE email = 'your-test-email@example.com';
   ```
3. **Use the OTP from database** to verify on the frontend

---

## Alternative Email Providers

### Using Outlook/Hotmail
```env
EMAIL_HOST="smtp-mail.outlook.com"
EMAIL_PORT="587"
EMAIL_USER="your-email@outlook.com"
EMAIL_PASSWORD="your-password"
```

### Using SendGrid
```env
EMAIL_HOST="smtp.sendgrid.net"
EMAIL_PORT="587"
EMAIL_USER="apikey"
EMAIL_PASSWORD="your-sendgrid-api-key"
```

### Using Mailgun
```env
EMAIL_HOST="smtp.mailgun.org"
EMAIL_PORT="587"
EMAIL_USER="your-mailgun-username"
EMAIL_PASSWORD="your-mailgun-password"
```

---

## 🔍 Troubleshooting

### Error: "Failed to send OTP email"
- ✅ Check that EMAIL_USER and EMAIL_PASSWORD are correct in `.env`
- ✅ Make sure you're using an **App Password**, not your regular Gmail password
- ✅ Verify 2FA is enabled on your Gmail account
- ✅ Check that there are no extra spaces in `.env` values

### Error: "Invalid login: 535 Authentication failed"
- You're using your regular password instead of App Password
- Generate a new App Password and use that

### Emails going to Spam
- Check your spam folder
- Mark emails from IQnite as "Not Spam"
- Consider using a professional email service for production

---

## 📝 Email Templates

The system sends two types of emails:

### 1. OTP Verification Email
- **Subject:** "Verify Your Email - IQnite"
- **Content:** 6-digit OTP code
- **Expiry:** 10 minutes

### 2. Welcome Email
- **Subject:** "Welcome to IQnite Platform!"
- **Content:** Confirmation of successful verification
- **Includes:** Direct login link

---

## 🎯 Testing the Complete Flow

1. **Register**: Go to `/register` and create a new account
2. **Check Email**: You should receive a 6-digit OTP
3. **Verify OTP**: Enter the OTP on the verification page
4. **Welcome Email**: After successful verification, you'll receive a welcome email
5. **Login**: You can now log in normally

---

## 🚀 Production Recommendations

For production, consider using:
- **SendGrid** - 100 free emails/day
- **Mailgun** - 5,000 free emails/month
- **AWS SES** - Very cheap, highly scalable
- **Postmark** - Great deliverability

These services have better deliverability rates and don't require 2FA setup.

---

## Need Help?

If you encounter any issues:
1. Check the backend console logs for detailed error messages
2. Verify `.env` file has correct credentials (no extra spaces)
3. Restart the backend after changing `.env`
4. Try using the database OTP method for testing first

# � FREE Email Emergency System Setup Guide

This guide will help you set up a completely FREE email-based emergency notification system using EmailJS. No backend server required!

## 📋 Quick Setup Overview

1. **Create EmailJS Account** (100% Free)
2. **Set up Email Service**
3. **Create Email Template**
4. **Get API Credentials**
5. **Set Environment Variables**
6. **Test the System**

---

## � EmailJS Setup (Completely Free)

### Step 1: Create Twilio Account
1. Go to [https://www.twilio.com/](https://www.twilio.com/)
2. Sign up for a free account
3. Verify your phone number
4. Complete account verification

### Step 2: Get Twilio Credentials
1. **Dashboard**: Go to Twilio Console Dashboard
2. **Account SID**: Copy your Account SID
3. **Auth Token**: Copy your Auth Token (click to reveal)
4. **Phone Number**: Get a Twilio phone number
   - Go to Phone Numbers → Manage → Buy a number
   - Choose a number from your country
   - Free trial includes $15 credit

### Step 3: Set Environment Variables
Create a `.env` file in your project root:

```env
# Twilio SMS Configuration
REACT_APP_TWILIO_ACCOUNT_SID=your_account_sid_here
REACT_APP_TWILIO_AUTH_TOKEN=your_auth_token_here
REACT_APP_TWILIO_PHONE_NUMBER=+1234567890
```

### Step 4: Test Twilio
1. Open Emergency Contacts Setup
2. Add a test contact with your phone number
3. Click the 📱 button next to the contact
4. You should receive a test SMS!

---

## 🇮🇳 Alternative: Fast2SMS (Popular in India)

### Step 1: Create Fast2SMS Account
1. Go to [https://www.fast2sms.com/](https://www.fast2sms.com/)
2. Sign up and verify your account
3. Complete KYC verification

### Step 2: Get API Key
1. Go to Dashboard → API Keys
2. Copy your API key

### Step 3: Set Environment Variables
Add to your `.env` file:

```env
# Fast2SMS Configuration
REACT_APP_FAST2SMS_API_KEY=your_api_key_here
REACT_APP_FAST2SMS_SENDER=RESQTECH
```

---

## 🌍 Alternative: TextLocal (UK/International)

### Step 1: Create TextLocal Account
1. Go to [https://www.textlocal.com/](https://www.textlocal.com/)
2. Sign up for an account

### Step 2: Get API Key
1. Go to Settings → API Keys
2. Create and copy your API key

### Step 3: Set Environment Variables
Add to your `.env` file:

```env
# TextLocal Configuration
REACT_APP_TEXTLOCAL_API_KEY=your_api_key_here
REACT_APP_TEXTLOCAL_SENDER=RESQTECH
```

---

## 🔧 Complete .env File Example

```env
# Google APIs (existing)
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_key
REACT_APP_GOOGLE_SPEECH_API_KEY=your_google_speech_key

# SMS Providers (choose one or more)
# Twilio (Recommended - Global)
REACT_APP_TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
REACT_APP_TWILIO_AUTH_TOKEN=your_auth_token_here
REACT_APP_TWILIO_PHONE_NUMBER=+1234567890

# Fast2SMS (India)
REACT_APP_FAST2SMS_API_KEY=your_fast2sms_api_key

# TextLocal (UK/International)
REACT_APP_TEXTLOCAL_API_KEY=your_textlocal_api_key
REACT_APP_TEXTLOCAL_SENDER=RESQTECH
```

---

## 🧪 Testing Your SMS Setup

### Method 1: Individual Contact Test
1. Open Emergency Contacts Setup (👥 button)
2. Add a contact with your phone number
3. Click the 📱 button next to the contact
4. Check your phone for the test SMS

### Method 2: Full System Test
1. Click "🧪 Test Full System" button
2. Check console for detailed results
3. Verify SMS delivery to all contacts

### Method 3: Voice Emergency Test
1. Click the microphone button
2. Say "help" when listening
3. Emergency mode should activate
4. SMS should be sent to all contacts

---

## 📱 SMS Message Format

Emergency SMS messages include:
- 🚨 Emergency alert header
- ⏰ Timestamp
- 📍 Location (address + coordinates)
- 🎤 Alert type
- 📞 Emergency numbers
- Clear instructions for the recipient

Example:
```
🚨 EMERGENCY ALERT 🚨

John, this is an automated emergency notification from ResQTech.

⏰ Time: 2024-01-15 14:30:25
📍 Location: 123 Main St, City, State
🎤 Alert Type: Voice Emergency Detection

Please check on the person immediately or contact emergency services.

Emergency Numbers:
🚔 Police: 100
🚑 Ambulance: 108
🔥 Fire: 101
📞 National: 112
```

---

## 🔍 Troubleshooting

### SMS Not Sending?
1. **Check Environment Variables**: Ensure `.env` file is in project root
2. **Restart Application**: Restart after adding environment variables
3. **Check API Keys**: Verify credentials are correct
4. **Check Phone Format**: Use international format (+1234567890)
5. **Check Console**: Look for error messages in browser console

### Twilio Issues?
- **Trial Account**: Can only send to verified numbers
- **Credits**: Check if you have remaining credits
- **Phone Number**: Ensure you have an active Twilio number

### Fast2SMS Issues?
- **KYC**: Complete verification process
- **Credits**: Check account balance
- **Phone Format**: Use Indian format without +91

### Still Not Working?
- Check the SMS Status panel in Emergency Contacts Setup
- Use simulation mode for testing (no provider needed)
- Contact support with console error messages

---

## 💰 Cost Information

### Twilio
- **Free Trial**: $15 credit
- **SMS Cost**: ~$0.0075 per SMS (varies by country)
- **Monthly**: No monthly fees for pay-as-you-go

### Fast2SMS
- **Free Trial**: Limited free SMS
- **SMS Cost**: ₹0.15-0.25 per SMS in India
- **Bulk Rates**: Available for higher volumes

### TextLocal
- **Free Trial**: Limited free SMS
- **SMS Cost**: £0.02-0.04 per SMS in UK
- **Monthly Plans**: Available

---

## 🔒 Security Best Practices

1. **Environment Variables**: Never commit `.env` to version control
2. **API Keys**: Keep credentials secure and rotate regularly
3. **Phone Numbers**: Validate phone numbers before storing
4. **Rate Limiting**: Implement to prevent abuse
5. **Logging**: Log SMS attempts for debugging (not content)

---

## 🚀 Production Deployment

### Vercel/Netlify
Add environment variables in platform settings

### Heroku
```bash
heroku config:set REACT_APP_TWILIO_ACCOUNT_SID=your_sid
heroku config:set REACT_APP_TWILIO_AUTH_TOKEN=your_token
heroku config:set REACT_APP_TWILIO_PHONE_NUMBER=your_number
```

### AWS/Azure
Configure environment variables in application settings

---

## ✅ Success Checklist

- [ ] SMS provider account created
- [ ] API credentials obtained
- [ ] Environment variables set
- [ ] Application restarted
- [ ] Test contact added
- [ ] Individual SMS test successful
- [ ] Full system test successful
- [ ] Emergency contacts configured
- [ ] Voice emergency test successful

**Your SMS emergency system is now ready! 🎉**

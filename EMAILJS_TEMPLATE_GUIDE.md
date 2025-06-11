# 📧 EmailJS Template Configuration Guide

## 🎯 Problem: Emails Going to Wrong Address

**Issue**: Emails are being sent to your registered EmailJS email instead of the contact's email from the form.

**Cause**: EmailJS template is configured with a fixed recipient instead of dynamic `{{to_email}}` variable.

---

## 🔧 Solution: Configure Dynamic Recipients

### Step 1: Open Your Template
1. Go to [EmailJS Dashboard](https://dashboard.emailjs.com/)
2. Click on "Email Templates"
3. Find and open `template_k0krvt9`

### Step 2: Check Template Settings
Your template settings should look like this:

```
┌─────────────────────────────────────┐
│ Template Settings                   │
├─────────────────────────────────────┤
│ To Email:    {{to_email}}          │ ← MUST be {{to_email}}
│ To Name:     {{to_name}}           │ ← MUST be {{to_name}}
│ From Name:   {{from_name}}         │
│ From Email:  your-email@gmail.com  │ ← Your registered email
│ Subject:     {{subject}}           │
│ Reply To:    {{reply_to}}          │
└─────────────────────────────────────┘
```

### Step 3: Fix Common Issues

#### ❌ Wrong Configuration:
```
To Email: syedtaj9849@gmail.com  ← Fixed email (WRONG!)
```

#### ✅ Correct Configuration:
```
To Email: {{to_email}}  ← Dynamic variable (CORRECT!)
```

---

## 🆕 Create New Template (Recommended)

If your current template is misconfigured, create a new one:

### Template Settings:
```
Template Name: Emergency Alert Dynamic
To Email: {{to_email}}
To Name: {{to_name}}
From Name: ResQTech Emergency System
Subject: 🚨 EMERGENCY ALERT - {{to_name}} - Immediate Attention Required
```

### Template Content:
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center;">
    <h1 style="margin: 0; font-size: 28px;">🚨 EMERGENCY ALERT 🚨</h1>
    <p style="margin: 10px 0 0 0; font-size: 16px;">Immediate Attention Required</p>
  </div>
  
  <div style="padding: 30px; background: white;">
    <p style="font-size: 18px; margin-bottom: 20px;"><strong>Dear {{to_name}},</strong></p>
    
    <p style="font-size: 16px; line-height: 1.6; color: #333;">
      This is an automated emergency notification from <strong>ResQTech Emergency System</strong>.
    </p>
    
    <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0;">
      <h3 style="color: #dc2626; margin-top: 0;">🚨 Emergency Details:</h3>
      <p><strong>⏰ Time:</strong> {{timestamp}}</p>
      <p><strong>📍 Location:</strong> {{location}}</p>
      <p><strong>🎤 Alert Type:</strong> {{alert_type}}</p>
      <p><strong>👤 Relationship:</strong> {{relationship}}</p>
    </div>
    
    <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
      <h3 style="margin-top: 0; color: white;">⚡ IMMEDIATE ACTION REQUIRED</h3>
      <p style="font-size: 16px; margin-bottom: 0;">
        Please check on the person immediately or contact emergency services if you cannot reach them.
      </p>
    </div>
    
    <div style="background: #f3f4f6; padding: 20px; border-radius: 8px;">
      <h4 style="color: #374151; margin-top: 0;">📞 Emergency Numbers (India):</h4>
      <p>🚔 <strong>Police:</strong> 100</p>
      <p>🚑 <strong>Ambulance:</strong> 108</p>
      <p>🔥 <strong>Fire:</strong> 101</p>
      <p>📞 <strong>National Emergency:</strong> 112</p>
    </div>
    
    <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
      <p>This is an automated message from <strong>ResQTech Emergency Response System</strong>.</p>
      <p>Do not reply to this email.</p>
    </div>
  </div>
</div>
```

---

## 🧪 Test Your Template

### In EmailJS Dashboard:
1. Open your template
2. Click "Test" button
3. Fill in test data:
   ```
   to_email: test@example.com
   to_name: Test User
   timestamp: 2024-01-15 14:30:25
   location: Test Location
   alert_type: Voice Emergency Detection
   relationship: Test Contact
   ```
4. Send test email
5. Check if it goes to `test@example.com` (not your registered email)

---

## 🔄 Update Your Application

If you create a new template, update your `.env` file:

```env
# EmailJS Configuration
REACT_APP_EMAILJS_SERVICE_ID=service_abc123
REACT_APP_EMAILJS_TEMPLATE_ID=template_NEW_ID_HERE  ← Update this
REACT_APP_EMAILJS_PUBLIC_KEY=CQRJsloCpIDO31Ynt
```

Then restart your application.

---

## ✅ Verification Steps

1. **Template configured** with `{{to_email}}` in "To Email" field
2. **Test in EmailJS dashboard** sends to dynamic email
3. **Application updated** with correct template ID
4. **Test in your app** with different email address
5. **Email received** at the contact's email (not yours)

---

## 🎯 Quick Fix Summary

**The issue**: Your EmailJS template has a fixed recipient email instead of `{{to_email}}` variable.

**The fix**: 
1. Edit template to use `{{to_email}}` in "To Email" field
2. OR create new template with correct configuration
3. Update template ID in your `.env` file if needed
4. Test with different email address

**Result**: Emails will be sent to the contact's email address from the form! 📧✅

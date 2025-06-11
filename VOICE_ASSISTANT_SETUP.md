# 🎙️ Voice Emergency Assistant Setup Guide

## 🚨 Overview

The Voice Emergency Assistant is an advanced feature that detects emergency situations through voice commands and automatically alerts emergency services and contacts. When a user says "help" 3 times in any language, the system triggers emergency protocols.

## ✨ Features

### 🎯 Core Functionality
- **Multi-language Help Detection**: Recognizes "help" in 15+ languages
- **3-Strike Emergency Trigger**: Activates after detecting "help" 3 times within 10 seconds
- **Automatic Location Detection**: Gets precise GPS coordinates
- **Emergency Services Integration**: Alerts authorities automatically
- **Contact Notifications**: Sends SMS/Email to emergency contacts
- **Real-time Audio Feedback**: Plays emergency sounds when activated

### 🌍 Supported Languages
- English, Spanish, French, German, Italian, Portuguese
- Hindi, Arabic, Chinese, Japanese, Korean, Russian
- Dutch, Swedish, Norwegian

### 📱 Emergency Protocols
1. **Voice Detection** → Continuous listening for help keywords
2. **Location Acquisition** → GPS coordinates + address lookup
3. **Emergency Services** → Automatic notification to authorities
4. **Contact Alerts** → SMS/Email to configured emergency contacts
5. **Event Logging** → Complete audit trail of emergency events

## 🛠️ Setup Instructions

### 1. Basic Setup (No API Keys Required)
The voice assistant works out-of-the-box with basic functionality:
- Voice recognition using browser's Web Speech API
- Local emergency contact storage
- Simulated emergency service notifications
- GPS location detection

### 2. Advanced Setup (With API Integration)

#### Environment Variables
Create a `.env` file in your project root:

```env
# Emergency Services API (Custom/Government Integration)
REACT_APP_EMERGENCY_API_URL=https://your-emergency-api.com/alert
REACT_APP_EMERGENCY_API_KEY=your_emergency_api_key

# SMS Gateway (Twilio, AWS SNS, etc.)
REACT_APP_SMS_API_URL=https://api.twilio.com/2010-04-01/Accounts/YOUR_SID/Messages.json
REACT_APP_SMS_API_KEY=your_twilio_auth_token

# Email Service (SendGrid, AWS SES, etc.)
REACT_APP_EMAIL_API_URL=https://api.sendgrid.com/v3/mail/send
REACT_APP_EMAIL_API_KEY=your_sendgrid_api_key

# Google Maps (for address lookup)
REACT_APP_MAPS_API_KEY=your_google_maps_api_key
```

#### API Service Providers

##### 🚨 Emergency Services
- **Government APIs**: Contact local emergency services for integration
- **Custom API**: Build your own emergency notification service
- **Third-party**: Use services like AlertMedia, Everbridge

##### 📱 SMS Services
- **Twilio**: https://www.twilio.com/
- **AWS SNS**: https://aws.amazon.com/sns/
- **MessageBird**: https://messagebird.com/
- **Plivo**: https://www.plivo.com/

##### 📧 Email Services
- **SendGrid**: https://sendgrid.com/
- **AWS SES**: https://aws.amazon.com/ses/
- **Mailgun**: https://www.mailgun.com/
- **Postmark**: https://postmarkapp.com/

##### 🗺️ Location Services
- **Google Maps API**: https://developers.google.com/maps
- **OpenCage Geocoding**: https://opencagedata.com/
- **MapBox**: https://www.mapbox.com/

## 🔧 Configuration

### Emergency Contacts Setup
1. Click the ⚙️ setup button on the voice assistant
2. Add emergency contacts with:
   - Name (required)
   - Phone number (required)
   - Email (optional)
   - Relationship (optional)

### Testing the System
1. Open the Emergency Contacts Setup
2. Click "🧪 Test System"
3. Check browser console for detailed results
4. Verify all services are working correctly

## 🎮 Usage Instructions

### Activating Voice Assistant
1. **Click the microphone button** (🎙️) on the welcome page
2. **Grant microphone permissions** when prompted
3. **Speak clearly** - the system listens continuously
4. **Say "help" 3 times** within 10 seconds to trigger emergency

### Emergency Trigger Process
1. **First "help"** → Counter shows (1/3)
2. **Second "help"** → Counter shows (2/3)
3. **Third "help"** → 🚨 EMERGENCY MODE ACTIVATED
4. **Automatic alerts** sent to all configured services
5. **Location shared** with emergency services
6. **Contacts notified** via SMS/Email

### Supported Emergency Phrases
- English: "help", "emergency", "urgent", "rescue", "danger"
- Spanish: "ayuda", "auxilio", "emergencia", "urgente"
- French: "aide", "secours", "urgence", "danger"
- Hindi: "मदद", "सहायता", "आपातकाल"
- And many more...

## 🔒 Privacy & Security

### Data Protection
- **Local Storage**: Emergency contacts stored locally
- **No Cloud Storage**: Voice data not transmitted to external servers
- **Encrypted Communications**: All API calls use HTTPS
- **Minimal Data**: Only essential information shared during emergencies

### Permissions Required
- **Microphone Access**: For voice recognition
- **Location Access**: For emergency location sharing
- **Notification Access**: For emergency alerts

## 🐛 Troubleshooting

### Common Issues

#### Voice Recognition Not Working
- **Check browser support**: Chrome, Edge, Safari supported
- **Enable microphone**: Grant permissions in browser settings
- **Check HTTPS**: Voice API requires secure connection
- **Clear browser cache**: Reset permissions if needed

#### Emergency Alerts Not Sending
- **Verify API keys**: Check environment variables
- **Test internet connection**: APIs require network access
- **Check API quotas**: Ensure service limits not exceeded
- **Review console logs**: Check for detailed error messages

#### Location Not Detected
- **Enable GPS**: Allow location access in browser
- **Check device GPS**: Ensure GPS is enabled on device
- **Indoor accuracy**: GPS may be less accurate indoors
- **Fallback coordinates**: System provides approximate location

### Browser Compatibility
- ✅ **Chrome 25+**: Full support
- ✅ **Edge 79+**: Full support
- ✅ **Safari 14.1+**: Full support
- ❌ **Firefox**: Limited support (no continuous recognition)
- ❌ **Internet Explorer**: Not supported

## 📞 Emergency Numbers (India)
- **Police**: 100
- **Fire**: 101
- **Ambulance**: 108
- **Disaster Management**: 1078
- **National Emergency**: 112
- **Women Helpline**: 1091
- **Child Helpline**: 1098

## 🚀 Advanced Features

### Custom Emergency Workflows
- Modify `src/services/emergencyServices.js` for custom logic
- Add new emergency service integrations
- Implement custom notification channels
- Create specialized emergency protocols

### Multi-language Expansion
- Add new languages to `helpKeywords` object
- Include regional emergency phrases
- Support local emergency numbers
- Customize cultural emergency protocols

### Integration Examples
- Hospital management systems
- Corporate emergency protocols
- School safety systems
- Elderly care monitoring
- Disability assistance services

## 📝 API Documentation

### Emergency Services API Format
```javascript
POST /emergency/alert
{
  "type": "voice_emergency",
  "priority": "critical",
  "location": {
    "latitude": 28.6139,
    "longitude": 77.2090,
    "address": "New Delhi, India",
    "accuracy": 10
  },
  "timestamp": "2024-01-01T12:00:00Z",
  "transcript": "help help help",
  "userAgent": "Mozilla/5.0...",
  "helpCount": 3
}
```

### SMS API Format
```javascript
POST /sms/send
{
  "to": "+919876543210",
  "message": "🚨 EMERGENCY ALERT 🚨\n\nLocation: New Delhi, India\nTime: 2024-01-01 12:00:00\n\nPlease check immediately."
}
```

## 🤝 Contributing

### Adding New Languages
1. Update `helpKeywords` object in `VoiceEmergencyAssistant.js`
2. Add language-specific emergency phrases
3. Test voice recognition accuracy
4. Update documentation

### Improving Emergency Services
1. Add new API integrations in `emergencyServices.js`
2. Implement failover mechanisms
3. Add service health monitoring
4. Create comprehensive testing

## 📄 License & Legal

### Important Legal Notice
- **Emergency Use Only**: This system is designed for genuine emergencies
- **No Guarantee**: While robust, technology can fail - always have backup plans
- **Local Laws**: Ensure compliance with local emergency service regulations
- **False Alarms**: Implement safeguards to prevent accidental activations
- **Privacy**: Inform users about data collection during emergencies

### Liability Disclaimer
This voice assistant is a supplementary emergency tool and should not be the sole method of emergency communication. Always maintain traditional emergency contact methods as backup.

---

## 🆘 Need Help?

If you need assistance setting up the voice emergency assistant or integrating with specific emergency services, please:

1. Check the troubleshooting section above
2. Review browser console for error messages
3. Test with the built-in system test function
4. Contact your local emergency services for integration requirements

**Remember**: This is a life-safety feature. Test thoroughly before relying on it in real emergencies! 🚨

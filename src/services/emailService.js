// Email Service for Emergency Notifications
// Uses EmailJS for free email sending without backend

import emailjs from '@emailjs/browser';

class EmailService {
  constructor() {
    this.config = {
      // EmailJS Configuration (Free service)
      emailjs: {
        serviceId: process.env.REACT_APP_EMAILJS_SERVICE_ID,
        templateId: process.env.REACT_APP_EMAILJS_TEMPLATE_ID,
        publicKey: process.env.REACT_APP_EMAILJS_PUBLIC_KEY,
        enabled: false
      },
      
      // SMTP Configuration (Alternative)
      smtp: {
        host: process.env.REACT_APP_SMTP_HOST,
        port: process.env.REACT_APP_SMTP_PORT,
        username: process.env.REACT_APP_SMTP_USERNAME,
        password: process.env.REACT_APP_SMTP_PASSWORD,
        enabled: false
      }
    };
    
    this.initializeServices();
  }

  // Initialize available email services
  initializeServices() {
    // Check EmailJS configuration
    if (this.config.emailjs.serviceId &&
        this.config.emailjs.templateId &&
        this.config.emailjs.publicKey) {
      this.config.emailjs.enabled = true;

      // Initialize EmailJS
      emailjs.init(this.config.emailjs.publicKey);
    }

    // Check SMTP configuration
    if (this.config.smtp.host &&
        this.config.smtp.username &&
        this.config.smtp.password) {
      this.config.smtp.enabled = true;
    }
  }

  // Check if any email provider is available
  hasAnyProvider() {
    return this.config.emailjs.enabled || this.config.smtp.enabled;
  }

  // Main email sending function
  async sendEmergencyEmail(contact, alertData) {
    const emailData = this.createEmergencyEmailData(contact, alertData);

    // Check if EmailJS is configured
    if (!this.config.emailjs.enabled) {
      throw new Error('EmailJS is not configured. Please check your .env file and ensure REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, and REACT_APP_EMAILJS_PUBLIC_KEY are set with valid values from https://www.emailjs.com/');
    }

    // Try EmailJS (required for real-time implementation)
    try {
      const result = await this.sendViaEmailJS(emailData);
      return {
        contact: contact.name,
        email: contact.email,
        provider: 'emailjs',
        status: 'success',
        messageId: result.text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('EmailJS failed:', error);

      // Provide specific error messages based on the error
      let errorMessage = 'EmailJS failed: ';
      if (error.text) {
        errorMessage += error.text;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error';
      }

      // Add helpful information for common errors
      if (error.text && error.text.includes('Public Key is invalid')) {
        errorMessage += '\n\nThe Public Key in your .env file is invalid. Please:\n1. Go to https://dashboard.emailjs.com/admin/account\n2. Copy your correct Public Key\n3. Update REACT_APP_EMAILJS_PUBLIC_KEY in your .env file\n4. Restart the application';
      } else if (error.text && error.text.includes('Service ID')) {
        errorMessage += '\n\nThe Service ID is invalid. Please check REACT_APP_EMAILJS_SERVICE_ID in your .env file.';
      } else if (error.text && error.text.includes('Template ID')) {
        errorMessage += '\n\nThe Template ID is invalid. Please check REACT_APP_EMAILJS_TEMPLATE_ID in your .env file.';
      }

      throw new Error(errorMessage);
    }
  }

  // Create emergency email data
  createEmergencyEmailData(contact, alertData) {
    const location = alertData.location?.address ||
                    (alertData.location?.latitude ?
                     `${alertData.location.latitude}, ${alertData.location.longitude}` :
                     'Location unavailable');

    const timestamp = new Date().toLocaleString();


    
    return {
      // Standard EmailJS variables
      to_email: contact.email,
      to_name: contact.name,
      from_name: 'ResQTech Emergency System',
      reply_to: 'noreply@resqtech.com',

      // Subject line
      subject: `🚨 EMERGENCY ALERT - ${contact.name} - Immediate Attention Required`,

      // Main message content
      message: `Dear ${contact.name},

This is an automated emergency notification from ResQTech Emergency System.

🚨 EMERGENCY DETAILS:
⏰ Time: ${timestamp}
📍 Location: ${location}
🎤 Alert Type: Voice Emergency Detection
👤 Relationship: ${contact.relationship || 'Emergency Contact'}

IMMEDIATE ACTION REQUIRED:
Please check on the person immediately or contact emergency services if you cannot reach them.

Emergency Numbers (India):
🚔 Police: 100
🚑 Ambulance: 108
🔥 Fire: 101
📞 National Emergency: 112

This is an automated message from ResQTech Emergency Response System.
Do not reply to this email.`,
      
      html_message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9;">
          <div style="background: linear-gradient(135deg, #dc2626, #ef4444); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 28px;">🚨 EMERGENCY ALERT 🚨</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px;">Immediate Attention Required</p>
          </div>
          
          <div style="padding: 30px; background: white; margin: 20px;">
            <p style="font-size: 18px; margin-bottom: 20px;"><strong>Dear ${contact.name},</strong></p>
            
            <p style="font-size: 16px; line-height: 1.6; color: #333;">
              This is an automated emergency notification from <strong>ResQTech Emergency System</strong>.
            </p>
            
            <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 25px 0; border-radius: 4px;">
              <h3 style="color: #dc2626; margin-top: 0;">🚨 Emergency Details:</h3>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">⏰ Time:</td>
                  <td style="padding: 8px 0; color: #333;">${timestamp}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">📍 Location:</td>
                  <td style="padding: 8px 0; color: #333;">${location}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">🎤 Alert Type:</td>
                  <td style="padding: 8px 0; color: #333;">Voice Emergency Detection</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; font-weight: bold; color: #555;">👤 Relationship:</td>
                  <td style="padding: 8px 0; color: #333;">${contact.relationship || 'Emergency Contact'}</td>
                </tr>
              </table>
            </div>
            
            <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px; text-align: center; margin: 25px 0;">
              <h3 style="margin-top: 0; color: white;">⚡ IMMEDIATE ACTION REQUIRED</h3>
              <p style="font-size: 16px; margin-bottom: 0;">
                Please check on the person immediately or contact emergency services if you cannot reach them.
              </p>
            </div>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 25px 0;">
              <h4 style="color: #374151; margin-top: 0;">📞 Emergency Numbers (India):</h4>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div>🚔 <strong>Police:</strong> 100</div>
                <div>🚑 <strong>Ambulance:</strong> 108</div>
                <div>🔥 <strong>Fire:</strong> 101</div>
                <div>📞 <strong>National Emergency:</strong> 112</div>
              </div>
            </div>
            
            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This is an automated message from <strong>ResQTech Emergency Response System</strong>.</p>
              <p>Do not reply to this email. For support, contact your system administrator.</p>
            </div>
          </div>
        </div>
      `,
      
      // Individual template variables (commonly used in EmailJS templates)
      location: location,
      timestamp: timestamp,
      alert_type: 'Voice Emergency Detection',
      relationship: contact.relationship || 'Emergency Contact',

      // Additional variables for template flexibility
      user_name: contact.name,
      user_email: contact.email,
      emergency_time: timestamp,
      emergency_location: location,
      emergency_type: 'Voice Emergency Detection',
      contact_relationship: contact.relationship || 'Emergency Contact',

      // Emergency contact numbers
      police_number: '100',
      ambulance_number: '108',
      fire_number: '101',
      national_emergency: '112',

      // System information
      system_name: 'ResQTech Emergency Response System',
      alert_priority: 'CRITICAL',
      response_required: 'IMMEDIATE'
    };
  }

  // Send via EmailJS
  async sendViaEmailJS(emailData) {
    try {
      const result = await emailjs.send(
        this.config.emailjs.serviceId,
        this.config.emailjs.templateId,
        emailData
      );

      return result;
    } catch (error) {
      console.error('EmailJS error:', error);
      throw new Error(`EmailJS failed: ${error.text || error.message || 'Unknown error'}`);
    }
  }

  // Send via SMTP (would require backend implementation)
  async sendViaSMTP(emailData) {
    // This would require a backend service
    return { messageId: 'smtp_' + Date.now() };
  }



  // Get real user location
  async getRealUserLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        resolve({
          address: 'Location unavailable - Geolocation not supported',
          latitude: null,
          longitude: null
        });
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude, accuracy } = position.coords;
          let address = `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;

          // Try to get human-readable address using reverse geocoding
          try {
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`
            );

            if (response.ok) {
              const data = await response.json();
              if (data.display_name) {
                address = data.display_name;
              }
            }
          } catch (error) {
            // Use coordinates as fallback
          }

          resolve({
            address: address,
            latitude: latitude,
            longitude: longitude,
            accuracy: accuracy,
            timestamp: new Date().toISOString()
          });
        },
        (error) => {
          let errorMessage = 'Location unavailable';

          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
            default:
              errorMessage = 'Unknown location error';
              break;
          }

          resolve({
            address: errorMessage,
            latitude: null,
            longitude: null,
            error: error.message
          });
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 300000 // 5 minutes
        }
      );
    });
  }

  // Send contact form email
  async sendContactEmail(contactData) {
    const emailData = this.createContactEmailData(contactData);

    // Check if EmailJS is configured
    if (!this.config.emailjs.enabled) {
      throw new Error('EmailJS is not configured. Please check your .env file and ensure REACT_APP_EMAILJS_SERVICE_ID, REACT_APP_EMAILJS_TEMPLATE_ID, and REACT_APP_EMAILJS_PUBLIC_KEY are set with valid values from https://www.emailjs.com/');
    }

    // Try EmailJS (required for real-time implementation)
    try {
      const result = await this.sendViaEmailJS(emailData);
      return {
        status: 'success',
        provider: 'emailjs',
        messageId: result.text,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('EmailJS failed for contact form:', error);

      // Provide specific error messages
      let errorMessage = 'EmailJS failed: ';
      if (error.text) {
        errorMessage += error.text;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Unknown error';
      }

      throw new Error(errorMessage);
    }
  }

  // Create contact form email data
  createContactEmailData(contactData) {
    const timestamp = new Date().toLocaleString();

    return {
      // Standard EmailJS variables
      to_email: 'contact@resqtech.com', // Your contact email
      to_name: 'ResQTech Team',
      from_name: contactData.name,
      from_email: contactData.email,
      reply_to: contactData.email,

      // Subject line
      subject: `Contact Form: ${contactData.subject}`,

      // Main message content
      message: `New contact form submission from ResQTech website:

📧 CONTACT DETAILS:
👤 Name: ${contactData.name}
📧 Email: ${contactData.email}
📋 Subject: ${contactData.subject}
⏰ Time: ${timestamp}

💬 MESSAGE:
${contactData.message}

---
This message was sent from the ResQTech contact form.
Please respond to: ${contactData.email}`,

      // HTML version for better formatting
      html_message: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #2563eb; margin-top: 0; border-bottom: 2px solid #e5e7eb; padding-bottom: 15px;">
              📧 New Contact Form Submission
            </h2>

            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">Contact Details:</h3>
              <p><strong>👤 Name:</strong> ${contactData.name}</p>
              <p><strong>📧 Email:</strong> ${contactData.email}</p>
              <p><strong>📋 Subject:</strong> ${contactData.subject}</p>
              <p><strong>⏰ Time:</strong> ${timestamp}</p>
            </div>

            <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #374151; margin-top: 0;">💬 Message:</h3>
              <p style="white-space: pre-wrap; line-height: 1.6;">${contactData.message}</p>
            </div>

            <div style="border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 30px; text-align: center; color: #6b7280; font-size: 14px;">
              <p>This message was sent from the <strong>ResQTech</strong> contact form.</p>
              <p>Please respond to: <a href="mailto:${contactData.email}" style="color: #2563eb;">${contactData.email}</a></p>
            </div>
          </div>
        </div>
      `,

      // Individual template variables
      contact_name: contactData.name,
      contact_email: contactData.email,
      contact_subject: contactData.subject,
      contact_message: contactData.message,
      contact_timestamp: timestamp,

      // System information
      form_type: 'Contact Form',
      website: 'ResQTech Emergency System'
    };
  }





  // Get email service status
  getStatus() {
    return {
      providers: {
        emailjs: this.config.emailjs.enabled,
        smtp: this.config.smtp.enabled
      },
      hasProvider: this.hasAnyProvider(),
      primaryProvider: this.config.emailjs.enabled ? 'emailjs' : 
                      this.config.smtp.enabled ? 'smtp' : 'none'
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

export default emailService;

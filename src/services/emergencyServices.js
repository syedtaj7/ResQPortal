// Emergency Services Integration
// This service handles emergency alerts and notifications

class EmergencyServices {
  constructor() {
    // Configuration for different emergency services
    this.config = {
      // Indian Emergency Numbers
      emergencyNumbers: {
        police: '100',
        fire: '101',
        ambulance: '108',
        disasterManagement: '1078',
        womenHelpline: '1091',
        childHelpline: '1098',
        nationalEmergency: '112'
      },
      
      // API endpoints (to be configured with real services)
      apiEndpoints: {
        emergencyAlert: process.env.REACT_APP_EMERGENCY_API_URL || null,
        locationServices: process.env.REACT_APP_LOCATION_API_URL || null,
        smsGateway: process.env.REACT_APP_SMS_API_URL || null,
        emailService: process.env.REACT_APP_EMAIL_API_URL || null
      },
      
      // API Keys (to be set via environment variables)
      apiKeys: {
        emergency: process.env.REACT_APP_EMERGENCY_API_KEY || null,
        sms: process.env.REACT_APP_SMS_API_KEY || null,
        email: process.env.REACT_APP_EMAIL_API_KEY || null,
        maps: process.env.REACT_APP_MAPS_API_KEY || null
      }
    };
  }

  // Main emergency alert function
  async triggerEmergencyAlert(alertData) {
    console.log('🚨 EMERGENCY ALERT TRIGGERED 🚨');
    console.log('Alert Data:', alertData);

    const results = {
      location: null,
      notifications: [],
      emergencyServices: null,
      timestamp: new Date().toISOString()
    };

    try {
      // 1. Get precise location
      results.location = await this.getCurrentLocation();
      
      // 2. Notify emergency services
      results.emergencyServices = await this.notifyEmergencyServices({
        ...alertData,
        location: results.location
      });
      
      // 3. Send notifications to emergency contacts
      results.notifications = await this.notifyEmergencyContacts({
        ...alertData,
        location: results.location
      });
      
      // 4. Log emergency event
      await this.logEmergencyEvent({
        ...alertData,
        location: results.location,
        results
      });

      return results;
    } catch (error) {
      console.error('Emergency alert error:', error);
      // Even if some services fail, try to continue with others
      return results;
    }
  }

  // Get current location with high accuracy
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const locationData = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: new Date().toISOString(),
            address: null
          };

          // Try to get human-readable address
          try {
            locationData.address = await this.reverseGeocode(
              position.coords.latitude,
              position.coords.longitude
            );
          } catch (error) {
            console.warn('Reverse geocoding failed:', error);
          }

          resolve(locationData);
        },
        (error) => {
          console.error('Geolocation error:', error);
          reject(error);
        },
        options
      );
    });
  }

  // Reverse geocoding to get address
  async reverseGeocode(lat, lng) {
    if (!this.config.apiKeys.maps) {
      // Fallback to basic coordinates
      return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    }

    try {
      // Using Google Maps Geocoding API (when API key is provided)
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.config.apiKeys.maps}`
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data.results && data.results[0]) {
          return data.results[0].formatted_address;
        }
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }

    return `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }

  // Notify emergency services
  async notifyEmergencyServices(alertData) {
    const notifications = [];

    try {
      // If real emergency API is configured
      if (this.config.apiEndpoints.emergencyAlert && this.config.apiKeys.emergency) {
        const response = await fetch(this.config.apiEndpoints.emergencyAlert, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.config.apiKeys.emergency}`
          },
          body: JSON.stringify({
            type: 'voice_emergency',
            priority: 'critical',
            location: alertData.location,
            timestamp: alertData.timestamp,
            transcript: alertData.transcript,
            userAgent: navigator.userAgent,
            helpCount: alertData.helpCount
          })
        });

        if (response.ok) {
          const result = await response.json();
          notifications.push({
            service: 'emergency_api',
            status: 'success',
            response: result
          });
        } else {
          throw new Error(`Emergency API error: ${response.status}`);
        }
      } else {
        // Simulation mode
        console.log('📞 Simulating emergency services notification...');
        console.log('Emergency Numbers:', this.config.emergencyNumbers);
        
        notifications.push({
          service: 'simulation',
          status: 'success',
          message: 'Emergency services notified (simulation)',
          numbers: this.config.emergencyNumbers
        });
      }
    } catch (error) {
      console.error('Emergency services notification error:', error);
      notifications.push({
        service: 'emergency_services',
        status: 'error',
        error: error.message
      });
    }

    return notifications;
  }

  // Notify emergency contacts
  async notifyEmergencyContacts(alertData) {
    const notifications = [];
    
    // Get emergency contacts from localStorage
    const emergencyContacts = this.getEmergencyContacts();
    
    if (emergencyContacts.length === 0) {
      console.warn('No emergency contacts configured');
      return notifications;
    }

    for (const contact of emergencyContacts) {
      try {
        // Send SMS if SMS service is configured
        if (contact.phone && this.config.apiKeys.sms) {
          const smsResult = await this.sendEmergencySMS(contact, alertData);
          notifications.push(smsResult);
        }

        // Send email if email service is configured
        if (contact.email && this.config.apiKeys.email) {
          const emailResult = await this.sendEmergencyEmail(contact, alertData);
          notifications.push(emailResult);
        }
      } catch (error) {
        console.error(`Error notifying contact ${contact.name}:`, error);
        notifications.push({
          contact: contact.name,
          status: 'error',
          error: error.message
        });
      }
    }

    return notifications;
  }

  // Send emergency SMS
  async sendEmergencySMS(contact, alertData) {
    if (!this.config.apiEndpoints.smsGateway) {
      return {
        contact: contact.name,
        type: 'sms',
        status: 'skipped',
        reason: 'SMS service not configured'
      };
    }

    const message = `🚨 EMERGENCY ALERT 🚨\n\n${contact.name}, this is an automated emergency notification.\n\nLocation: ${alertData.location?.address || 'Location unavailable'}\nTime: ${new Date().toLocaleString()}\n\nPlease check on the person immediately or contact emergency services.`;

    try {
      const response = await fetch(this.config.apiEndpoints.smsGateway, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKeys.sms}`
        },
        body: JSON.stringify({
          to: contact.phone,
          message: message
        })
      });

      if (response.ok) {
        return {
          contact: contact.name,
          type: 'sms',
          status: 'success',
          phone: contact.phone
        };
      } else {
        throw new Error(`SMS API error: ${response.status}`);
      }
    } catch (error) {
      return {
        contact: contact.name,
        type: 'sms',
        status: 'error',
        error: error.message
      };
    }
  }

  // Send emergency email
  async sendEmergencyEmail(contact, alertData) {
    if (!this.config.apiEndpoints.emailService) {
      return {
        contact: contact.name,
        type: 'email',
        status: 'skipped',
        reason: 'Email service not configured'
      };
    }

    const emailData = {
      to: contact.email,
      subject: '🚨 EMERGENCY ALERT - Immediate Attention Required',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; text-align: center;">
            <h1>🚨 EMERGENCY ALERT 🚨</h1>
          </div>
          <div style="padding: 20px; background: #f9f9f9;">
            <p><strong>Dear ${contact.name},</strong></p>
            <p>This is an automated emergency notification from ResQTech.</p>
            
            <div style="background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 20px 0;">
              <h3>Emergency Details:</h3>
              <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
              <p><strong>Location:</strong> ${alertData.location?.address || 'Location unavailable'}</p>
              ${alertData.location?.latitude ? `<p><strong>Coordinates:</strong> ${alertData.location.latitude}, ${alertData.location.longitude}</p>` : ''}
              <p><strong>Alert Type:</strong> Voice Emergency Detection</p>
            </div>
            
            <p style="color: #dc2626; font-weight: bold;">
              Please check on the person immediately or contact emergency services if you cannot reach them.
            </p>
            
            <div style="background: #fef2f2; padding: 15px; border-radius: 5px; margin: 20px 0;">
              <h4>Emergency Numbers (India):</h4>
              <ul>
                <li>Police: 100</li>
                <li>Fire: 101</li>
                <li>Ambulance: 108</li>
                <li>National Emergency: 112</li>
              </ul>
            </div>
          </div>
        </div>
      `
    };

    try {
      const response = await fetch(this.config.apiEndpoints.emailService, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKeys.email}`
        },
        body: JSON.stringify(emailData)
      });

      if (response.ok) {
        return {
          contact: contact.name,
          type: 'email',
          status: 'success',
          email: contact.email
        };
      } else {
        throw new Error(`Email API error: ${response.status}`);
      }
    } catch (error) {
      return {
        contact: contact.name,
        type: 'email',
        status: 'error',
        error: error.message
      };
    }
  }

  // Get emergency contacts from localStorage
  getEmergencyContacts() {
    try {
      const contacts = localStorage.getItem('emergencyContacts');
      return contacts ? JSON.parse(contacts) : [];
    } catch (error) {
      console.error('Error getting emergency contacts:', error);
      return [];
    }
  }

  // Log emergency event
  async logEmergencyEvent(eventData) {
    try {
      const logEntry = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'voice_emergency',
        ...eventData
      };

      // Store in localStorage for now
      const existingLogs = JSON.parse(localStorage.getItem('emergencyLogs') || '[]');
      existingLogs.push(logEntry);
      
      // Keep only last 100 logs
      if (existingLogs.length > 100) {
        existingLogs.splice(0, existingLogs.length - 100);
      }
      
      localStorage.setItem('emergencyLogs', JSON.stringify(existingLogs));
      
      console.log('Emergency event logged:', logEntry);
    } catch (error) {
      console.error('Error logging emergency event:', error);
    }
  }

  // Test emergency system
  async testEmergencySystem() {
    console.log('🧪 Testing Emergency System...');
    
    const testData = {
      type: 'test',
      transcript: 'help help help',
      helpCount: 3,
      timestamp: new Date().toISOString()
    };

    try {
      const results = await this.triggerEmergencyAlert(testData);
      console.log('Test results:', results);
      return results;
    } catch (error) {
      console.error('Test failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const emergencyServices = new EmergencyServices();

export default emergencyServices;

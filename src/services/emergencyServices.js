// Emergency Services Integration
// This service handles emergency alerts and notifications

import emailService from './emailService';

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
    try {
      // First try OpenStreetMap Nominatim (free service)
      const osmResponse = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'ResQTech Emergency System'
          }
        }
      );

      if (osmResponse.ok) {
        const osmData = await osmResponse.json();
        if (osmData.display_name) {
          return osmData.display_name;
        }
      }
    } catch (error) {
      // Continue to fallback
    }

    try {
      // Fallback to Google Maps if API key is available
      if (this.config.apiKeys.maps) {
        const googleResponse = await fetch(
          `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${this.config.apiKeys.maps}`
        );

        if (googleResponse.ok) {
          const googleData = await googleResponse.json();
          if (googleData.results && googleData.results[0]) {
            return googleData.results[0].formatted_address;
          }
        }
      }
    } catch (error) {
      // Continue to fallback
    }

    // Final fallback to coordinates
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
      return notifications;
    }

    for (const contact of emergencyContacts) {
      try {
        // Send email notification
        if (contact.email) {
          const emailResult = await this.sendEmergencyEmail(contact, alertData);
          notifications.push(emailResult);
        } else {
          notifications.push({
            contact: contact.name,
            type: 'email',
            status: 'skipped',
            reason: 'No email address provided'
          });
        }
      } catch (error) {
        console.error(`Error notifying contact ${contact.name}:`, error);
        notifications.push({
          contact: contact.name,
          type: 'email',
          status: 'error',
          error: error.message
        });
      }
    }

    return notifications;
  }

  // Send emergency email using dedicated email service
  async sendEmergencyEmail(contact, alertData) {
    try {
      const result = await emailService.sendEmergencyEmail(contact, alertData);
      return {
        contact: contact.name,
        type: 'email',
        status: result.status,
        email: result.email,
        provider: result.provider,
        messageId: result.messageId,
        timestamp: result.timestamp
      };
    } catch (error) {
      console.error(`Email error for ${contact.name}:`, error);
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
    } catch (error) {
      console.error('Error logging emergency event:', error);
    }
  }

  // Test emergency system
  async testEmergencySystem() {
    const testData = {
      type: 'test',
      transcript: 'help help help',
      helpCount: 3,
      timestamp: new Date().toISOString()
    };

    try {
      const results = await this.triggerEmergencyAlert(testData);
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

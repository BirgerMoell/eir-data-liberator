/**
 * Data Transfer Module for Chrome Plugin
 * Handles secure data transfer to eir.space using PostMessage API
 */

class DataTransferManager {
  constructor() {
    this.dataKey = null;
    this.eirData = null;
    this.eirSpaceUrl = 'https://eir.space';
    this.messageHandlers = new Map();
    
    this.init();
  }

  /**
   * Initialize the data transfer manager
   */
  init() {
    this.setupMessageListener();
    console.log('DataTransferManager initialized');
  }

  /**
   * Generate a unique key for data storage
   */
  generateDataKey() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 15);
    return `eir_data_${timestamp}_${random}`;
  }

  /**
   * Store EIR data locally and prepare for transfer
   * @param {Array} normalizedEntries - Normalized journal entries (already in EIR format)
   * @param {Object} metadata - Optional metadata (patient info, source, etc.)
   */
  async storeEirData(normalizedEntries, metadata = {}) {
    try {
      // Generate unique key
      this.dataKey = this.generateDataKey();
      
      // Generate EIR content using EIRFormatter if available
      if (typeof EIRFormatter !== 'undefined') {
        this.eirData = EIRFormatter.generateEIRContent(normalizedEntries, metadata);
      } else {
        // Fallback: use local method
        this.eirData = this.generateEIRContent(normalizedEntries);
      }
      
      // Store in local storage
      localStorage.setItem(this.dataKey, JSON.stringify(this.eirData));
      
      // Set expiration (24 hours)
      const expiration = Date.now() + (24 * 60 * 60 * 1000);
      localStorage.setItem(`${this.dataKey}_expires`, expiration.toString());
      
      console.log(`EIR data stored with key: ${this.dataKey}`);
      return this.dataKey;
      
    } catch (error) {
      console.error('Error storing EIR data:', error);
      throw error;
    }
  }

  /**
   * Transfer data to eir.space using PostMessage
   */
  async transferToEirSpace() {
    if (!this.dataKey || !this.eirData) {
      throw new Error('No data available for transfer');
    }

    try {
      // Open eir.space in new tab with data key
      const eirUrl = `${this.eirSpaceUrl}/view?key=${this.dataKey}`;
      const eirTab = window.open(eirUrl, '_blank');
      
      if (!eirTab) {
        throw new Error('Failed to open eir.space tab. Please check popup blockers.');
      }

      // Wait for eir.space to load and request data
      this.waitForDataRequest(eirTab);
      
      return eirUrl;
      
    } catch (error) {
      console.error('Error transferring to eir.space:', error);
      throw error;
    }
  }

  /**
   * Wait for eir.space to request data via PostMessage
   */
  waitForDataRequest(eirTab) {
    const checkInterval = setInterval(() => {
      try {
        // Check if tab is still open
        if (eirTab.closed) {
          clearInterval(checkInterval);
          return;
        }

        // Try to send a ping to check if eir.space is ready
        eirTab.postMessage({
          type: 'EIR_PLUGIN_PING',
          key: this.dataKey
        }, this.eirSpaceUrl);
        
      } catch (error) {
        // Tab might not be ready yet, continue waiting
        console.log('Waiting for eir.space to load...');
      }
    }, 1000);

    // Stop checking after 30 seconds
    setTimeout(() => {
      clearInterval(checkInterval);
    }, 30000);
  }

  /**
   * Setup PostMessage listener for data requests
   */
  setupMessageListener() {
    window.addEventListener('message', (event) => {
      // Security: Only accept messages from eir.space
      if (event.origin !== this.eirSpaceUrl) {
        return;
      }

      this.handleMessage(event);
    });
  }

  /**
   * Handle incoming messages from eir.space
   */
  handleMessage(event) {
    const { type, key } = event.data;

    switch (type) {
      case 'REQUEST_EIR_DATA':
        this.sendEirData(event.source, key);
        break;
        
      case 'EIR_SPACE_READY':
        // eir.space is ready, send data immediately
        this.sendEirData(event.source, key);
        break;
        
      default:
        console.log('Unknown message type:', type);
    }
  }

  /**
   * Send EIR data to eir.space
   */
  sendEirData(targetWindow, requestedKey) {
    try {
      // Verify the key matches
      if (requestedKey !== this.dataKey) {
        console.error('Key mismatch:', requestedKey, 'vs', this.dataKey);
        return;
      }

      // Get data from local storage
      const storedData = localStorage.getItem(this.dataKey);
      
      if (!storedData) {
        console.error('No data found for key:', this.dataKey);
        return;
      }

      // Send data to eir.space
      targetWindow.postMessage({
        type: 'EIR_DATA_RESPONSE',
        key: this.dataKey,
        data: storedData,
        timestamp: Date.now()
      }, this.eirSpaceUrl);

      console.log('EIR data sent to eir.space successfully');
      
      // Clean up after successful transfer (optional)
      // this.cleanupData();
      
    } catch (error) {
      console.error('Error sending EIR data:', error);
    }
  }

  /**
   * Clean up stored data
   */
  cleanupData() {
    if (this.dataKey) {
      localStorage.removeItem(this.dataKey);
      localStorage.removeItem(`${this.dataKey}_expires`);
      console.log('Data cleaned up for key:', this.dataKey);
    }
  }

  /**
   * Check if stored data has expired
   */
  isDataExpired(key) {
    const expiration = localStorage.getItem(`${key}_expires`);
    if (!expiration) return true;
    
    return Date.now() > parseInt(expiration);
  }

  /**
   * Generate EIR content from journal entries
   * Uses EIRFormatter if available, otherwise falls back to basic structure
   */
  generateEIRContent(entries) {
    // Use EIRFormatter if available (from core module)
    if (typeof EIRFormatter !== 'undefined') {
      const patientName = document.querySelector('.ic-avatar-box__name')?.textContent || 'Unknown';
      return EIRFormatter.generateEIRContent(entries, {
        source: "1177.se Journal",
        patient: {
          name: patientName,
          birth_date: null, // Would need to be extracted from page
          personal_number: null // Would need to be extracted from page
        }
      });
    }
    
    // Fallback: basic structure if EIRFormatter not available
    const currentDate = new Date().toISOString();
    const patientName = document.querySelector('.ic-avatar-box__name')?.textContent || 'Unknown';
    
    return {
      metadata: {
        format_version: "1.0",
        created_at: currentDate,
        source: "1177.se Journal",
        patient: {
          name: patientName,
          birth_date: null,
          personal_number: null
        },
        export_info: {
          total_entries: entries.length,
          date_range: { start: 'Unknown', end: 'Unknown' },
          healthcare_providers: []
        }
      },
      entries: entries
    };
  }

}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = DataTransferManager;
} else {
  window.DataTransferManager = DataTransferManager;
}

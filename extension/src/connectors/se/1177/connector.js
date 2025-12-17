/**
 * 1177.se Connector
 * 
 * Implements the BaseConnector interface for 1177.se journal portal.
 * Coordinates scraping and normalization to produce EIR-standard output.
 */

class Connector1177 extends BaseConnector {
  static providerName = "1177.se";
  static country = "SE";
  
  constructor() {
    super();
    this.scraper = new Scraper1177();
  }
  
  /**
   * Check if this connector matches the current URL
   * @param {string} url - The current page URL
   * @returns {boolean} - True if this connector should handle this URL
   */
  static matches(url) {
    return url.includes('journalen.1177.se') || url.includes('1177.se/journal');
  }
  
  /**
   * Check if user is authenticated/logged in (1177-specific)
   * @returns {boolean} - True if user appears to be logged in
   */
  isAuthenticated() {
    // Check for 1177-specific login indicators
    const loginIndicators = [
      document.querySelector('[data-testid="user-menu"]'),
      document.querySelector('.ic-avatar-box__name'), // 1177-specific
      document.querySelector('.user-profile'),
      document.querySelector('.logout-button'),
      document.querySelector('[href*="logout"]'),
      document.querySelector('.user-info'),
      !window.location.href.includes('login') && !window.location.href.includes('auth')
    ];
    
    const isLoggedIn = loginIndicators.some(indicator => indicator !== null);
    
    console.log('1177 Extension Debug:');
    console.log('Current URL:', window.location.href);
    console.log('Is logged in:', isLoggedIn);
    
    return isLoggedIn;
  }
  
  /**
   * Wait for journal data to load (1177-specific)
   * @returns {Promise<void>}
   */
  async waitForData() {
    return this.scraper.waitForJournalData();
  }
  
  /**
   * Scrape raw data from 1177.se
   * @returns {Promise<Array>} - Raw provider-specific data structure
   */
  async scrape() {
    console.log('1177: Starting scrape...');
    
    // Wait for data to load
    await this.waitForData();
    
    // Load all available journal entries
    await this.scraper.loadAllJournalEntries();
    
    // Get all journal entries
    const rawEntries = await this.scraper.getAllJournalEntries();
    
    console.log(`1177: Scraped ${rawEntries.length} entries`);
    return rawEntries;
  }
  
  /**
   * Normalize raw scraped data into EIR standard format
   * @param {Array} rawData - Raw data from scrape()
   * @returns {Array} - Normalized data matching EIR format
   */
  normalize(rawData) {
    console.log('1177: Normalizing data...');
    const normalized = Normalizer1177.normalize(rawData);
    console.log(`1177: Normalized ${normalized.length} entries`);
    return normalized;
  }
  
  /**
   * Get patient metadata (1177-specific extraction)
   * @returns {Object} - Patient metadata
   */
  getPatientMetadata() {
    const patientName = this.scraper.getPatientName();
    
    // TODO: Extract birth_date and personal_number from 1177 page
    // These would need specific selectors for 1177's patient info section
    return {
      name: patientName,
      birth_date: null, // Would need to be extracted from page
      personal_number: null // Would need to be extracted from page
    };
  }
}

// Register this connector with the registry
if (typeof ConnectorRegistry !== 'undefined') {
  ConnectorRegistry.registerConnector(Connector1177);
} else {
  // If registry isn't loaded yet, register when it becomes available
  window.addEventListener('DOMContentLoaded', () => {
    if (typeof ConnectorRegistry !== 'undefined') {
      ConnectorRegistry.registerConnector(Connector1177);
    }
  });
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Connector1177;
} else {
  window.Connector1177 = Connector1177;
}


/**
 * Base Connector Interface
 * 
 * All connectors must extend this base class and implement the required methods.
 * This ensures a consistent interface for the Core to interact with any provider.
 */

class BaseConnector {
  /**
   * Static properties that must be defined by each connector
   */
  
  /**
   * Provider name (e.g., "1177.se", "Epic MyChart")
   * @type {string}
   */
  static providerName = null;
  
  /**
   * ISO country code (e.g., "SE", "US")
   * @type {string}
   */
  static country = null;
  
  /**
   * Check if this connector matches the current URL
   * @param {string} url - The current page URL
   * @returns {boolean} - True if this connector should handle this URL
   */
  static matches(url) {
    throw new Error('matches() must be implemented by connector');
  }
  
  /**
   * Check if user is authenticated/logged in
   * @returns {boolean} - True if user appears to be logged in
   */
  isAuthenticated() {
    // Default implementation - can be overridden
    const loginIndicators = [
      document.querySelector('[data-testid="user-menu"]'),
      document.querySelector('.user-profile'),
      document.querySelector('.logout-button'),
      document.querySelector('[href*="logout"]'),
      document.querySelector('.user-info'),
      !window.location.href.includes('login') && !window.location.href.includes('auth')
    ];
    
    return loginIndicators.some(indicator => indicator !== null);
  }
  
  /**
   * Wait for data to load (for dynamic content)
   * Override this if the provider loads content dynamically
   * @returns {Promise<void>}
   */
  async waitForData() {
    // Default: no waiting needed
    return Promise.resolve();
  }
  
  /**
   * Scrape raw data from the provider's page
   * This is provider-specific and returns raw, unnormalized data
   * @returns {Promise<Object>} - Raw provider-specific data structure
   */
  async scrape() {
    throw new Error('scrape() must be implemented by connector');
  }
  
  /**
   * Normalize raw scraped data into EIR standard format
   * @param {Object} rawData - Raw data from scrape()
   * @returns {Object} - Normalized data matching EIR format
   */
  normalize(rawData) {
    throw new Error('normalize() must be implemented by connector');
  }
  
  /**
   * Get patient metadata (name, birth date, etc.)
   * Override if provider has specific way to extract this
   * @returns {Object} - Patient metadata
   */
  getPatientMetadata() {
    return {
      name: 'Unknown',
      birth_date: null,
      personal_number: null
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BaseConnector;
} else {
  window.BaseConnector = BaseConnector;
}


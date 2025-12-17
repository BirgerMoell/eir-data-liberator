/**
 * Connector Registry
 * 
 * Discovers, registers, and matches connectors to URLs.
 * Acts as the central hub for connector management.
 */

class ConnectorRegistry {
  constructor() {
    this.connectors = [];
    this.activeConnector = null;
  }
  
  /**
   * Register a connector class
   * Connectors are registered automatically when their script loads
   * @param {Class} ConnectorClass - Connector class that extends BaseConnector
   */
  registerConnector(ConnectorClass) {
    // Validate that it's a proper connector
    if (!ConnectorClass.providerName || !ConnectorClass.country) {
      console.error('Invalid connector: missing providerName or country', ConnectorClass);
      return;
    }
    
    if (typeof ConnectorClass.matches !== 'function') {
      console.error('Invalid connector: missing matches() method', ConnectorClass);
      return;
    }
    
    this.connectors.push(ConnectorClass);
    console.log(`Registered connector: ${ConnectorClass.providerName} (${ConnectorClass.country})`);
  }
  
  /**
   * Find a connector that matches the current URL
   * @param {string} url - The URL to match (defaults to current page URL)
   * @returns {Class|null} - Matching connector class or null
   */
  findConnector(url = window.location.href) {
    for (const ConnectorClass of this.connectors) {
      try {
        if (ConnectorClass.matches(url)) {
          console.log(`Found matching connector: ${ConnectorClass.providerName}`);
          return ConnectorClass;
        }
      } catch (error) {
        console.error(`Error checking connector ${ConnectorClass.providerName}:`, error);
      }
    }
    
    console.log('No matching connector found for URL:', url);
    return null;
  }
  
  /**
   * Get or create an instance of the active connector
   * @param {string} url - The URL to match (defaults to current page URL)
   * @returns {BaseConnector|null} - Connector instance or null
   */
  getActiveConnector(url = window.location.href) {
    // If we already have an active connector for this URL, return it
    if (this.activeConnector && this.activeConnector.constructor.matches(url)) {
      return this.activeConnector;
    }
    
    // Find matching connector
    const ConnectorClass = this.findConnector(url);
    if (!ConnectorClass) {
      this.activeConnector = null;
      return null;
    }
    
    // Create instance
    try {
      this.activeConnector = new ConnectorClass();
      console.log(`Created connector instance: ${ConnectorClass.providerName}`);
      return this.activeConnector;
    } catch (error) {
      console.error(`Error creating connector instance:`, error);
      this.activeConnector = null;
      return null;
    }
  }
  
  /**
   * Get list of all registered connectors
   * @returns {Array} - Array of connector classes
   */
  getAllConnectors() {
    return this.connectors;
  }
  
  /**
   * Clear the active connector (useful for testing or page navigation)
   */
  clearActiveConnector() {
    this.activeConnector = null;
  }
}

// Create singleton instance
const connectorRegistry = new ConnectorRegistry();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = connectorRegistry;
} else {
  window.ConnectorRegistry = connectorRegistry;
}


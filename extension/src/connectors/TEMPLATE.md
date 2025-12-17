# Connector Template

Use this template when creating a new connector. Copy the structure and adapt it to your provider.

## File Structure

```
extension/src/connectors/{country}/{provider}/
  ├── connector.js      # Main connector class (required)
  ├── scraper.js        # DOM scraping logic (optional)
  └── normalizer.js     # Data normalization (optional)
```

## connector.js Template

```javascript
/**
 * {Provider Name} Connector
 * 
 * Implements the BaseConnector interface for {provider URL}.
 */

class {Provider}Connector extends BaseConnector {
  static providerName = "{Provider Name}";
  static country = "{ISO_COUNTRY_CODE}"; // e.g., "US", "SE", "GB"
  
  constructor() {
    super();
    // Initialize scraper/normalizer if using separate files
    // this.scraper = new Scraper{Provider}();
  }
  
  /**
   * Check if this connector matches the current URL
   */
  static matches(url) {
    // Add URL patterns that identify this provider
    return url.includes('provider-domain.com') ||
           url.match(/provider-pattern/);
  }
  
  /**
   * Check if user is authenticated/logged in
   */
  isAuthenticated() {
    // Look for login indicators specific to this provider
    return document.querySelector('.user-menu') !== null ||
           !window.location.href.includes('login');
  }
  
  /**
   * Wait for data to load (for dynamic content)
   */
  async waitForData() {
    // Wait for journal entries to appear
    return new Promise((resolve) => {
      const check = () => {
        if (document.querySelector('.journal-entry')) {
          resolve();
        } else {
          setTimeout(check, 500);
        }
      };
      check();
      setTimeout(resolve, 10000); // Max 10s wait
    });
  }
  
  /**
   * Scrape raw data from the provider's page
   */
  async scrape() {
    await this.waitForData();
    
    // Option 1: DOM scraping
    const entries = [];
    const entryElements = document.querySelectorAll('.journal-entry');
    entryElements.forEach(el => {
      entries.push({
        date: el.querySelector('.date')?.textContent,
        title: el.querySelector('.title')?.textContent,
        text: el.textContent,
        // Extract other fields...
      });
    });
    
    // Option 2: API calls (if provider uses APIs)
    // const response = await fetch('/api/patient/records');
    // const data = await response.json();
    
    return entries;
  }
  
  /**
   * Normalize raw data to EIR format
   */
  normalize(rawData) {
    return rawData.map((entry, index) => ({
      id: `entry_${String(index + 1).padStart(3, '0')}`,
      date: this.formatDate(entry.date), // Convert to YYYY-MM-DD
      time: this.extractTime(entry.text), // Extract HH:MM
      category: entry.category || 'Unknown',
      type: entry.title || 'Unknown',
      provider: {
        name: entry.provider || 'Unknown',
        region: this.extractRegion(entry.provider),
        location: entry.location || 'Unknown'
      },
      status: entry.status || 'Unknown',
      responsible_person: {
        name: entry.doctor || 'Unknown',
        role: entry.role || 'Unknown'
      },
      content: {
        summary: entry.title || 'Journal Entry',
        details: entry.text || '',
        notes: this.extractNotes(entry.text)
      },
      attachments: [],
      tags: this.generateTags(entry)
    }));
  }
  
  /**
   * Get patient metadata
   */
  getPatientMetadata() {
    return {
      name: this.extractPatientName(),
      birth_date: null, // Extract if available
      personal_number: null // Extract if available
    };
  }
  
  // Helper methods
  
  formatDate(dateStr) {
    // Convert provider date format to YYYY-MM-DD
    if (!dateStr) return 'Unknown';
    // Add your date parsing logic here
    return dateStr;
  }
  
  extractTime(text) {
    // Extract time from text (e.g., "10:52 AM" → "10:52")
    const match = text.match(/(\d{1,2}):(\d{2})/);
    return match ? match[0] : 'Unknown';
  }
  
  extractRegion(provider) {
    // Extract region/state from provider name
    return 'Unknown';
  }
  
  extractNotes(text) {
    // Extract structured notes from text
    return [];
  }
  
  generateTags(entry) {
    // Generate tags based on entry content
    const tags = [];
    if (entry.category) tags.push(entry.category.toLowerCase());
    return tags;
  }
  
  extractPatientName() {
    // Extract patient name from page
    return 'Unknown';
  }
}

// Auto-register with registry
if (typeof ConnectorRegistry !== 'undefined') {
  ConnectorRegistry.registerConnector({Provider}Connector);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {Provider}Connector;
} else {
  window.{Provider}Connector = {Provider}Connector;
}
```

## manifest.json Entry

Add this to `extension/manifest.json`:

```json
{
  "content_scripts": [
    {
      "matches": ["https://provider-domain.com/*"],
      "js": [
        "src/connectors/base-connector.js",
        "src/connectors/{country}/{provider}/connector.js",
        "src/core/connector-registry.js",
        "src/core/ui-manager.js",
        "src/core/file-downloader.js",
        "src/core/eir-formatter.js",
        "data-transfer.js",
        "content.js"
      ],
      "css": ["styles.css"],
      "run_at": "document_end"
    }
  ],
  "host_permissions": [
    "https://provider-domain.com/*"
  ]
}
```

## Testing Checklist

- [ ] Connector matches correct URLs
- [ ] Authentication detection works
- [ ] Data scraping extracts all available entries
- [ ] Dates normalized to ISO format (YYYY-MM-DD)
- [ ] Times normalized to HH:MM format
- [ ] Data structure matches EIR format
- [ ] Tested with real portal (logged in)
- [ ] No console errors
- [ ] Files download correctly

## Example

See `extension/src/connectors/se/1177/` for a complete working example.


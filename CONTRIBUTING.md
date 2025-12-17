# Contributing to Eir Data Liberator

Thank you for your interest in contributing! This guide will help you add support for new healthcare portals.

## 🎯 How to Contribute

### 1. Find a Portal to Add

- Check [open Issues](https://github.com/BirgerMoell/eir-data-liberator/issues) for requested portals
- Or pick a major healthcare portal in your country
- Make sure it's not already supported (check `extension/src/connectors/`)

### 2. Set Up Your Development Environment

```bash
# Clone the repo
git clone https://github.com/BirgerMoell/eir-data-liberator.git
cd eir-data-liberator

# Load extension in Chrome
# 1. Open chrome://extensions
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the extension folder
```

### 3. Study an Existing Connector

The best way to learn is by example. Check out the working 1177.se connector:

- **`extension/src/connectors/se/1177/connector.js`** — Main connector class
- **`extension/src/connectors/se/1177/scraper.js`** — DOM scraping logic
- **`extension/src/connectors/se/1177/normalizer.js`** — Data normalization

### 4. Create Your Connector

#### Step 1: Create Directory Structure

```bash
mkdir -p extension/src/connectors/{country}/{provider}
```

Example:
```bash
mkdir -p extension/src/connectors/us/epic
```

#### Step 2: Implement the Connector

Create `connector.js`:

```javascript
// Import base class (available globally when loaded)
class EpicConnector extends BaseConnector {
  static providerName = "Epic MyChart";
  static country = "US";
  
  // URL matching - when should this connector activate?
  static matches(url) {
    return url.includes('mychart.') || 
           url.includes('epic.com') ||
           url.match(/mychart\.[a-z]+\.org/);
  }
  
  // Check if user is logged in
  isAuthenticated() {
    // Look for login indicators
    return document.querySelector('.user-menu') !== null ||
           !window.location.href.includes('login');
  }
  
  // Wait for data to load (for dynamic content)
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
  
  // Scrape raw data from the portal
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
        // ... extract other fields
      });
    });
    
    // Option 2: API calls (if portal uses APIs)
    // const response = await fetch('/api/patient/records');
    // const data = await response.json();
    
    return entries;
  }
  
  // Normalize to EIR format
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
  
  // Helper methods
  formatDate(dateStr) {
    // Convert provider date format to YYYY-MM-DD
    // Example: "03/17/2025" → "2025-03-17"
    if (!dateStr) return 'Unknown';
    // Add your date parsing logic here
    return dateStr; // Return ISO format
  }
  
  extractTime(text) {
    // Extract time from text (e.g., "10:52 AM" → "10:52")
    const match = text.match(/(\d{1,2}):(\d{2})/);
    return match ? match[0] : 'Unknown';
  }
  
  extractRegion(provider) {
    // Extract region/state from provider name
    return 'Unknown'; // Implement based on your country
  }
  
  extractNotes(text) {
    // Extract structured notes from text
    return [];
  }
  
  generateTags(entry) {
    // Generate tags based on entry content
    const tags = [];
    if (entry.category) tags.push(entry.category.toLowerCase());
    // Add more tag logic
    return tags;
  }
}

// Auto-register with registry
if (typeof ConnectorRegistry !== 'undefined') {
  ConnectorRegistry.registerConnector(EpicConnector);
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = EpicConnector;
} else {
  window.EpicConnector = EpicConnector;
}
```

#### Step 3: Update manifest.json

Add your connector to the content scripts:

```json
{
  "content_scripts": [
    {
      "matches": ["https://mychart.*/*", "https://*.epic.com/*"],
      "js": [
        "src/connectors/base-connector.js",
        "src/connectors/us/epic/connector.js",
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
    "https://mychart.*/*",
    "https://*.epic.com/*"
  ]
}
```

**Important:** Keep the file order! Base classes must load before connectors.

### 5. Test Your Connector

1. **Reload the extension** in `chrome://extensions`
2. **Navigate to your provider's portal**
3. **Log in manually** (the extension uses your existing session)
4. **Click the floating "Download Journals" button**
5. **Verify:**
   - Button appears and is clickable
   - Download starts without errors
   - `.txt` file downloads with readable content
   - `.eir` file downloads with valid YAML
   - Data looks correct when opened

### 6. Debugging Tips

- **Open DevTools** (F12) to see console logs
- Look for errors in the Console tab
- Check Network tab if using API calls
- Use `console.log()` liberally during development
- Test with real patient data (your own, with permission)

### 7. Submit Your PR

```bash
# Create a branch
git checkout -b add-us-epic

# Add your files
git add extension/src/connectors/us/epic/
git add extension/manifest.json

# Commit
git commit -m "Add connector for Epic MyChart (US)"

# Push
git push origin add-us-epic
```

Then open a Pull Request on GitHub!

## 📋 PR Checklist

Before submitting, ensure:

- [ ] Connector works with real portal (tested logged in)
- [ ] All dates normalized to ISO format (YYYY-MM-DD)
- [ ] All times normalized to HH:MM format
- [ ] Data structure matches EIR format spec
- [ ] Added to `manifest.json` with correct permissions
- [ ] No console errors
- [ ] Code follows existing style
- [ ] Added comments for complex logic

## 🐛 Reporting Issues

Found a bug or have a feature request? Open an [Issue](https://github.com/BirgerMoell/eir-data-liberator/issues) with:

- **Description**: What happened vs. what you expected
- **Provider**: Which healthcare portal
- **Steps to reproduce**: How to trigger the issue
- **Screenshots**: If applicable
- **Console errors**: Copy any error messages

## 💡 Tips for Success

1. **Start simple**: Get basic scraping working first, then refine
2. **Use existing connectors**: Copy patterns from 1177.se connector
3. **Test incrementally**: Test each method as you write it
4. **Handle edge cases**: Empty data, missing fields, pagination
5. **Document quirks**: Add comments explaining provider-specific behavior

## 🤝 Need Help?

- Check existing connectors for examples
- Open a [Discussion](https://github.com/BirgerMoell/eir-data-liberator/discussions)
- Review the [EIR Format Spec](extension/EIR-FORMAT-SPECIFICATION.md)

Thank you for contributing! 🎉


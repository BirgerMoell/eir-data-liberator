# 🏥 Eir Data Liberator

### *Your Health Data, In Your Hands.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)
[![Contributors Welcome](https://img.shields.io/badge/contributors-welcome-blue.svg)](CONTRIBUTING.md)
[![Code of Conduct](https://img.shields.io/badge/code%20of-conduct-ff69b4.svg)](CODE_OF_CONDUCT.md)

**Eir Data Liberator** is an open-source browser extension that helps patients worldwide download and own their medical records from restrictive healthcare portals.

**Part of the [Eir.Space](https://eir.space) ecosystem** — We believe if you generate the data, you should own the data.

---

## 🌍 The Problem

Healthcare providers lock patient data behind clunky portals with no "Export All" button. This extension gives you:

1. **One-click download** of all your medical records
2. **Universal format** — converts everything to the open `.eir` (YAML) standard
3. **Your data, your control** — download locally or sync with Eir.Space

**Current Status:** ✅ **Sweden (1177.se)** — Working and tested  
**Goal:** 🌎 Universal support for all major EHR portals worldwide

---

## 🚀 Quick Start

### For Users

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BirgerMoell/eir-data-liberator.git
   cd eir-data-liberator
   ```

2. **Load the extension:**
   - Open Chrome/Edge/Brave → `chrome://extensions`
   - Enable **Developer mode** (top right)
   - Click **Load unpacked**
   - Select the `extension` folder

3. **Use it:**
   - Navigate to [1177.se](https://1177.se) (or your supported provider)
   - Log in to your healthcare portal
   - Click the floating **"Download Journals"** button

### For Developers

See [Contributing](#-contributing) below or check out [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guides.

---

## 🏗️ Architecture

This extension uses a **connector-based architecture** — think of it as a universal translator:

- **Core** (`extension/src/core/`): Universal engine that works with any provider
  - UI management, file downloads, EIR formatting, connector registry

- **Connectors** (`extension/src/connectors/`): Provider-specific implementations
  - Each healthcare portal gets its own connector
  - Handles DOM scraping, API calls, and data normalization

- **Registry**: Automatically matches URLs to the right connector

```
extension/
  src/
    core/              # Universal engine (UI, downloads, EIR formatting)
    connectors/        # Provider-specific connectors
      se/1177/        # ✅ Sweden - 1177.se (working)
      us/epic/        # 🚧 US - Epic/MyChart (planned)
```

---

## 🤝 Contributing

We need connectors for healthcare portals worldwide! Here's how to add one:

### Step 1: Choose Your Target

**Need ideas?** Here are high-impact targets by region:

- **🇸🇪 Sweden**: MinGuld, Region-specific portals
- **🇺🇸 United States**: Epic MyChart, Cerner, Allscripts, athenahealth
- **🇬🇧 United Kingdom**: NHS Patient Access, GP portals
- **🇨🇦 Canada**: Provincial health portals (e.g., MyHealthNS, eHealth Ontario)
- **🇩🇪 Germany**: KV portals, practice-specific systems
- **🇫🇷 France**: Ameli, Doctolib patient portals
- **🇦🇺 Australia**: My Health Record, state health portals
- **🇳🇱 Netherlands**: ZorgDomein, patient portals

**Or add your country's portal!** Check [Issues](https://github.com/BirgerMoell/eir-data-liberator/issues) for requests.

### Step 2: Create Your Connector

1. **Create the directory structure:**
   ```bash
   mkdir -p extension/src/connectors/{country}/{provider}
   ```
   
   Example: `extension/src/connectors/us/epic/`

2. **Create three files:**

   **`connector.js`** — Main connector class:
   ```javascript
   class EpicConnector extends BaseConnector {
     static providerName = "Epic MyChart";
     static country = "US";
     
     static matches(url) {
       return url.includes('mychart.') || url.includes('epic.com');
     }
     
     async scrape() {
       // Your scraping logic here
       // Can use DOM queries or API calls
       return rawData;
     }
     
     normalize(rawData) {
       // Convert to EIR format
       return normalizedEntries;
     }
   }
   
   // Auto-register
   if (typeof ConnectorRegistry !== 'undefined') {
     ConnectorRegistry.registerConnector(EpicConnector);
   }
   ```

   **`scraper.js`** (optional) — DOM scraping helpers:
   ```javascript
   class ScraperEpic {
     async waitForData() { /* ... */ }
     async loadAllEntries() { /* ... */ }
     extractEntryContent(element) { /* ... */ }
   }
   ```

   **`normalizer.js`** (optional) — Data normalization:
   ```javascript
   class NormalizerEpic {
     static normalize(rawEntries) {
       // Convert provider format → EIR format
       return normalizedEntries;
     }
   }
   ```

3. **Update `manifest.json`:**
   ```json
   {
     "content_scripts": [
       {
         "matches": ["https://mychart.*/*", "https://*.epic.com/*"],
         "js": [
           "src/connectors/base-connector.js",
           "src/connectors/us/epic/scraper.js",
           "src/connectors/us/epic/normalizer.js",
           "src/connectors/us/epic/connector.js",
           "src/core/connector-registry.js",
           "src/core/ui-manager.js",
           "src/core/file-downloader.js",
           "src/core/eir-formatter.js",
           "data-transfer.js",
           "content.js"
         ]
       }
     ],
     "host_permissions": [
       "https://mychart.*/*",
       "https://*.epic.com/*"
     ]
   }
   ```

### Step 3: Normalize to EIR Format

Your `normalize()` method must return entries matching this structure:

```javascript
[
  {
    id: "entry_001",
    date: "2025-03-17",        // ISO: YYYY-MM-DD
    time: "10:52",             // HH:MM
    category: "Visit",          // Entry category
    type: "Primary Care",       // Entry type
    provider: {
      name: "Hospital Name",
      region: "State/Region",
      location: "City"
    },
    status: "Completed",
    responsible_person: {
      name: "Dr. Smith",
      role: "Physician"
    },
    content: {
      summary: "Annual checkup",
      details: "Full visit notes...",
      notes: ["Note 1", "Note 2"]
    },
    attachments: [],
    tags: ["checkup", "primary-care"]
  }
]
```

See `extension/EIR-FORMAT-SPECIFICATION.md` for the complete spec.

### Step 4: Test & Submit

1. **Test locally:**
   - Load the extension in Developer mode
   - Navigate to your provider's portal
   - Log in manually (extension uses your existing session)
   - Click "Download Journals"
   - Verify `.txt` and `.eir` files download correctly

2. **Submit a PR:**
   - Fork the repo
   - Create a branch: `git checkout -b add-{country}-{provider}`
   - Commit: `git commit -m "Add connector for {Provider}"`
   - Push and open a Pull Request

**Need help?** 
- Read [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guides
- Check existing connectors in `extension/src/connectors/se/1177/` for examples
- Open an [Issue](https://github.com/BirgerMoell/eir-data-liberator/issues) for questions

---

## 📋 Connector Checklist

When adding a new connector, ensure:

- [ ] Connector extends `BaseConnector`
- [ ] `matches()` correctly identifies provider URLs
- [ ] `scrape()` extracts all available data
- [ ] `normalize()` converts to EIR format
- [ ] Added to `manifest.json` with correct permissions
- [ ] Tested with real portal (logged in)
- [ ] Documentation added (if needed)

---

## 🗺️ Roadmap by Nation

Help us expand! Here's what we're targeting:

| Country | Priority Providers | Status |
|---------|-------------------|--------|
| 🇸🇪 Sweden | 1177.se | ✅ Done |
| 🇸🇪 Sweden | MinGuld, Region portals | 🚧 Needed |
| 🇺🇸 United States | Epic MyChart | 🚧 Needed |
| 🇺🇸 United States | Cerner | 🚧 Needed |
| 🇬🇧 United Kingdom | NHS Patient Access | 🚧 Needed |
| 🇨🇦 Canada | Provincial portals | 🚧 Needed |
| 🌍 Other | Your country's portal | 🚧 Needed |

**Want to add your country?** See [Contributing](#-contributing) above!

---

## 📚 Resources

- **EIR Format Spec**: `extension/EIR-FORMAT-SPECIFICATION.md`
- **Example Connector**: `extension/src/connectors/se/1177/`
- **Connector Template**: `extension/src/connectors/TEMPLATE.md`
- **Base Connector**: `extension/src/connectors/base-connector.js`
- **Roadmap**: [ROADMAP.md](ROADMAP.md)
- **Changelog**: [CHANGELOG.md](CHANGELOG.md)
- **Security Policy**: [SECURITY.md](SECURITY.md)

---

## 📝 License

MIT License — See [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

Built with ❤️ by the open-source community. Special thanks to all contributors helping patients own their health data worldwide.

**Questions?** Open an [Issue](https://github.com/BirgerMoell/eir-data-liberator/issues) or start a [Discussion](https://github.com/BirgerMoell/eir-data-liberator/discussions).

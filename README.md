🏥 Eir Data Liberator
Your Health Data, In Your Hands.
Eir Data Liberator is an open-source Chrome Extension designed to help patients around the world scrape, download, and own their medical records from restrictive Electronic Health Record (EHR) web portals.

This project is part of the Eir.Space ecosystem. We believe that if you generate the data, you should own the data.

🌍 The Mission
Healthcare providers often lock patient data behind clunky portals with no "Export All" button. This extension injects a simple interface into these portals, allowing users to:

Scrape their journal entries, vaccinations, and diagnoses.

Format the data into the universal, open .eir (YAML) standard.

Download it locally or sync it with their Eir.Space Personal Health Cloud.

Current Status: ✅ Live for Sweden (1177.se). Goal: 🌎 Universal support for all major EHR portals (Epic, MyChart, Cerner, etc.).

🚀 Getting Started (Sideloading)
Currently, this extension is in Developer Preview. You must sideload it into Chrome/Edge/Brave.

Clone or Download this repository.

Bash

git clone https://github.com/your-org/eir-data-liberator.git
Open your browser and navigate to chrome://extensions.

Toggle Developer mode (top right corner).

Click Load unpacked.

Select the dist or src folder from this repository.

Navigate to a supported healthcare provider (e.g., 1177.se) and log in.

Look for the "Download Journals" floating button on the right side of the screen.

📂 Project Structure
To support multiple nations and providers, we organize code by Country and Provider.

Plaintext

/src
  /core            # The engine (UI, .eir formatting, file downloading logic)
  /connectors      # Country-specific logic
    /se            # Sweden
      /1177        # Logic for 1177.se
      /min-guld    # Logic for other Swedish providers
    /us            # United States
      /epic        # (Planned) Logic for Epic/MyChart
      /cerner      # (Planned) Logic for Cerner
  manifest.json
🤝 How to Contribute
We need you to help us add support for your country's healthcare portal.

1. The Connector Pattern
If you know JavaScript and how to inspect DOM elements, you can add a new provider.

Create a folder: src/connectors/[country_code]/[provider_name].

Create a connector.js file.

Implement the Standard Interface:

JavaScript

// Example Interface
export const connector = {
  // Pattern to match the URL (e.g., "1177.se")
  urlMatch: "provider-domain.com", 
  
  // Logic to detect if user is logged in
  isLoggedIn: () => { ... }, 
  
  // Logic to scrape the data and return an array of objects
  scrapeData: async () => { 
     // Your scraping logic here
     // Return format: [{ date, title, text, category, source }]
  }
};
2. The .eir File Format
The extension automatically converts scraped data into the .eir format. This is a human-readable YAML structure.

Example output:

YAML

entries:
  - id: "entry_001"
    date: "2025-03-17"
    category: "Vaccinationer"
    provider:
      name: "Östervåla vårdcentral"
      region: "Region Uppsala"
    content:
      summary: "TBE-vaccination"
      details: "Dose 3 of 3..."
(See docs/EIR_SPEC.md for the full specification).

🔒 Privacy & Security
Local Processing: All data scraping and formatting happens locally in your browser.

No Tracking: We do not track your usage or collect your health data on our servers unless you explicitly choose to "View on Eir.Space" and authorize the transfer.

Open Source: The code is open for audit by anyone.

🛠 Roadmap
[x] Core extraction engine.

[x] Connector: Sweden (1177.se).

[ ] Refactor monolithic code into modular Connector pattern.

[ ] Connector: USA (Epic MyChart).

[ ] Connector: UK (NHS App web portal).

[ ] Encrypted export options.

[ ] Publish to Chrome Web Store.

📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

# 🏥 Eir Data Liberator
### *Your Health Data, In Your Hands.*

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

**Eir Data Liberator** is an open-source Chrome Extension designed to help patients around the world scrape, download, and own their medical records from restrictive Electronic Health Record (EHR) web portals.

This project is part of the **[Eir.Space](https://eir.space)** ecosystem. We believe that if you generate the data, you should own the data.

---

## 🌍 The Mission
Healthcare providers often lock patient data behind clunky portals with no "Export All" button. This extension injects a simple interface into these portals, allowing users to:
1.  **Scrape** their journal entries, vaccinations, and diagnoses.
2.  **Format** the data into the universal, open `.eir` (YAML) standard.
3.  **Download** it locally or sync it with their Eir.Space Personal Health Cloud.

**Current Status:** ✅ Live for **Sweden (1177.se)**.
**Goal:** 🌎 Universal support for all major EHR portals (Epic, MyChart, Cerner, etc.).

---

## 🚀 Getting Started (Sideloading)

Currently, this extension is in **Developer Preview**. You must sideload it into Chrome/Edge/Brave.

1.  **Clone or Download** this repository.
    ```bash
    git clone [https://github.com/your-org/eir-data-liberator.git](https://github.com/your-org/eir-data-liberator.git)
    ```
2.  Open your browser and navigate to `chrome://extensions`.
3.  Toggle **Developer mode** (top right corner).
4.  Click **Load unpacked**.
5.  Select the `dist` or `src` folder from this repository.
6.  Navigate to a supported healthcare provider (e.g., [1177.se](https://1177.se)) and log in.
7.  Look for the **"Download Journals"** floating button on the right side of the screen.

---

## 📂 Project Structure

To support multiple nations and providers, we organize code by **Country** and **Provider**.

```text
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

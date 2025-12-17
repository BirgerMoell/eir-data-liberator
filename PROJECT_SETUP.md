# Project Setup Summary

This document summarizes the project structure and setup for contributors.

## 📁 Project Structure

```
eir-data-liberator/
├── .github/
│   ├── ISSUE_TEMPLATE/      # Issue templates for GitHub
│   ├── workflows/            # GitHub Actions CI/CD
│   └── dependabot.yml        # Automated dependency updates
├── extension/                # Browser extension source code
│   ├── src/
│   │   ├── core/            # Universal engine
│   │   └── connectors/      # Provider-specific connectors
│   ├── manifest.json        # Extension manifest
│   └── ...
├── .editorconfig            # Editor configuration
├── .eslintrc.json          # ESLint configuration
├── .gitignore              # Git ignore rules
├── CHANGELOG.md            # Version history
├── CODE_OF_CONDUCT.md      # Community guidelines
├── CONTRIBUTING.md         # Contribution guide
├── LICENSE                 # MIT License
├── package.json            # Node.js dependencies
├── README.md               # Main documentation
├── ROADMAP.md              # Project roadmap
└── SECURITY.md             # Security policy
```

## 🛠️ Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/BirgerMoell/eir-data-liberator.git
   cd eir-data-liberator
   ```

2. **Install dependencies (optional, for linting):**
   ```bash
   npm install
   ```

3. **Load extension in browser:**
   - Chrome/Edge/Brave: `chrome://extensions` → Developer mode → Load unpacked → Select `extension` folder

4. **Run linter:**
   ```bash
   npm run lint
   ```

## 📝 Key Files for Contributors

- **Adding a connector?** → See `CONTRIBUTING.md` and `extension/src/connectors/TEMPLATE.md`
- **Reporting a bug?** → Use `.github/ISSUE_TEMPLATE/bug-report.md`
- **Requesting a connector?** → Use `.github/ISSUE_TEMPLATE/new-connector.md`
- **Submitting a PR?** → Use `.github/pull_request_template.md`

## ✅ Quality Checklist

Before submitting:
- [ ] Code follows `.editorconfig` style
- [ ] No ESLint errors (`npm run lint`)
- [ ] Manifest.json is valid (`npm run validate-manifest`)
- [ ] Documentation updated if needed
- [ ] Tested with real portal (for connectors)

## 🔗 Useful Links

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)
- [Security Policy](SECURITY.md)
- [Roadmap](ROADMAP.md)
- [Changelog](CHANGELOG.md)


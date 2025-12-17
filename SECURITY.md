# Security Policy

## Supported Versions

We actively support the latest version of the extension. Older versions may receive security updates on a case-by-case basis.

| Version | Supported          |
| ------- | ------------------ |
| 2.x.x   | :white_check_mark: |
| < 2.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email:** [INSERT SECURITY EMAIL]
2. **GitHub Security Advisory:** Use the "Report a vulnerability" button on the repository's Security tab

### What to Include

When reporting a vulnerability, please include:

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if you have one)

### Response Timeline

- **Initial Response:** Within 48 hours
- **Status Update:** Within 7 days
- **Fix Timeline:** Depends on severity (typically 30-90 days)

## Security Best Practices

This extension handles sensitive medical data. We follow these security principles:

1. **No External Transmission:** All data processing happens locally in your browser
2. **No Authentication Storage:** We never store passwords or authentication tokens
3. **Session-Based:** The extension uses your existing logged-in session
4. **Open Source:** All code is publicly auditable

## Known Security Considerations

- The extension runs with the same permissions as the web page it's injected into
- Data is stored temporarily in browser localStorage (cleared after 24 hours)
- No data is sent to external servers except when explicitly transferring to eir.space (user-initiated)

## Security Updates

Security updates will be released as soon as possible after a vulnerability is confirmed and patched. We recommend:

- Keeping the extension updated to the latest version
- Reviewing the code changes in each release
- Reporting any suspicious behavior immediately


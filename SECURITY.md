# Security Policy

## Supported Versions

We release patches for security vulnerabilities in the following versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: |

## Reporting a Vulnerability

We take the security of Cantio seriously. If you discover a security vulnerability, please report it responsibly.

### How to Report

1. **DO NOT** open a public GitHub issue for security vulnerabilities
2. Email: support@cantio.app (or use GitHub Security Advisories)
3. Include:
   - Description of the vulnerability
   - Steps to reproduce
   - Potential impact
   - Suggested fix (if available)

### What to Expect

- **Acknowledgment**: Within 48 hours of your report
- **Initial Assessment**: Within 5 business days
- **Status Updates**: Every 7 days until resolved
- **Disclosure**: Coordinated disclosure after patch is released

### Security Measures

We implement the following security practices:

- **Dependency Monitoring**: Automated Dependabot alerts and updates
- **Code Scanning**: GitHub CodeQL analysis on every commit
- **Authentication**: JWT-based auth with bcrypt password hashing
- **Rate Limiting**: API endpoint protection against abuse
- **Input Validation**: Zod schema validation on all inputs
- **CORS**: Strict cross-origin policies
- **Environment**: Secure secrets management via .env

### Known Issues

See our [Dependabot Alerts](https://github.com/akshay-k-a-dev/Cantio/security/dependabot) for current tracked vulnerabilities.

**Critical Note**: `fast-jwt@6.1.0` has CVE-2026-34950 with no patch available yet. We are monitoring the upstream fix at https://github.com/nearform/fast-jwt/security/advisories/GHSA-mvf2-f6gm-w987

### Security Updates

- 2026-04-04: Updated Electron to 39.8.5, fastify to 5.8.3, nodemailer to 8.0.4, path-to-regexp to 8.4.0
- 2026-04-04: Added overrides for picomatch@4.0.4, @xmldom/xmldom@0.8.12

## Scope

The following are **in scope** for security reports:

- Authentication bypass
- SQL injection
- Cross-Site Scripting (XSS)
- Remote Code Execution (RCE)
- Server-Side Request Forgery (SSRF)
- Privilege escalation
- Data exposure

The following are **out of scope**:

- Social engineering attacks
- Physical attacks
- Denial of Service (DoS) attacks
- Issues in third-party dependencies (report to upstream)
- Self-XSS that requires user interaction

## Safe Harbor

We will not pursue legal action against security researchers who:

- Report vulnerabilities responsibly and privately
- Do not exploit vulnerabilities beyond demonstration
- Do not access or modify user data without permission
- Do not perform attacks that degrade service availability

Thank you for helping keep Cantio and our users safe!

# Security Policy

## Supported Versions

Use this section to tell people about which versions of your project are
currently being supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| 0.0.x   | :white_check_mark: |
| < 0.0.0 | :x:                |

## Reporting a Vulnerability

We take the security of **SexyLove** seriously, especially given the sensitive nature of the "Vault" feature.

If you discover a security vulnerability, please **DO NOT** open a public issue.

### How to Report

Please email the security team at `security@example.com` (replace with actual email) with the following details:

1.  **Type of Vulnerability**: (e.g., XSS, SQL Injection, Encryption Bypass).
2.  **Impact**: What can an attacker achieve?
3.  **Reproduction Steps**: Detailed steps to reproduce the issue.

We will acknowledge your report within 48 hours and provide an estimated timeline for a fix.

### The Vault

The "Vault" feature relies on client-side encryption. Please report any potential side-channel attacks or weaknesses in the key derivation/storage mechanism immediately.

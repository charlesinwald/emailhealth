# emailhealth

A terminal tool that checks a domain's email deliverability health. Point it at an email address and it looks up the domain's DNS records — MX, SPF, DKIM, DMARC, and more — and renders an interactive report in your terminal.

## Features

`emailhealth` runs the following checks against the domain of the email address you give it:

- **NS Records** — confirms the domain resolves and has nameservers
- **IP Address (A record)** — resolves the domain's A record
- **MX Records** — fetches and sorts mail exchanger records, flags null MX records
- **TXT Records** — fetches all TXT records for the domain
- **SPF Records** — checks `_spf.<domain>` and falls back to scanning TXT records for a `v=spf1` entry
- **DMARC Records** — checks `_dmarc.<domain>`
- **DKIM Records** — checks `_domainkey.<domain>` plus a set of common selectors (`default`, `google`, `k1`, `s1`, `s2`, `selector1`, `selector2`), and flags revoked/empty keys (`p=`) or RSA keys under 1024 bits

Each check is reported as **healthy**, **unhealthy**, or **unknown**, and an overall health score (percentage of healthy checks) is shown in the header. Results are displayed as an interactive, collapsible accordion in the terminal, with a button to copy any individual report to your clipboard.

## Requirements

- [Node.js](https://nodejs.org/) 18+
- [Yarn](https://yarnpkg.com/)

## Installation

### Global install from NPM


```bash
npm install -g emailhealth
```


### From source

```bash
git clone https://github.com/charlesinwald/emailhealth.git
cd emailhealth
yarn install
yarn build
```


## Usage

From a local clone, run:

```bash
yarn start someone@example.com
```

This compiles the TypeScript sources and runs the CLI against the domain of the given email address (`example.com` in this case — the local part of the address isn't used for lookups).

Inside the report view:

| Key            | Action           |
| -------------- | ---------------- |
| Mouse          | Full interaction |
| Up Arrow       | Scroll up        |
| Down Arrow     | Scroll down      |
| Enter          | Open a section   |
| `q`            | Quit             |

## Development

```bash
yarn build   # compile TypeScript to dist/
yarn test    # compile and run the test suite (node --test)
```

Source lives in `src/`:

- `src/index.ts` — CLI entry point and terminal UI (built with [@rezi-ui](https://www.npmjs.com/package/@rezi-ui/core))
- `src/checkEmailHealth.ts` — DNS lookups and health check logic
- `src/utils.ts` — CLI argument parsing, formatting, and helper functions
- `src/types.ts` — shared types

## Tech stack

- [TypeScript](https://www.typescriptlang.org/)
- [Node.js `dns`](https://nodejs.org/api/dns.html) for DNS resolution
- [Commander](https://www.npmjs.com/package/commander) for CLI argument parsing
- [@rezi-ui/core](https://www.npmjs.com/package/@rezi-ui/core) / [@rezi-ui/node](https://www.npmjs.com/package/@rezi-ui/node) for the terminal UI

## License

ISC

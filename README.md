# TalentPulse V2

TalentPulse is a PC web portfolio product for HR students and early-career HR practitioners. The product is designed to help users demonstrate three things in interviews:

- AI usage ability
- Analytical ability
- Organizational diagnosis ability

This is not a heavy admin system. It is a static-deploy-friendly AI talent review and succession diagnosis experience that turns employee data into report-ready organizational insight.

## V2 Positioning

The second version is rebuilt around one product promise:

`Turn employee data into report-ready organizational insight.`

The product narrative now follows:

`Describe -> Explain -> Predict -> Control -> Report`

That means the experience is built to answer five questions:

1. What is happening now?
2. Why is it happening?
3. What may happen next?
4. What should be done now?
5. How can this be presented as a report?

## Primary Navigation

The V2 information architecture centers on six primary pages:

- Home
- Overview
- Talent Review
- Succession
- Data Health
- Report

`Home`, `Overview`, and `Report` are the strongest portfolio pages.

## What Changed in V2

### 1. Home was rebuilt as a portfolio entry page

Home now clearly emphasizes two entry points:

- Try Demo
- Upload Employee Data

It also highlights the AI value proposition, the NovaEdge demo company story, and the end-to-end workflow from diagnosis to report.

### 2. Overview became the strongest page in the product

Overview is now the main 2-3 minute interview storytelling page. It includes:

- Executive Summary
- Describe section
- Explain section
- Predict section
- Control section
- Drill-down links
- Fragile key-role table

### 3. Data Health became a trust page instead of a dirty-data list

The page now explains:

- what the system auto-understood
- what it auto-fixed
- what still needs caution
- how trustworthy the current analysis is

### 4. Talent Review now tells a talent story

The page now supports explaining:

- department talent density
- high-potential concentration
- high performers who are not successor-ready
- a selected talent narrative for interview walkthroughs

### 5. Succession now focuses on bench strength and exposure

The page now emphasizes:

- critical role coverage
- ready-now / ready-soon distribution
- heatmap of role readiness
- role detail panel
- uncovered role list
- action-oriented succession risk summary

### 6. Report is now a real presentation page

The page now follows a report structure:

- Current State
- Why It Is Happening
- What May Happen Next
- What To Do Now
- Priority Actions

It is designed to be read directly in an interview or stakeholder presentation.

## Demo Story

The official demo company is `NovaEdge Technologies` with roughly 300 employees.

The demo is intentionally structured to surface stable organizational stories:

- R&D has strong high-potential density but thin ready-now leadership cover
- Sales performs strongly but carries high flight risk and star dependency
- Operations is stable but stagnant
- Product has concentrated critical-role dependency
- Customer Success has weaker high-potential identification quality
- HR, Finance, and IT have small but high-risk succession benches

## Data Capabilities

TalentPulse V2 keeps static deployment simple while making AI value visible in the product.

### Auto-detect and normalization

The site attempts to automatically:

- recognize common employee field names
- normalize department and role aliases
- standardize date formats
- de-duplicate analytical records

### Upload support

The site supports:

- CSV upload directly in-browser
- XLSX upload through the browser spreadsheet parser on the hosted version

### Data confidence

The site evaluates:

- auto-fixed issues
- caution-level issues
- material risk issues
- overall analysis confidence

## Key Files

```text
TalentPulse/
├─ index.html
├─ README.md
├─ GITHUB_PAGES_DEPLOY.md
├─ demo/
│  ├─ demo_talentpulse_company.xlsx
│  ├─ demo_employees.json
│  ├─ demo_org_metadata.json
│  ├─ demo_scenario_guide.md
│  └─ demo_expected_insights.md
├─ scripts/
│  └─ generate-demo-clean.ps1
└─ src/
   ├─ demo-data.js
   ├─ app-v2.js
   └─ styles.css
```

## Run Locally

The project can still be opened directly by double-clicking `index.html`.

For the hosted version, GitHub Pages static deployment remains supported.

## Deploy

GitHub Pages deployment notes are in:

- `GITHUB_PAGES_DEPLOY.md`

## Verification

The V2 runtime entry is:

- `src/app-v2.js`

The script passes:

```bash
node --check .\src\app-v2.js
```

## Next Iteration Ideas

- split the current runtime file into smaller modules
- improve CSV parsing robustness for quoted commas
- add a dedicated profile route while keeping the six-page main navigation
- export a richer report format such as Markdown or PDF
- deepen the Explain and Predict logic with more scenario templates

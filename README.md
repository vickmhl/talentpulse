# TalentPulse V3

TalentPulse is a PC web portfolio product for HR students and early-career HR practitioners.

It is not a heavy HR SaaS or an admin backend. It is an AI-assisted talent review and succession diagnosis workbench built for interview presentation.

The core product promise is:

`Turn employee data into report-ready organizational diagnosis.`

## V3 Product Positioning

TalentPulse V3 is designed to help a user prove three things in an interview:

- They can use AI to structure messy HR data.
- They can diagnose organizational issues instead of only reading charts.
- They can turn people data into management-ready language and actions.

The experience is organized around six pages:

- Home
- Overview
- Talent Review
- Succession
- Data Health
- Report

`Home`, `Overview`, and `Report` are the main stage.
`Talent Review`, `Succession`, and `Data Health` are evidence pages.

## V3 Narrative Framework

The main analytical flow is:

`Conclusion -> Evidence -> Explanation -> Risk -> Action`

Across the product this maps to:

- Describe
- Explain
- Predict
- Control
- Report

## Demo Story

The official demo company is `NovaEdge Technologies` with about 300 employees.

The demo is intentionally structured to surface stable organizational issues:

- R&D has strong high-potential density but thin ready-now leadership cover.
- Sales performs strongly but carries star dependency and high flight risk.
- Operations is stable but short on growth momentum.
- Product has concentrated critical-role dependency.
- Customer Success has weaker high-potential visibility than its size suggests.
- HR, Finance, and IT are small but succession-fragile.

## What Changed in V3

### 1. Home is now a portfolio entry page

Home now emphasizes:

- product pitch
- Demo / Upload dual entry
- AI value proof
- demo cockpit preview
- lightweight upload reassurance

### 2. Overview is now the single-page control tower

Overview now follows a fixed diagnostic structure:

- Executive Summary Hero
- Current State
- Key Issues
- Why It's Happening
- Priority Focus
- Risk Outlook
- Recommended Actions
- Drill-down links

### 3. Analysis logic is no longer only department-threshold storytelling

V3 introduces a signal-based diagnosis layer. It first detects structural signals such as:

- high-potential concentration
- ready-now shortage
- high-performer / successor mismatch
- uncovered critical-role clusters
- single-point dependency
- support-function low-visibility risk
- low pipeline signals

These signals are then combined into issues and report-ready judgments.

### 4. Evidence pages now stay organization-first

`Talent Review` and `Succession` now lead with organizational judgments. Employee and candidate details are pushed lower and wrapped as secondary drill-down evidence instead of taking first-screen attention.

### 5. Data Health now behaves as a trust page

The page now focuses on:

- confidence verdict
- auto-understood fields
- auto-fixed normalization work
- low-confidence areas
- impact on analysis
- appendix evidence table

### 6. Report now models real issue structure

Each top issue is expressed as:

- issue title
- phenomenon
- root cause
- likely consequence
- recommended move

## Runtime and File Structure

Current runtime entry:

- `index.html`
- `src/app-v3.js`

Analysis logic is now separated into:

- `src/v3/analysis-engine.js`

Key source files:

```text
TalentPulse/
├─ index.html
├─ README.md
├─ demo/
│  ├─ demo_talentpulse_company.xlsx
│  ├─ demo_employees.json
│  ├─ demo_org_metadata.json
│  ├─ demo_scenario_guide.md
│  └─ demo_expected_insights.md
├─ src/
│  ├─ demo-data.js
│  ├─ styles.css
│  ├─ app-v3.js
│  └─ v3/
│     └─ analysis-engine.js
└─ scripts/
   └─ generate-demo-clean.ps1
```

## Upload Support

The product supports:

- CSV upload in-browser
- XLSX upload in-browser when the spreadsheet parser is available

The upload flow attempts to:

- auto-detect common employee fields
- normalize common HR labels
- surface data-quality risk
- estimate analysis confidence before diagnosis

## Local Run

This project can be opened directly by double-clicking `index.html`.

For hosted use, GitHub Pages static deployment remains supported.

## Verification

Current V3 runtime check:

```bash
node --check .\src\app-v3.js
```

## Next V3 Polish Ideas

- split page renderers into dedicated files under `src/v3/`
- strengthen presenter mode for demo walkthroughs
- add print-oriented report styling
- deepen upload confidence explanations for mixed-schema files

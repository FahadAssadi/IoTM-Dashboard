# Health Screening Scraper

This folder contains a small Python scraper (`health_screening_scraper.py`) that fetches Australian health screening program information from public government pages and produces a consolidated JSON file (`health-screenings.json`). The JSON is intended to be ingested by the .NET backend.

## What it does
- Downloads the main program page (and the program's “Learn about the program” page when available).
- Extracts a concise set of fields (name, type, age/sex applicability, default/fine‑grained frequency when detectable, cost hints, delivery, description, link, last updated date, etc.).
- Applies local overrides to fix or enrich any fields that scraping can’t reliably infer.
- Writes the result to `app/backend/Scrapers/health-screenings.json`.

## Files
- `health_screening_scraper.py` — the scraper implementation.
- `requirements.txt` — Python dependencies for the scraper (requests, beautifulsoup4).
- `health-screenings.json` — generated output (created/overwritten when you run the scraper).
- `overrides.json` (optional) — local data corrections and enrichments you can apply on top of the scraped result. By default the script looks for this at `app/backend/Scrapers/overrides.json`, but you can point to any file using `SCREENING_OVERRIDES_PATH`.

## Install dependencies (using requirements.txt)
You can use the provided `requirements.txt` to install the exact Python packages the scraper needs.

Windows PowerShell (recommended):

```powershell
# Optionally create & activate a virtual environment (isolates dependencies)
python -m venv .venv
.\.venv\Scripts\Activate.ps1

# Install dependencies for the scraper
pip install -r app/backend/Scrapers/requirements.txt
```

Notes:
- If you already have a preferred virtual environment, activate it first, then run the `pip install -r` step.
- If VS Code shows import warnings (e.g., for `requests` or `bs4`), ensure your selected Python interpreter matches the environment where you installed packages. You can change it via the VS Code status bar (Python version) or the Command Palette → “Python: Select Interpreter”.

## Run the scraper
From the repository root:

```powershell
# Ensure dependencies are installed (see above), then run:
python app/backend/Scrapers/health_screening_scraper.py
```

On success, you should see a message similar to:

```
Saved N screenings to app/backend/Scrapers/health-screenings.json
```

## Overrides
Sometimes public pages omit details or present them in ways that are hard to parse consistently. You can supply local overrides that the scraper deep‑merges into the generated data.

- Default location: `app/backend/Scrapers/overrides.json`

Keying rules:
- If a program object has an explicit `id` (e.g., `"bowel-cancer"`), that is used as the override key.
- Otherwise, the script uses the program `main_url` (lowercased, without a trailing slash) as the key, e.g. `"https://www.health.gov.au/our-work/nlcsp"`.

Merge behavior:
- Deep merge with override values winning.
- Case‑insensitive key matching (override keys are mapped onto existing casing where present).
- Dict values merge recursively; non‑dict values replace.

## Output schema (summary)
Each entry in `health-screenings.json` contains fields similar to:

- `ScreeningType` — e.g., `Cancer`, `Newborn`, or `General`.
- `Name` — program name.
- `DefaultFrequencyMonths` — numeric frequency in months when a simple default can be inferred (or `0` if unknown).
- `Category` — always `screening` currently.
- `MinAge` / `MaxAge` — integers when detectable.
- `SexApplicable` — `male`, `female`, or `both`.
- `PregnancyApplicable` — one of `any`, `not_pregnant`, `pregnant`, `postpartum`.
- `ConditionsRequired` / `ConditionsExcluded` / `RiskFactors` — reserved for future extraction (may be `null`).
- `Description` — short blurb from the page when available.
- `LastUpdated` — ISO date (set by the script when run).
- `Cost` — e.g., “Free for eligible Australians” or a dollar amount if detected.
- `Delivery` — hints like “clinic”, “at home/kit mailed”, etc.
- `Link` — the main program URL.
- `isRecurring` — true.
- `FrequencyRules` — optional array of more specific rules inferred from text, with fields:
  - `MinAge`, `MaxAge`, `SexApplicable`, `PregnancyApplicable`, `FrequencyMonths`.

## Troubleshooting
- Imports can’t be resolved in VS Code: make sure the interpreter matches the environment where you ran `pip install -r app/backend/Scrapers/requirements.txt`.
- Empty or partial output: page structures may change. Use `overrides.json` to patch specific fields until the scraper logic is updated.

## License and data sources
- The scraper reads public content from Australian Government health pages solely to build a normalized local JSON for this project. Respect the source terms of use.

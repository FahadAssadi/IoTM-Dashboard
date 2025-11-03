"""
Health screening scraper
-----------------------

Scrapes public Australian government pages to produce a normalized JSON of
screening guidelines consumed by the .NET backend.

Key behavior
- Fetches a program's main page, optionally follows a "Learn about the program" link.
- Extracts structured fields (name, type, frequency, applicability, description, cost, delivery, link).
- Derives frequency rules from sentence-level text and removes identical rules.
- Applies optional overrides (see SCREENING_OVERRIDES_PATH) to correct/enrich fields.

Inputs/Outputs
- Input: A small list of program descriptors with a main_url (and optional id).
- Output: app/backend/Scrapers/health-screenings.json (array of guidelines).

"""

import os
import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin
import json
from datetime import date

OVERRIDES_PATH = os.getenv("SCREENING_OVERRIDES_PATH", "app/backend/Scrapers/overrides.json")

def parse_frequency_to_months(text: str):
    """Parse natural-language frequency phrases to months.

    Supports variants like:
    - "every 2 years"
    - "every 6 months"
    - "every 2-3 years" (returns the stricter/smaller interval in months)

    Args:
        text: Input text to scan (e.g., a sentence or the whole page text).

    Returns:
        int | None: Frequency in months, or None if no recognisable phrase found.
    """
    if not text:
        return None
    m = re.search(r"\bevery\s+(\d+)(?:\s*(?:to|-|–)\s*(\d+))?\s+(years?|year|months?|month)\b", text, re.IGNORECASE)
    if not m:
        return None
    n1 = int(m.group(1))
    n2 = int(m.group(2)) if m.group(2) else None
    unit = (m.group(3) or "").lower()
    val = min(n1, n2) if n2 else n1
    return val * 12 if "year" in unit else val

def fetch_html(url):
    """Fetch HTML and return a BeautifulSoup parser.

    Args:
        url: Absolute URL to fetch.

    Returns:
        BeautifulSoup: Parsed HTML document.

    Raises:
        requests.RequestException: On network or HTTP errors (propagated to caller).
    """
    resp = requests.get(url)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")

def find_learn_link(main_url, soup):
    """Find a "Learn about the program"-style link on the main page.

    Args:
        main_url: The base URL (used to resolve relative hrefs).
        soup: BeautifulSoup of the main page.

    Returns:
        str | None: Absolute URL if found, else None.
    """
    link_texts = [
        "learn about the program",
        "about the program",
        "learn more",
    ]
    for a in soup.find_all("a", href=True):
        a_text = a.get_text(strip=True).lower()
        if any(lt in a_text for lt in link_texts):
            href = a['href']
            return urljoin(main_url, href)
    return None

def infer_screening_type(name, description=None):
    """Infer a broad screening type.

    Rules:
    - Prioritise keywords in the name; fallback to description.
    - Returns "Cancer", "Newborn", or "General".

    Args:
        name: Title of the program (e.g., H1 text).
        description: Optional short description from the page.

    Returns:
        str: One of "Cancer", "Newborn", or "General".
    """
    name_lower = (name or "").lower()
    desc_lower = (description or "").lower()

    if "cancer" in name_lower:
        return "Cancer"
    if "newborn" in name_lower:
        return "Newborn"

    # If not found in name, check description for keywords
    if description:
        if "cancer" in desc_lower:
            return "Cancer"
        if "newborn" in desc_lower:
            return "Newborn"

    return "General"

def load_overrides():
    """Load optional overrides JSON from SCREENING_OVERRIDES_PATH.

    Overrides are deep-merged into scraped output so that known fields can be
    fixed or enriched when scraping is unreliable.

    Returns:
        dict: Overrides keyed by program id or normalized URL. Empty dict if missing.
    """
    try:
        with open(OVERRIDES_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return {}
    except Exception as e:
        print(f"Warning: failed to load overrides: {e}")
        return {}

def program_key(program: dict) -> str:
    """Compute a stable key for overrides.

    Prefers explicit program['id']; otherwise uses the lowercased main_url
    without trailing slash.

    Args:
        program: Dict containing at least main_url, optional id.

    Returns:
        str: Stable key.
    """
    if "id" in program and program["id"]:
        return str(program["id"]).strip().lower()
    url = (program.get("main_url") or "").strip().lower().rstrip("/")
    return url

def deep_merge(base: dict, override: dict) -> dict:
    """Deep-merge override into base (override wins).

    Rules:
    - Keys are matched case-insensitively and mapped to base's original casing when present.
    - Dicts are merged recursively; other values (None, scalar, list, mismatched types) replace base.

    Args:
        base: The original object to be enriched.
        override: Values to apply on top of base.

    Returns:
        dict: The merged object (same reference as base).
    """
    # Map base keys (lowercased) to their original casing for case-insensitive replace
    base_key_map = {k.lower(): k for k in base.keys()}

    for ok, ov in override.items():
        # Normalize override key to match base casing if present
        bk = base_key_map.get(ok.lower(), ok)

        # If both are dicts, recurse; otherwise, override
        if isinstance(ov, dict) and isinstance(base.get(bk), dict):
            base[bk] = deep_merge(base[bk], ov)
        else:
            base[bk] = ov

    return base

def normalize_pregnancy(value: str) -> str:
    """Normalise pregnancy applicability to backend enum values.

    Accepts common variants and returns one of: any | not_pregnant | pregnant | postpartum.

    Args:
        value: Input string (may be None/empty).

    Returns:
        str: Normalised enum value, defaulting to "any".
    """
    v = (value or "").strip().lower()
    if v in {"any"} or v == "":
        return "any"
    if v in {"not_pregnant", "notpregnant", "not-pregnant"}:
        return "not_pregnant"
    if v in {"pregnant"}:
        return "pregnant"
    if v in {"postpartum", "post-partum", "post partum"}:
        return "postpartum"
    return "any"

def extract_screening_info(program, overrides=None):
    """Scrape and assemble a single screening guideline object.

    Steps:
    - Fetch main page and optionally its "learn" page; pool text from both.
    - Parse name/description/cost/delivery and simple eligibility (age, sex, pregnancy).
    - Parse default frequency and sentence-level frequency rules, then de‑duplicate.
    - Apply overrides if provided.

    Args:
        program: Dict with fields {"main_url": str, "id"?: str}.
        overrides: Dict of override fragments keyed by program key.

    Returns:
        dict | None: Normalised guideline data ready for JSON serialization, or None on fetch failure.
    """
    main_url = program['main_url']
    try:
        main_soup = fetch_html(main_url)
    except requests.RequestException as e:
        print(f"Warning: Failed to fetch main page: {main_url} ({e})")
        return None
    learn_url = find_learn_link(main_url, main_soup)

    soups = [main_soup]
    if learn_url:
        try:
            learn_soup = fetch_html(learn_url)
            soups.append(learn_soup)
        except requests.RequestException:
            print(f"Warning: Failed to fetch learn page: {learn_url}")

    pooled_text = " ".join(s.get_text(" ", strip=True) for s in soups)

    name_tag = main_soup.find("h1")
    name = name_tag.get_text(strip=True) if name_tag else None

    # Extract recommended frequency as default (simple)
    default_frequency_months = parse_frequency_to_months(pooled_text)

    # Description from .au-introduction on main page (or None)
    description = soups[0].find(class_="au-introduction").get_text(" ", strip=True) if soups[0].find(class_="au-introduction") else None

    cost = None
    if re.search(r"\bfree\b|no cost", pooled_text, re.IGNORECASE):
        cost = "Free for eligible Australians"
    else:
        dollar_match = re.search(r"\$\d+(?:\.\d{1,2})?", pooled_text)
        if dollar_match:
            cost = dollar_match.group()

    delivery = None
    delivery_match = re.search(r"(\bclinic\b|hospitals?|radiology centres?|healthcare provider|kit mailed|at home|home kit|return by post)", pooled_text, re.IGNORECASE)
    if delivery_match:
        delivery = delivery_match.group()

    screening_type = infer_screening_type(name, description)

    # Extract eligibility criteria (age, gender, pregnancy)

    eligibility = {}

    # Extract age range
    age_match = re.search(r"aged?\s*(\d{1,3})\s*(to|-|and)\s*(\d{1,3})", pooled_text, re.IGNORECASE)
    if age_match:
        eligibility['age'] = {
            "min": int(age_match.group(1)),
            "max": int(age_match.group(3))
        }

    # Extract gender criteria (prefer explicit exclusivity, otherwise leave as both)
    female_flag = re.search(r"\bwomen\b|\bfemale\b", pooled_text, re.IGNORECASE)
    male_flag = re.search(r"\bmen\b|\bmale\b", pooled_text, re.IGNORECASE)
    both_phrase = re.search(r"\b(men and women|women and men|male and female|female and male)\b", pooled_text, re.IGNORECASE)
    if both_phrase or (female_flag and male_flag):
        pass  # both applicable; leave unset to default to both
    elif female_flag:
        eligibility['gender'] = ["female"]
    elif male_flag:
        eligibility['gender'] = ["male"]

    # Extract pregnancy criteria
    if re.search(r"\bpregnant\b|\bpregnancy\b", pooled_text, re.IGNORECASE):
        eligibility['pregnant'] = True

    # Extract frequency rules
    frequency_rules = []
    sentences = re.split(r"[.\n]", pooled_text)
    for sent in sentences:
        # Look for frequency pattern (years or months, ranges supported)
        freq_months = parse_frequency_to_months(sent)
        if freq_months:
            # Look for simple conditions: pregnant, age range, gender keywords
            conditions = {}
            if re.search(r"\bpregnant\b|\bpregnancy\b", sent, re.IGNORECASE):
                conditions['pregnant'] = True
            age_cond = re.search(r"aged?\s*(\d{1,3})\s*(to|-|and)\s*(\d{1,3})", sent, re.IGNORECASE)
            if age_cond:
                conditions['age'] = {"min": int(age_cond.group(1)), "max": int(age_cond.group(3))}
            if re.search(r"\bwomen\b|\bfemale\b", sent, re.IGNORECASE):
                conditions['gender'] = ["female"]
            if re.search(r"\bmen\b|\bmale\b", sent, re.IGNORECASE):
                conditions['gender'] = ["male"]
            if conditions:
                frequency_rules.append({
                    "conditions": conditions,
                    "frequency_months": freq_months
                })

    # Determine PregnancyApplicable enum value
    pregnancy_applicable = "any"
    # If screening is for newborns, set to postpartum
    if "newborn" in (name or "").lower() or "newborn" in (description or "").lower():
        pregnancy_applicable = "postpartum"
    elif eligibility.get("pregnant", False):
        pregnancy_applicable = "pregnant"

    # Remove duplicate frequency rules
    unique_rules = []
    seen = set()
    for rule in frequency_rules:
        min_age = rule["conditions"].get("age", {}).get("min")
        max_age = rule["conditions"].get("age", {}).get("max")
        sex = rule["conditions"].get("gender", ["both"])[0] if "gender" in rule["conditions"] else "both"
        preg = normalize_pregnancy(
            "postpartum" if "newborn" in (name or "").lower() or "newborn" in (description or "").lower()
            else "pregnant" if rule["conditions"].get("pregnant", False)
            else "any"
        )
        key = (min_age, max_age, sex, preg, rule["frequency_months"])
        if key in seen:
            continue
        seen.add(key)
        unique_rules.append({
            "MinAge": min_age,
            "MaxAge": max_age,
            "SexApplicable": sex,
            "PregnancyApplicable": preg,
            "FrequencyMonths": rule["frequency_months"],
        })

    data = {
        "ScreeningType": screening_type,
        "Name": name,
        "DefaultFrequencyMonths": (default_frequency_months if default_frequency_months is not None else 0),
        "Category": "screening",
        "MinAge": eligibility.get("age", {}).get("min"),
        "MaxAge": eligibility.get("age", {}).get("max"),
        "SexApplicable": eligibility.get("gender", ["both"])[0] if "gender" in eligibility else "both",
        "PregnancyApplicable": normalize_pregnancy(pregnancy_applicable),
        "ConditionsRequired": None, # TODO: Extract ConditionsRequired
        "ConditionsExcluded": None, # TODO: Extract ConditionsExcluded
        "RiskFactors": None, # TODO: Extract RiskFactors
        "Description": description,
        "LastUpdated": date.today().isoformat(),
        "Cost": cost,
        "Delivery": delivery,
        "Link": main_url,
        "isRecurring": bool(default_frequency_months is not None),
        "FrequencyRules": unique_rules
    }

    # Apply overrides last — override always wins
    if overrides:
        key = program_key(program)
        ov = overrides.get(key)
        if ov:
            data = deep_merge(data, ov)

    return data

if __name__ == "__main__":
    programs = [
        # You can add an explicit 'id' for stable overrides:
        {"id": "bowel-cancer", "main_url": "https://www.health.gov.au/our-work/national-bowel-cancer-screening-program"},
        {"id": "cervical-screening", "main_url": "https://www.health.gov.au/our-work/national-cervical-screening-program"},
        {"id": "breastscreen", "main_url": "https://www.health.gov.au/our-work/breastscreen-australia-program"},
        {"id": "newborn-bloodspot", "main_url": "https://www.health.gov.au/our-work/newborn-bloodspot-screening"},
        {"id": "newborn-hearing", "main_url": "https://www.health.gov.au/resources/publications/national-framework-for-newborn-hearing-screening"},
        {"id": "nlcsp", "main_url": "https://www.health.gov.au/our-work/nlcsp"}
    ]

    overrides = load_overrides()

    all_data = []
    for program in programs:
        data = extract_screening_info(program, overrides=overrides)
        if data:
            all_data.append(data)

    output_path = "app/backend/Scrapers/health-screenings.json"
    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2, ensure_ascii=False)
    print(f"Saved {len(all_data)} screenings to {output_path}")

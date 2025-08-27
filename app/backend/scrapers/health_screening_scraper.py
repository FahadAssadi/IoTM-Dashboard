import requests
from bs4 import BeautifulSoup
import re
from urllib.parse import urljoin
import json

def fetch_html(url):
    resp = requests.get(url)
    resp.raise_for_status()
    return BeautifulSoup(resp.text, "html.parser")

def find_learn_link(main_url, soup):
    """Find 'Learn about the program' link on the main page."""
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
    """
    Infer screening type from the name first.
    If inconclusive, check description.
    If still inconclusive, return 'general'.
    """
    name_lower = (name or "").lower()
    desc_lower = (description or "").lower()

    if "cancer" in name_lower:
        return "cancer screening"
    if "newborn" in name_lower:
        return "newborn screening"

    # If not found in name, check description for keywords
    if description:
        if "cancer" in desc_lower:
            return "cancer screening"
        if "newborn" in desc_lower:
            return "newborn screening"

    return "general"

def extract_screening_info(program):
    main_url = program['main_url']

    main_soup = fetch_html(main_url)
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
    freq_match = re.search(r"every\s+\d+\s+years?", pooled_text, re.IGNORECASE)
    default_frequency = freq_match.group() if freq_match else None

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

    # Extract gender criteria
    if re.search(r"\bwomen\b|\bfemale\b", pooled_text, re.IGNORECASE):
        eligibility['gender'] = ["women"]
    elif re.search(r"\bmen\b|\bmale\b", pooled_text, re.IGNORECASE):
        eligibility['gender'] = ["men"]

    # Extract pregnancy criteria
    if re.search(r"\bpregnant\b|\bpregnancy\b", pooled_text, re.IGNORECASE):
        eligibility['pregnant'] = True

    # Extract frequency rules
    frequency_rules = []
    sentences = re.split(r"[.\n]", pooled_text)
    for sent in sentences:
        # Look for frequency pattern
        freq = re.search(r"every\s+\d+\s+years?", sent, re.IGNORECASE)
        if freq:
            # Look for simple conditions: pregnant, age range, gender keywords
            conditions = {}
            if re.search(r"\bpregnant\b|\bpregnancy\b", sent, re.IGNORECASE):
                conditions['pregnant'] = True
            age_cond = re.search(r"aged?\s*(\d{1,3})\s*(to|-|and)\s*(\d{1,3})", sent, re.IGNORECASE)
            if age_cond:
                conditions['age'] = {"min": int(age_cond.group(1)), "max": int(age_cond.group(3))}
            if re.search(r"\bwomen\b|\bfemale\b", sent, re.IGNORECASE):
                conditions['gender'] = ["woman"]
            if re.search(r"\bmen\b|\bmale\b", sent, re.IGNORECASE):
                conditions['gender'] = ["man"]
            if conditions:
                frequency_rules.append({
                    "conditions": conditions,
                    "frequency": freq.group()
                })

    # Determine PregnancyApplicable enum value
    pregnancy_applicable = "notPregnant"
    # If screening is for newborns, set to postpartum
    if "newborn" in (name or "").lower() or "newborn" in (description or "").lower():
        pregnancy_applicable = "postpartum"
    elif eligibility.get("pregnant", False):
        pregnancy_applicable = "pregnant"

    return {
        "ScreeningType": screening_type,
        "Name": name,
        "DefaultFrequencyMonths": (
            int(re.search(r"\d+", default_frequency).group()) * 12
            if default_frequency and "year" in default_frequency.lower()
            else int(re.search(r"\d+", default_frequency).group())
            if default_frequency and "month" in default_frequency.lower()
            else None
        ),
        "Category": "screening",
        "MinAge": eligibility.get("age", {}).get("min"),
        "MaxAge": eligibility.get("age", {}).get("max"),
        "SexApplicable": eligibility.get("gender", ["both"])[0] if "gender" in eligibility else "both",
        "PregnancyApplicable": pregnancy_applicable,
        "ConditionsRequired": None,  # TODO: implement logic to extract this
        "ConditionsExcluded": None,  # TODO: implement logic to extract this
        "RiskFactors": None,         # TODO: implement logic to extract this
        "Description": description,
        "CountrySpecific": "AUS",
        "LastUpdated": "2025-08-25",
        "Cost": cost,
        "Delivery": delivery,
        "Link": main_url,
        "isRecurring": True,
        "FrequencyRules": [
            {
                "MinAge": rule["conditions"].get("age", {}).get("min"),
                "MaxAge": rule["conditions"].get("age", {}).get("max"),
                "SexApplicable": rule["conditions"].get("gender", ["both"])[0] if "gender" in rule["conditions"] else "both",
                "PregnancyApplicable": (
                    "postpartum" if "newborn" in (name or "").lower() or "newborn" in (description or "").lower()
                    else "pregnant" if rule["conditions"].get("pregnant", False)
                    else "notPregnant"
                ),
                "FrequencyMonths": (
                    int(re.search(r"\d+", rule["frequency"]).group()) * 12
                    if "year" in rule["frequency"].lower()
                    else int(re.search(r"\d+", rule["frequency"]).group())
                    if "month" in rule["frequency"].lower()
                    else None
                )
            }
            for rule in frequency_rules
        ]
    }
    
if __name__ == "__main__":
    programs = [
        {"main_url": "https://www.health.gov.au/our-work/national-bowel-cancer-screening-program"},
        {"main_url": "https://www.health.gov.au/our-work/national-cervical-screening-program"},
        {"main_url": "https://www.health.gov.au/our-work/breastscreen-australia-program"},
        {"main_url": "https://www.health.gov.au/our-work/newborn-bloodspot-screening"},
        {"main_url": "https://www.health.gov.au/resources/publications/national-framework-for-newborn-hearing-screening"},
    ]

    all_data = []
    for program in programs:
        data = extract_screening_info(program)
        all_data.append(data)
        print(f"Scraped: {data['Name']}\n", json.dumps(data, indent=4, ensure_ascii=False), "\n")

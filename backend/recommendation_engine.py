from cpic_rules import CPIC_DB

def get_recommendation(drug, phenotype):

    drug = drug.lower().strip()

    if drug not in CPIC_DB:
        return {"recommendation": "No guideline available for this drug.", "evidence": "N/A"}

    drug_rules = CPIC_DB[drug]

    # 1. Exact match first
    if phenotype in drug_rules:
        return drug_rules[phenotype]

    # 2. Case-insensitive match
    phenotype_lower = phenotype.lower().strip()
    for key, value in drug_rules.items():
        if key.lower().strip() == phenotype_lower:
            return value

    # 3. Partial/fuzzy match — e.g. "poor" matches "Poor metabolizer"
    for key, value in drug_rules.items():
        if phenotype_lower in key.lower() or key.lower() in phenotype_lower:
            return value

    # 4. Show all available options for this drug as a fallback
    available = "; ".join(
        f"{ptype}: {rule['recommendation']}"
        for ptype, rule in drug_rules.items()
    )
    return {
        "recommendation": f"No match for phenotype '{phenotype}'. Available: {available}",
        "evidence": "N/A"
    }

from drug_rules import DRUG_DB

def predict_risk(drug, phenotype):
    drug = drug.lower()

    if drug not in DRUG_DB:
        return "Unknown"

    risk_rules = DRUG_DB[drug]["risk"]

    return risk_rules.get(phenotype, "Unknown")

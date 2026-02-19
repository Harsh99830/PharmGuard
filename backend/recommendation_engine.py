from cpic_rules import CPIC_DB

def get_recommendation(drug, phenotype):

    drug = drug.lower()

    if drug not in CPIC_DB:
        return {"recommendation": "No guideline", "evidence": "N/A"}

    rule = CPIC_DB[drug].get(phenotype)

    if rule:
        return rule

    return {"recommendation": "No specific recommendation", "evidence": "N/A"}

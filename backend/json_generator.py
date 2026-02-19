from datetime import datetime

def confidence_score(variant_found, genotype, evidence):
    variant = 1.0 if variant_found else 0.5
    phenotype = 1.0 if genotype == "1/1" else 0.8
    evidence_map = {
        "CPIC Level A": 1.0,
        "CPIC Level B": 0.8
    }
    evidence_score = evidence_map.get(evidence, 0.5)
    gene_drug = 1.0  # primary gene
    return round((variant + phenotype + evidence_score + gene_drug)/4, 2)

def generate_output(
    patient_id,
    drug,
    gene,
    diplotype,
    phenotype,
    risk,
    variants,
    recommendation,
    explanation,
    parsing_success=True
):

    # Calculate dynamic confidence score
    variant_found = len(variants) > 0
    genotype = diplotype if diplotype else "unknown"
    evidence = recommendation.get("evidence", "CPIC Level B") if isinstance(recommendation, dict) else "CPIC Level B"
    
    calculated_confidence = confidence_score(variant_found, genotype, evidence)

    return {
        "patient_id": patient_id,
        "drug": drug,
        "timestamp": datetime.utcnow().isoformat(),

        "risk_assessment": {
            "risk_label": risk,
            "confidence_score": calculated_confidence,
            "severity": map_severity(risk)
        },

        "pharmacogenomic_profile": {
            "primary_gene": gene,
            "diplotype": diplotype,
            "phenotype": phenotype,
            "detected_variants": variants
        },

        "clinical_recommendation": recommendation,

        "llm_generated_explanation": {
            "summary": explanation.get("summary", "") if isinstance(explanation, dict) else explanation,
            "clinical_summary": explanation.get("clinical_summary", "") if isinstance(explanation, dict) else ""
        },

        "quality_metrics": {
            "vcf_parsing_success": parsing_success
        }
    }


def map_severity(risk):

    if risk == "Safe":
        return "none"
    elif risk == "Adjust Dosage":
        return "moderate"
    elif risk == "Toxic":
        return "critical"
    elif risk == "Ineffective":
        return "high"
    else:
        return "low"

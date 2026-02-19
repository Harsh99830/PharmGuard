from datetime import datetime

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

    return {
        "patient_id": patient_id,
        "drug": drug,
        "timestamp": datetime.utcnow().isoformat(),

        "risk_assessment": {
            "risk_label": risk,
            "confidence_score": 0.9,
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
            "summary": explanation
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

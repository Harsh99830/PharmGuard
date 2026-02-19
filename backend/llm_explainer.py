from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables from .env file FIRST
load_dotenv()

# Now create OpenAI client - will work with your .env file
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_explanation(drug, gene, diplotype, phenotype, risk, rsid, recommendation):
    """
    Generate two pharmacogenomic explanations using GPT-4o-mini:
    - patient_summary: plain-English, short, reassuring (for patients)
    - clinical_summary: detailed clinical language (for doctors)
    Returns a dict with both.
    """

    # ── Patient-facing explanation ──
    patient_prompt = f"""
    You are explaining a medication safety result to a patient with no medical background.

    Drug: {drug}
    Gene: {gene}
    Diplotype: {diplotype}
    Phenotype: {phenotype}
    Variant: {rsid}
    Risk: {risk}
    Recommendation: {recommendation}

    Write a 2-sentence plain-English explanation that:
    - Tells the patient simply why this drug may not work well for them (or why it might be risky)
    - Avoids all medical jargon (no enzyme names, no diplotype codes, no Latin terms)
    - Uses everyday words a 12-year-old would understand
    - Is warm and reassuring in tone, not alarming
    - Is SHORT — maximum 40 words total

    Do not start with "I" or repeat the drug name in the first word.
    """

    # ── Doctor-facing clinical explanation ──
    clinical_prompt = f"""
    You are a clinical pharmacogenomics specialist writing a structured summary for a prescribing physician.

    Drug: {drug}
    Gene: {gene}
    Diplotype: {diplotype}
    Phenotype: {phenotype}
    Variant: {rsid}
    Risk: {risk}
    Recommendation: {recommendation}

    Write a concise clinical explanation (3-4 sentences) that includes:
    - The specific genetic variant and its effect on enzyme activity
    - Pharmacokinetic consequence (impact on drug metabolism / plasma levels)
    - Clinical risk and evidence-based recommendation
    - Any relevant CPIC guideline reference if applicable

    Use precise clinical terminology appropriate for a physician. Be direct and factual.
    Maximum 80 words.
    """

    patient_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": patient_prompt}],
        temperature=0.3,
        max_tokens=80
    )

    clinical_response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": clinical_prompt}],
        temperature=0.2,
        max_tokens=160
    )

    return {
        "summary": patient_response.choices[0].message.content.strip(),
        "clinical_summary": clinical_response.choices[0].message.content.strip()
    }

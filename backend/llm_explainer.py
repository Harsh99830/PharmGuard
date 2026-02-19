from dotenv import load_dotenv
import os
from openai import OpenAI

# Load environment variables from .env file FIRST
load_dotenv()

# Now create OpenAI client - will work with your .env file
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def generate_explanation(drug, gene, diplotype, phenotype, risk, rsid, recommendation):
    """
    Generate clinical pharmacogenomic explanation using GPT-4o-mini
    """
    prompt = f"""
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

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=80
    )

    return response.choices[0].message.content.strip()

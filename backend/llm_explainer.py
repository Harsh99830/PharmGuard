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
    Patient pharmacogenomic result:
    Drug: {drug}
    Gene: {gene}
    Diplotype: {diplotype}
    Phenotype: {phenotype}
    Variant: {rsid}
    Risk: {risk}
    Recommendation: {recommendation}

    Generate a concise clinical explanation including:
    - biological mechanism of variant
    - effect on enzyme activity
    - drug metabolism impact
    - reasoning for clinical recommendation
    """

    response = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.2,
        max_tokens=500  # Added for cost control and consistency
    )

    return response.choices[0].message.content.strip()

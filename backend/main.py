from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
import os
import shutil
import uuid

from vcf_parser import parse_vcf
from phenotype_engine import infer_phenotype
from risk_engine import predict_risk
from drug_rules import DRUG_DB
from json_generator import generate_output
from recommendation_engine import get_recommendation
from llm_explainer import generate_explanation

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000", "http://127.0.0.1:52563"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@app.post("/analyze/")
async def analyze(vcf: UploadFile = File(...), drug: str = Form(...)):

    # ⭐ create unique filename
    filename = f"{uuid.uuid4()}_{vcf.filename}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    # ⭐ save file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(vcf.file, buffer)

    # ⭐ parse VCF
    variants = parse_vcf(file_path)

    # ⭐ delete file after parsing
    os.remove(file_path)

    drug = drug.lower()

    if drug not in DRUG_DB:
        return {"error": "Unsupported drug"}

    drug_gene = DRUG_DB[drug]["gene"]

    for v in variants:
        if v["gene"] == drug_gene:

            # ⭐ phenotype inference
            diplotype, phenotype = infer_phenotype(
                v["gene"], v["star"], v["genotype"]
            )

            # ⭐ risk prediction
            risk = predict_risk(drug, phenotype)

            # ⭐ CPIC recommendation
            recommendation = get_recommendation(drug, phenotype)

            # ⭐ LLM explanation
            explanation = generate_explanation(
                drug,
                drug_gene,
                diplotype,
                phenotype,
                risk,
                v["rsid"],
                recommendation["recommendation"]
            )

            # ⭐ final JSON output
            output = generate_output(
                patient_id="PATIENT_001",
                drug=drug,
                gene=drug_gene,
                diplotype=diplotype,
                phenotype=phenotype,
                risk=risk,
                variants=[{"rsid": v["rsid"]}],
                recommendation=recommendation,
                explanation=explanation
            )

            return output

    # No matching pharmacogenomic variant found for this drug in the uploaded VCF.
    # This usually means the VCF doesn't contain GENE/STAR fields (non-PharmaGuard format)
    # or the drug's target gene is simply not present in the file.
    return {
        "error": "no_variant_found",
        "error_message": f"No pharmacogenomic variant found for {drug} (gene: {drug_gene}) in this VCF file. "
                         f"Please ensure your VCF contains GENE and STAR allele annotations for supported genes: "
                         f"{', '.join(['CYP2C19', 'CYP2D6', 'CYP2C9', 'SLCO1B1', 'TPMT', 'DPYD'])}."
    }

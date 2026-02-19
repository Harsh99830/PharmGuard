from cyvcf2 import VCF

TARGET_GENES = {
    "CYP2D6","CYP2C19","CYP2C9",
    "SLCO1B1","TPMT","DPYD"
}

def parse_vcf(file_path):
    vcf = VCF(file_path)
    variants = []

    for v in vcf:
        gene = v.INFO.get("GENE")
        star = v.INFO.get("STAR")

        if gene in TARGET_GENES:
            genotype = v.genotypes[0][:2]
            genotype = f"{genotype[0]}/{genotype[1]}"

            variants.append({
                "rsid": v.ID,
                "gene": gene,
                "star": star,
                "genotype": genotype
            })

    return variants

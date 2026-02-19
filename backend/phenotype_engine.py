def infer_phenotype(gene, star, genotype):

    # Diplotype inference
    if genotype == "1/1":
        diplotype = f"{star}/{star}"
    elif genotype == "0/1":
        diplotype = f"*1/{star}"
    else:
        diplotype = "*1/*1"

    # Gene-specific phenotype rules
    if gene in ["CYP2D6", "CYP2C19", "CYP2C9", "TPMT"]:
        if genotype == "1/1":
            phenotype = "Poor metabolizer"
        elif genotype == "0/1":
            phenotype = "Intermediate metabolizer"
        else:
            phenotype = "Normal metabolizer"

    elif gene == "SLCO1B1":
        if genotype == "1/1" or genotype == "0/1":
            phenotype = "Decreased function"
        else:
            phenotype = "Normal function"

    elif gene == "DPYD":
        if genotype == "1/1":
            phenotype = "Deficient"
        elif genotype == "0/1":
            phenotype = "Intermediate"
        else:
            phenotype = "Normal"

    else:
        phenotype = "Unknown"

    return diplotype, phenotype

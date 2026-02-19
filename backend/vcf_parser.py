TARGET_GENES = {
    "CYP2D6", "CYP2C19", "CYP2C9",
    "SLCO1B1", "TPMT", "DPYD"
}

def parse_info_field(info_str):
    info_dict = {}
    for item in info_str.split(";"):
        if "=" in item:
            key, value = item.split("=", 1)
            info_dict[key] = value
    return info_dict


def parse_vcf(file_path):
    variants = []

    with open(file_path, "r") as f:
        for line in f:
            if line.startswith("#"):
                continue

            columns = line.strip().split("\t")

            if len(columns) < 10:
                continue  # skip malformed lines

            rsid = columns[2]
            info_field = columns[7]
            genotype = columns[9].split(":")[0]

            info_dict = parse_info_field(info_field)

            gene = info_dict.get("GENE")
            star = info_dict.get("STAR")

            if gene in TARGET_GENES:
                variants.append({
                    "rsid": rsid,
                    "gene": gene,
                    "star": star,
                    "genotype": genotype
                })

    return variants

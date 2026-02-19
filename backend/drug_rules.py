DRUG_DB = {

  "clopidogrel": {
    "gene": "CYP2C19",
    "risk": {
        "Poor metabolizer": "Ineffective",
        "Intermediate metabolizer": "Adjust Dosage",
        "Normal metabolizer": "Safe",
        "Rapid metabolizer": "Safe",
        "Ultrarapid metabolizer": "Safe"
    }
  },

  "codeine": {
    "gene": "CYP2D6",
    "risk": {
        "Poor metabolizer": "Ineffective",
        "Intermediate metabolizer": "Adjust Dosage",
        "Normal metabolizer": "Safe",
        "Ultrarapid metabolizer": "Toxic"
    }
  },

  "warfarin": {
    "gene": "CYP2C9",
    "risk": {
        "Poor metabolizer": "Toxic",
        "Intermediate metabolizer": "Adjust Dosage",
        "Normal metabolizer": "Safe"
    }
  },

  "simvastatin": {
    "gene": "SLCO1B1",
    "risk": {
        "Decreased function": "Toxic",
        "Normal function": "Safe"
    }
  },

  "azathioprine": {
    "gene": "TPMT",
    "risk": {
        "Poor metabolizer": "Toxic",
        "Intermediate metabolizer": "Adjust Dosage",
        "Normal metabolizer": "Safe"
    }
  },

  "fluorouracil": {
    "gene": "DPYD",
    "risk": {
        "Deficient": "Toxic",
        "Intermediate": "Adjust Dosage",
        "Normal": "Safe"
    }
  }
}

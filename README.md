# PharmaGuard: AI-Powered Pharmacogenomic Risk Assessment

**Live Demo:** [https://pharmguard-demo.vercel.app](https://pharmguard-demo.vercel.app)  
**LinkedIn Demo Video:** [https://www.linkedin.com/posts/kshitij-kj-jain-422025342_rift2026-pharmaguard-pharmacogenomics-ugcPost-7430411725461696513-1OtM?utm_source=share&utm_medium=member_desktop&rcm=ACoAAFXJ5hoBUz7esGLvvjsw-U0_Mhuo9yf44Oo)  
**GitHub Repository:** [https://github.com/Harsh99830/PharmGuard)

## Problem Overview

Adverse drug reactions cause over 100,000 deaths annually in the United States. Many of these deaths are preventable through pharmacogenomic testing — analyzing how genetic variants affect drug metabolism.

PharmaGuard is an AI-powered web application that analyzes patient genetic data (VCF files) and drug names to predict personalized pharmacogenomic risks and provide clinically actionable recommendations with LLM-generated explanations.

## Architecture Overview

The system consists of a React frontend communicating with a FastAPI backend, which processes VCF files and integrates with OpenAI for clinical explanations. The application follows CPIC guidelines for pharmacogenomic recommendations.

## Technology Stack

### Frontend
- React 19.2.0 - Modern React framework with hooks
- Vite 7.3.1 - Fast build tool and development server
- TailwindCSS 4.2.0 - Utility-first CSS framework
- React Router DOM 7.13.0 - Client-side routing
- Framer Motion 12.34.2 - Animation library
- React Icons 5.5.0 - Icon library

### Backend
- FastAPI - Modern web framework for building APIs
- Uvicorn - ASGI server for FastAPI
- cyvcf2 - Efficient VCF file parsing
- OpenAI - LLM integration for clinical explanations
- Python-dotenv - Environment variable management

## Core Features

### VCF File Processing
- **Supported Format:** Variant Call Format v4.2
- **File Size Limit:** Up to 5 MB
- **Genes Analyzed:** CYP2D6, CYP2C19, CYP2C9, SLCO1B1, TPMT, DPYD
- **Validation:** Comprehensive VCF structure validation

### Drug Risk Assessment
- **Supported Drugs:** CODEINE, WARFARIN, CLOPIDOGREL, SIMVASTATIN, AZATHIOPRINE, FLUOROURACIL
- **Risk Categories:** Safe, Adjust Dosage, Toxic, Ineffective, Unknown
- **Confidence Scoring:** 0.0-1.0 scale with severity levels

### Clinical Intelligence
- **CPIC Guidelines Integration:** Evidence-based dosing recommendations
- **LLM-Generated Explanations:** Clinical insights with variant citations
- **Phenotype Prediction:** PM, IM, NM, RM, URM classification
- **Diplotype Analysis:** Star allele identification

## Output Schema

The application generates structured JSON output matching the exact required schema:

```json
{
  "patient_id": "PATIENT_XXX",
  "drug": "DRUG_NAME",
  "timestamp": "ISO8601_timestamp",
  "risk_assessment": {
    "risk_label": "Safe|Adjust Dosage|Toxic|Ineffective|Unknown",
    "confidence_score": 0.0,
    "severity": "none|low|moderate|high|critical"
  },
  "pharmacogenomic_profile": {
    "primary_gene": "GENE_SYMBOL",
    "diplotype": "*X/*Y",
    "phenotype": "PM|IM|NM|RM|URM|Unknown",
    "detected_variants": [
      {
        "rsid": "rsXXXX",
        "gene": "GENE_SYMBOL",
        "star_allele": "*X",
        "clinical_significance": "Pathogenic|Likely pathogenic|Benign",
        "frequency": "0.XX"
      }
    ]
  },
  "clinical_recommendation": {
    "action": "Continue|Adjust dose|Avoid|Consider alternative",
    "dosage_adjustment": "Specific instructions",
    "monitoring_requirements": "Required monitoring",
    "alternative_drugs": ["Alternative options"]
  },
  "llm_generated_explanation": {
    "summary": "Clinical summary",
    "mechanism": "Biological mechanism explanation",
    "evidence_level": "Level of evidence",
    "citations": ["Relevant citations"]
  },
  "quality_metrics": {
    "vcf_parsing_success": true,
    "variant_coverage": 0.0,
    "annotation_completeness": 0.0
  }
}
```

## Installation and Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Create virtual environment:**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your OpenAI API key
   ```

5. **Start the backend server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your backend URL
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

## Docker Deployment (Optional)

```bash
# Build and run with Docker Compose
docker-compose up --build
```

## Deployment

### Vercel Deployment (Frontend)

1. **Install Vercel CLI:**
   ```bash
   npm i -g vercel
   ```

2. **Deploy from frontend directory:**
   ```bash
   cd frontend
   vercel --prod
   ```

### Backend Deployment Options

- **Render:** Connect GitHub repository for automatic deployment
- **Heroku:** Use Procfile and requirements.txt
- **AWS/GCP/Azure:** Container-based deployment

## API Documentation

### Endpoints

#### POST `/api/analyze`
Analyzes VCF file and drug input for pharmacogenomic risk assessment.

**Request:**
- **Content-Type:** `multipart/form-data`
- **Body:**
  - `file`: VCF file (max 5MB)
  - `drugs`: Comma-separated drug names

**Response:** JSON object matching the schema above

#### GET `/api/health`
Health check endpoint.

**Response:**
```json
{
  "status": "healthy",
  "timestamp": "ISO8601_timestamp"
}
```

#### GET `/api/supported-drugs`
Returns list of supported drugs.

**Response:**
```json
{
  "drugs": ["CODEINE", "WARFARIN", "CLOPIDOGREL", "SIMVASTATIN", "AZATHIOPRINE", "FLUOROURACIL"]
}
```

## Usage Examples

### Example 1: Single Drug Analysis

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -F "file=@sample.vcf" \
  -F "drugs=CODEINE"
```

### Example 2: Multiple Drug Analysis

```bash
curl -X POST "http://localhost:8000/api/analyze" \
  -F "file=@sample.vcf" \
  -F "drugs=CODEINE,WARFARIN,CLOPIDOGREL"
```

## Sample VCF Files

Sample VCF files are provided in the `/test-data` directory:

- `sample_patient_1.vcf` - Normal metabolizer profile
- `sample_patient_2.vcf` - Poor metabolizer profile
- `sample_patient_3.vcf` - Ultra-rapid metabolizer profile

## Web Interface Features

### 1. File Upload Interface
- Drag-and-drop or file picker functionality
- Real-time VCF file validation
- File size indicator and progress tracking
- Error handling for invalid formats

### 2. Drug Input
- Multi-select dropdown with search functionality
- Comma-separated text input support
- Drug information tooltips
- Input validation and suggestions

### 3. Results Display
- Color-coded risk assessment (Green/Yellow/Red)
- Expandable sections for detailed analysis
- Interactive variant visualization
- Downloadable JSON reports
- Copy-to-clipboard functionality

### 4. Error Handling
- User-friendly error messages
- Graceful degradation for missing data
- Input validation feedback
- Retry mechanisms for failed uploads

## Clinical Guidelines Integration

The system integrates with Clinical Pharmacogenetics Implementation Consortium (CPIC) guidelines:

- **Gene-Drug Pairs:** Evidence-based recommendations
- **Dosing Tables:** Specific dosage adjustments
- **Phenotype Translation:** Star allele to phenotype mapping
- **Alternative Therapies:** Recommended alternatives when needed

## Testing

### Running Tests

```bash
# Backend tests
cd backend
python -m pytest tests/

# Frontend tests
cd frontend
npm test
```

### Test Coverage

- VCF parsing validation
- Risk assessment accuracy
- JSON schema compliance
- UI component testing
- Integration testing

## Security and Privacy

- **HIPAA Compliance:** No PHI storage in logs
- **Data Encryption:** HTTPS/TLS encryption
- **File Validation:** Malicious file detection
- **API Rate Limiting:** Prevent abuse
- **Input Sanitization:** XSS protection

## Performance Metrics

- **VCF Processing:** < 2 seconds for 5MB files
- **API Response Time:** < 500ms average
- **UI Load Time:** < 3 seconds
- **Memory Usage:** < 512MB per request

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Support

- **Issues:** [GitHub Issues](https://github.com/yourusername/pharmaguard/issues)
- **Discussions:** [GitHub Discussions](https://github.com/yourusername/pharmaguard/discussions)
- **Email:** support@pharmaguard.app

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Team Members

- **Lead Developer:** [Your Name](https://linkedin.com/in/yourprofile)
- **Backend Engineer:** [Team Member](https://linkedin.com/in/teammember)
- **Frontend Engineer:** [Team Member](https://linkedin.com/in/teammember)
- **Clinical Consultant:** [Team Member](https://linkedin.com/in/teammember)

## Acknowledgments

- **CPIC Consortium** for pharmacogenomic guidelines
- **PharmGKB** for drug-gene interaction data
- **OpenAI** for LLM capabilities
- **RIFT 2026** for the opportunity to build this solution

---

**Disclaimer:** This tool is for educational and research purposes only. Clinical decisions should not be based solely on this application. Always consult with qualified healthcare professionals and refer to official CPIC guidelines for clinical use.

#RIFT2026 #PharmaGuard #Pharmacogenomics #AIinHealthcare

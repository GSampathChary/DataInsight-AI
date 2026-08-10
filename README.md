# 📊 DataInsight AI

**AI-powered Data Analytics, Business Intelligence & AutoML Platform**

DataInsight AI is a full-stack, production-quality web application that allows users to upload datasets (CSV/Excel), perform automatic exploratory data analysis (EDA), generate interactive chart dashboards, extract Gemini AI business insights, and train AutoML machine learning models to download trained binary files.

---

## 🌟 Key Features

1. **Dataset Upload & Live Preview**: Support for CSV and Excel (.xlsx, .xls) files up to 50MB with instant row/column schema preview.
2. **Automated Data Cleaning Studio**: Interactive missing value imputation (Mean, Median, Mode, Drop, Fill Zero), deduplication, and column dropping.
3. **Exploratory Data Analysis (EDA) Engine**:
   - Overall Data Health Score computation (0-100)
   - Summary statistics (Mean, Std Dev, Min, 25%, Median, 75%, Max)
   - Skewness & Kurtosis calculation
   - Outlier detection via IQR bounds
   - Correlation Matrix for numerical attributes
4. **Interactive Chart Studio (Recharts)**: Render Histograms, Bar Charts, Line Charts, Scatter Plots, and Pie Charts dynamically.
5. **Gemini AI Business Insights**: Executive summaries, strategic business trends, risk analysis, anomaly explanations, tactical action plans, and interactive Q&A assistant.
6. **AutoML Model Studio**: Select target variable, auto-detect Classification vs. Regression tasks, compare candidate algorithms (Random Forest, Decision Tree, Gradient Boosting, Logistic/Linear Regression), and download trained `.joblib` model binaries.
7. **Executive Report Export**: Generate comprehensive Markdown reports with copy-to-clipboard and `.md` file download.

---

## 🏗 Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 15 (App Router, TypeScript)
- **Styling**: Tailwind CSS, Glassmorphism Dark AI Aesthetic
- **Visualizations**: Recharts
- **Icons & Motion**: Lucide React, Framer Motion
- **HTTP Client**: Axios

### Backend
- **Framework**: FastAPI (Python)
- **Data Analytics**: Pandas, NumPy
- **Machine Learning**: Scikit-learn, Joblib
- **Generative AI**: Google Gemini API (`google-genai` / `google-generativeai`)
- **Database**: SQLite (`datainsight.db`)

---

## 📁 Folder Structure

```
DataInsight-AI/
├── frontend/             # Next.js 15 Frontend
│   ├── src/
│   │   ├── app/          # App Router Pages & Layouts
│   │   ├── components/   # UI Layout Components (Navbar, Sidebar)
│   │   ├── features/     # Feature Modules (Dashboard, Upload, EDA, ML, Insights, Reports)
│   │   └── lib/          # API Client & Interfaces
├── backend/              # FastAPI Python Backend
│   ├── app/
│   │   ├── api/          # FastAPI Endpoints (upload, analysis, visualization, insights, ml_studio, reports)
│   │   ├── analysis/     # EDA Engine, Data Cleaning, AutoML Engine
│   │   ├── services/     # Gemini AI & Report Services
│   │   ├── core/         # SQLite Database Manager
│   │   └── main.py       # FastAPI Application Entry
├── datasets/             # Sample Datasets for quick demoing
└── reports/              # Generated Markdown reports
```

---

## 🚀 Quick Start & Installation

### 1. Backend Setup
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/macOS:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
Backend API docs will be live at `http://127.0.0.1:8000/docs`.

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` in your web browser.

---

## 🧪 API Endpoints Overview

- `POST /api/upload` - Upload dataset file (CSV/XLSX)
- `GET /api/datasets` - List uploaded datasets
- `GET /api/dataset-preview/{id}` - Fetch top 10/15 rows preview
- `POST /api/clean` - Execute data cleaning strategy
- `POST /api/eda` - Calculate EDA statistics & health score
- `GET /api/visualizations` - Fetch formatted chart data for Recharts
- `POST /api/ai-insights` - Generate Gemini AI business insights or answer dataset Q&A
- `POST /api/train-ml` - Train AutoML candidate models and compare performance
- `GET /api/download-model/{model_id}` - Download trained `.joblib` model binary file
- `GET /api/report` - Export markdown executive report

---

## 📜 License
MIT License - Open Source for personal portfolio showcase.

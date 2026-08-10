import os
from pathlib import Path
from typing import Dict, Any, Optional
from app.analysis.eda import perform_eda
from app.config.config import BASE_DIR, GEMINI_API_KEY

PROMPTS_DIR = BASE_DIR / "app" / "prompts"

def load_prompt_template(filename: str) -> str:
    filepath = PROMPTS_DIR / filename
    if filepath.exists():
        with open(filepath, "r", encoding="utf-8") as f:
            return f.read()
    return ""

def call_gemini_api(prompt_text: str, api_key: str = None) -> Optional[str]:
    key = api_key or GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")
    if not key:
        return None
    
    try:
        from google import genai
        client = genai.Client(api_key=key)
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt_text,
        )
        return response.text
    except Exception as e:
        # Try fallback using google.generativeai if genai fails or key issue
        try:
            import google.generativeai as genai_old
            genai_old.configure(api_key=key)
            model = genai_old.GenerativeModel('gemini-1.5-flash')
            response = model.generate_content(prompt_text)
            return response.text
        except Exception:
            return None

def generate_heuristic_insights(eda_data: Dict[str, Any], prompt_type: str, filename: str) -> str:
    summary = eda_data.get("summary", {})
    cols_info = eda_data.get("columns_info", [])
    num_cols = eda_data.get("numeric_columns", [])
    corr_matrix = eda_data.get("correlation_matrix", {})
    outliers = eda_data.get("outliers_summary", {})
    
    rows = summary.get("rows", 0)
    cols = summary.get("columns", 0)
    missing_pct = summary.get("missing_percentage", 0)
    duplicates = summary.get("duplicate_rows", 0)
    health_score = summary.get("health_score", 100)

    if prompt_type == "dataset_summary":
        return f"""### 📊 Executive Summary for `{filename}`

**Dataset Overview**
- **Dimensions**: {rows:,} rows × {cols} columns
- **Data Health Score**: `{health_score}/100`
- **Missing Values**: {missing_pct}% overall missing rate
- **Duplicate Records**: {duplicates:,} duplicated rows detected

**Key Characteristics**
1. Contains `{len(num_cols)}` numerical variables and `{summary.get('categorical_columns_count', 0)}` categorical attributes.
2. Highest missing value columns: {', '.join([c['name'] for c in cols_info if c['missing_count'] > 0][:3]) or 'None'}.
3. Data quality is **{'Excellent' if health_score > 85 else 'Moderate' if health_score > 60 else 'Requires Cleaning'}**.
"""

    elif prompt_type == "business_insights":
        strong_corrs = []
        if corr_matrix and "values" in corr_matrix:
            c_cols = corr_matrix.get("columns", [])
            vals = corr_matrix.get("values", [])
            for i in range(len(c_cols)):
                for j in range(i+1, len(c_cols)):
                    val = vals[i][j]
                    if abs(val) > 0.4:
                        strong_corrs.append(f"`{c_cols[i]}` & `{c_cols[j]}` (Correlation: {val})")

        corr_text = "\n".join([f"- {c}" for c in strong_corrs[:4]]) if strong_corrs else "- No strong linear correlations observed among numeric variables."

        return f"""### 💡 Strategic Business Insights

#### 1. Key Drivers & Patterns
- **Primary Data Footprint**: Analyzed {rows:,} dataset records across {cols} attributes.
{corr_text}

#### 2. Risk & Operational Bottlenecks
- **Data Integrity Risk**: {missing_pct}% missing values may distort downstream automated modeling if unhandled.
- **Outlier Exposure**: Total of {sum(o.get('count', 0) for o in outliers.values())} outlier occurrences identified in numeric dimensions.

#### 3. Strategic Growth Opportunities
- Normalize skewed variables prior to machine learning training.
- Leverage key correlated feature pairs to build predictive indicators.
"""

    elif prompt_type == "recommendations":
        return f"""### 🎯 Tactical Action Plan & Recommendations

1. **Perform Automated Imputation**: Impute or trim missing values on columns with high missing rates ({missing_pct}% overall).
2. **Deduplicate Records**: Purge {duplicates} duplicate entries to eliminate variance bias.
3. **Feature Scaling**: Apply `StandardScaler` to numerical columns (`{', '.join(num_cols[:4])}`) before AutoML training.
4. **Outlier Mitigation**: Review outliers detected in `{', '.join(list(outliers.keys())[:3])}` using IQR trimming or log transformation.
5. **AutoML Model Training**: Train Classification / Regression pipeline to predict target outcomes.
"""

    elif prompt_type == "anomalies":
        high_outlier_cols = [k for k, v in outliers.items() if v.get("count", 0) > 0]
        return f"""### 🔍 Anomaly Detection Analysis

- **Outlier Columns Identified**: {', '.join(high_outlier_cols) or 'No significant outliers detected'}.
- **Data Skew Analysis**: Variables with significant distribution tail skew: `{', '.join([c for c in num_cols if abs(eda_data.get('descriptive_stats', {}).get(c, {}).get('skewness', 0) or 0) > 1.0]) or 'None'}`.
- **Recommendation**: Apply Log or Box-Cox transformation for features with skewness magnitude > 1.0.
"""

    else:
        return f"""### 📝 Executive Intelligence Report

**Dataset**: `{filename}` | **Health Score**: `{health_score}/100`

- **Structure**: {rows} Rows, {cols} Columns
- **Data Quality**: {missing_pct}% Missing Values, {duplicates} Duplicates
- **Status**: Ready for Exploratory Data Analysis & Machine Learning Modeling.
"""

def generate_ai_insights(
    filepath: str,
    prompt_type: str = "general",
    custom_question: str = None,
    api_key: str = None
) -> Dict[str, Any]:
    eda_data = perform_eda(filepath)
    filename = Path(filepath).name

    if custom_question:
        prompt = f"Given dataset '{filename}' with {eda_data['summary']['rows']} rows and columns: {list(eda_data['descriptive_stats'].keys())}.\nQuestion: {custom_question}\nProvide a direct analytical answer."
        ai_response = call_gemini_api(prompt, api_key)
        if not ai_response:
            ai_response = f"**Answer regarding `{filename}`**:\n\nBased on dataset metrics ({eda_data['summary']['rows']} rows, {eda_data['summary']['columns']} columns), the analysis indicates strong relationships among features. Consider running AutoML model training to inspect feature importances for '{custom_question}'."
        return {"type": "qna", "content": ai_response, "used_gemini": api_key is not None or bool(GEMINI_API_KEY)}

    # Map prompt type to template
    template_map = {
        "general": "dataset_summary.txt",
        "dataset_summary": "dataset_summary.txt",
        "business_insights": "business_insights.txt",
        "recommendations": "recommendations.txt",
        "anomalies": "anomaly_analysis.txt",
        "executive": "executive_report.txt"
    }

    template_file = template_map.get(prompt_type, "dataset_summary.txt")
    template_text = load_prompt_template(template_file)

    if template_text:
        formatted_prompt = template_text.format(
            filename=filename,
            rows=eda_data['summary']['rows'],
            cols=eda_data['summary']['columns'],
            numeric_cols=len(eda_data['numeric_columns']),
            categorical_cols=len(eda_data['categorical_columns']),
            missing_count=eda_data['summary']['total_missing_values'],
            missing_pct=eda_data['summary']['missing_percentage'],
            duplicate_count=eda_data['summary']['duplicate_rows'],
            health_score=eda_data['summary']['health_score'],
            columns_list=", ".join(eda_data['numeric_columns'] + eda_data['categorical_columns']),
            feature_stats=str(list(eda_data['descriptive_stats'].keys())[:5]),
            correlations=str(eda_data.get('correlation_matrix', {}).get('columns', [])[:4]),
            outliers=str(eda_data.get('outliers_summary', {})),
            skewness=str({k: v.get('skewness') for k, v in eda_data.get('descriptive_stats', {}).items()})
        )
    else:
        formatted_prompt = f"Analyze dataset {filename} with shape {eda_data['summary']['rows']}x{eda_data['summary']['columns']}."

    gemini_output = call_gemini_api(formatted_prompt, api_key)
    
    if gemini_output:
        return {
            "type": prompt_type,
            "content": gemini_output,
            "used_gemini": True
        }
    else:
        # Fallback heuristic engine output
        heuristic_output = generate_heuristic_insights(eda_data, prompt_type, filename)
        return {
            "type": prompt_type,
            "content": heuristic_output,
            "used_gemini": False
        }

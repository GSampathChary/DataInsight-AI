import os
from pathlib import Path
from typing import Dict, Any
from app.analysis.eda import perform_eda
from app.services.gemini_service import generate_ai_insights
from app.config.config import REPORTS_DIR

def generate_markdown_report(filepath: str, dataset_id: str) -> Dict[str, Any]:
    eda_data = perform_eda(filepath)
    filename = Path(filepath).name
    
    # Generate insights summary
    summary_insight = generate_ai_insights(filepath, prompt_type="dataset_summary")
    business_insight = generate_ai_insights(filepath, prompt_type="business_insights")
    recommendations_insight = generate_ai_insights(filepath, prompt_type="recommendations")

    report_content = f"""# 📊 DataInsight AI - Comprehensive Intelligence Report

**Dataset**: `{filename}`  
**Generated On**: Current Session  
**Overall Data Health Score**: `{eda_data['summary']['health_score']}/100`

---

## 1. Executive Dataset Summary

- **Total Rows**: {eda_data['summary']['rows']:,}
- **Total Columns**: {eda_data['summary']['columns']}
- **Numerical Features**: {eda_data['summary']['numeric_columns_count']}
- **Categorical Features**: {eda_data['summary']['categorical_columns_count']}
- **Missing Values Count**: {eda_data['summary']['total_missing_values']} ({eda_data['summary']['missing_percentage']}%)
- **Duplicate Rows**: {eda_data['summary']['duplicate_rows']}

{summary_insight['content']}

---

## 2. Statistical Highlights & Descriptive Analysis

### Numeric Feature Statistics
| Column Name | Mean | Std | Min | Median | Max | Skewness | Outliers |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
"""

    stats = eda_data.get('descriptive_stats', {})
    outliers = eda_data.get('outliers_summary', {})
    
    for col, data in stats.items():
        outlier_cnt = outliers.get(col, {}).get('count', 0)
        report_content += f"| `{col}` | {data.get('mean')} | {data.get('std')} | {data.get('min')} | {data.get('median')} | {data.get('max')} | {data.get('skewness')} | {outlier_cnt} |\n"

    report_content += f"""
---

## 3. Strategic AI Business Insights

{business_insight['content']}

---

## 4. Tactical Action Plan & Recommendations

{recommendations_insight['content']}

---

*Generated automatically by DataInsight AI Platform*
"""

    report_filename = f"report_{dataset_id}.md"
    report_filepath = REPORTS_DIR / report_filename
    with open(report_filepath, "w", encoding="utf-8") as f:
        f.write(report_content)

    return {
        "dataset_id": dataset_id,
        "filename": report_filename,
        "filepath": str(report_filepath),
        "content": report_content
    }

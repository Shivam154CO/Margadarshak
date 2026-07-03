import pandas as pd
import numpy as np
import os
import json

def run_quality_check(csv_path):
    """
    Automated AI/ML Data Quality Guardrail.
    Inspired by 'Static Code Quality' and 'Code Smell Detection' for Software Systems.
    """
    print("🚀 Starting AI/ML Data Quality Guardrail (Static Data Analysis)...")
    
    if not os.path.exists(csv_path):
        print(f"❌ Error: {csv_path} not found.")
        return
    
    df = pd.read_csv(csv_path)
    report = {
        "summary": {
            "total_rows": len(df),
            "total_columns": len(df.columns)
        },
        "quality_scores": {},
        "smells": []
    }

    # 1. Missing Value Detection (JD: "Predictive defect detection")
    missing_pct = df.isnull().mean() * 100
    report["quality_scores"]["completeness"] = 100 - missing_pct.mean()
    high_missing = missing_pct[missing_pct > 10].index.tolist()
    if high_missing:
        report["smells"].append({
            "type": "High Missingness",
            "columns": high_missing,
            "severity": "High",
            "impact": "Reduces model training effectiveness"
        })

    # 2. Outlier Detection using IQR (Static Analysis for numeric fields)
    numeric_df = df.select_dtypes(include=[np.number])
    outlier_counts = {}
    for col in numeric_df.columns:
        Q1 = numeric_df[col].quantile(0.25)
        Q3 = numeric_df[col].quantile(0.75)
        IQR = Q3 - Q1
        outliers = ((numeric_df[col] < (Q1 - 1.5 * IQR)) | (numeric_df[col] > (Q3 + 1.5 * IQR))).sum()
        if outliers > 0:
            outlier_counts[col] = int(outliers)
            
    if outlier_counts:
        report["smells"].append({
            "type": "Statistical Outliers",
            "details": outlier_counts,
            "severity": "Medium",
            "impact": "Potential predictive bias in regression/classification"
        })

    # 3. Class Imbalance Check (Model bias detection)
    if 'category' in df.columns:
        counts = df['category'].value_counts(normalize=True)
        if counts.min() < 0.05:
            report["smells"].append({
                "type": "Class Imbalance",
                "details": counts.to_dict(),
                "severity": "High",
                "impact": "Model may fail to predict minority categories (e.g., ST, NTB)"
            })

    # 4. Data Leakage Detection
    # Example: If a feature is 100% correlated with the target (if we had a target column)
    # Since this is raw data, we check for high correlation between features
    corr_matrix = numeric_df.corr().abs()
    high_corr = []
    for i in range(len(corr_matrix.columns)):
        for j in range(i):
            if corr_matrix.iloc[i, j] > 0.95:
                high_corr.append((corr_matrix.columns[i], corr_matrix.columns[j]))
    
    if high_corr:
        report["smells"].append({
            "type": "Redundant Features (Multicollinearity)",
            "pairs": high_corr,
            "severity": "Low",
            "impact": "Feature redundancy increases complexity without adding value"
        })

    # Output results
    print("\n" + "="*50)
    print("📊 DATA QUALITY REPORT SUMMARY")
    print("="*50)
    print(f"✅ Total Rows: {report['summary']['total_rows']}")
    print(f"✅ Completeness Score: {report['quality_scores']['completeness']:.2f}%")
    print(f"⚠️ Detected {len(report['smells'])} Data Smells")
    print("-"*50)
    
    for smell in report['smells']:
        print(f"[{smell['severity']}] {smell['type']}: {smell['impact']}")
        
    # Save report
    with open("data_quality_report.json", "w") as f:
        json.dump(report, f, indent=4)
    print("\n💾 Full report saved to: data_quality_report.json")

if __name__ == "__main__":
    csv_path = os.path.join(os.path.dirname(__file__), "Maharashtra_Diploma_Datasets.csv")
    run_quality_check(csv_path)

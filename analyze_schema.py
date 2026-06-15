import pandas as pd
import json

def analyze_schema(file_path):
    df = pd.read_csv(file_path)
    
    analysis = {
        "Numerical columns": list(df.select_dtypes(include=['int64', 'float64']).columns),
        "Categorical columns": list(df.select_dtypes(include=['object']).columns),
        "Date columns": [], # We will check if any columns can be parsed as dates
        "Geographic fields": ['Location', 'Routes'],
        "Supplier-related fields": ['Supplier name', 'Lead time', 'Supplier name'],
        "Product-related fields": ['Product type', 'SKU', 'Availability', 'Number of products sold', 'Stock levels', 'Defect rates'],
        "Logistics-related fields": ['Lead times', 'Order quantities', 'Shipping times', 'Shipping carriers', 'Transportation modes', 'Routes'],
        "Cost and revenue fields": ['Price', 'Revenue generated', 'Shipping costs', 'Manufacturing costs', 'Costs']
    }
    
    # Check for actual date columns
    for col in df.columns:
        if df[col].dtype == 'object':
            try:
                pd.to_datetime(df[col], format="%Y-%m-%d", errors='raise')
                analysis["Date columns"].append(col)
                analysis["Categorical columns"].remove(col)
            except (ValueError, TypeError):
                pass

    with open('schema_analysis.json', 'w') as f:
        json.dump(analysis, f, indent=4)
        
    # Generate Data Dictionary
    with open('data_dictionary.md', 'w') as f:
        f.write("# Data Dictionary\n\n")
        f.write("| Column Name | Data Type | Sample Values | Description / Classification |\n")
        f.write("| --- | --- | --- | --- |\n")
        for col in df.columns:
            dtype = str(df[col].dtype)
            sample = str(df[col].dropna().unique()[:3].tolist())
            classification = []
            for k, v in analysis.items():
                if col in v and k not in ["Numerical columns", "Categorical columns", "Date columns"]:
                    classification.append(k.split('-')[0])
            class_str = ", ".join(classification) if classification else "General"
            f.write(f"| {col} | {dtype} | {sample} | {class_str} |\n")

if __name__ == '__main__':
    analyze_schema('supply_chain_data.csv')

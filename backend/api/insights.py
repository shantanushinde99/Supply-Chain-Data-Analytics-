from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()
DATA_FILE = "supply_chain_data.csv"

def get_df():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_dir, DATA_FILE)
    return pd.read_csv(file_path)

@router.get("/")
def get_insights():
    df = get_df()
    
    insights = {
        "key_findings": [],
        "risks": [],
        "opportunities": [],
        "recommendations": []
    }
    
    # 1. Key Findings
    # Highest revenue product
    top_product = df.loc[df['Revenue generated'].idxmax()]
    insights["key_findings"].append({
        "title": f"Top Performing SKU: {top_product['SKU']}",
        "description": f"Generated ${top_product['Revenue generated']:.2f} in revenue."
    })
    
    # Highest defect rate product
    top_defect = df.loc[df['Defect rates'].idxmax()]
    insights["key_findings"].append({
        "title": f"Quality Control Issue: {top_defect['SKU']}",
        "description": f"This product has the highest defect rate at {top_defect['Defect rates']:.2f}%."
    })
    
    # 2. Risks
    # High stock out risk
    stock_out = df[df['Stock levels'] < (0.1 * df['Order quantities'])]
    if not stock_out.empty:
        insights["risks"].append({
            "title": f"{len(stock_out)} SKUs at Risk of Stock-out",
            "description": "Stock levels are critically below 10% of order quantities, threatening fulfillment."
        })
        
    # High delivery delay region
    df['is_delayed'] = df['Shipping times'] > df['Lead times']
    delay_by_region = df.groupby('Location')['is_delayed'].mean()
    worst_region = delay_by_region.idxmax()
    insights["risks"].append({
        "title": f"Delivery Delays in {worst_region}",
        "description": f"{delay_by_region[worst_region]*100:.1f}% of shipments to {worst_region} exceed the lead time."
    })
    
    # 3. Opportunities
    # High shipping cost optimization
    avg_shipping = df['Shipping costs'].mean()
    high_shipping = df[df['Shipping costs'] > avg_shipping * 1.5]
    if not high_shipping.empty:
        insights["opportunities"].append({
            "title": f"Optimize Shipping Costs for {len(high_shipping)} SKUs",
            "description": "Renegotiating carrier rates for these products could significantly improve margins."
        })
        
    # 4. Recommendations
    insights["recommendations"].append({
        "title": f"Supplier Review: {top_defect['Supplier name']}",
        "description": f"Conduct a quality audit with {top_defect['Supplier name']} to address the {top_defect['Defect rates']:.1f}% defect rate on {top_defect['SKU']}."
    })
    insights["recommendations"].append({
        "title": "Inventory Rebalancing",
        "description": f"Prioritize restocking the {len(stock_out)} SKUs identified with high stock-out risk."
    })

    return insights

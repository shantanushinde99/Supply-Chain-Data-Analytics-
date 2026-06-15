from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()
DATA_FILE = "supply_chain_data.csv"

def get_df():
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_dir, DATA_FILE)
    return pd.read_csv(file_path)

@router.get("/suppliers")
def get_supplier_metrics():
    df = get_df()
    # Best supplier / Worst supplier / Risky suppliers based on Defect rates and Lead time
    supplier_group = df.groupby("Supplier name").agg(
        total_revenue=("Revenue generated", "sum"),
        avg_lead_time=("Lead time", "mean"),
        avg_defect_rate=("Defect rates", "mean"),
        total_products=("Number of products sold", "sum")
    ).reset_index()
    
    # Calculate Supplier performance score = (total_revenue/max_rev) * 50 + (1 - avg_defect/max_defect)*30 + (1 - lead_time/max_lead)*20
    max_rev = supplier_group['total_revenue'].max()
    max_def = supplier_group['avg_defect_rate'].max()
    max_lead = supplier_group['avg_lead_time'].max()
    
    supplier_group['performance_score'] = (
        (supplier_group['total_revenue'] / max_rev) * 50 +
        (1 - supplier_group['avg_defect_rate'] / max_def) * 30 +
        (1 - supplier_group['avg_lead_time'] / max_lead) * 20
    ).round(2)
    
    supplier_group = supplier_group.sort_values(by="performance_score", ascending=False)
    
    return {
        "suppliers": supplier_group.to_dict(orient="records"),
        "best_supplier": supplier_group.iloc[0].to_dict(),
        "worst_supplier": supplier_group.iloc[-1].to_dict()
    }

@router.get("/logistics")
def get_logistics_metrics():
    df = get_df()
    
    # Delayed shipment % => Shipping time > Lead time
    total_shipments = len(df)
    delayed = len(df[df['Shipping times'] > df['Lead times']])
    delayed_percent = (delayed / total_shipments) * 100
    
    avg_delivery_time = df['Shipping times'].mean()
    
    # Transportation mode analysis
    transport_group = df.groupby("Transportation modes").agg(
        total_shipping_costs=("Shipping costs", "sum"),
        avg_shipping_times=("Shipping times", "mean")
    ).reset_index()
    
    # Region-wise
    region_group = df.groupby("Location").agg(
        delayed_deliveries=("Shipping times", lambda x: sum(x > df.loc[x.index, 'Lead times'])),
        total_routes=("Routes", "nunique")
    ).reset_index()
    
    return {
        "delayed_percent": delayed_percent,
        "avg_delivery_time": avg_delivery_time,
        "transportation_modes": transport_group.to_dict(orient="records"),
        "regions": region_group.to_dict(orient="records")
    }

@router.get("/inventory")
def get_inventory_metrics():
    df = get_df()
    
    # Stock-out risk: Stock levels < 10% of Order quantities
    df['stock_out_risk'] = df['Stock levels'] < (0.1 * df['Order quantities'])
    stock_out_count = int(df['stock_out_risk'].sum())
    
    # Fast-moving products: Highest 'Number of products sold'
    fast_moving = df.nlargest(5, 'Number of products sold')[['SKU', 'Product type', 'Number of products sold', 'Stock levels']].to_dict(orient="records")
    slow_moving = df.nsmallest(5, 'Number of products sold')[['SKU', 'Product type', 'Number of products sold', 'Stock levels']].to_dict(orient="records")
    
    # Inventory turnover = Number of products sold / avg stock level
    total_sold = df['Number of products sold'].sum()
    avg_stock = df['Stock levels'].mean()
    inventory_turnover = total_sold / avg_stock if avg_stock > 0 else 0
    
    return {
        "stock_out_count": stock_out_count,
        "fast_moving": fast_moving,
        "slow_moving": slow_moving,
        "inventory_turnover": inventory_turnover
    }

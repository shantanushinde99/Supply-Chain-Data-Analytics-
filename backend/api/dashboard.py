from fastapi import APIRouter
import pandas as pd
import os

router = APIRouter()

DATA_FILE = "supply_chain_data.csv"

def get_df():
    # Construct absolute path to ensure reliability
    base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
    file_path = os.path.join(base_dir, DATA_FILE)
    return pd.read_csv(file_path)

@router.get("/kpis")
def get_dashboard_kpis():
    df = get_df()
    
    total_revenue = float(df['Revenue generated'].sum())
    total_cost = float(df['Costs'].sum() + df['Shipping costs'].sum() + df['Manufacturing costs'].sum())
    total_profit = float(total_revenue - total_cost)
    profit_margin = float((total_profit / total_revenue) * 100) if total_revenue > 0 else 0.0
    
    total_orders = int(df['Order quantities'].sum())
    total_customers = int(len(df)) # Assuming each row is an order/customer interaction
    
    # Delivery Success Rate logic: Shipping time <= Lead time (delivery level)
    # Actually, we have 'Lead times' and 'Shipping times'
    success_deliveries = len(df[df['Shipping times'] <= df['Lead times']])
    delivery_success_rate = float((success_deliveries / len(df)) * 100)
    
    return {
        "total_revenue": total_revenue,
        "total_cost": total_cost,
        "total_profit": total_profit,
        "profit_margin": profit_margin,
        "total_orders": total_orders,
        "total_customers": total_customers,
        "delivery_success_rate": delivery_success_rate
    }

@router.get("/revenue_trend")
def get_revenue_trend():
    df = get_df()
    # Since there's no actual date, we use Product type or routes to simulate categories for the 'trend'
    # The requirement asks for 'Revenue trend', 'Profit trend'.
    # Let's aggregate by Location as a proxy for trend or categorical overview
    trend_data = df.groupby("Location")[["Revenue generated", "Costs", "Shipping costs", "Manufacturing costs"]].sum().reset_index()
    trend_data["Total Cost"] = trend_data["Costs"] + trend_data["Shipping costs"] + trend_data["Manufacturing costs"]
    trend_data["Total Profit"] = trend_data["Revenue generated"] - trend_data["Total Cost"]
    
    return trend_data.to_dict(orient="records")

@router.get("/geography")
def get_geography_overview():
    df = get_df()
    geo = df.groupby("Location")["Revenue generated"].sum().reset_index()
    return geo.to_dict(orient="records")

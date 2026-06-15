# Executive Summary: Amdocs Supply Chain Analysis

## The Problem
Amdocs requires a data-driven approach to identify inefficiencies, mitigate risks, and uncover optimization opportunities within the supply chain network using the provided `supply_chain_data.csv`. The goal is to provide a unified, interactive platform for executives to track KPIs, monitor supplier performance, and explore data dynamically without relying on static reports.

## The Analysis & Methodology
The solution ingests the dataset into an automated analytics engine. Using Pandas for deterministic aggregation and a LangChain AI Agent for conversational data retrieval, we modeled the dataset to output KPIs in the following domains:
- **Financial Performance:** Revenue, Costs, Profit Margins.
- **Supplier Health:** A custom "Performance Score" weighing revenue contribution against lead times and defect rates.
- **Logistics Efficiency:** Delivery delay percentages and transportation cost analysis.
- **Inventory Management:** Stock-out risk identification based on order velocity vs. current stock.

## Key Findings
1. **Quality Issues:** Specific SKUs (e.g., SKU1, SKU2) have defect rates exceeding 4.5%, heavily impacting supplier reliability scores for Supplier 1 and Supplier 3.
2. **Delivery Delays:** A significant portion of shipments exceed the agreed-upon manufacturing and supplier lead times, requiring closer monitoring of Air and Road routes.
3. **Inventory Misalignment:** Several fast-moving products carry high stock-out risks where current stock is less than 10% of typical order quantities, threatening revenue.

## AI Approach
The platform integrates an advanced AI layer via LangChain's Pandas DataFrame Agent and Groq. This prevents "hallucinations" by enforcing the LLM to query the data via python REPL directly, retrieving exact metrics and calculating answers dynamically. It also provides 100% transparency by attaching the methodology (code) and supporting data tables to every answer.

## Recommendations
- **Supplier Audits:** Initiate immediate quality assurance audits for suppliers with average defect rates > 3%.
- **Route Optimization:** Transition low-urgency, high-cost Air shipments to Sea/Rail to improve profit margins, given current shipping cost variances.
- **Dynamic Restocking:** Implement automated reorder triggers for SKUs identified as high risk for stock-outs by the AI engine.

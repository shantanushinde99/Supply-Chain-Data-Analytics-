# Technical Documentation

## Data Cleaning & Transformation
- **Null Values:** The dataset contains minimal nulls, but all categorical grouping methods use `.dropna()` before calculating unique constraints to avoid pipeline failures.
- **Data Types:** Handled strictly via Pydantic on the API boundary. The Pandas engine ensures floating-point conversions for cost/revenue metrics to maintain precision.

## Assumptions & Limitations
- **No Temporal Data:** The original `supply_chain_data.csv` lacks intrinsic "Date" or "Timestamp" fields. Consequently, "Revenue Trends" and similar time-series analyses are modeled categorically (e.g., trend by Location or Product Type) rather than chronologically. No synthetic dates were generated per strict instruction.
- **Profit Calculation Strategy:** "Total Profit" is calculated deterministically as `Revenue generated` - (`Costs` + `Manufacturing costs` + `Shipping costs`). 
- **Delivery Success Rate Strategy:** Calculated by checking if `Shipping times <= Lead times`.
- **Customer Volume:** Without a distinct `Customer ID` field, `Total Customers` is proxied by the total number of distinct rows/orders in the dataset.

## Biases
- **Geographic Bias:** Results highly skew toward the listed Indian metros (Mumbai, Kolkata, Delhi, Bangalore, Chennai) which may not represent global supply chain models.
- **Categorical Bias:** The dataset only focuses on 'haircare', 'skincare', and 'cosmetics'. AI recommendations generated are strictly localized to these cosmetic niches and cannot be universally extrapolated.

## AI Design Architecture
The Conversational AI uses a **RAG-like architecture with a DataFrame context**:
1. **Engine:** `langchain_experimental.agents.create_pandas_dataframe_agent`
2. **LLM:** Groq (`llama3-70b-8192`) running at `temperature=0` to eliminate creative hallucinations.
3. **Execution Guardrails:** The agent is instructed to write Python Pandas code to retrieve answers. The code output (`methodology`) and the resulting DataFrame subset (`supporting_data`) are surfaced to the UI.
4. **Failure State:** If the LLM generates an invalid query or cannot find the data, the API catches the exception and gracefully returns: *"I cannot determine this from the available dataset."*

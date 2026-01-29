"""
==============================================================================
REMA Backend - ROI Calculator Tool
==============================================================================

WHAT IT DOES:
    LLM tool for calculating investment return on property.
    Provides year-by-year breakdown of ROI.

HOW IT WORKS:
    - Takes purchase price, expected rent, and investment period
    - Calculates cumulative rental income
    - Projects property appreciation
    - Returns total ROI percentage

INPUTS:
    purchase_price, monthly_rent, years, appreciation_rate, expenses_percent

OUTPUTS:
    Year-by-year ROI breakdown with totals

==============================================================================
"""


def calculate_roi_tool(
    purchase_price: int,
    monthly_rent: int,
    years: int = 10,
    annual_appreciation: float = 0.05,
    expenses_percent: float = 0.20
) -> dict:
    """
    Calculate ROI with year-by-year breakdown.
    
    Args:
        purchase_price: Initial property purchase price in JOD
        monthly_rent: Expected monthly rental income in JOD
        years: Investment period in years
        annual_appreciation: Annual property value increase (default 5%)
        expenses_percent: Percentage of rent going to expenses (default 20%)
    
    Returns:
        ROI breakdown with yearly data and summary
    """
    results = []
    cumulative_income = 0
    property_value = purchase_price
    
    for year in range(1, years + 1):
                                        
        annual_rent = monthly_rent * 12 * (1 - expenses_percent)
        cumulative_income += annual_rent
        
                               
        property_value *= (1 + annual_appreciation)
        
                      
        capital_gain = property_value - purchase_price
        total_return = cumulative_income + capital_gain
        roi_percent = (total_return / purchase_price) * 100
        
        results.append({
            "year": year,
            "property_value": round(property_value),
            "yearly_rent": round(annual_rent),
            "cumulative_income": round(cumulative_income),
            "capital_gain": round(capital_gain),
            "total_return": round(total_return),
            "roi_percent": round(roi_percent, 2)
        })
    
    final = results[-1]
    
    return {
        "success": True,
        "input": {
            "purchase_price": purchase_price,
            "monthly_rent": monthly_rent,
            "years": years,
            "appreciation_rate": f"{annual_appreciation * 100:.1f}%",
            "expenses": f"{expenses_percent * 100:.0f}%"
        },
        "yearly_breakdown": results,
        "summary": {
            "final_property_value": final["property_value"],
            "total_rental_income": final["cumulative_income"],
            "total_capital_gain": final["capital_gain"],
            "total_return": final["total_return"],
            "total_roi": f"{final['roi_percent']:.2f}%"
        },
        "message": f"After {years} years, your projected total ROI is {final['roi_percent']:.2f}%",
        "display_type": "roi_chart"
    }

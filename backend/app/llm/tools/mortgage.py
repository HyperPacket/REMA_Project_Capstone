"""
==============================================================================
REMA Backend - Mortgage Calculator Tool
==============================================================================

WHAT IT DOES:
    LLM tool for calculating monthly mortgage payments.
    Provides full breakdown including total interest.

HOW IT WORKS:
    - Uses standard amortization formula
    - Supports custom down payment, rate, and term
    - Returns monthly payment with full breakdown

INPUTS:
    property_price, down_payment_percent, annual_rate, years

OUTPUTS:
    Mortgage breakdown with monthly payment and totals

==============================================================================
"""


def calculate_mortgage_tool(
    property_price: int,
    down_payment_percent: float = 0.20,
    annual_rate: float = 0.085,                           
    years: int = 20
) -> dict:
    """
    Calculate mortgage with full breakdown.
    
    Args:
        property_price: Property price in JOD
        down_payment_percent: Down payment as decimal (default 20%)
        annual_rate: Annual interest rate as decimal (default 8.5%)
        years: Loan term in years (default 20)
    
    Returns:
        Mortgage breakdown with monthly payment
    """
    down_payment = int(property_price * down_payment_percent)
    loan_amount = property_price - down_payment
    monthly_rate = annual_rate / 12
    num_payments = years * 12
    
                                   
    if monthly_rate > 0:
        monthly_payment = loan_amount * (
            monthly_rate * (1 + monthly_rate)**num_payments
        ) / ((1 + monthly_rate)**num_payments - 1)
    else:
        monthly_payment = loan_amount / num_payments
    
    total_paid = monthly_payment * num_payments
    total_interest = total_paid - loan_amount
    
    return {
        "success": True,
        "breakdown": {
            "property_price": property_price,
            "down_payment": down_payment,
            "down_payment_percent": f"{int(down_payment_percent * 100)}%",
            "loan_amount": loan_amount,
            "annual_rate": f"{annual_rate * 100:.1f}%",
            "term_years": years,
            "num_payments": num_payments,
            "monthly_payment": round(monthly_payment),
            "total_paid": round(total_paid),
            "total_interest": round(total_interest)
        },
        "summary": f"Monthly payment: {round(monthly_payment):,} JOD for {years} years",
        "message": f"For a {property_price:,} JOD property with {int(down_payment_percent * 100)}% down, "
                   f"your monthly payment would be approximately {round(monthly_payment):,} JOD.",
        "display_type": "mortgage_breakdown"
    }

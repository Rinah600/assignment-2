package com.microfinance.loan.rules;

import com.microfinance.loan.model.LoanApplication;

/** Limits the principal to a number of months of income. Example of a rule added without changing others. */
public class LoanAmountCapRule implements EligibilityRule {

    private final double maxMonthsOfIncome;

    public LoanAmountCapRule(double maxMonthsOfIncome) {
        if (maxMonthsOfIncome <= 0) {
            throw new IllegalArgumentException("maxMonthsOfIncome must be positive.");
        }
        this.maxMonthsOfIncome = maxMonthsOfIncome;
    }

    @Override
    public String name() {
        return "Loan amount cap";
    }

    @Override
    public RuleResult evaluate(LoanApplication application) {
        double cap = application.monthlyIncome() * maxMonthsOfIncome;
        String detail = String.format("Requested %.0f; cap is %.0f (%.0f months of income).",
                application.requestedAmount(), cap, maxMonthsOfIncome);
        return application.requestedAmount() <= cap ? RuleResult.pass(name(), detail) : RuleResult.fail(name(), detail);
    }
}

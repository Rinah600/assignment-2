package com.microfinance.loan.rules;

import com.microfinance.loan.model.LoanApplication;

/** Requires income to cover expenses by a minimum multiple, so the applicant has a safety margin. */
public class IncomeToExpenseRule implements EligibilityRule {

    private final double minRatio;

    public IncomeToExpenseRule(double minRatio) {
        if (minRatio <= 0) {
            throw new IllegalArgumentException("minRatio must be positive.");
        }
        this.minRatio = minRatio;
    }

    @Override
    public String name() {
        return "Income-to-expense ratio";
    }

    @Override
    public RuleResult evaluate(LoanApplication application) {
        // No expenses means income trivially covers them.
        if (application.monthlyExpenses() == 0) {
            return RuleResult.pass(name(), "No monthly expenses declared, so income covers them.");
        }
        double ratio = application.monthlyIncome() / application.monthlyExpenses();
        String detail = String.format("Income is %.2f times expenses (minimum required: %.2f).", ratio, minRatio);
        return ratio >= minRatio ? RuleResult.pass(name(), detail) : RuleResult.fail(name(), detail);
    }
}

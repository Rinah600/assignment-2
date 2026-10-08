package com.microfinance.loan.rules;

import com.microfinance.loan.model.LoanApplication;

/** Caps total monthly debt payments, including the new loan, as a share of income. */
public class DebtObligationRule implements EligibilityRule {

    private final double maxDebtToIncomeRatio;

    public DebtObligationRule(double maxDebtToIncomeRatio) {
        if (maxDebtToIncomeRatio <= 0 || maxDebtToIncomeRatio > 1) {
            throw new IllegalArgumentException("maxDebtToIncomeRatio must be between 0 (exclusive) and 1.");
        }
        this.maxDebtToIncomeRatio = maxDebtToIncomeRatio;
    }

    @Override
    public String name() {
        return "Existing debt obligations";
    }

    @Override
    public RuleResult evaluate(LoanApplication application) {
        double installment = application.monthlyInstallment();
        double totalDebt = application.existingMonthlyDebt() + installment;
        if (application.monthlyIncome() == 0) {
            return RuleResult.fail(name(), "No income declared, so any debt payment is unaffordable.");
        }
        double ratio = totalDebt / application.monthlyIncome();
        String detail = String.format(
                "Existing debt %.0f + new installment %.0f = %.0f per month, which is %.0f%% of income (maximum: %.0f%%).",
                application.existingMonthlyDebt(), installment, totalDebt, ratio * 100, maxDebtToIncomeRatio * 100);
        return ratio <= maxDebtToIncomeRatio ? RuleResult.pass(name(), detail) : RuleResult.fail(name(), detail);
    }
}

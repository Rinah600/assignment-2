package com.microfinance.loan.rules;

import com.microfinance.loan.model.EmploymentStatus;
import com.microfinance.loan.model.LoanApplication;
import java.util.Set;

/** Requires an accepted employment status held for a minimum number of months. */
public class EmploymentStatusRule implements EligibilityRule {

    private final Set<EmploymentStatus> allowedStatuses;
    private final int minMonths;

    public EmploymentStatusRule(Set<EmploymentStatus> allowedStatuses, int minMonths) {
        if (allowedStatuses == null || allowedStatuses.isEmpty()) {
            throw new IllegalArgumentException("At least one allowed employment status is required.");
        }
        if (minMonths < 0) {
            throw new IllegalArgumentException("minMonths cannot be negative.");
        }
        this.allowedStatuses = Set.copyOf(allowedStatuses);
        this.minMonths = minMonths;
    }

    @Override
    public String name() {
        return "Employment status";
    }

    @Override
    public RuleResult evaluate(LoanApplication application) {
        if (!allowedStatuses.contains(application.employmentStatus())) {
            return RuleResult.fail(name(), String.format(
                    "Status %s is not accepted (accepted: %s).", application.employmentStatus(), allowedStatuses));
        }
        if (application.monthsInCurrentEmployment() < minMonths) {
            return RuleResult.fail(name(), String.format(
                    "Only %d months in current work; at least %d required.",
                    application.monthsInCurrentEmployment(), minMonths));
        }
        return RuleResult.pass(name(), String.format(
                "%s for %d months (minimum: %d).",
                application.employmentStatus(), application.monthsInCurrentEmployment(), minMonths));
    }
}

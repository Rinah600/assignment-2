package com.microfinance.loan.engine;

import com.microfinance.loan.model.LoanApplication;
import com.microfinance.loan.rules.RuleResult;
import java.util.List;

/**
 * Full explanation of an assessment: the application, every rule result, and the decision.
 * The decision is derived from the results, so the two can never disagree.
 */
public record AssessmentReport(LoanApplication application, List<RuleResult> results) {

    public AssessmentReport {
        results = List.copyOf(results); // defensive copy keeps the record immutable
    }

    /** Approved only if every rule passed. */
    public Decision decision() {
        return results.stream().allMatch(RuleResult::passed) ? Decision.APPROVED : Decision.REJECTED;
    }

    /** Renders the report as text for printing or saving. */
    public String toText() {
        StringBuilder sb = new StringBuilder();
        sb.append("=== LOAN ASSESSMENT REPORT ===\n");
        sb.append(String.format("Applicant : %s%n", application.applicantName()));
        sb.append(String.format("Request   : %.0f over %d months at %.1f%% a year (installment %.0f)%n",
                application.requestedAmount(), application.termMonths(),
                application.annualInterestRate() * 100, application.monthlyInstallment()));
        sb.append("\nRule results:\n");
        for (RuleResult r : results) {
            sb.append(String.format("  [%s] %s: %s%n", r.passed() ? "PASS" : "FAIL", r.ruleName(), r.explanation()));
        }
        sb.append(String.format("%nDECISION: %s%n", decision()));
        if (decision() == Decision.REJECTED) {
            sb.append("Reasons for rejection:\n");
            results.stream().filter(r -> !r.passed())
                    .forEach(r -> sb.append("  - ").append(r.ruleName()).append(": ").append(r.explanation()).append('\n'));
        } else {
            sb.append("All eligibility rules were satisfied.\n");
        }
        return sb.toString();
    }
}

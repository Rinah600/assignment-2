package com.microfinance.loan.engine;

import com.microfinance.loan.model.LoanApplication;
import com.microfinance.loan.rules.EligibilityRule;
import com.microfinance.loan.rules.RuleResult;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

/**
 * Runs every registered rule against an application. The engine only knows the
 * {@link EligibilityRule} interface, so any new rule works without changing this class.
 */
public class LoanAssessmentEngine {

    private final List<EligibilityRule> rules;

    public LoanAssessmentEngine(List<EligibilityRule> rules) {
        Objects.requireNonNull(rules, "rules must not be null");
        if (rules.isEmpty()) {
            throw new IllegalArgumentException("At least one eligibility rule is required.");
        }
        this.rules = List.copyOf(rules);
    }

    /**
     * Evaluates all rules (no early exit, so the report is complete).
     * A rule that crashes is treated as a failure, which is the safe choice for lending.
     */
    public AssessmentReport assess(LoanApplication application) {
        Objects.requireNonNull(application, "application must not be null");
        List<RuleResult> results = new ArrayList<>();
        for (EligibilityRule rule : rules) {
            try {
                results.add(rule.evaluate(application)); // polymorphic call: each rule decides for itself
            } catch (RuntimeException e) {
                results.add(RuleResult.fail(rule.name(), "Rule could not be evaluated: " + e.getMessage()));
            }
        }
        return new AssessmentReport(application, results);
    }
}

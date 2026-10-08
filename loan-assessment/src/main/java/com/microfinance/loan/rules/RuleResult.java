package com.microfinance.loan.rules;

/**
 * Outcome of one rule for one application.
 *
 * @param ruleName    name of the rule that produced this result
 * @param passed      true if the applicant satisfies the rule
 * @param explanation plain-language reason, shown in the report
 */
public record RuleResult(String ruleName, boolean passed, String explanation) {

    public static RuleResult pass(String ruleName, String explanation) {
        return new RuleResult(ruleName, true, explanation);
    }

    public static RuleResult fail(String ruleName, String explanation) {
        return new RuleResult(ruleName, false, explanation);
    }
}

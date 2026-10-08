package com.microfinance.loan.rules;

import com.microfinance.loan.model.LoanApplication;

/**
 * One business rule. To add a new rule, create a class that implements this interface
 * and register it with the engine. No existing class has to change.
 */
public interface EligibilityRule {

    /** Short, human-readable name shown in reports. */
    String name();

    /** Checks the application and explains the result. Must not modify the application. */
    RuleResult evaluate(LoanApplication application);
}

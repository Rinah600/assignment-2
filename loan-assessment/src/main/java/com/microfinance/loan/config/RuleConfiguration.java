package com.microfinance.loan.config;

import com.microfinance.loan.model.EmploymentStatus;
import com.microfinance.loan.rules.DebtObligationRule;
import com.microfinance.loan.rules.EligibilityRule;
import com.microfinance.loan.rules.EmploymentStatusRule;
import com.microfinance.loan.rules.IncomeToExpenseRule;
import com.microfinance.loan.rules.LoanAmountCapRule;
import java.io.IOException;
import java.io.Reader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.EnumSet;
import java.util.List;
import java.util.Properties;
import java.util.Set;

/** Reads thresholds from a properties file and builds the rule objects. Missing keys use safe defaults. */
public class RuleConfiguration {

    private final Properties props;

    private RuleConfiguration(Properties props) {
        this.props = props;
    }

    /** Loads a configuration file. */
    public static RuleConfiguration fromFile(Path path) {
        Properties props = new Properties();
        try (Reader reader = Files.newBufferedReader(path)) {
            props.load(reader);
        } catch (IOException e) {
            throw new ConfigurationException("Cannot read configuration file: " + path, e);
        }
        return new RuleConfiguration(props);
    }

    /** Configuration made only of default values. */
    public static RuleConfiguration defaults() {
        return new RuleConfiguration(new Properties());
    }

    /** Builds the rules in the order they appear in reports. */
    public List<EligibilityRule> buildRules() {
        List<EligibilityRule> rules = new ArrayList<>();
        try {
            rules.add(new IncomeToExpenseRule(number("rule.incomeToExpense.minRatio", 1.5)));
            rules.add(new EmploymentStatusRule(statuses("rule.employment.allowedStatuses", "EMPLOYED,SELF_EMPLOYED"),
                    (int) number("rule.employment.minMonths", 6)));
            rules.add(new DebtObligationRule(number("rule.debt.maxDebtToIncomeRatio", 0.40)));
            rules.add(new LoanAmountCapRule(number("rule.loanCap.maxMonthsOfIncome", 6)));
        } catch (IllegalArgumentException e) { // thrown by rule constructors for out-of-range values
            throw new ConfigurationException("Invalid rule configuration: " + e.getMessage(), e);
        }
        return rules;
    }

    private double number(String key, double fallback) {
        String raw = props.getProperty(key);
        if (raw == null) {
            return fallback;
        }
        try {
            return Double.parseDouble(raw.trim());
        } catch (NumberFormatException e) {
            throw new ConfigurationException("Value for '" + key + "' is not a number: " + raw, e);
        }
    }

    private Set<EmploymentStatus> statuses(String key, String fallback) {
        Set<EmploymentStatus> result = EnumSet.noneOf(EmploymentStatus.class);
        for (String token : props.getProperty(key, fallback).split(",")) {
            try {
                result.add(EmploymentStatus.valueOf(token.trim().toUpperCase()));
            } catch (IllegalArgumentException e) {
                throw new ConfigurationException("Unknown employment status in '" + key + "': " + token.trim(), e);
            }
        }
        return result;
    }
}

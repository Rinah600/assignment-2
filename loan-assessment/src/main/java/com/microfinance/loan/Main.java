package com.microfinance.loan;

import com.microfinance.loan.config.ConfigurationException;
import com.microfinance.loan.config.RuleConfiguration;
import com.microfinance.loan.engine.LoanAssessmentEngine;
import com.microfinance.loan.model.EmploymentStatus;
import com.microfinance.loan.model.InvalidApplicationException;
import com.microfinance.loan.model.LoanApplication;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

/** Demo entry point: assesses three sample applicants. Optional argument: path to a rules file. */
public class Main {

    public static void main(String[] args) {
        try {
            Path configPath = Path.of(args.length > 0 ? args[0] : "config/loan-rules.properties");
            RuleConfiguration config = Files.exists(configPath)
                    ? RuleConfiguration.fromFile(configPath)
                    : RuleConfiguration.defaults();
            System.out.println(Files.exists(configPath)
                    ? "Using rules from " + configPath
                    : "Config file not found, using default thresholds.");

            LoanAssessmentEngine engine = new LoanAssessmentEngine(config.buildRules());

            List<LoanApplication> applicants = List.of(
                    // Strong applicant: should be approved.
                    new LoanApplication("Amina Nakato", 1_500_000, 700_000, 100_000,
                            EmploymentStatus.EMPLOYED, 24, 3_000_000, 12, 0.24),
                    // Weak applicant: fails several rules.
                    new LoanApplication("Peter Okello", 800_000, 700_000, 300_000,
                            EmploymentStatus.UNEMPLOYED, 0, 5_000_000, 12, 0.24),
                    // Borderline applicant: passes income and employment, fails debt load.
                    new LoanApplication("Grace Atim", 1_200_000, 500_000, 400_000,
                            EmploymentStatus.SELF_EMPLOYED, 18, 4_000_000, 12, 0.24));

            for (LoanApplication application : applicants) {
                System.out.println(engine.assess(application).toText());
            }
        } catch (ConfigurationException | InvalidApplicationException e) {
            System.err.println("Error: " + e.getMessage());
            System.exit(1);
        }
    }
}

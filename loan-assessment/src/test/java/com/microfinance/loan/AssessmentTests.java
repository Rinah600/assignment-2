package com.microfinance.loan;

import com.microfinance.loan.engine.AssessmentReport;
import com.microfinance.loan.engine.Decision;
import com.microfinance.loan.engine.LoanAssessmentEngine;
import com.microfinance.loan.model.EmploymentStatus;
import com.microfinance.loan.model.InvalidApplicationException;
import com.microfinance.loan.model.LoanApplication;
import com.microfinance.loan.rules.*;
import java.util.List;

/** Dependency-free tests: run with the commands in the README. Exits with code 1 on any failure. */
public class AssessmentTests {

    private static int failures = 0;

    public static void main(String[] args) {
        LoanAssessmentEngine engine = new LoanAssessmentEngine(List.of(
                new IncomeToExpenseRule(1.5),
                new EmploymentStatusRule(java.util.Set.of(EmploymentStatus.EMPLOYED), 6),
                new DebtObligationRule(0.40)));

        check("good applicant is approved",
                engine.assess(app(1_500_000, 700_000, 100_000, EmploymentStatus.EMPLOYED, 24, 3_000_000)).decision() == Decision.APPROVED);

        check("low income-to-expense is rejected",
                engine.assess(app(800_000, 700_000, 0, EmploymentStatus.EMPLOYED, 24, 500_000)).decision() == Decision.REJECTED);

        check("unaccepted employment status is rejected",
                engine.assess(app(1_500_000, 700_000, 0, EmploymentStatus.STUDENT, 24, 1_000_000)).decision() == Decision.REJECTED);

        check("too few months employed is rejected",
                engine.assess(app(1_500_000, 700_000, 0, EmploymentStatus.EMPLOYED, 2, 1_000_000)).decision() == Decision.REJECTED);

        check("heavy existing debt is rejected",
                engine.assess(app(1_500_000, 700_000, 600_000, EmploymentStatus.EMPLOYED, 24, 3_000_000)).decision() == Decision.REJECTED);

        AssessmentReport rejected = engine.assess(app(800_000, 700_000, 0, EmploymentStatus.STUDENT, 0, 500_000));
        check("report lists every rule", rejected.results().size() == 3);
        check("report text names a rejection reason", rejected.toText().contains("Reasons for rejection"));

        // Extensibility: a brand-new rule defined here, without editing any existing rule class.
        EligibilityRule alwaysFails = new EligibilityRule() {
            public String name() { return "Test rule"; }
            public RuleResult evaluate(LoanApplication a) { return RuleResult.fail(name(), "forced failure"); }
        };
        LoanAssessmentEngine extended = new LoanAssessmentEngine(List.of(new IncomeToExpenseRule(1.5), alwaysFails));
        check("new rule plugs in without changing others",
                extended.assess(app(1_500_000, 700_000, 0, EmploymentStatus.EMPLOYED, 24, 1_000_000)).decision() == Decision.REJECTED);

        // A rule that throws must fail safe.
        EligibilityRule crashing = new EligibilityRule() {
            public String name() { return "Crashing rule"; }
            public RuleResult evaluate(LoanApplication a) { throw new IllegalStateException("boom"); }
        };
        check("crashing rule counts as failure",
                new LoanAssessmentEngine(List.of(crashing)).assess(app(1, 1, 0, EmploymentStatus.EMPLOYED, 1, 1)).decision() == Decision.REJECTED);

        check("negative income is rejected at construction", throwsInvalid(() -> app(-1, 1, 0, EmploymentStatus.EMPLOYED, 1, 1)));
        check("zero-interest installment is principal / term",
                Math.abs(new LoanApplication("A", 1, 1, 0, EmploymentStatus.EMPLOYED, 1, 1200, 12, 0).monthlyInstallment() - 100) < 1e-9);

        System.out.println(failures == 0 ? "\nAll tests passed." : "\n" + failures + " test(s) FAILED.");
        System.exit(failures == 0 ? 0 : 1);
    }

    private static LoanApplication app(double income, double expenses, double debt, EmploymentStatus status, int months, double amount) {
        return new LoanApplication("Test Applicant", income, expenses, debt, status, months, amount, 12, 0.24);
    }

    private static boolean throwsInvalid(Runnable action) {
        try { action.run(); return false; } catch (InvalidApplicationException e) { return true; }
    }

    private static void check(String name, boolean condition) {
        System.out.println((condition ? "PASS  " : "FAIL  ") + name);
        if (!condition) failures++;
    }
}

# Microfinance Loan Assessment Engine

A Java 17+ application that checks a loan application against configurable business rules and returns a report explaining why it was approved or rejected.

**Code walkthrough video (5 min):** ADD_YOUR_PUBLIC_VIDEO_URL_HERE

## How to run
Requires JDK 17 or newer (`javac -version` to check). From this folder:

**Windows (PowerShell)**
```powershell
mkdir out
javac -d out (Get-ChildItem -Recurse src -Filter *.java).FullName
java -cp out com.microfinance.loan.Main
java -cp out com.microfinance.loan.AssessmentTests
```

**Mac / Linux**
```bash
mkdir -p out
javac -d out $(find src -name '*.java')
java -cp out com.microfinance.loan.Main
java -cp out com.microfinance.loan.AssessmentTests
```
`Main` assesses three sample applicants. Pass your own rules file as the first argument, for example `java -cp out com.microfinance.loan.Main my-rules.properties`. Thresholds live in `config/loan-rules.properties`; edit and re-run, no recompiling.

## Project structure
| Package | Contents |
|---|---|
| `model` | `LoanApplication` (validated record), `EmploymentStatus`, `InvalidApplicationException` |
| `rules` | `EligibilityRule` interface, `RuleResult`, and four rule classes |
| `engine` | `LoanAssessmentEngine`, `AssessmentReport`, `Decision` |
| `config` | `RuleConfiguration` (reads the properties file), `ConfigurationException` |

## Design decisions
- **Open/closed principle.** Every rule implements `EligibilityRule`. The engine only knows that interface, so a new rule is a new class added to the list, with no change to the engine or to existing rules. `LoanAmountCapRule` was added this way, and the tests define another rule inline to prove it.
- **Polymorphism.** The engine calls `rule.evaluate(application)` and each rule decides for itself.
- **Explainable decisions.** Each rule returns a `RuleResult` with a plain-language explanation. The report lists every result and then the reasons for any rejection.
- **No early exit.** All rules always run, so a rejected applicant sees every problem at once.
- **Decision derived, not stored.** `AssessmentReport.decision()` is computed from the results, so the decision and the explanations cannot disagree.
- **Immutability.** The application, results and report are records with defensive copies.
- **Fail safe.** If a rule throws, the engine records it as a failed rule instead of crashing or silently approving.
- **Validation in one place.** `LoanApplication` rejects impossible data at construction, so rules can trust their input.
- **Configuration.** Thresholds come from a properties file with safe defaults. Bad values raise `ConfigurationException` with a clear message.

## Rules implemented
1. **Income-to-expense ratio:** income must be at least 1.5 times expenses (configurable).
2. **Employment status:** status must be EMPLOYED or SELF_EMPLOYED, held for at least 6 months (configurable).
3. **Existing debt obligations:** existing monthly debt plus the new installment must be at most 40% of income (configurable).
4. **Loan amount cap (extension example):** the amount must be at most 6 months of income.

## Assumptions
- Applicants are approved only if **all** rules pass.
- Amounts are in one currency (for example UGX); income, expenses and debt are monthly.
- The installment uses the standard amortisation formula with a fixed interest rate.
- `double` is enough for these ratio checks. A real ledger would use `BigDecimal`.
- Data comes from code for the demo; there is no database or user interface.

## Adding a new rule
```java
public class MinimumAgeRule implements EligibilityRule {
    public String name() { return "Minimum age"; }
    public RuleResult evaluate(LoanApplication a) { /* check and return RuleResult.pass/fail */ }
}
```
Then add `new MinimumAgeRule()` to the list passed to `LoanAssessmentEngine`.

## video
Public URL: https://youtu.be/DWFJ0WHJfSA

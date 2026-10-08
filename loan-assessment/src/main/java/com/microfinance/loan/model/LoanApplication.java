package com.microfinance.loan.model;

import java.util.Objects;

/**
 * Immutable description of a loan request. All money values are in the same currency
 * (for example UGX) and are monthly unless stated otherwise.
 *
 * @param applicantName             full name, used in reports
 * @param monthlyIncome             take-home income per month
 * @param monthlyExpenses           living expenses per month
 * @param existingMonthlyDebt       total repayments on existing loans per month
 * @param employmentStatus          current employment situation
 * @param monthsInCurrentEmployment months in the current job or business
 * @param requestedAmount           principal being requested
 * @param termMonths                repayment period in months
 * @param annualInterestRate        yearly interest rate as a fraction (0.24 means 24%)
 */
public record LoanApplication(
        String applicantName,
        double monthlyIncome,
        double monthlyExpenses,
        double existingMonthlyDebt,
        EmploymentStatus employmentStatus,
        int monthsInCurrentEmployment,
        double requestedAmount,
        int termMonths,
        double annualInterestRate) {

    /** Validates the data once, so every rule can trust it. */
    public LoanApplication {
        if (applicantName == null || applicantName.isBlank()) {
            throw new InvalidApplicationException("Applicant name is required.");
        }
        Objects.requireNonNull(employmentStatus, "Employment status is required.");
        if (monthlyIncome < 0 || monthlyExpenses < 0 || existingMonthlyDebt < 0) {
            throw new InvalidApplicationException("Income, expenses and debt cannot be negative.");
        }
        if (monthsInCurrentEmployment < 0) {
            throw new InvalidApplicationException("Months in employment cannot be negative.");
        }
        if (requestedAmount <= 0) {
            throw new InvalidApplicationException("Requested amount must be greater than zero.");
        }
        if (termMonths <= 0) {
            throw new InvalidApplicationException("Loan term must be at least one month.");
        }
        if (annualInterestRate < 0) {
            throw new InvalidApplicationException("Interest rate cannot be negative.");
        }
    }

    /** Fixed monthly repayment using the standard amortisation formula. */
    public double monthlyInstallment() {
        double monthlyRate = annualInterestRate / 12.0;
        if (monthlyRate == 0) {
            return requestedAmount / termMonths;
        }
        return requestedAmount * monthlyRate / (1 - Math.pow(1 + monthlyRate, -termMonths));
    }
}

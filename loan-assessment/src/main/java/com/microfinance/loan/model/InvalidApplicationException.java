package com.microfinance.loan.model;

/** Thrown when a loan application contains data that cannot be valid (for example, negative income). */
public class InvalidApplicationException extends RuntimeException {
    public InvalidApplicationException(String message) {
        super(message);
    }
}

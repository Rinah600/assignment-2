package com.microfinance.loan.config;

/** Thrown when the rules configuration file is missing, unreadable, or has an invalid value. */
public class ConfigurationException extends RuntimeException {
    public ConfigurationException(String message) {
        super(message);
    }

    public ConfigurationException(String message, Throwable cause) {
        super(message, cause);
    }
}

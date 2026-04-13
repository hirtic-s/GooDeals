package com.goodeal.exception;

/**
 * Thrown when a requested resource (e.g., Product) is not found in the database.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " with id " + id + " was not found");
    }
}

package com.app.deskly.util;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class CpfValidatorTest {

    @Test
    void shouldReturnTrueForValidCpf() {
        assertTrue(CpfValidator.isValid("11144477735"));
        assertTrue(CpfValidator.isValid("12345678909"));
    }

    @Test
    void shouldReturnFalseForNullCpf() {
        assertFalse(CpfValidator.isValid(null));
    }

    @Test
    void shouldReturnFalseForCpfWithLessThan11Digits() {
        assertFalse(CpfValidator.isValid("1234567890"));
        assertFalse(CpfValidator.isValid("123"));
    }

    @Test
    void shouldReturnFalseForCpfWithMoreThan11Digits() {
        assertFalse(CpfValidator.isValid("123456789012"));
    }

    @Test
    void shouldReturnFalseForCpfWithNonNumericCharacters() {
        assertFalse(CpfValidator.isValid("1234567890a"));
        assertFalse(CpfValidator.isValid("111.444.777-35"));
    }

    @Test
    void shouldReturnFalseForCpfWithAllSameDigits() {
        assertFalse(CpfValidator.isValid("11111111111"));
        assertFalse(CpfValidator.isValid("22222222222"));
        assertFalse(CpfValidator.isValid("00000000000"));
    }

    @Test
    void shouldReturnFalseForInvalidCpfWithWrongCheckDigits() {
        assertFalse(CpfValidator.isValid("11144477736"));
        assertFalse(CpfValidator.isValid("12345678901"));
    }

    @Test
    void shouldReturnFalseForEmptyString() {
        assertFalse(CpfValidator.isValid(""));
    }
}
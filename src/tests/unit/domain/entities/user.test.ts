import { isValidEmail, isValidCpf, isStrongPassword } from '../../../../domain/entities/user';

describe('User Entity Validation', () => {
  describe('isValidEmail', () => {
    it('should return true for valid emails', () => {
      expect(isValidEmail('test@example.com')).toBe(true);
      expect(isValidEmail('user.name@domain.co')).toBe(true);
      expect(isValidEmail('user+tag@example.org')).toBe(true);
    });

    it('should return false for invalid emails', () => {
      expect(isValidEmail('')).toBe(false);
      expect(isValidEmail('invalid')).toBe(false);
      expect(isValidEmail('invalid@')).toBe(false);
      expect(isValidEmail('@domain.com')).toBe(false);
      expect(isValidEmail('user@.com')).toBe(false);
    });
  });

  describe('isValidCpf', () => {
    it('should return true for valid CPFs', () => {
      expect(isValidCpf('12345678901')).toBe(true);
      expect(isValidCpf('111.222.333-44')).toBe(true);
    });

    it('should return false for invalid CPFs', () => {
      expect(isValidCpf('')).toBe(false);
      expect(isValidCpf('123')).toBe(false);
      expect(isValidCpf('12345')).toBe(false);
      expect(isValidCpf('1234567890')).toBe(false);
      expect(isValidCpf('123456789012')).toBe(false);
    });
  });

  describe('isStrongPassword', () => {
    it('should return true for strong passwords', () => {
      expect(isStrongPassword('Password123')).toBe(true);
      expect(isStrongPassword('abcd1234')).toBe(true);
      expect(isStrongPassword('p@ssw0rd')).toBe(true);
    });

    it('should return false for weak passwords', () => {
      expect(isStrongPassword('')).toBe(false);
      expect(isStrongPassword('pass')).toBe(false);
      expect(isStrongPassword('password')).toBe(false);
      expect(isStrongPassword('12345678')).toBe(false);
      expect(isStrongPassword('ABCDEFGH')).toBe(false);
    });
  });
});
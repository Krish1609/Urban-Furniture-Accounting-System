export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isNonEmptyString(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function isNonNegativeNumber(value) {
  return typeof value === 'number' && Number.isFinite(value) && value >= 0;
}

export function isValidEmail(value) {
  return typeof value === 'string' && EMAIL_PATTERN.test(value);
}

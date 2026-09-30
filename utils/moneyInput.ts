const centsFromDisplayValue = (value: string) => value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

export const formatMoneyFromCents = (rawCents: string) => {
  const cents = rawCents.replace(/\D/g, '').replace(/^0+(?=\d)/, '') || '0';
  const padded = cents.padStart(3, '0');
  const whole = padded.slice(0, -2).replace(/^0+(?=\d)/, '') || '0';
  const decimal = padded.slice(-2);

  return `${whole}.${decimal}`;
};

export const appendMoneyDigit = (value: string, key: string, maxDigits = 11) => {
  if (!/^\d$/.test(key)) return value || '0.00';

  const current = centsFromDisplayValue(value);
  const next = `${current}${key}`.replace(/^0+(?=\d)/, '');

  return formatMoneyFromCents(next.slice(0, maxDigits));
};

export const deleteMoneyDigit = (value: string) => {
  const current = centsFromDisplayValue(value);
  return formatMoneyFromCents(current.slice(0, -1));
};

export const normalizeMoneyDisplay = (value: string | number | null | undefined) => {
  const numericValue = Number(value || 0);
  if (!Number.isFinite(numericValue)) return '0.00';
  return numericValue.toFixed(2);
};

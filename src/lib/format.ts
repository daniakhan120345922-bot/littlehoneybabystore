/** Format amount as Pakistani Rupees (prices stored in PKR) */
export function formatCurrency(amount: number): string {
  const value = roundMoney(amount);
  return `Rs ${value.toLocaleString("en-PK", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

/** Round to two decimal places for monetary calculations */
export function roundMoney(amount: number): number {
  return Math.round(amount * 100) / 100;
}

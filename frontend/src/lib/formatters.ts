/**
 * Currency and date formatting utilities for RealEstateIQ
 */

export function formatINR(amount: number): string {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return "₹ 0";
  }
  // Standard Indian numbering system (lakhs & crores)
  const formatted = new Intl.NumberFormat("en-IN", {
    maximumFractionDigits: 0,
  }).format(Math.round(amount));

  return `₹ ${formatted}`;
}

export function formatDate(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return dateString;
  }
}

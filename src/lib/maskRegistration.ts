/**
 * Masks a vehicle registration number for privacy.
 * Shows first 4 characters, replaces rest with asterisks.
 * Example: "KA 23 AB 1234" → "KA 2*********"
 */
export const maskRegistration = (registration: string | null | undefined): string => {
  if (!registration) return "N/A";
  
  // Remove spaces for consistent processing
  const cleaned = registration.replace(/\s+/g, '');
  
  if (cleaned.length <= 4) {
    return registration; // Too short to mask
  }
  
  // Show first 4 chars, mask the rest
  const visible = cleaned.substring(0, 4);
  const masked = '*'.repeat(cleaned.length - 4);
  
  return `${visible}${masked}`;
};

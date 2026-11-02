/** Populate only with verified business details. Empty values are deliberately hidden. */
export const business: {
  phone?: string;
  email?: string;
  address?: string;
  hours?: string;
  mapUrl?: string;
  socials: { label: string; url: string }[];
} = { socials: [] };
export interface ContactFields {
  name: string;
  email: string;
  message: string;
}
export function contactErrors(
  fields: ContactFields,
): Partial<Record<keyof ContactFields, string>> {
  const errors: Partial<Record<keyof ContactFields, string>> = {};
  if (fields.name.trim().length < 2)
    errors.name = "Indiquez votre nom (2 caractères minimum).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim()))
    errors.email = "Indiquez une adresse e-mail valide.";
  if (fields.message.trim().length < 10)
    errors.message = "Écrivez un message de 10 caractères minimum.";
  return errors;
}

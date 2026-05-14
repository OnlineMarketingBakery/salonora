export type CF7FieldOption = { value: string; label: string };

export type CF7FormField = {
  name: string;
  type: string;
  basetype: string;
  rawName: string;
  rawValues: string;
  /** Populated for `select` and grouped `radio` fields when parsed from form HTML. */
  options?: CF7FieldOption[];
};

export type CF7FormDefinition = {
  id: string;
  hash: string;
  fields: CF7FormField[];
  properties?: Record<string, string>;
  title?: string;
  /** First submit `value` from the form template, when available. */
  submitLabel?: string;
};

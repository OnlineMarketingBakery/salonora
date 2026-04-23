export type CF7FormField = {
  name: string;
  type: string;
  basetype: string;
  rawName: string;
  rawValues: string;
};

export type CF7FormDefinition = {
  id: string;
  hash: string;
  fields: CF7FormField[];
  properties?: Record<string, string>;
  title?: string;
};

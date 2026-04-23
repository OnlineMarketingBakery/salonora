import type { CF7FormField } from "@/types/forms";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";

/**
 * Renders a single CF7 field for the custom form bridge.
 * Extend with select, radio, accept, etc. as your forms require.
 */
export function CF7FieldRenderer({ field }: { field: CF7FormField }) {
  if (field.basetype === "submit") return null;
  if (field.basetype === "textarea" || field.type.toLowerCase().includes("textarea")) {
    return <Textarea name={field.name} label={field.name} required />;
  }
  if (field.basetype === "email") {
    return <Input name={field.name} type="email" label={field.name} required />;
  }
  return <Input name={field.name} label={field.name} />;
}

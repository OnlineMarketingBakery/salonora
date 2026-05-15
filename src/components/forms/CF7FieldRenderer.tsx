import type { CF7FormField } from "@/types/forms";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

type Props = {
  field: CF7FormField;
};

/**
 * Renders a single CF7 field for the custom form bridge.
 * Extend with select, radio, accept, etc. as your forms require.
 */
export function CF7FieldRenderer({ field }: Props) {
  if (field.basetype === "submit") return null;
  if (field.basetype === "textarea" || field.type.toLowerCase().includes("textarea")) {
    return <Textarea name={field.name} label={field.name} required />;
  }
  if (field.basetype === "email") {
    return <Input name={field.name} type="email" label={field.name} required />;
  }
  if (field.basetype === "tel") {
    return <Input name={field.name} type="tel" label={field.name} />;
  }
  if (field.basetype === "url") {
    return <Input name={field.name} type="url" label={field.name} />;
  }
  if (field.basetype === "number") {
    return <Input name={field.name} type="number" label={field.name} />;
  }
  if (field.basetype === "select" && field.options?.length) {
    const defaultVal = field.options[0]?.value ?? "";
    return (
      <Select name={field.name} label={field.name} required defaultValue={defaultVal}>
        {field.options.map((o) => (
          <option key={`${field.name}-${o.value}`} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    );
  }
  if (field.basetype === "radio" && field.options?.length) {
    const defaultVal = field.options[0]?.value ?? "";
    return (
      <fieldset>
        <legend className="mb-1 block text-sm font-medium text-muted">{field.name}</legend>
        <div className="flex flex-wrap gap-3">
          {field.options.map((o) => (
            <label key={`${field.name}-${o.value}`} className="inline-flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="radio"
                name={field.name}
                value={o.value}
                defaultChecked={o.value === defaultVal}
                required
                className="size-3.5 accent-brand"
              />
              <span>{o.label}</span>
            </label>
          ))}
        </div>
      </fieldset>
    );
  }
  return <Input name={field.name} label={field.name} />;
}

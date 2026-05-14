import type { CF7FormField } from "@/types/forms";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";

const freeDemoInputClass =
  "mt-1 border-0 bg-surface px-4 py-3 text-base text-navy-deep shadow-none placeholder:text-muted/40 focus:border-brand focus:outline-none focus:ring-2 focus:ring-brand rounded-xl";

type Props = {
  field: CF7FormField;
  /** `free_demo` matches the lead card inputs (Figma 1417:36). */
  variant?: "default" | "free_demo";
};

/**
 * Renders a single CF7 field for the custom form bridge.
 * Extend with select, radio, accept, etc. as your forms require.
 */
export function CF7FieldRenderer({ field, variant = "default" }: Props) {
  const fc = variant === "free_demo" ? freeDemoInputClass : "";
  if (field.basetype === "submit") return null;
  if (field.basetype === "textarea" || field.type.toLowerCase().includes("textarea")) {
    return (
      <Textarea
        name={field.name}
        label={field.name}
        required
        className={variant === "free_demo" ? `${fc} min-h-[120px]` : ""}
      />
    );
  }
  if (field.basetype === "email") {
    return <Input name={field.name} type="email" label={field.name} required className={fc} />;
  }
  if (field.basetype === "tel") {
    return <Input name={field.name} type="tel" label={field.name} className={fc} />;
  }
  if (field.basetype === "url") {
    return <Input name={field.name} type="url" label={field.name} className={fc} />;
  }
  if (field.basetype === "number") {
    return <Input name={field.name} type="number" label={field.name} className={fc} />;
  }
  if (field.basetype === "select" && field.options?.length) {
    const defaultVal = field.options[0]?.value ?? "";
    return (
      <Select name={field.name} label={field.name} required className={fc} defaultValue={defaultVal}>
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
      <fieldset className={variant === "free_demo" ? "text-left" : ""}>
        <legend
          className={
            variant === "free_demo"
              ? "mb-2 block text-sm font-normal text-muted tracking-tight"
              : "mb-1 block text-sm font-medium text-muted"
          }
        >
          {field.name}
        </legend>
        <div
          className={
            variant === "free_demo"
              ? "flex flex-wrap items-center gap-x-4 gap-y-2"
              : "flex flex-wrap gap-3"
          }
        >
          {field.options.map((o) => (
            <label
              key={`${field.name}-${o.value}`}
              className={
                variant === "free_demo"
                  ? "inline-flex cursor-pointer items-center gap-1.5 text-base font-medium text-navy-deep"
                  : "inline-flex cursor-pointer items-center gap-2 text-sm text-foreground"
              }
            >
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
  return <Input name={field.name} label={field.name} className={fc} />;
}

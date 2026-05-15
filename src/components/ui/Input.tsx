export function Input(
  props: React.InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    labelClassName?: string;
    /** Label + input stack with `gap-2.5` (Figma 10px); no extra `mb-1` / `mt-1` on the control. */
    stackedLabel?: boolean;
  }
) {
  const { label, labelClassName, stackedLabel, id, className = "", ...rest } = props;
  const labelWrap = labelClassName ?? "block text-sm font-medium text-muted";
  const spanClass = stackedLabel ? "block" : "mb-1 block";
  const inputMt = stackedLabel ? "mt-0" : "mt-1";
  return (
    <label className={labelWrap}>
      {label && <span className={spanClass}>{label}</span>}
      <input
        id={id}
        className={`${inputMt} w-full rounded-lg border border-muted/20 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${className}`}
        {...rest}
      />
    </label>
  );
}

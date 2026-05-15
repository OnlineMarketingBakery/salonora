export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string; labelClassName?: string }
) {
  const { label, labelClassName, id, className = "", children, ...rest } = props;
  return (
    <label className={labelClassName ?? "block text-sm font-medium text-muted"}>
      {label && <span className="mb-1 block">{label}</span>}
      <select
        id={id}
        className={`mt-1 w-full rounded-lg border border-muted/20 bg-white px-3 py-2 text-sm text-foreground shadow-sm focus:border-brand focus:outline-none focus:ring-1 focus:ring-brand ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

export function Select(
  props: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
) {
  const { label, id, className = "", children, ...rest } = props;
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label && <span className="mb-1 block">{label}</span>}
      <select
        id={id}
        className={`mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-[#1e5bb8] focus:outline-none focus:ring-1 focus:ring-[#1e5bb8] ${className}`}
        {...rest}
      >
        {children}
      </select>
    </label>
  );
}

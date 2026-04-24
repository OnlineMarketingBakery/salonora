import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  highlight = false,
}: {
  children: ReactNode;
  className?: string;
  highlight?: boolean;
}) {
  if (highlight) {
    return (
      <div
        className={`box-border flex min-h-[282px] w-full max-w-[417px] flex-col justify-center rounded-[12px] border-0 bg-gradient-to-b from-[#152951] to-[#224D88] p-12 text-white [background-size:100%] ${className}`.trim()}
      >
        {children}
      </div>
    );
  }
  return (
    <div
      className={`box-border flex h-full min-h-[282px] w-full max-w-[417px] flex-col items-start justify-start rounded-[12px] border-0 bg-[#EBF3FE] p-6 text-navy [background-size:100%] ${className}`.trim()}
    >
      {children}
    </div>
  );
}

import type { ReactNode } from "react";

type DashboardStatProps = {
  label: string;
  value: ReactNode;
  hint: string;
  color: "red" | "green" | "orange" | "blue";
  icon: ReactNode;
};

export function DashboardStat({
  label,
  value,
  hint,
  color,
  icon,
}: DashboardStatProps) {
  const accents = {
    red: "text-[#d6324c]",
    green: "text-[#3b9b70]",
    orange: "text-[#cf7a24]",
    blue: "text-[#3863df]",
  };
  return (
    <article className="flex min-h-32 flex-col gap-2 rounded-[20px] border border-[#e2e8f1] bg-white p-6 shadow-[0_3px_5px_#1929500b] md:min-h-[178px]">
      <div className="flex items-center justify-between text-lg font-bold text-[#68778e]">
        <span>{label}</span>
        <span className={`${accents[color]} [&_svg]:text-[27px]`}>{icon}</span>
      </div>
      <strong
        className={`text-[42px] leading-none tracking-[-1.5px] md:text-[47px] ${accents[color]} [&_small]:text-[22px] [&_small]:tracking-normal`}
      >
        {value}
      </strong>
      <span className="text-base font-medium text-[#91a0b8]">{hint}</span>
    </article>
  );
}

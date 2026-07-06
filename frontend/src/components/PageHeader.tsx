interface PageHeaderProps {
  title: string;
  subtitle: string;
  className?: string;
}

export default function PageHeader({ title, subtitle, className = "mb-8 mt-1 text-center max-w-xl mx-auto" }: PageHeaderProps) {
  return (
    <div className={className}>
      <h1 className="text-2xl font-extrabold text-[#22c55e] tracking-wide">{title}</h1>
      <p className="text-sm text-[#94a3b8] mt-2">{subtitle}</p>
    </div>
  );
}

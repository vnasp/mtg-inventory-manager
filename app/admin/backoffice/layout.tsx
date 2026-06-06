export default function BackofficeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="min-h-screen w-screen bg-slate-50 antialiased">{children}</div>;
}

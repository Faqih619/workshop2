import AppShell from "@/components/layouts/appshell";

export default function EmployerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell role="employer">{children}</AppShell>;
}
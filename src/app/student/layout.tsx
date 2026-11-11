import AppShell from "@/components/layouts/appshell";

export default function StudentLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell role="student">{children}</AppShell>;
}
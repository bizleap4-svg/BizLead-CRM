import type { ReactNode } from "react";
import { ThemeProvider } from "../../components/theme/ThemeProvider";
import WorkspaceShell from "../../components/layout/WorkspaceShell";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <WorkspaceShell>
        {children}
      </WorkspaceShell>
    </ThemeProvider>
  );
}

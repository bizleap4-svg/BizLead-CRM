import type { ReactNode } from "react";
import { ThemeProvider } from "../../components/theme/ThemeProvider";
import WorkspaceShell from "../../components/layout/WorkspaceShell";
import { CRMProvider } from "../../components/crm/CRMProvider";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <CRMProvider>
        <WorkspaceShell>
          {children}
        </WorkspaceShell>
      </CRMProvider>
    </ThemeProvider>
  );
}

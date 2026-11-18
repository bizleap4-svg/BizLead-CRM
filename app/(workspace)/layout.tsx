import type { ReactNode } from "react";
import { ThemeProvider } from "../../components/theme/ThemeProvider";
import WorkspaceShell from "../../components/layout/WorkspaceShell";
import { CRMProvider } from "../../components/crm/CRMProvider";
import { ControlCenterProvider } from "../../components/settings/ControlCenterContext";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <ControlCenterProvider>
        <CRMProvider>
          <WorkspaceShell>
            {children}
          </WorkspaceShell>
        </CRMProvider>
      </ControlCenterProvider>
    </ThemeProvider>
  );
}

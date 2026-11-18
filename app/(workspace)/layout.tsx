import type { ReactNode } from "react";
import { ThemeProvider } from "../../components/theme/ThemeProvider";
import WorkspaceShell from "../../components/layout/WorkspaceShell";
import { CRMProvider } from "../../components/crm/CRMProvider";
import { ControlCenterProvider } from "../../components/settings/ControlCenterContext";
import { GlobalAIProvider } from "../../components/ai/GlobalAIContext";

export default function Layout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <ThemeProvider>
      <ControlCenterProvider>
        <CRMProvider>
          <GlobalAIProvider>
            <WorkspaceShell>
              {children}
            </WorkspaceShell>
          </GlobalAIProvider>
        </CRMProvider>
      </ControlCenterProvider>
    </ThemeProvider>
  );
}

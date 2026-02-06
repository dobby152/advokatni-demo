import type { ReactNode } from "react";
import PortalShell from "./_components/PortalShell";
import { PortalDataProvider } from "../../lib/demoPortalStore";

export default function PortalLayout({ children }: { children: ReactNode }) {
  return (
    <PortalDataProvider>
      <PortalShell>{children}</PortalShell>
    </PortalDataProvider>
  );
}

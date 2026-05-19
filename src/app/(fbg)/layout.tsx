import FbgShell from "@/components/fbg/fbg-shell";
import MobileFrame from "@/components/fbg/mobile-frame";

export default function FbgLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <MobileFrame>
      <FbgShell>{children}</FbgShell>
    </MobileFrame>
  );
}

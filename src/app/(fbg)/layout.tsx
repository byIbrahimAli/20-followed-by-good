import FbgShell from "@/components/fbg/fbg-shell";
import MobileFrame from "@/components/fbg/mobile-frame";
import ThemeProvider from "@/components/fbg/ThemeProvider";
import { FBG_THEME_STORAGE_KEY } from "@/lib/fbg/themes";

const themeInitScript = `(function(){try{var k=${JSON.stringify(FBG_THEME_STORAGE_KEY)};var t=localStorage.getItem(k);if(t)document.documentElement.setAttribute("data-fbg-theme",t);}catch(e){}})();`;

export default function FbgLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      <ThemeProvider>
        <MobileFrame>
          <FbgShell>{children}</FbgShell>
        </MobileFrame>
      </ThemeProvider>
    </>
  );
}

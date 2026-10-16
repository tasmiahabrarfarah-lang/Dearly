import { ThemeProvider } from "@/components/ThemeContext";
import HomeScene from "@/components/HomeScene";

/**
 * /world — The authenticated Dearly home scene.
 * Protected by middleware: unauthenticated users are redirected to /welcome.
 */
export default function WorldPage() {
  return (
    <ThemeProvider>
      <HomeScene />
    </ThemeProvider>
  );
}

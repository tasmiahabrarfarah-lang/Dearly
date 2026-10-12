import { ThemeProvider } from "@/components/ThemeContext";
import HomeScene from "@/components/HomeScene";

/**
 * Root page — wraps the scene in the ThemeProvider so palette
 * state is available to all child components.
 */
export default function Page() {
  return (
    <ThemeProvider>
      <HomeScene />
    </ThemeProvider>
  );
}

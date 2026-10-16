import { redirect } from "next/navigation";

/**
 * Root route — redirects to the landing page.
 * The home scene lives at /world (auth-protected).
 * The landing page lives at /welcome.
 */
export default function RootPage() {
  redirect("/welcome");
}


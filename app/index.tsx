import { Redirect } from "expo-router";
import { useAuth, useUser } from "@clerk/expo";

// Central redirect gate. We MUST wait for Clerk to finish loading before
// issuing any redirect. Firing a <Redirect> while isLoaded=false means React
// can push a new route while the previous screen is still mid-render (hooks
// still running), which causes "Rendered fewer hooks than expected".
export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();

  // Clerk not ready yet — render nothing, let it load silently.
  if (!isLoaded) return null;

  // Signed in → route to the correct dashboard based on the user's role
  if (isSignedIn) {
    const role = user?.unsafeMetadata?.role as string | undefined;
    if (role === "LANDLORD") return <Redirect href="/landlord/dashboard" />;
    return <Redirect href="/renter/dashboard" />;
  }

  // Not signed in → welcome screen
  return <Redirect href="/welcome" />;
}

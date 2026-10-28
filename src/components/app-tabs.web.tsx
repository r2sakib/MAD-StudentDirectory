import { Slot } from 'expo-router';

// No tab bar on web: just render the current route.
export default function AppTabs() {
  return <Slot />;
}

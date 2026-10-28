import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useColorScheme } from 'react-native';

import { AnimatedSplashOverlay } from '@/components/animated-icon';
import { StudentsProvider } from '@/context/students-context';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      {/* StudentsProvider wraps everything — every screen in the
          entire app can now call useStudents() and get the list. */}
      <StudentsProvider>
        <AnimatedSplashOverlay />
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen
            name="add-student"
            options={{
              title: 'Add Student',
              headerShown: true,
              headerTitle: 'Join the Directory',
              headerStyle: { backgroundColor: '#0D1F4E' },
              headerTintColor: '#FFFFFF',
            }}
          />
        </Stack>
      </StudentsProvider>
    </ThemeProvider>
  );
}

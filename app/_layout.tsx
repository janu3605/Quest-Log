import { Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import config from '../tamagui.config';
import { AppThemeProvider, useAppTheme } from '../lib/theme';

function InnerLayout() {
  const { theme } = useAppTheme();

  return (
    <>
      <StatusBar style={theme.statusBarStyle} />
      <Stack screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.bg }
      }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="login" />
        <Stack.Screen name="add-quest" options={{ presentation: 'modal' }} />
        <Stack.Screen name="edit-quest" options={{ presentation: 'modal' }} />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  const [loaded] = useFonts({
    Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
    InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
  });

  if (!loaded) return null;

  return (
    <TamaguiProvider config={config} defaultTheme="dark">
      <Theme name="dark">
        <AppThemeProvider>
          <InnerLayout />
        </AppThemeProvider>
      </Theme>
    </TamaguiProvider>
  );
}
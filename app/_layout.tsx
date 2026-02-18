import { Stack } from 'expo-router';
import { TamaguiProvider, Theme } from 'tamagui';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import config from '../tamagui.config'; // Your config file

export default function RootLayout() {
    // 1. Load the fonts required by Tamagui (Inter is standard)
    const [loaded] = useFonts({
        Inter: require('@tamagui/font-inter/otf/Inter-Medium.otf'),
        InterBold: require('@tamagui/font-inter/otf/Inter-Bold.otf'),
    });

    // 2. Hide content until fonts are loaded to prevent flickering
    if (!loaded) return null;

    return (
        // 3. Wrap everything in TamaguiProvider
        <TamaguiProvider config={config} defaultTheme={'dark'}>
            <Theme name="dark"> {/* Force Dark Mode for that "Gamer" look */}
                <StatusBar style="light" />

                {/* 4. The Stack Router handles the screens */}
                <Stack screenOptions={{ headerShown: false }}>
                    {/* Your Home Screen */}
                    <Stack.Screen name="index" />

                    {/* Your "Add Quest" Modal */}
                    <Stack.Screen
                        name="add-quest"
                        options={{
                            presentation: 'modal',
                            title: 'New Skill'
                        }}
                    />
                </Stack>
            </Theme>
        </TamaguiProvider>
    );
}
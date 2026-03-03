import React from 'react';
import { Pressable, View } from 'react-native';
import { XStack, YStack, Text } from 'tamagui';
import { useAppTheme, THEMES, THEME_NAMES, THEME_LABELS } from '../lib/theme';

export function ThemeSwitcher() {
    const { themeName, setTheme, theme } = useAppTheme();

    return (
        <XStack ai="center" gap="$2">
            {THEME_NAMES.map((name) => {
                const t = THEMES[name];
                const isActive = name === themeName;
                return (
                    <Pressable key={name} onPress={() => setTheme(name)}>
                        <View style={{
                            width: 28,
                            height: 28,
                            borderRadius: 14,
                            backgroundColor: t.accent,
                            borderWidth: isActive ? 3 : 1,
                            borderColor: isActive ? theme.text : theme.border,
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}>
                            {/* Inner dot showing bg color */}
                            <View style={{
                                width: 12,
                                height: 12,
                                borderRadius: 6,
                                backgroundColor: t.bg,
                            }} />
                        </View>
                    </Pressable>
                );
            })}
        </XStack>
    );
}

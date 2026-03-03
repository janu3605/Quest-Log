import React, { useEffect, useState } from 'react';
import { Animated, View, Pressable } from 'react-native';
import { YStack, H1, H2, Text } from 'tamagui';
import { useAppTheme } from '../lib/theme';

interface LevelUpOverlayProps {
    visible: boolean;
    newLevel: number;
    questName: string;
    questColor: string;
    xpEarned: number;
    onDismiss: () => void;
}

function Particle({ delay, color }: { delay: number; color: string }) {
    const [anim] = useState(new Animated.Value(0));
    const left = Math.random() * 100;
    const startY = 40 + Math.random() * 20;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.delay(delay),
                Animated.timing(anim, {
                    toValue: 1, duration: 1800 + Math.random() * 800,
                    useNativeDriver: false,
                }),
                Animated.timing(anim, {
                    toValue: 0, duration: 0, useNativeDriver: false,
                }),
            ])
        ).start();
    }, []);

    const translateY = anim.interpolate({ inputRange: [0, 1], outputRange: [startY, -60] });
    const opacity = anim.interpolate({ inputRange: [0, 0.3, 0.7, 1], outputRange: [0, 1, 1, 0] });
    const scale = anim.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0.3, 1.2, 0.5] });

    return (
        <Animated.View style={{
            position: 'absolute', left: `${left}%`, bottom: 0,
            opacity, transform: [{ translateY }, { scale }],
        }}>
            <View style={{
                width: 6 + Math.random() * 6, height: 6 + Math.random() * 6,
                borderRadius: 6, backgroundColor: color,
            }} />
        </Animated.View>
    );
}

export function LevelUpOverlay({
    visible, newLevel, questName, questColor, xpEarned, onDismiss,
}: LevelUpOverlayProps) {
    const { theme } = useAppTheme();
    const [fadeAnim] = useState(new Animated.Value(0));
    const [scaleAnim] = useState(new Animated.Value(0.5));
    const [glowAnim] = useState(new Animated.Value(0));

    useEffect(() => {
        if (visible) {
            Animated.parallel([
                Animated.spring(scaleAnim, {
                    toValue: 1, tension: 50, friction: 7, useNativeDriver: false,
                }),
                Animated.timing(fadeAnim, {
                    toValue: 1, duration: 400, useNativeDriver: false,
                }),
            ]).start();

            Animated.loop(
                Animated.sequence([
                    Animated.timing(glowAnim, { toValue: 1, duration: 1200, useNativeDriver: false }),
                    Animated.timing(glowAnim, { toValue: 0, duration: 1200, useNativeDriver: false }),
                ])
            ).start();
        }
    }, [visible]);

    if (!visible) return null;

    const glowOpacity = glowAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.4] });
    const particleColors = [questColor, theme.accent, '#fff', questColor, theme.accent];

    return (
        <Animated.View style={{
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 999, backgroundColor: 'rgba(0,0,0,0.85)',
            alignItems: 'center', justifyContent: 'center', opacity: fadeAnim,
        }}>
            <View style={{
                position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                overflow: 'hidden',
            }}>
                {particleColors.map((c, i) =>
                    Array.from({ length: 4 }).map((_, j) => (
                        <Particle key={`${i}-${j}`} delay={(i * 4 + j) * 150} color={c} />
                    ))
                )}
            </View>

            <Animated.View style={{
                position: 'absolute', width: 280, height: 280,
                borderRadius: 140, backgroundColor: questColor,
                opacity: glowOpacity,
            }} />

            <Animated.View style={{
                transform: [{ scale: scaleAnim }],
                alignItems: 'center', gap: 12,
            }}>
                <Text fontSize={16} color={theme.text} textTransform="uppercase" letterSpacing={4}>
                    ⚔ Level Up!! ⚔
                </Text>

                <View style={{
                    width: 140, height: 140, borderRadius: 70,
                    borderWidth: 4, borderColor: questColor,
                    backgroundColor: theme.card,
                    alignItems: 'center', justifyContent: 'center',
                }}>
                    <H1 color={questColor as any} fontSize={64} fontWeight="900">
                        {newLevel}
                    </H1>
                </View>

                <H2 color={theme.text} textAlign="center" mt="$2">
                    {questName}
                </H2>

                <View style={{
                    backgroundColor: questColor,
                    paddingHorizontal: 20, paddingVertical: 6, borderRadius: 12,
                }}>
                    <Text color="black" fontWeight="900" fontSize="$4">
                        +{xpEarned} XP
                    </Text>
                </View>

                <Pressable onPress={onDismiss} style={{ marginTop: 32 }}>
                    <View style={{
                        backgroundColor: theme.surfaceHover,
                        paddingHorizontal: 40, paddingVertical: 14,
                        borderRadius: 14, borderWidth: 1, borderColor: theme.border,
                    }}>
                        <Text color={theme.text} fontWeight="bold" fontSize="$4">
                            Continue →
                        </Text>
                    </View>
                </Pressable>
            </Animated.View>
        </Animated.View>
    );
}

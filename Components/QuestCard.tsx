import React from 'react';
import { Image, Pressable, View } from 'react-native';
import { YStack, XStack, H2, H4, Text } from 'tamagui';
import { LiveTimer } from './LiveTimer';
import { useAppTheme } from '../lib/theme';

interface QuestCardProps {
    project: any;
    activeTimer: any | undefined;
    onPress: (projectId: string) => void;
    onEdit?: (projectId: string) => void;
    streak?: number;
}

export function QuestCard({ project, activeTimer, onPress, onEdit, streak = 0 }: QuestCardProps) {
    const { theme } = useAppTheme();
    const isRunning = !!activeTimer;
    const questColor = project.color_hex || '#6366f1';

    const currentXp = project.current_xp || 0;
    const xpInCurrentLevel = currentXp % 100;
    const progressPercentage = `${Math.max(2, xpInCurrentLevel)}%`;

    return (
        <YStack
            borderWidth={1}
            borderColor={isRunning ? questColor : theme.border}
            borderRadius="$6"
            backgroundColor={theme.card}
            w="100%"
            $gtSm={{ w: "48%" }}
            $gtMd={{ w: "31%" }}
            $gtLg={{ w: "23%" }}
            minHeight={220}
            p="$4"
            jc="space-between"
            onPress={() => onPress(project.id)}
            cursor="pointer"
            hoverStyle={{ scale: 0.98, opacity: 0.9 }}
            overflow="hidden"
        >
            {/* Top color accent bar */}
            <View style={{
                width: '100%', height: 3,
                backgroundColor: questColor, opacity: isRunning ? 1 : 0.4,
            }} />

            {/* TOP: Icon & Quest Name */}
            <XStack ai="center" gap="$3">
                {project.icon_url ? (
                    <Image
                        source={{ uri: project.icon_url }}
                        style={{ width: 40, height: 40, borderRadius: 10 }}
                    />
                ) : (
                    <View style={{
                        width: 32, height: 32, borderRadius: 10,
                        backgroundColor: questColor,
                        alignItems: 'center', justifyContent: 'center',
                    }}>
                        <Text fontSize={14} color="white">⚔</Text>
                    </View>
                )}
                <H4 color={theme.text} numberOfLines={1} f={1}>{project.name}</H4>
                {onEdit && (
                    <Pressable
                        onPress={(e) => { e.stopPropagation(); onEdit(project.id); }}
                        style={{ padding: 6 }}
                    >
                        <Text fontSize="$3" color={theme.textSecondary}>✏️</Text>
                    </Pressable>
                )}
            </XStack>

            {/* MIDDLE: Level & Progress */}
            <YStack ai="center" gap="$3" my="$4">
                <XStack ai="center" gap="$2" jc="center">
                    <H2 color={theme.text} fontWeight="900">Lv {project.current_level || 1}</H2>
                    {streak >= 2 && (
                        <View style={{
                            backgroundColor: '#ff6b2b',
                            paddingHorizontal: 8, paddingVertical: 2,
                            borderRadius: 10, flexDirection: 'row',
                            alignItems: 'center', gap: 2,
                        }}>
                            <Text fontSize={12}>🔥</Text>
                            <Text color="white" fontSize={11} fontWeight="900">{streak}</Text>
                        </View>
                    )}
                </XStack>

                {/* Progress Bar */}
                <View style={{
                    width: '100%', height: 8, borderRadius: 4,
                    backgroundColor: theme.progressTrack, overflow: 'hidden',
                }}>
                    <View style={{
                        height: '100%',
                        width: progressPercentage,
                        backgroundColor: questColor,
                        borderRadius: 4,
                    } as any} />
                </View>

                <XStack w="100%" jc="space-between">
                    <Text color={theme.textSecondary} fontSize="$2">{xpInCurrentLevel} / 100 XP</Text>
                    <Text color={theme.textSecondary} fontSize="$2">x{project.xp_multiplier} / min</Text>
                </XStack>
            </YStack>

            {/* BOTTOM: Timer or Start */}
            <YStack ai="center" pt="$2" borderTopWidth={1} borderColor={theme.border}>
                {isRunning ? (
                    <LiveTimer startTimeIso={activeTimer.start_time} />
                ) : (
                    <View style={{
                        backgroundColor: questColor,
                        paddingHorizontal: 20, paddingVertical: 6,
                        borderRadius: 12, opacity: 0.9,
                    }}>
                        <Text color="black" fontSize="$3" fontWeight="bold" letterSpacing={1}>
                            START
                        </Text>
                    </View>
                )}
            </YStack>

        </YStack>
    );
}
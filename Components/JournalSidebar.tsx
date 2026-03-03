import React from 'react';
import { View, Image } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useAppTheme } from '../lib/theme';

interface Quest {
    id: string;
    name: string;
    color_hex: string;
    icon_url: string | null;
    current_level: number;
    current_xp: number;
}

interface JournalSidebarProps {
    totalXp: number;
    totalSessions: number;
    totalMinutes: number;
    streakDays: boolean[];
    currentStreak: number;
    topQuests: Quest[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export function JournalSidebar({
    totalXp, totalSessions, totalMinutes,
    streakDays, currentStreak, topQuests,
}: JournalSidebarProps) {
    const { theme } = useAppTheme();
    const userLevel = Math.floor(totalXp / 100) + 1;
    const timeStr = totalMinutes >= 60
        ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
        : `${totalMinutes}m`;

    return (
        <YStack gap="$4" w={260}>
            {/* ── User Level Card ── */}
            <YStack backgroundColor={theme.card} borderRadius="$6" borderWidth={1} borderColor={theme.border} overflow="hidden">
                <View style={{ height: 3, backgroundColor: theme.accent, opacity: 0.7 }} />
                <YStack p="$4" ai="center" gap="$2">
                    <View style={{
                        width: 64, height: 64, borderRadius: 32,
                        backgroundColor: theme.accent,
                        alignItems: 'center', justifyContent: 'center', marginBottom: 4,
                    }}>
                        <Text fontSize={28} color={theme.statusBarStyle === 'light' ? 'black' : 'white'} fontWeight="900">
                            {userLevel}
                        </Text>
                    </View>
                    <Text color={theme.textSecondary} fontSize="$2" textTransform="uppercase" letterSpacing={1.5}>
                        Adventurer Level
                    </Text>
                    <XStack w="100%" jc="space-around" mt="$3" pt="$3" borderTopWidth={1} borderColor={theme.border}>
                        <YStack ai="center">
                            <Text color={theme.text} fontWeight="900" fontSize="$5">{totalSessions}</Text>
                            <Text color={theme.textSecondary} fontSize={11}>Sessions</Text>
                        </YStack>
                        <YStack ai="center">
                            <Text color={theme.text} fontWeight="900" fontSize="$5">{timeStr}</Text>
                            <Text color={theme.textSecondary} fontSize={11}>Focused</Text>
                        </YStack>
                        <YStack ai="center">
                            <Text color={theme.accent} fontWeight="900" fontSize="$5">{totalXp}</Text>
                            <Text color={theme.textSecondary} fontSize={11}>XP</Text>
                        </YStack>
                    </XStack>
                </YStack>
            </YStack>

            {/* ── Streak Tracker ── */}
            <YStack backgroundColor={theme.card} borderRadius="$6" borderWidth={1} borderColor={theme.border} p="$4" gap="$3">
                <XStack ai="center" jc="space-between">
                    <Text color={theme.text} fontWeight="700" fontSize="$4">Your Streak</Text>
                    {currentStreak >= 2 && (
                        <XStack ai="center" gap="$1" backgroundColor="#ff6b2b" px="$2" py="$1" borderRadius="$3">
                            <Text fontSize={12}>🔥</Text>
                            <Text color="white" fontSize={12} fontWeight="900">{currentStreak}</Text>
                        </XStack>
                    )}
                </XStack>
                <XStack jc="space-between" px="$1">
                    {DAY_LABELS.map((label, i) => {
                        const active = streakDays[i];
                        return (
                            <YStack key={i} ai="center" gap="$1">
                                <Text color={theme.textSecondary} fontSize={11} fontWeight="600">{label}</Text>
                                <View style={{
                                    width: 28, height: 28, borderRadius: 14,
                                    backgroundColor: active ? theme.accent : theme.progressTrack,
                                    borderWidth: active ? 0 : 1,
                                    borderColor: theme.border,
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    {active && (
                                        <Text fontSize={12} color={theme.statusBarStyle === 'light' ? 'black' : 'white'} fontWeight="900">✓</Text>
                                    )}
                                </View>
                            </YStack>
                        );
                    })}
                </XStack>
                <Text color={theme.textSecondary} fontSize={11} textAlign="center">
                    {currentStreak === 0 ? "Start a session today!"
                        : currentStreak === 1 ? "Day 1 — keep it going!"
                            : `🔥${currentStreak} Day streak — legendary!`}
                </Text>
            </YStack>

            {/* ── Top Quests ── */}
            <YStack backgroundColor={theme.card} borderRadius="$6" borderWidth={1} borderColor={theme.border} p="$4" gap="$3">
                <Text color={theme.text} fontWeight="700" fontSize="$4">Top Quests</Text>
                {topQuests.length === 0 ? (
                    <Text color={theme.textSecondary} fontSize="$2" textAlign="center" py="$2">No quests yet</Text>
                ) : (
                    topQuests.map((quest, idx) => {
                        const xpInLevel = (quest.current_xp || 0) % 100;
                        return (
                            <XStack key={quest.id} ai="center" gap="$3">
                                <View style={{
                                    width: 24, height: 24, borderRadius: 12,
                                    backgroundColor: idx === 0 ? '#f5d020' : idx === 1 ? '#c0c0c0' : '#cd7f32',
                                    alignItems: 'center', justifyContent: 'center',
                                }}>
                                    <Text fontSize={11} color="black" fontWeight="900">{idx + 1}</Text>
                                </View>
                                {quest.icon_url ? (
                                    <Image source={{ uri: quest.icon_url }}
                                        style={{ width: 28, height: 28, borderRadius: 7 }} />
                                ) : (
                                    <View style={{
                                        width: 28, height: 28, borderRadius: 7,
                                        backgroundColor: quest.color_hex || '#6366f1',
                                        alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <Text fontSize={12} color="white">⚔</Text>
                                    </View>
                                )}
                                <YStack f={1} gap={2}>
                                    <Text color={theme.text} fontSize="$3" fontWeight="600" numberOfLines={1}>
                                        {quest.name}
                                    </Text>
                                    <View style={{
                                        width: '100%', height: 4, borderRadius: 2,
                                        backgroundColor: theme.progressTrack, overflow: 'hidden',
                                    }}>
                                        <View style={{
                                            height: '100%',
                                            width: `${Math.max(2, xpInLevel)}%`,
                                            backgroundColor: quest.color_hex || '#6366f1',
                                            borderRadius: 2,
                                        } as any} />
                                    </View>
                                </YStack>
                                <Text color={theme.textSecondary} fontSize={12} fontWeight="700">
                                    Lv {quest.current_level || 1}
                                </Text>
                            </XStack>
                        );
                    })
                )}
            </YStack>
        </YStack>
    );
}

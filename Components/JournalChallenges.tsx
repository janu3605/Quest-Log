import React, { useMemo, useState } from 'react';
import { View, Pressable } from 'react-native';
import { YStack, XStack, Text } from 'tamagui';
import { useAppTheme } from '../lib/theme';

interface Challenge {
    id: string;
    icon: string;
    title: string;
    description: string;
    current: number;
    target: number;
    completed: boolean;
}

interface ChallengesProps {
    totalXp: number;
    currentStreak: number;
    maxLevel: number;
    longestSessionMinutes: number;
    totalSessions: number;
    maxDailyQuests: number;
}

const VISIBLE_COUNT = 3;

export function JournalChallenges({
    totalXp, currentStreak, maxLevel,
    longestSessionMinutes, totalSessions, maxDailyQuests,
}: ChallengesProps) {
    const { theme } = useAppTheme();
    const [expanded, setExpanded] = useState(false);

    const challenges = useMemo<Challenge[]>(() => {
        const ch: Challenge[] = [
            {
                id: 'streak-3', icon: '🔥', title: '3-Day Streak', description: 'Practice 3 days in a row',
                current: Math.min(currentStreak, 3), target: 3, completed: currentStreak >= 3
            },
            {
                id: 'streak-7', icon: '🔥', title: 'Week Warrior', description: 'Reach a 7-day streak',
                current: Math.min(currentStreak, 7), target: 7, completed: currentStreak >= 7
            },
            {
                id: 'streak-30', icon: '💎', title: 'Monthly Legend', description: 'Reach a 30-day streak',
                current: Math.min(currentStreak, 30), target: 30, completed: currentStreak >= 30
            },
            {
                id: 'level-2', icon: '⚔️', title: 'First Ascension', description: 'Reach Level 2 with any quest',
                current: Math.min(maxLevel, 2), target: 2, completed: maxLevel >= 2
            },
            {
                id: 'level-5', icon: '🛡️', title: 'Knight\'s Rank', description: 'Reach Level 5 with any quest',
                current: Math.min(maxLevel, 5), target: 5, completed: maxLevel >= 5
            },
            {
                id: 'level-10', icon: '👑', title: 'Master Rank', description: 'Reach Level 10 with any quest',
                current: Math.min(maxLevel, 10), target: 10, completed: maxLevel >= 10
            },
            {
                id: 'session-30', icon: '⏱️', title: 'Deep Focus', description: 'Log a 30-minute session',
                current: Math.min(longestSessionMinutes, 30), target: 30, completed: longestSessionMinutes >= 30
            },
            {
                id: 'session-60', icon: '⏱️', title: 'Hour of Power', description: 'Log a 1-hour session',
                current: Math.min(longestSessionMinutes, 60), target: 60, completed: longestSessionMinutes >= 60
            },
            {
                id: 'xp-500', icon: '🏆', title: 'XP Hunter', description: 'Earn 500 total XP',
                current: Math.min(totalXp, 500), target: 500, completed: totalXp >= 500
            },
            {
                id: 'xp-2000', icon: '🏆', title: 'XP Legend', description: 'Earn 2,000 total XP',
                current: Math.min(totalXp, 2000), target: 2000, completed: totalXp >= 2000
            },
            {
                id: 'sessions-10', icon: '📋', title: 'Getting Started', description: 'Complete 10 sessions',
                current: Math.min(totalSessions, 10), target: 10, completed: totalSessions >= 10
            },
            {
                id: 'sessions-50', icon: '📋', title: 'Dedicated', description: 'Complete 50 sessions',
                current: Math.min(totalSessions, 50), target: 50, completed: totalSessions >= 50
            },
            {
                id: 'daily-3', icon: '📅', title: 'Triple Threat', description: 'Work on 3 quests in one day',
                current: Math.min(maxDailyQuests, 3), target: 3, completed: maxDailyQuests >= 3
            },
        ];
        return ch.sort((a, b) => {
            if (a.completed && !b.completed) return 1;
            if (!a.completed && b.completed) return -1;
            if (!a.completed && !b.completed) return (b.current / b.target) - (a.current / a.target);
            return 0;
        });
    }, [totalXp, currentStreak, maxLevel, longestSessionMinutes, totalSessions, maxDailyQuests]);

    const completedCount = challenges.filter(c => c.completed).length;
    const visibleChallenges = expanded ? challenges : challenges.slice(0, VISIBLE_COUNT);
    const hiddenCount = challenges.length - VISIBLE_COUNT;

    // Challenge accent — purple tint
    const challengeAccent = '#a855f7';

    return (
        <YStack gap="$4" w={280}>
            <YStack backgroundColor={theme.card} borderRadius="$6" borderWidth={1} borderColor={theme.border} overflow="hidden">
                <View style={{ height: 3, backgroundColor: challengeAccent, opacity: 0.7 }} />
                <YStack p="$4" gap="$3">
                    <XStack ai="center" jc="space-between">
                        <Text color={theme.text} fontWeight="700" fontSize="$4">Challenges</Text>
                        <XStack ai="center" gap="$1" backgroundColor={theme.surfaceHover} px="$2" py="$1" borderRadius="$3">
                            <Text fontSize={11} color={theme.accent} fontWeight="700">{completedCount}/{challenges.length}</Text>
                        </XStack>
                    </XStack>

                    {visibleChallenges.map((ch) => {
                        const pct = Math.min(100, Math.round((ch.current / ch.target) * 100));
                        return (
                            <YStack
                                key={ch.id} p="$3"
                                backgroundColor={ch.completed ? theme.accentMuted : theme.cardAlt}
                                borderRadius="$4" borderWidth={1}
                                borderColor={ch.completed ? theme.accent + '40' : theme.border}
                                gap="$2" opacity={ch.completed ? 0.7 : 1}
                            >
                                <XStack ai="center" gap="$2">
                                    <Text fontSize={18}>{ch.icon}</Text>
                                    <YStack f={1}>
                                        <Text color={ch.completed ? theme.accent : theme.text}
                                            fontSize="$3" fontWeight="700" numberOfLines={1}>
                                            {ch.title}{ch.completed && ' ✅'}
                                        </Text>
                                        <Text color={theme.textSecondary} fontSize={11}>{ch.description}</Text>
                                    </YStack>
                                </XStack>
                                {!ch.completed && (
                                    <YStack gap={3}>
                                        <View style={{
                                            width: '100%', height: 6, borderRadius: 3,
                                            backgroundColor: theme.progressTrack, overflow: 'hidden',
                                        }}>
                                            <View style={{
                                                height: '100%', width: `${Math.max(2, pct)}%`,
                                                backgroundColor: challengeAccent, borderRadius: 3,
                                            } as any} />
                                        </View>
                                        <XStack jc="space-between">
                                            <Text color={theme.textSecondary} fontSize={10}>{ch.current} / {ch.target}</Text>
                                            <Text color={theme.textSecondary} fontSize={10}>{pct}%</Text>
                                        </XStack>
                                    </YStack>
                                )}
                            </YStack>
                        );
                    })}

                    {hiddenCount > 0 && (
                        <Pressable onPress={() => setExpanded(!expanded)}>
                            <YStack ai="center" py="$2" mt="$1" borderTopWidth={1} borderColor={theme.border}>
                                <Text color={theme.textSecondary} fontSize={12} fontWeight="600">
                                    {expanded ? '▲ Show Less' : `▼ Show All (${hiddenCount} more)`}
                                </Text>
                            </YStack>
                        </Pressable>
                    )}
                </YStack>
            </YStack>
        </YStack>
    );
}

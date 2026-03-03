import React, { memo } from 'react';
import { View } from 'react-native';
import { YStack, Text, Spinner } from 'tamagui';
import { LogCard } from './LogCard';
import { useAppTheme } from '../lib/theme';

interface JournalActivityFeedProps {
    logs: any[];
    loading: boolean;
    hasMore: boolean;
    onLoadMore: () => void;
    loadingMore: boolean;
}

function groupLogsByDate(logs: any[]): { key: string; label: string; logs: any[] }[] {
    const groups: Map<string, any[]> = new Map();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    for (const log of logs) {
        const d = new Date(log.end_time);
        d.setHours(0, 0, 0, 0);
        const key = d.toISOString();
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(log);
    }

    return Array.from(groups.entries()).map(([key, groupLogs]) => {
        const d = new Date(key);
        d.setHours(0, 0, 0, 0);
        let label: string;
        if (d.getTime() === today.getTime()) label = 'Today';
        else if (d.getTime() === yesterday.getTime()) label = 'Yesterday';
        else label = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        return { key, label, logs: groupLogs };
    });
}

const MemoLogCard = memo(LogCard);

export function JournalActivityFeed({ logs, loading, hasMore, onLoadMore, loadingMore }: JournalActivityFeedProps) {
    const { theme } = useAppTheme();

    if (loading) {
        return (
            <YStack f={1} ai="center" jc="center" py="$10">
                <Spinner size="large" color={theme.accent} />
            </YStack>
        );
    }

    if (logs.length === 0) {
        return (
            <YStack ai="center" jc="center" py="$10" gap="$3">
                <Text fontSize={48}>📜</Text>
                <Text color={theme.text} textAlign="center" fontSize="$4">
                    No sessions logged yet.
                </Text>
                <Text color={theme.textSecondary} textAlign="center" fontSize="$3">
                    Complete a focus session to see it here!
                </Text>
            </YStack>
        );
    }

    const groupedLogs = groupLogsByDate(logs);

    return (
        <YStack gap="$1">
            {groupedLogs.map((group) => (
                <YStack key={group.key}>
                    <YStack py="$2" mt="$2" mb="$1">
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                            <View style={{ height: 1, flex: 1, backgroundColor: theme.border }} />
                            <Text color={theme.textSecondary} fontSize={12} fontWeight="700"
                                textTransform="uppercase" letterSpacing={1}>
                                {group.label}
                            </Text>
                            <View style={{ height: 1, flex: 1, backgroundColor: theme.border }} />
                        </View>
                    </YStack>
                    {group.logs.map((log: any) => (
                        <MemoLogCard key={log.id} log={log} />
                    ))}
                </YStack>
            ))}

            {hasMore && (
                <YStack ai="center" py="$4">
                    {loadingMore ? (
                        <Spinner size="small" color={theme.accent} />
                    ) : (
                        <YStack
                            onPress={onLoadMore}
                            cursor="pointer"
                            backgroundColor={theme.surfaceHover}
                            borderWidth={1}
                            borderColor={theme.border}
                            borderRadius="$4"
                            px="$6" py="$3"
                            hoverStyle={{ opacity: 0.8 }}
                        >
                            <Text color={theme.text} fontSize="$3" fontWeight="600">
                                Load More Sessions
                            </Text>
                        </YStack>
                    )}
                </YStack>
            )}
        </YStack>
    );
}

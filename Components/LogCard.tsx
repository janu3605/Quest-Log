import React from 'react';
import { Image, View } from 'react-native';
import { YStack, XStack, H4, Text } from 'tamagui';
import { useAppTheme } from '../lib/theme';

interface LogCardProps {
    log: {
        id: string;
        start_time: string;
        end_time: string;
        duration_seconds: number;
        xp_earned: number;
        note: string | null;
        image_url: string | null;
        projects: {
            name: string;
            color_hex: string;
            icon_url: string | null;
            current_level: number;
        };
    };
}

export const LogCard = React.memo(function LogCard({ log }: LogCardProps) {
    const { theme } = useAppTheme();
    const { projects: quest } = log;
    const questColor = quest.color_hex || '#6366f1';

    const hours = Math.floor(log.duration_seconds / 3600);
    const minutes = Math.floor((log.duration_seconds % 3600) / 60);
    const seconds = log.duration_seconds % 60;
    const durationStr = hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m ${seconds}s`;

    const date = new Date(log.end_time);
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric', minute: '2-digit',
    });

    return (
        <YStack
            borderWidth={1}
            borderColor={theme.border}
            borderRadius="$6"
            backgroundColor={theme.card}
            overflow="hidden"
            mb="$3"
            maxWidth={600}
            w="100%"
            alignSelf="center"
        >
            <View style={{ height: 3, backgroundColor: questColor, opacity: 0.6 }} />

            {log.image_url && (
                <YStack w="100%" h={200}>
                    <Image
                        source={{ uri: log.image_url }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode="cover"
                    />
                </YStack>
            )}

            <YStack p="$4" gap="$3">
                <XStack ai="center" gap="$3">
                    {quest.icon_url ? (
                        <Image
                            source={{ uri: quest.icon_url }}
                            style={{ width: 32, height: 32, borderRadius: 8 }}
                        />
                    ) : (
                        <View style={{
                            width: 32, height: 32, borderRadius: 8,
                            backgroundColor: questColor,
                            alignItems: 'center', justifyContent: 'center',
                        }}>
                            <Text fontSize="$3" color="white">⚔</Text>
                        </View>
                    )}
                    <YStack f={1}>
                        <H4 color={theme.text} numberOfLines={1}>{quest.name}</H4>
                        <Text color={theme.textSecondary} fontSize="$2">{dateStr} · {timeStr}</Text>
                    </YStack>
                </XStack>

                <XStack
                    gap="$4" p="$3"
                    backgroundColor={theme.cardAlt}
                    borderRadius="$4"
                >
                    <YStack ai="center" f={1}>
                        <Text color={theme.textSecondary} fontSize="$2">Duration</Text>
                        <Text color={theme.text} fontWeight="bold" fontSize="$4">{durationStr}</Text>
                    </YStack>
                    <View style={{ width: 1, backgroundColor: theme.border }} />
                    <YStack ai="center" f={1}>
                        <Text color={theme.textSecondary} fontSize="$2">XP Earned</Text>
                        <Text color={theme.accent} fontWeight="bold" fontSize="$4">+{log.xp_earned}</Text>
                    </YStack>
                </XStack>

                {log.note ? (
                    <YStack
                        p="$3"
                        backgroundColor={theme.cardAlt}
                        borderRadius="$4"
                        borderLeftWidth={3}
                        borderLeftColor={questColor as any}
                    >
                        <Text color={theme.textSecondary} fontSize="$2" mb="$1">Captain's Log</Text>
                        <Text color={theme.text} fontSize="$3" lineHeight={20}>{log.note}</Text>
                    </YStack>
                ) : null}
            </YStack>
        </YStack>
    );
});

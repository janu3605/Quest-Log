import React from 'react';
import { Image } from 'react-native';
import { YStack, XStack, H4, Text } from 'tamagui';

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

export function LogCard({ log }: LogCardProps) {
    const { projects: quest } = log;

    // Format duration
    const hours = Math.floor(log.duration_seconds / 3600);
    const minutes = Math.floor((log.duration_seconds % 3600) / 60);
    const seconds = log.duration_seconds % 60;
    const durationStr = hours > 0
        ? `${hours}h ${minutes}m`
        : `${minutes}m ${seconds}s`;

    // Format date
    const date = new Date(log.end_time);
    const dateStr = date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
    });

    return (
        <YStack
            borderWidth={1}
            borderColor="$gray4"
            borderRadius="$6"
            backgroundColor="$backgroundStrong"
            overflow="hidden"
            mb="$3"
        >
            {/* Evidence Photo */}
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
                {/* Quest Identity Row */}
                <XStack ai="center" gap="$3">
                    {quest.icon_url ? (
                        <Image
                            source={{ uri: quest.icon_url }}
                            style={{ width: 32, height: 32, borderRadius: 8 }}
                        />
                    ) : (
                        <YStack
                            w={32}
                            h={32}
                            br={8}
                            bc={quest.color_hex || '$color'}
                            ai="center"
                            jc="center"
                        >
                            <Text fontSize="$3" color="white">⚔</Text>
                        </YStack>
                    )}
                    <YStack f={1}>
                        <H4 color="$color" numberOfLines={1}>{quest.name}</H4>
                        <Text color="$gray10" fontSize="$2">{dateStr} · {timeStr}</Text>
                    </YStack>
                </XStack>

                {/* Stats Row */}
                <XStack
                    gap="$4"
                    p="$3"
                    backgroundColor="$background"
                    borderRadius="$4"
                >
                    <YStack ai="center" f={1}>
                        <Text color="$gray10" fontSize="$2">Duration</Text>
                        <Text color="$color" fontWeight="bold" fontSize="$4">
                            {durationStr}
                        </Text>
                    </YStack>

                    <YStack w={1} backgroundColor="$gray5" />

                    <YStack ai="center" f={1}>
                        <Text color="$gray10" fontSize="$2">XP Earned</Text>
                        <Text color="$yellow10" fontWeight="bold" fontSize="$4">
                            +{log.xp_earned}
                        </Text>
                    </YStack>
                </XStack>

                {/* Captain's Log Notes */}
                {log.note ? (
                    <YStack
                        p="$3"
                        backgroundColor="$background"
                        borderRadius="$4"
                        borderLeftWidth={3}
                        borderLeftColor={quest.color_hex || '$yellow10'}
                    >
                        <Text color="$gray10" fontSize="$2" mb="$1">Captain's Log</Text>
                        <Text color="$color" fontSize="$3" lineHeight={20}>
                            {log.note}
                        </Text>
                    </YStack>
                ) : null}
            </YStack>
        </YStack>
    );
}

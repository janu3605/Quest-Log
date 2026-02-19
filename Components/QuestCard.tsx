import React from 'react';
import { Image } from 'react-native';
import { YStack, XStack, H2, H4, Text } from 'tamagui';
import { LiveTimer } from './LiveTimer';

interface QuestCardProps {
    project: any;
    activeTimer: any | undefined;
    onPress: (projectId: string) => void;
}

export function QuestCard({ project, activeTimer, onPress }: QuestCardProps) {
    const isRunning = !!activeTimer;

    // --- XP MATH ---
    // Assuming 100 XP per level based on our previous logic
    const currentXp = project.current_xp || 0;
    const xpInCurrentLevel = currentXp % 100; // E.g., 150 total XP = 50 XP into Level 2
    const progressPercentage = `${Math.max(2, xpInCurrentLevel)}%`; // Minimum 2% so the bar is visible

    return (
        <YStack
            // 1. Replaced buggy Card props with standard YStack styles
            borderWidth={1}
            borderColor={isRunning ? "$yellow8" : "$gray5"}
            borderRadius="$6"
            backgroundColor={isRunning ? "$gray3" : "$backgroundStrong"}

            // 2. Responsive Width Grid
            w="100%"
            $gtSm={{ w: "48%" }}
            $gtMd={{ w: "31%" }}
            $gtLg={{ w: "23%" }}

            // 3. Replaced aspectRatio with minHeight to fix the empty void
            minHeight={220}
            p="$4"
            jc="space-between"
            onPress={() => onPress(project.id)}
            cursor="pointer"
            hoverStyle={{ scale: 0.98, opacity: 0.9 }}
        >

            {/* TOP: Icon & Quest Name */}
            <XStack ai="center" gap="$3">
                {project.icon_url ? (
                    <Image
                        source={{ uri: project.icon_url }}
                        style={{ width: 40, height: 40, borderRadius: 10 }}
                    />
                ) : (
                    <YStack w={16} h={16} br={8} bc={project.color_hex || "$color"} />
                )}
                <H4 col="$color" numberOfLines={1} f={1}>{project.name}</H4>
            </XStack>

            {/* MIDDLE: Big Level & Progress Bar */}
            <YStack ai="center" gap="$3" my="$4">
                {/* Big Visible Level Number */}
                <H2 col="$color" fontWeight="900">Lv {project.current_level || 1}</H2>

                {/* The Progress Bar Container */}
                <YStack w="100%" h={10} borderRadius="$4" backgroundColor="$gray5" overflow="hidden">
                    {/* The Fill */}
                    <YStack
                        h="100%"
                        width={progressPercentage as any}
                        backgroundColor={isRunning ? "$yellow10" : "$green10"}
                    />
                </YStack>

                {/* XP Details */}
                <XStack w="100%" jc="space-between">
                    <Text col="$gray10" fontSize="$2">{xpInCurrentLevel} / 100 XP</Text>
                    <Text col="$gray10" fontSize="$2">x{project.xp_multiplier} / min</Text>
                </XStack>
            </YStack>

            {/* BOTTOM: Action Area (Timer or Start) */}
            <YStack ai="center" pt="$2" borderTopWidth={1} borderColor="$gray4">
                {isRunning ? (
                    <LiveTimer startTimeIso={activeTimer.start_time} />
                ) : (
                    <Text col="$green10" fontSize="$5" fontWeight="bold" letterSpacing={1} mt="$2">
                        START
                    </Text>
                )}
            </YStack>

        </YStack>
    );
}
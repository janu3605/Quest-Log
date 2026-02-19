import React from 'react';
import { YStack, H4, Text, Card, XStack } from 'tamagui';
import { LiveTimer } from './LiveTimer';

interface QuestCardProps {
    project: any;
    activeTimer: any | undefined;
    onPress: (projectId: string) => void;
}

export function QuestCard({ project, activeTimer, onPress }: QuestCardProps) {
    const isRunning = !!activeTimer;

    return (
        <Card
            border='1px solid'
            elevation={'$1'}
            w="100%"
            $gtSm={{ w: "48%" }}
            $gtMd={{ w: "31%" }}
            $gtLg={{ w: "23%" }}
            aspectRatio={1}
            bc={isRunning ? "$gray3" : "$backgroundStrong"}
            onPress={() => onPress(project.id)}
            p="$3"
            jc="space-between"
            cursor="pointer"
        >
            <YStack>
                {/* Color dot and Name */}
                <XStack ai="center" gap="$2" mb="$1">
                    <YStack w={8} h={8} br={4} bc={project.color_hex || "$color"} />
                    <H4 col="$color" numberOfLines={1} size="$3">{project.name}</H4>
                </XStack>
                <Text col="$gray10" fontSize="$2">Lv {project.current_level}</Text>
                <Text col="$gray10" fontSize="$1">x{project.xp_multiplier} XP</Text>
            </YStack>

            <YStack ai="center">
                {isRunning ? (
                    <LiveTimer startTimeIso={activeTimer.start_time} />
                ) : (
                    <Text col="$green10" fontSize="$2" fontWeight="bold">START</Text>
                )}
            </YStack>
        </Card>
    );
}
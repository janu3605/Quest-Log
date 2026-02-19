import React, { useEffect, useState } from 'react';
import { YStack, XStack, H1, H2, H4, Button, Text, Spinner, Circle } from 'tamagui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { supabase } from '../../lib/supabase';

export default function SessionScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [project, setProject] = useState<any>(null);
    const [timer, setTimer] = useState<any>(null);
    const [now, setNow] = useState(Date.now());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSessionData();
        // High-speed tick for smooth clock updates
        const interval = setInterval(() => setNow(Date.now()), 1000);
        return () => clearInterval(interval);
    }, []);

    const fetchSessionData = async () => {
        // Get Project Info
        const { data: pData } = await supabase.from('projects').select('*').eq('id', id).single();
        // Get Timer Info
        const { data: tData } = await supabase.from('active_timers').select('*').eq('project_id', id).single();

        setProject(pData);
        setTimer(tData);
        setLoading(false);
    };

    const endSession = async () => {
        setLoading(true);
        // 1. In Phase 3, we will calculate XP here. For now, we just delete the timer.
        await supabase.from('active_timers').delete().eq('project_id', id);
        // 2. Go back to Dashboard
        router.back();
    };

    // Big Clock Formatter
    const getFormattedTime = () => {
        if (!timer) return { h: "00", m: "00", s: "00" };
        const start = new Date(timer.start_time).getTime();
        const diff = Math.floor((now - start) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        return { h, m, s };
    };

    if (loading || !project) return <YStack f={1} bc="$background" ai="center" jc="center"><Spinner size="large" /></YStack>;

    const { h, m, s } = getFormattedTime();

    return (
        <YStack f={1} bc="$background" ai="center" jc="space-between" p="$6" pt="$10" pb="$10">

            {/* Header */}
            <YStack ai="center" gap="$2">
                <H4 col="$gray10" textTransform="uppercase" letterSpacing={2}>Focused Session</H4>
                <H2 col={project.color_hex || "$color"} ta="center">{project.name}</H2>
                <Text col="$gray10">x{project.xp_multiplier} XP Multiplier</Text>
            </YStack>

            {/* The Giant Timer & Vector Graphics */}
            <YStack ai="center" jc="center">
                {/* Simple "Radar" Vector rings */}
                <Circle size={300} bc="$gray3" pos="absolute" opacity={0.3} />
                <Circle size={250} bc="$gray4" pos="absolute" opacity={0.5} />

                {/* The Clock */}
                <XStack ai="baseline" gap="$2">
                    {h !== "00" && <H1 col="$color" fontSize={60} fontFamily="$mono">{h}:</H1>}
                    <H1 col="$color" fontSize={80} fontFamily="$mono">{m}:</H1>
                    <H1 col="$yellow10" fontSize={80} fontFamily="$mono">{s}</H1>
                </XStack>
            </YStack>

            {/* Footer Controls */}
            <YStack w="100%" gap="$4">
                <Button
                    size="$6"
                    theme="active"
                    bc="$red10"
                    onPress={endSession}
                    pressStyle={{ scale: 0.95 }}
                >
                    End & Log Session
                </Button>
                <Button size="$4" chromeless borderColor="$gray10" onPress={() => router.back()}>
                    Minimize (Keep Running)
                </Button>
            </YStack>

        </YStack>
    );
}
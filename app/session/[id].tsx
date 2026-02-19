import React, { useEffect, useState } from 'react';
import { Image } from 'react-native';
import { YStack, XStack, H1, H2, H4, Button, Text, Spinner, TextArea } from 'tamagui';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';

export default function SessionScreen() {
    const { id } = useLocalSearchParams();
    const router = useRouter();

    const [project, setProject] = useState<any>(null);
    const [timer, setTimer] = useState<any>(null);
    const [now, setNow] = useState(Date.now());
    const [loading, setLoading] = useState(true);

    const [sessionState, setSessionState] = useState<'running' | 'logging'>('running');
    const [note, setNote] = useState('');
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [finalStats, setFinalStats] = useState({ seconds: 0, xp: 0, endMs: 0 });
    const [bgUrl, setBgUrl] = useState('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop'); // Fallback image

    useEffect(() => {
        fetchSessionData();
        fetchRandomBackground();
        const interval = setInterval(() => {
            if (sessionState === 'running') setNow(Date.now());
        }, 1000);
        return () => clearInterval(interval);
    }, [sessionState]);

    const fetchSessionData = async () => {
        const { data: pData } = await supabase.from('projects').select('*').eq('id', id).single();
        const { data: tData } = await supabase.from('active_timers').select('*').eq('project_id', id).single();

        setProject(pData);
        setTimer(tData);
        setLoading(false);
    };

    // 🛑 Stops the timer and moves to the Logging screen
    const handleStopTimer = () => {
        if (!timer || !project) return;
        const startMs = new Date(timer.start_time).getTime();
        const endMs = Date.now();
        const durationSeconds = Math.max(1, Math.floor((endMs - startMs) / 1000));
        const durationMinutes = Math.max(1, Math.floor(durationSeconds / 60));
        const xpEarned = Math.floor(durationMinutes * project.xp_multiplier);

        setFinalStats({ seconds: durationSeconds, xp: xpEarned, endMs });
        setSessionState('logging');
    };

    // 🗑️ Cancels the quest entirely without saving XP
    const cancelSession = async () => {
        setLoading(true);
        // Delete the active timer from the database
        await supabase.from('active_timers').delete().eq('project_id', id);
        // Go back to the dashboard
        router.back();
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            quality: 0.7,
        });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    // 2. Add this function
    const fetchRandomBackground = async () => {
        const { data } = await supabase.from('backgrounds').select('url');
        if (data && data.length > 0) {
            const randomIndex = Math.floor(Math.random() * data.length);
            setBgUrl(data[randomIndex].url);
        }
    };

    const saveLog = async () => {
        setLoading(true);
        let finalImageUrl = null;

        if (imageUri) {
            try {
                const fileExt = imageUri.split('.').pop();
                const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
                const response = await fetch(imageUri);
                const blob = await response.blob();

                const { error: uploadError } = await supabase.storage.from('quest-images').upload(fileName, blob);
                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage.from('quest-images').getPublicUrl(fileName);
                finalImageUrl = publicUrl;
            } catch (err: any) {
                alert(`Image Upload Failed: ${err.message}`);
                setLoading(false); return;
            }
        }

        const currentXp = project.current_xp || 0;
        const newTotalXp = currentXp + finalStats.xp;
        const newLevel = Math.floor(newTotalXp / 100) + 1;

        const { error: logError } = await supabase.from('logs').insert([{
            user_id: project.user_id,
            project_id: project.id,
            start_time: timer.start_time,
            end_time: new Date(finalStats.endMs).toISOString(),
            duration_seconds: finalStats.seconds,
            xp_earned: finalStats.xp,
            note: note,
            image_url: finalImageUrl
        }]);

        if (logError) { alert(`Log Error: ${logError.message}`); setLoading(false); return; }

        await supabase.from('projects').update({ current_xp: newTotalXp, current_level: newLevel }).eq('id', project.id);
        await supabase.from('active_timers').delete().eq('project_id', id);
        router.back();
    };

    const getFormattedTime = () => {
        if (!timer) return { h: "00", m: "00", s: "00" };
        const start = new Date(timer.start_time).getTime();
        const diff = Math.floor((now - start) / 1000);
        const h = Math.floor(diff / 3600).toString().padStart(2, '0');
        const m = Math.floor((diff % 3600) / 60).toString().padStart(2, '0');
        const s = (diff % 60).toString().padStart(2, '0');
        return { h, m, s };
    };

    if (loading || !project) return <YStack f={1} bc="$background" ai="center" jc="center"><Spinner size="large" color="$yellow10" /></YStack>;

    const { h, m, s } = getFormattedTime();

    return (
        <YStack f={1} backgroundColor="black">

            <YStack fullscreen zIndex={0}>
                <Image
                    source={{ uri: bgUrl }}
                    style={{ width: '100%', height: '100%', opacity: 0.25, position: 'absolute' }}
                    resizeMode="cover"
                />
            </YStack>

            {/* 🛡️ CONTENT CONTAINER */}
            <YStack
                f={1}
                w="100%"
                maxWidth={600}
                alignSelf="center"
                jc="space-between"
                p="$6"
                pt="$10"
                pb="$10"
                zIndex={1}
            >

                {/* Header */}
                <YStack ai="center" gap="$2">
                    <H4 color="$gray10" textTransform="uppercase" letterSpacing={2}>
                        {sessionState === 'running' ? 'Focused Session' : 'Session Complete'}
                    </H4>
                    <H2 color={project.color_hex || "$color"} textAlign="center" fontSize={40}>{project.name}</H2>
                </YStack>

                {sessionState === 'running' ? (

                    // {/* HUGE TIMER */ }
                    <YStack ai="center" jc="center" f={1}>
                        <XStack ai="baseline" gap="$2">
                            {h !== "00" && <H1 color="$color" fontSize={80} fontFamily="$mono">{h}:</H1>}
                            <H1 color="$color" fontSize={100} fontFamily="$mono">{m}:</H1>
                            <H1 color="$yellow10" fontSize={100} fontFamily="$mono">{s}</H1>
                        </XStack>
                    </YStack>

                ) : (

                    // {/* LOGGING FORM */ }
                    <YStack f={1} jc="center" gap="$4">
                        <YStack ai="center" gap="$1" p="$4" backgroundColor="rgba(0,0,0,0.5)" borderRadius="$6" borderWidth={1} borderColor="$gray4">
                            <Text color="$gray10" fontSize="$5">Time: {Math.floor(finalStats.seconds / 60)}m {finalStats.seconds % 60}s</Text>
                            <H1 color="$yellow10" fontSize={50}>+{finalStats.xp} XP</H1>
                        </YStack>

                        <TextArea
                            size="$5"
                            placeholder="What did you accomplish?"
                            value={note}
                            onChangeText={setNote}
                            minHeight={120}
                            backgroundColor="rgba(0,0,0,0.5)"
                        />

                        <YStack gap="$2" ai="center">
                            {imageUri ? (
                                <YStack ai="center" gap="$2">
                                    <Image source={{ uri: imageUri }} style={{ width: 120, height: 120, borderRadius: 12 }} />
                                    <Button size="$3" chromeless onPress={() => setImageUri(null)}>
                                        <Text color="$red10">Remove Image</Text>
                                    </Button>
                                </YStack>
                            ) : (
                                <Button size="$4" variant="outlined" onPress={pickImage} w="100%" backgroundColor="rgba(0,0,0,0.5)">
                                    📸 Add Evidence Photo
                                </Button>
                            )}
                        </YStack>
                    </YStack>
                )}

                {/* Footer Buttons */}
                <YStack w="100%" gap="$4">
                    {sessionState === 'running' ? (
                        <>
                            <Button size="$6" theme="active" backgroundColor="$yellow10" onPress={handleStopTimer} borderRadius="$8">
                                <Text color="black">Stop & Log Session</Text>
                            </Button>

                            {/* Split row for Minimize and Cancel */}
                            <XStack gap="$4" w="100%">
                                <Button f={1} size="$4" chromeless onPress={() => router.back()}>
                                    <Text color="$gray10">Minimize</Text>
                                </Button>
                                <Button f={1} size="$4" chromeless onPress={cancelSession}>
                                    <Text color="$red10">Cancel Quest</Text>
                                </Button>
                            </XStack>
                        </>
                    ) : (
                        <>
                            <Button size="$6" theme="active" backgroundColor="$green10" onPress={saveLog} borderRadius="$8">
                                Save to Log
                            </Button>
                            <Button size="$4" chromeless onPress={() => setSessionState('running')}>
                                < Text color="$gray10"> Resume Session </Text>
                            </Button>
                        </>
                    )}
                </YStack>

            </YStack>
        </YStack >
    );
}
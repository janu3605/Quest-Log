import { useState, useCallback } from 'react';
import { ScrollView, RefreshControl } from 'react-native';
import { YStack, H1, Text, Spinner } from 'tamagui';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { LogCard } from '../../Components/LogCard';

export default function JournalScreen() {
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);

    useFocusEffect(
        useCallback(() => {
            fetchLogs();
        }, [])
    );

    const fetchLogs = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data, error } = await supabase
            .from('logs')
            .select('*, projects(name, color_hex, icon_url, current_level)')
            .eq('user_id', session.user.id)
            .order('end_time', { ascending: false });

        if (!error && data) {
            setLogs(data);
        }
        setLoading(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchLogs();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <YStack f={1} bc="$background" ai="center" jc="center">
                <Spinner size="large" color="$yellow10" />
            </YStack>
        );
    }

    // Calculate totals for the header
    const totalXp = logs.reduce((sum, l) => sum + (l.xp_earned || 0), 0);
    const totalSessions = logs.length;
    const totalMinutes = Math.floor(
        logs.reduce((sum, l) => sum + (l.duration_seconds || 0), 0) / 60
    );

    return (
        <YStack f={1} backgroundColor="$background" p="$6" pt="$8">
            <H1 color="$color" mb="$2">Journal</H1>
            <Text color="$gray10" mb="$5" fontSize="$3">
                {totalSessions} sessions · {totalMinutes >= 60
                    ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                    : `${totalMinutes}m`
                } focused · {totalXp} XP earned
            </Text>

            <ScrollView
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor="#f5d020"
                    />
                }
            >
                {logs.length === 0 ? (
                    <YStack ai="center" jc="center" py="$10" gap="$3">
                        <Text fontSize={48}>📜</Text>
                        <Text color="$gray10" textAlign="center" fontSize="$4">
                            No sessions logged yet.
                        </Text>
                        <Text color="$gray8" textAlign="center" fontSize="$3">
                            Complete a focus session to see it here!
                        </Text>
                    </YStack>
                ) : (
                    <YStack pb="$4">
                        {logs.map((log) => (
                            <LogCard key={log.id} log={log} />
                        ))}
                    </YStack>
                )}
            </ScrollView>
        </YStack>
    );
}

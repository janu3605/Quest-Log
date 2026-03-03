import { useState, useCallback, useRef } from 'react';
import { ScrollView, RefreshControl, useWindowDimensions } from 'react-native';
import { YStack, XStack, H1, Text, Spinner } from 'tamagui';
import { useFocusEffect } from 'expo-router';
import { supabase } from '../../lib/supabase';
import { useAppTheme } from '../../lib/theme';
import { JournalSidebar } from '../../Components/JournalSidebar';
import { JournalChallenges } from '../../Components/JournalChallenges';
import { JournalActivityFeed } from '../../Components/JournalActivityFeed';

const PAGE_SIZE = 15;

export default function JournalScreen() {
    const { theme } = useAppTheme();
    const { width } = useWindowDimensions();
    const isWide = width >= 900;
    const isMedium = width >= 600 && width < 900;

    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [logs, setLogs] = useState<any[]>([]);
    const [projects, setProjects] = useState<any[]>([]);
    const [hasMore, setHasMore] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const pageRef = useRef(0);

    const [totalXp, setTotalXp] = useState(0);
    const [totalSessions, setTotalSessions] = useState(0);
    const [totalMinutes, setTotalMinutes] = useState(0);
    const [streakDays, setStreakDays] = useState<boolean[]>([false, false, false, false, false, false, false]);
    const [currentStreak, setCurrentStreak] = useState(0);
    const [longestSessionMinutes, setLongestSessionMinutes] = useState(0);
    const [maxDailyQuests, setMaxDailyQuests] = useState(0);

    useFocusEffect(
        useCallback(() => { fetchAll(); }, [])
    );

    const fetchAll = async () => {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const uid = session.user.id;

        pageRef.current = 0;
        setHasMore(true);

        const [logsResult, projectsResult, allLogsResult] = await Promise.all([
            supabase.from('logs').select('*, projects(name, color_hex, icon_url, current_level)')
                .eq('user_id', uid).order('end_time', { ascending: false }).range(0, PAGE_SIZE - 1),
            supabase.from('projects').select('*').eq('user_id', uid).order('current_level', { ascending: false }),
            supabase.from('logs').select('end_time, duration_seconds, xp_earned, project_id')
                .eq('user_id', uid).order('end_time', { ascending: false }),
        ]);

        const feedLogs = logsResult.data || [];
        const projs = projectsResult.data || [];
        const allLogs = allLogsResult.data || [];

        setLogs(feedLogs);
        setProjects(projs);
        setHasMore(feedLogs.length >= PAGE_SIZE);

        let xp = 0, sessions = 0, totalSec = 0, longestSec = 0;
        const dayQuestMap: Record<string, Set<string>> = {};
        for (const log of allLogs) {
            xp += log.xp_earned || 0;
            sessions++;
            totalSec += log.duration_seconds || 0;
            if ((log.duration_seconds || 0) > longestSec) longestSec = log.duration_seconds;
            const dayKey = new Date(log.end_time).toDateString();
            if (!dayQuestMap[dayKey]) dayQuestMap[dayKey] = new Set();
            dayQuestMap[dayKey].add(log.project_id);
        }
        setTotalXp(xp);
        setTotalSessions(sessions);
        setTotalMinutes(Math.floor(totalSec / 60));
        setLongestSessionMinutes(Math.floor(longestSec / 60));

        let maxDaily = 0;
        for (const set of Object.values(dayQuestMap)) {
            if (set.size > maxDaily) maxDaily = set.size;
        }
        setMaxDailyQuests(maxDaily);

        const logDates = [...new Set(allLogs.map(l => new Date(l.end_time).toDateString()))];
        logDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < logDates.length; i++) {
            const d = new Date(logDates[i]);
            d.setHours(0, 0, 0, 0);
            const expected = new Date(today);
            expected.setDate(expected.getDate() - i);
            if (d.getTime() === expected.getTime()) streak++;
            else break;
        }
        setCurrentStreak(streak);

        const now = new Date();
        const dayOfWeek = now.getDay();
        const mondayOffset = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const monday = new Date(now);
        monday.setDate(now.getDate() - mondayOffset);
        monday.setHours(0, 0, 0, 0);
        const logDateSet = new Set(allLogs.map(l => new Date(l.end_time).toDateString()));
        const weekDays: boolean[] = [];
        for (let i = 0; i < 7; i++) {
            const d = new Date(monday);
            d.setDate(monday.getDate() + i);
            weekDays.push(logDateSet.has(d.toDateString()));
        }
        setStreakDays(weekDays);
        setLoading(false);
    };

    const loadMore = async () => {
        if (loadingMore || !hasMore) return;
        setLoadingMore(true);
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;
        const nextPage = pageRef.current + 1;
        const from = nextPage * PAGE_SIZE;
        const to = from + PAGE_SIZE - 1;
        const { data } = await supabase.from('logs')
            .select('*, projects(name, color_hex, icon_url, current_level)')
            .eq('user_id', session.user.id).order('end_time', { ascending: false }).range(from, to);
        if (data) {
            setLogs(prev => [...prev, ...data]);
            setHasMore(data.length >= PAGE_SIZE);
            pageRef.current = nextPage;
        }
        setLoadingMore(false);
    };

    const onRefresh = async () => {
        setRefreshing(true);
        await fetchAll();
        setRefreshing(false);
    };

    if (loading) {
        return (
            <YStack f={1} backgroundColor={theme.bg} ai="center" jc="center">
                <Spinner size="large" color={theme.accent} />
            </YStack>
        );
    }

    const topQuests = projects.slice(0, 3);
    const maxLevel = projects.reduce((max: number, p: any) => Math.max(max, p.current_level || 1), 0);

    const sidebarProps = {
        totalXp, totalSessions, totalMinutes,
        streakDays, currentStreak, topQuests,
    };
    const challengeProps = {
        totalXp, currentStreak, maxLevel,
        longestSessionMinutes, totalSessions, maxDailyQuests,
    };
    const feedProps = {
        logs, loading: false, hasMore, onLoadMore: loadMore, loadingMore,
    };

    // ─── WIDE WEB LAYOUT (3-column) ───
    if (isWide) {
        return (
            <YStack f={1} backgroundColor={theme.bg}>
                <ScrollView showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}>
                    <YStack px="$6" pt="$8" pb="$4">
                        <H1 color={theme.text} mb="$1">Journal</H1>
                        <Text color={theme.textSecondary} fontSize="$3">
                            Your quest log — track every session, see your progress.
                        </Text>
                    </YStack>
                    <XStack px="$6" pb="$8" gap="$5" ai="flex-start">
                        <JournalSidebar {...sidebarProps} />
                        <YStack f={1} minWidth={300}>
                            <JournalActivityFeed {...feedProps} />
                        </YStack>
                        <JournalChallenges {...challengeProps} />
                    </XStack>
                </ScrollView>
            </YStack>
        );
    }

    // ─── MEDIUM LAYOUT ───
    if (isMedium) {
        return (
            <YStack f={1} backgroundColor={theme.bg}>
                <ScrollView showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}>
                    <YStack px="$5" pt="$8" pb="$4">
                        <H1 color={theme.text} mb="$1">Journal</H1>
                    </YStack>
                    <XStack px="$5" pb="$4" gap="$4" flexWrap="wrap">
                        <JournalSidebar {...sidebarProps} />
                    </XStack>
                    <YStack px="$5" pb="$8">
                        <JournalActivityFeed {...feedProps} />
                    </YStack>
                </ScrollView>
            </YStack>
        );
    }

    // ─── MOBILE LAYOUT ───
    return (
        <YStack f={1} backgroundColor={theme.bg}>
            <ScrollView showsVerticalScrollIndicator={false}
                refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.accent} />}>
                <YStack px="$4" pt="$8" pb="$2">
                    <H1 color={theme.text} mb="$1">Journal</H1>
                    <Text color={theme.textSecondary} fontSize="$2" mb="$3">
                        {totalSessions} sessions · {totalMinutes >= 60
                            ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m`
                            : `${totalMinutes}m`
                        } focused · {totalXp} XP earned
                    </Text>
                </YStack>
                <XStack px="$4" pb="$4" gap="$3" flexWrap="wrap">
                    <JournalSidebar {...sidebarProps} />
                </XStack>
                <YStack px="$4" pb="$8">
                    <JournalActivityFeed {...feedProps} />
                </YStack>
            </ScrollView>
        </YStack>
    );
}

import { useState, useCallback } from 'react';
import { ScrollView, View, Pressable } from 'react-native';
import { YStack, XStack, H1, Button, Text, Spinner } from 'tamagui';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { supabase } from '../../lib/supabase';
import { QuestCard } from '../../Components/QuestCard';
import { ThemeSwitcher } from '../../Components/ThemeSwitcher';
import { useAppTheme } from '../../lib/theme';

export default function Dashboard() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTimers, setActiveTimers] = useState<any[]>([]);
  const [uploadingBg, setUploadingBg] = useState(false);
  const [streaks, setStreaks] = useState<Record<string, number>>({});

  useFocusEffect(
    useCallback(() => {
      checkAuth();
    }, [])
  );

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/login');
    } else {
      setUser(session.user);
      await fetchData(session.user.id);
    }
  };

  const fetchData = async (userId: string) => {
    // ── Parallel data fetching for speed ──
    const [projResult, timerResult, logResult] = await Promise.all([
      supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false }),
      supabase.from('active_timers').select('*').eq('user_id', userId),
      supabase.from('logs').select('project_id, end_time').eq('user_id', userId).order('end_time', { ascending: false }),
    ]);

    setProjects(projResult.data || []);
    setActiveTimers(timerResult.data || []);

    // Compute streaks from logs
    const logData = logResult.data;
    if (logData) {
      const streakMap: Record<string, number> = {};
      const grouped: Record<string, string[]> = {};
      for (const log of logData) {
        if (!grouped[log.project_id]) grouped[log.project_id] = [];
        grouped[log.project_id].push(log.end_time);
      }
      for (const [projId, times] of Object.entries(grouped)) {
        const days = [...new Set(times.map(t => new Date(t).toDateString()))];
        days.sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        let streak = 0;
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        for (let i = 0; i < days.length; i++) {
          const d = new Date(days[i]);
          d.setHours(0, 0, 0, 0);
          const expected = new Date(today);
          expected.setDate(expected.getDate() - i);
          if (d.getTime() === expected.getTime()) {
            streak++;
          } else {
            break;
          }
        }
        streakMap[projId] = streak;
      }
      setStreaks(streakMap);
    }

    setLoading(false);
  };

  const handleCardPress = async (projectId: string) => {
    const isRunning = activeTimers.find(t => t.project_id === projectId);
    if (!isRunning) {
      const newTimer = { project_id: projectId, start_time: new Date().toISOString(), user_id: user.id };
      await supabase.from('active_timers').insert([newTimer]);
    }
    router.push(`/session/${projectId}`);
  };

  const uploadNewBackground = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        quality: 0.8,
      });
      if (!result.canceled) {
        setUploadingBg(true);
        const assetUri = result.assets[0].uri;
        const fileExt = assetUri.split('.').pop();
        const fileName = `bg-${Date.now()}-${Math.random()}.${fileExt}`;
        const response = await fetch(assetUri);
        const blob = await response.blob();
        const { error: uploadError } = await supabase.storage.from('quest-images').upload(fileName, blob);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('quest-images').getPublicUrl(fileName);
        const { error: dbError } = await supabase.from('backgrounds').insert([{ url: publicUrl }]);
        if (dbError) throw dbError;
        alert("Background added! It will now appear randomly in sessions.");
      }
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingBg(false);
    }
  };

  if (loading) return <YStack f={1} bc={theme.bg} ai="center" jc="center"><Spinner size="large" color={theme.accent} /></YStack>;

  const runningCount = activeTimers.length;

  return (
    <YStack f={1} backgroundColor={theme.bg} p="$4" pt="$8">

      {/* Header */}
      <XStack jc="space-between" ai="center" mb="$2">
        <YStack>
          <H1 color={theme.text} fontSize={28}>🛡️ Quests</H1>
          <Text color={theme.textSecondary} fontSize="$2" mt="$1">
            {projects.length} quest{projects.length !== 1 ? 's' : ''}
            {runningCount > 0 ? ` · ${runningCount} active` : ''}
          </Text>
        </YStack>
        <XStack ai="center" gap="$3">
          <ThemeSwitcher />
          <Button size="$3" chromeless onPress={() => supabase.auth.signOut().then(() => router.replace('/login'))}>
            <Text color={theme.textSecondary} fontSize="$2">Log Out</Text>
          </Button>
        </XStack>
      </XStack>

      {/* Accent line */}
      <View style={{
        height: 2, backgroundColor: theme.accent, marginBottom: 20,
        borderRadius: 1, opacity: 0.4,
      }} />

      <ScrollView showsVerticalScrollIndicator={false}>
        {projects.length === 0 ? (
          <YStack ai="center" jc="center" py="$10" gap="$3">
            <Text fontSize={48}>⚔</Text>
            <Text color={theme.text} textAlign="center" fontSize="$4">
              No quests yet. Forge your first!
            </Text>
            <Text color={theme.textSecondary} textAlign="center" fontSize="$3">
              Track your hobbies, earn XP, level up.
            </Text>
          </YStack>
        ) : (
          <XStack flexWrap="wrap" jc="flex-start" gap="3%" pb="$8">
            {projects.map((project) => (
              <QuestCard
                key={project.id}
                project={project}
                activeTimer={activeTimers.find(t => t.project_id === project.id)}
                onPress={handleCardPress}
                onEdit={(id) => router.push(`/edit-quest?id=${id}`)}
                streak={streaks[project.id] || 0}
              />
            ))}
          </XStack>
        )}
      </ScrollView>

      {/* Create Button */}
      <Pressable
        onPress={() => router.push('/add-quest')}
        style={{ alignSelf: 'center', marginTop: 'auto', marginBottom: 8 }}
      >
        <View style={{
          backgroundColor: theme.accent,
          paddingHorizontal: 32, paddingVertical: 14,
          borderRadius: 16, flexDirection: 'row',
          alignItems: 'center', gap: 8,
        }}>
          <Text color={theme.statusBarStyle === 'light' ? 'black' : 'white'} fontWeight="900" fontSize="$4">
            ⚔ Create New Quest
          </Text>
        </View>
      </Pressable>

      {/* Floating Add Background Button */}
      <Pressable
        onPress={uploadNewBackground}
        disabled={uploadingBg}
        style={{ position: 'absolute', bottom: 12, right: 16, zIndex: 100 }}
      >
        <View style={{
          width: 48, height: 48, borderRadius: 24,
          backgroundColor: theme.surfaceHover,
          borderWidth: 1, borderColor: theme.border,
          alignItems: 'center', justifyContent: 'center',
        }}>
          {uploadingBg ? <Spinner color={theme.accent} /> : <Text fontSize={20}>🖼️</Text>}
        </View>
      </Pressable>

    </YStack>
  );
}
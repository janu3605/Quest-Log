import { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, H1, Button, Text, Spinner } from 'tamagui';
import { useRouter, useFocusEffect } from 'expo-router';
import { supabase } from '../lib/supabase';
import { QuestCard } from '../Components/QuestCard';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTimers, setActiveTimers] = useState<any[]>([]);

  // 🔥 THIS FIXES THE RELOAD BUG
  // It runs every time this screen comes into focus
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
    const { data: projData } = await supabase.from('projects').select('*').eq('user_id', userId).order('created_at', { ascending: false });
    const { data: timerData } = await supabase.from('active_timers').select('*').eq('user_id', userId);

    setProjects(projData || []);
    setActiveTimers(timerData || []);
    setLoading(false);
  };

  const handleCardPress = async (projectId: string) => {
    const isRunning = activeTimers.find(t => t.project_id === projectId);
    
    if (!isRunning) {
      // Start the timer in DB before opening session
      const newTimer = { project_id: projectId, start_time: new Date().toISOString(), user_id: user.id };
      await supabase.from('active_timers').insert([newTimer]);
    }
    
    // Jump to the Focus Session screen
    router.push(`/session/${projectId}`);
  };

  if (loading) return <YStack f={1} bc="$background" ai="center" jc="center"><Spinner size="large" color="$yellow10" /></YStack>;

  return (
    <YStack f={1} bc="$background" p="$4" pt="$8">
      <XStack jc="space-between" ai="center" mb="$6">
        <H1 col="$color">Quests</H1>
        <Button size="$3" chromeless borderColor="$red10" onPress={() => supabase.auth.signOut().then(() => router.replace('/login'))}>Log Out</Button>
      </XStack>

      <ScrollView>
        {projects.length === 0 ? (
          <Text col="$gray10" ta="center" mt="$4">No active quests. Go create one!</Text>
        ) : (
          // 🔥 THIS IS THE 3-COLUMN GRID
          <XStack fw="wrap" jc="flex-start" gap="3%" pb="$8">
            {projects.map((project) => (
              <QuestCard 
                key={project.id}
                project={project}
                activeTimer={activeTimers.find(t => t.project_id === project.id)}
                onPress={handleCardPress}
              />
            ))}
          </XStack>
        )}
      </ScrollView>

      <Button size="$5" theme="active" onPress={() => router.push('/add-quest')} mt="auto">
        + Create New Quest
      </Button>
    </YStack>
  );
}
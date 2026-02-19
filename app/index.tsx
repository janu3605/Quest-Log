import { useState, useCallback } from 'react';
import { ScrollView } from 'react-native';
import { YStack, XStack, H1, Button, Text, Spinner } from 'tamagui';
import { useRouter, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker'; // 📸 NEW IMPORT
import { supabase } from '../lib/supabase';
import { QuestCard } from '../Components/QuestCard';

export default function Dashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [activeTimers, setActiveTimers] = useState<any[]>([]);

  // ⏳ State to show a spinner while background uploads
  const [uploadingBg, setUploadingBg] = useState(false);

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
      const newTimer = { project_id: projectId, start_time: new Date().toISOString(), user_id: user.id };
      await supabase.from('active_timers').insert([newTimer]);
    }

    router.push(`/session/${projectId}`);
  };

  // 🖼️ THE NEW BACKGROUND UPLOAD FUNCTION
  const uploadNewBackground = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All, // Allows GIFs and Images!
        quality: 0.8,
      });

      if (!result.canceled) {
        setUploadingBg(true); // Start the spinner
        const assetUri = result.assets[0].uri;

        // 1. Upload to Supabase Storage
        const fileExt = assetUri.split('.').pop();
        const fileName = `bg-${Date.now()}-${Math.random()}.${fileExt}`;
        const response = await fetch(assetUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage.from('quest-images').upload(fileName, blob);
        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('quest-images').getPublicUrl(fileName);

        // 2. Add to your randomized 'backgrounds' table
        const { error: dbError } = await supabase.from('backgrounds').insert([{ url: publicUrl }]);
        if (dbError) throw dbError;

        alert("Background added! It will now appear randomly in sessions.");
      }
    } catch (error: any) {
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingBg(false); // Stop the spinner
    }
  };

  if (loading) return <YStack f={1} bc="$background" ai="center" jc="center"><Spinner size="large" color="$yellow10" /></YStack>;

  return (
    <YStack f={1} backgroundColor="$background" p="$4" pt="$8">
      <XStack jc="space-between" ai="center" mb="$6">
        <H1 color="$color">Quests</H1>
        <Button size="$3" chromeless onPress={() => supabase.auth.signOut().then(() => router.replace('/login'))}>
          <Text color="$red10"></Text>Log Out</Button>
      </XStack>

      <ScrollView>
        {projects.length === 0 ? (
          <Text color="$gray10" textAlign="center" mt="$4">No active quests. Go create one!</Text>
        ) : (
          <XStack flexWrap="wrap" jc="flex-start" gap="3%" pb="$8">
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

      <Button size="$5" maxWidth={'50%'} alignSelf='center' theme="active" borderColor={'yellowgreen'} onPress={() => router.push('/add-quest')} mt="auto">
        + Create New Quest
      </Button>

      {/* 🖼️ THE FLOATING ADD BACKGROUND BUTTON */}
      <Button
        size="$5"
        // circular
        theme="active"
        backgroundColor="$gray4"
        borderColor={'black'}
        position="absolute"
        bottom={15}
        right={20}
        zIndex={100}
        elevation="$4"
        onPress={uploadNewBackground}
        disabled={uploadingBg}
      >
        {uploadingBg ? <Spinner color="$yellow10" /> : "🖼️"}
      </Button>

    </YStack>
  );
}
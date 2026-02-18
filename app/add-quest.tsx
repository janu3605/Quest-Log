import React, { useState } from 'react';
import { View } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
// Import UI components from Tamagui
import { 
  YStack, XStack, Text, Button, Input, Slider, Card, Label, H2, H4 
} from 'tamagui';

export default function AddQuestScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(1.0);
  const [loading, setLoading] = useState(false);

  // The Logic: Saving to Supabase
  const createQuest = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert("You need to be logged in!");
      setLoading(false);
      return;
    }

    const { error } = await supabase
      .from('projects')
      .insert([
        {
          user_id: user.id,
          name: name,
          xp_multiplier: difficulty,
          // We can add color logic later
          color_hex: '#6366f1', 
        }
      ]);

    if (error) {
      alert(error.message);
    } else {
      router.back(); // Go back to dashboard on success
    }
    setLoading(false);
  };

  // The UI: "Game-like" Class Selection
  return (
    <YStack f={1} bc="$background" jc="center" ai="center" p="$4" gap="$4">
      
      <H2 color="$color">Unlock New Skill</H2>
      
      {/* 1. The Name Input */}
      <YStack w="100%" gap="$2">
        <Label>Skill Name</Label>
        <Input 
          size="$4" 
          placeholder="e.g. Woodworking, Rust, Cooking" 
          onChangeText={setName} 
          value={name}
        />
      </YStack>

      {/* 2. The Difficulty Slider (XP Multiplier) */}
      <YStack w="100%" gap="$4" p="$4" bc="$backgroundStrong" br="$4">
        <XStack jc="space-between">
          <H4>Difficulty Multiplier</H4>
          <H4 color="$yellow10">x{difficulty.toFixed(1)} XP</H4>
        </XStack>
        
        <Slider 
          defaultValue={[1]} 
          max={2.0} 
          min={0.5} 
          step={0.1} 
          onValueChange={(val) => setDifficulty(val[0])}
        >
          <Slider.Track>
            <Slider.TrackActive bc="$yellow10" />
          </Slider.Track>
          <Slider.Thumb size="$2" index={0} circular elevate />
        </Slider>

        <Text ta="center" color="$gray10">
          {difficulty < 1.0 ? "Relaxing / Passive" : 
           difficulty === 1.0 ? "Standard Flow" : 
           "Hardcore / Grind"}
        </Text>
      </YStack>

      {/* 3. The "Unlock" Button */}
      <Button 
        theme="active" 
        size="$5" 
        onPress={createQuest}
        disabled={loading}
      >
        {loading ? "Unlocking..." : "Unlock Skill"}
      </Button>

    </YStack>
  );
}
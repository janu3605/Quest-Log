import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import {
  YStack, H2, Button, Input, Slider, Text, Label, Spinner
} from 'tamagui';

export default function AddQuestScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(1.0);
  const [saving, setSaving] = useState(false);

  const createQuest = async () => {
    if (!name) return alert("Give your quest a name!");

    setSaving(true);

    // 1. Get the current user (Auto-logged in by Dashboard)
    const { data: { user } } = await supabase.auth.getUser();

    // 2. Save directly
    if (user) {
      const { error } = await supabase.from('projects').insert([
        {
          user_id: user.id,
          name: name,
          xp_multiplier: difficulty,
          color_hex: '#6366f1',
        }
      ]);

      if (error) alert(error.message);
      else router.back();
    }

    setSaving(false);
  };

  return (
    <YStack f={1} bc="$background" jc="center" ai="center" p="$4" gap="$4">
      <H2 color="$color">New Quest</H2>

      <YStack w="100%" gap="$2">
        <Label>Quest Name</Label>
        <Input
          size="$4"
          placeholder="e.g. Learn Rust, Morning Run"
          onChangeText={setName}
          value={name}
          autoFocus // Keyboard opens automatically
        />
      </YStack>

      <YStack w="100%" gap="$4" p="$4" bc="$backgroundStrong" br="$4">
        <YStack fd="row" jc="space-between">
          <Text color="$color" fontWeight="bold">Difficulty</Text>
          <Text color="$yellow10" fontWeight="bold">x{difficulty.toFixed(1)} XP</Text>
        </YStack>

        <Slider
          defaultValue={[1]}
          max={2.0}
          min={0.5}
          step={0.1}
          onValueChange={(val) => setDifficulty(val[0])}
        >
          <Slider.Track><Slider.TrackActive bc="$yellow10" /></Slider.Track>
          <Slider.Thumb size="$2" index={0} circular elevate />
        </Slider>
      </YStack>

      <Button
        theme="active"
        size="$5"
        onPress={createQuest}
        disabled={saving}
      >
        {saving ? <Spinner /> : "Start Quest"}
      </Button>
    </YStack>
  );
}
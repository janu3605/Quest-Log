import React, { useState } from 'react';
import { Image } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  YStack, XStack, H2, Button, Input, Slider, Text, Label, Spinner
} from 'tamagui';

export default function AddQuestScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(1.0);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // 📸 Pick an Icon Image
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1], // Force a square crop for icons!
      quality: 0.5,   // High compression for small icons
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const createQuest = async () => {
    if (!name) return alert("Give your quest a name!");

    setSaving(true);
    let finalIconUrl = null;

    // 1. Upload the Icon (If selected)
    if (imageUri) {
      try {
        const fileExt = imageUri.split('.').pop();
        const fileName = `icon-${Date.now()}-${Math.random()}.${fileExt}`;

        const response = await fetch(imageUri);
        const blob = await response.blob();

        const { error: uploadError } = await supabase.storage
          .from('quest-images')
          .upload(fileName, blob);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('quest-images')
          .getPublicUrl(fileName);

        finalIconUrl = publicUrl;
      } catch (err: any) {
        alert(`Icon Upload Failed: ${err.message}`);
        setSaving(false);
        return;
      }
    }

    // 2. Get the current user
    const { data: { user } } = await supabase.auth.getUser();

    // 3. Save the new Quest directly
    if (user) {
      const { error } = await supabase.from('projects').insert([
        {
          user_id: user.id,
          name: name,
          xp_multiplier: difficulty,
          color_hex: '#6366f1',
          icon_url: finalIconUrl
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

      {/* 📸 Icon Picker UI */}
      <YStack ai="center" gap="$2" mb="$2">
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={{ width: 80, height: 80, borderRadius: 20 }}
          />
        ) : (
          <YStack w={80} h={80} br={20} bc="$gray3" ai="center" jc="center">
            <Text col="$gray10" fontSize="$5">?</Text>
          </YStack>
        )}
        <Button size="$3" chromeless borderColor="$yellow10" onPress={pickImage}>
          {imageUri ? "Change Icon" : "Set Quest Icon"}
        </Button>
      </YStack>

      <YStack w="100%" gap="$2">
        <Label>Quest Name</Label>
        <Input
          size="$4"
          placeholder="e.g. Learn Rust, Morning Run"
          onChangeText={setName}
          value={name}
        />
      </YStack>

      <YStack w="100%" gap="$4" p="$4" bc="$backgroundStrong" br="$4">
        <XStack jc="space-between">
          <Text color="$color" fontWeight="bold">Difficulty</Text>
          <Text color="$yellow10" fontWeight="bold">x{difficulty.toFixed(1)} XP</Text>
        </XStack>

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
        mt="$4"
      >
        {saving ? <Spinner /> : "Start Quest"}
      </Button>
    </YStack>
  );
}
import React, { useState } from 'react';
import { Image, View, Pressable, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
  YStack, XStack, H2, Button, Input, Slider, Text, Label, Spinner
} from 'tamagui';

const QUEST_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f5d020', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
];

export default function AddQuestScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(1.0);
  const [colorHex, setColorHex] = useState(QUEST_COLORS[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setImageUri(result.assets[0].uri);
    }
  };

  const createQuest = async () => {
    if (!name) return alert("Give your quest a name!");

    setSaving(true);
    let finalIconUrl = null;

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

    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      const { error } = await supabase.from('projects').insert([
        {
          user_id: user.id,
          name: name,
          xp_multiplier: difficulty,
          color_hex: colorHex,
          icon_url: finalIconUrl
        }
      ]);

      if (error) alert(error.message);
      else router.back();
    }

    setSaving(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#0a0a0f' }}>
      <YStack f={1} ai="center" p="$5" gap="$5" pt="$8" pb="$10">

        {/* Header with glow accent */}
        <YStack ai="center" gap="$1" mb="$2">
          <Text fontSize="$2" color="$gray10" textTransform="uppercase" letterSpacing={3}>
            Forge a New
          </Text>
          <H2 color="$color" fontSize={32}>⚔ Quest</H2>
        </YStack>

        {/* Icon Picker with colored ring */}
        <YStack ai="center" gap="$3">
          <View style={{
            width: 96, height: 96, borderRadius: 24,
            borderWidth: 3, borderColor: colorHex,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: '#111118',
          }}>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 86, height: 86, borderRadius: 20 }}
              />
            ) : (
              <Text col="$gray8" fontSize={36}>?</Text>
            )}
          </View>
          <Button size="$3" chromeless borderWidth={1} borderColor="$gray6" onPress={pickImage}>
            <Text color="$gray10" fontSize="$3">
              {imageUri ? "Change Icon" : "📷 Set Quest Icon"}
            </Text>
          </Button>
        </YStack>

        {/* Quest Name */}
        <YStack w="100%" gap="$2" maxWidth={500}>
          <Label color="$gray10" fontSize="$2" textTransform="uppercase" letterSpacing={1}>
            Quest Name
          </Label>
          <Input
            size="$5"
            placeholder="e.g. Learn Rust, Morning Run"
            onChangeText={setName}
            value={name}
            backgroundColor="#111118"
            borderColor="$gray5"
            borderWidth={1}
            focusStyle={{ borderColor: colorHex as any }}
          />
        </YStack>

        {/* Color Picker */}
        <YStack w="100%" gap="$3" maxWidth={500}>
          <Label color="$gray10" fontSize="$2" textTransform="uppercase" letterSpacing={1}>
            Quest Color
          </Label>
          <View style={{
            flexDirection: 'row', flexWrap: 'wrap', gap: 12,
            justifyContent: 'center',
            padding: 16,
            backgroundColor: '#111118',
            borderRadius: 16,
          }}>
            {QUEST_COLORS.map((c) => (
              <Pressable key={c} onPress={() => setColorHex(c)}>
                <View style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: c,
                  borderWidth: colorHex === c ? 3 : 0,
                  borderColor: '#fff',
                  opacity: colorHex === c ? 1 : 0.45,
                  transform: [{ scale: colorHex === c ? 1.15 : 1 }],
                }} />
              </Pressable>
            ))}
          </View>
        </YStack>

        {/* Difficulty */}
        <YStack w="100%" gap="$4" p="$4" maxWidth={500}
          backgroundColor="#111118" borderRadius="$6"
          borderWidth={1} borderColor="$gray4"
        >
          <XStack jc="space-between" ai="center">
            <Text color="$color" fontWeight="bold" fontSize="$4">Difficulty</Text>
            <XStack
              backgroundColor={colorHex as any}
              px="$3" py="$1" borderRadius="$4"
            >
              <Text color="black" fontWeight="900" fontSize="$4">
                x{difficulty.toFixed(1)} XP
              </Text>
            </XStack>
          </XStack>

          <Slider
            defaultValue={[1]}
            max={2.0}
            min={0.5}
            step={0.1}
            onValueChange={(val) => setDifficulty(val[0])}
          >
            <Slider.Track backgroundColor="$gray6">
              <Slider.TrackActive backgroundColor={colorHex as any} />
            </Slider.Track>
            <Slider.Thumb size="$2" index={0} circular elevate backgroundColor="white" />
          </Slider>

          <XStack jc="space-between">
            <Text color="$gray8" fontSize="$2">Easy</Text>
            <Text color="$gray8" fontSize="$2">Hard</Text>
          </XStack>
        </YStack>

        {/* Create Button */}
        <Pressable
          onPress={createQuest}
          disabled={saving}
          style={{
            width: '100%', maxWidth: 500, marginTop: 8,
          }}
        >
          <View style={{
            backgroundColor: colorHex,
            paddingVertical: 18,
            borderRadius: 16,
            alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? <Spinner color="black" /> : (
              <Text color="black" fontWeight="900" fontSize="$5">
                ⚔ Start Quest
              </Text>
            )}
          </View>
        </Pressable>

        {/* Cancel */}
        <Button size="$4" chromeless onPress={() => router.back()} mt="$1">
          <Text color="$gray8">Cancel</Text>
        </Button>

      </YStack>
    </ScrollView>
  );
}
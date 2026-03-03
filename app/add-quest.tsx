import React, { useState } from 'react';
import { Image, View, Pressable, ScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { YStack, XStack, H2, Button, Input, Slider, Text, Label, Spinner } from 'tamagui';
import { useAppTheme } from '../lib/theme';

const QUEST_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
  '#f97316', '#f5d020', '#22c55e', '#14b8a6',
  '#3b82f6', '#64748b',
];

export default function AddQuestScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState(1.0);
  const [colorHex, setColorHex] = useState(QUEST_COLORS[0]);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, aspect: [1, 1], quality: 0.5,
    });
    if (!result.canceled) setImageUri(result.assets[0].uri);
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
        const { error: uploadError } = await supabase.storage.from('quest-images').upload(fileName, blob);
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('quest-images').getPublicUrl(fileName);
        finalIconUrl = publicUrl;
      } catch (err: any) {
        alert(`Icon Upload Failed: ${err.message}`);
        setSaving(false); return;
      }
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { error } = await supabase.from('projects').insert([{
        user_id: user.id, name, xp_multiplier: difficulty,
        color_hex: colorHex, icon_url: finalIconUrl,
      }]);
      if (error) alert(error.message);
      else router.back();
    }
    setSaving(false);
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: theme.bg }}>
      <YStack f={1} ai="center" p="$5" gap="$5" pt="$8" pb="$10">

        <YStack ai="center" gap="$1" mb="$2">
          <Text fontSize="$2" color={theme.textSecondary} textTransform="uppercase" letterSpacing={3}>
            Forge a New
          </Text>
          <H2 color={theme.text} fontSize={32}>⚔ Quest</H2>
        </YStack>

        <YStack ai="center" gap="$3">
          <View style={{
            width: 96, height: 96, borderRadius: 24,
            borderWidth: 3, borderColor: colorHex,
            alignItems: 'center', justifyContent: 'center',
            backgroundColor: theme.card,
          }}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={{ width: 86, height: 86, borderRadius: 20 }} />
            ) : (
              <Text color={theme.textSecondary} fontSize={36}>?</Text>
            )}
          </View>
          <Button size="$3" chromeless borderWidth={1} borderColor={theme.border} onPress={pickImage}>
            <Text color={theme.text} fontSize="$3">
              {imageUri ? "Change Icon" : "📷 Set Quest Icon"}
            </Text>
          </Button>
        </YStack>

        <YStack w="100%" gap="$2" maxWidth={500}>
          <Label color={theme.textSecondary} fontSize="$2" textTransform="uppercase" letterSpacing={1}>
            Quest Name
          </Label>
          <Input
            size="$5" placeholder="e.g. Learn Rust, Morning Run"
            onChangeText={setName} value={name}
            backgroundColor={theme.card} borderColor={theme.border}
            borderWidth={1} color={theme.text}
            placeholderTextColor={theme.textSecondary as any}
            focusStyle={{ borderColor: colorHex as any }}
          />
        </YStack>

        <YStack w="100%" gap="$3" maxWidth={500}>
          <Label color={theme.textSecondary} fontSize="$2" textTransform="uppercase" letterSpacing={1}>
            Quest Color
          </Label>
          <View style={{
            flexDirection: 'row', flexWrap: 'wrap', gap: 12,
            justifyContent: 'center', padding: 16,
            backgroundColor: theme.card, borderRadius: 16,
          }}>
            {QUEST_COLORS.map((c) => (
              <Pressable key={c} onPress={() => setColorHex(c)}>
                <View style={{
                  width: 40, height: 40, borderRadius: 20,
                  backgroundColor: c,
                  borderWidth: colorHex === c ? 3 : 0,
                  borderColor: theme.text,
                  opacity: colorHex === c ? 1 : 0.45,
                  transform: [{ scale: colorHex === c ? 1.15 : 1 }],
                }} />
              </Pressable>
            ))}
          </View>
        </YStack>

        <YStack w="100%" gap="$4" p="$4" maxWidth={500}
          backgroundColor={theme.card} borderRadius="$6"
          borderWidth={1} borderColor={theme.border}>
          <XStack jc="space-between" ai="center">
            <Text color={theme.text} fontWeight="bold" fontSize="$4">Difficulty</Text>
            <XStack backgroundColor={colorHex as any} px="$3" py="$1" borderRadius="$4">
              <Text color="black" fontWeight="900" fontSize="$4">
                x{difficulty.toFixed(1)} XP
              </Text>
            </XStack>
          </XStack>
          <Slider defaultValue={[1]} max={2.0} min={0.5} step={0.1}
            onValueChange={(val) => setDifficulty(val[0])}>
            <Slider.Track backgroundColor={theme.progressTrack}>
              <Slider.TrackActive backgroundColor={colorHex as any} />
            </Slider.Track>
            <Slider.Thumb size="$2" index={0} circular elevate backgroundColor="white" />
          </Slider>
          <XStack jc="space-between">
            <Text color={theme.textSecondary} fontSize="$2">Easy</Text>
            <Text color={theme.textSecondary} fontSize="$2">Hard</Text>
          </XStack>
        </YStack>

        <Pressable onPress={createQuest} disabled={saving}
          style={{ width: '100%', maxWidth: 500, marginTop: 8 }}>
          <View style={{
            backgroundColor: colorHex, paddingVertical: 18,
            borderRadius: 16, alignItems: 'center',
            opacity: saving ? 0.6 : 1,
          }}>
            {saving ? <Spinner color="black" /> : (
              <Text color="black" fontWeight="900" fontSize="$5">⚔ Start Quest</Text>
            )}
          </View>
        </Pressable>

        <Button size="$4" chromeless onPress={() => router.back()} mt="$1">
          <Text color={theme.textSecondary}>Cancel</Text>
        </Button>
      </YStack>
    </ScrollView>
  );
}
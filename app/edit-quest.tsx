import React, { useState, useEffect } from 'react';
import { Image, Alert, View, Pressable, ScrollView as RNScrollView } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { YStack, XStack, H2, Button, Input, Slider, Text, Label, Spinner } from 'tamagui';
import { useAppTheme } from '../lib/theme';

const QUEST_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#f5d020', '#22c55e', '#14b8a6',
    '#3b82f6', '#64748b',
];

export default function EditQuestScreen() {
    const router = useRouter();
    const { theme } = useAppTheme();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [name, setName] = useState('');
    const [difficulty, setDifficulty] = useState(1.0);
    const [colorHex, setColorHex] = useState(QUEST_COLORS[0]);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [existingIconUrl, setExistingIconUrl] = useState<string | null>(null);

    useEffect(() => { fetchQuest(); }, []);

    const fetchQuest = async () => {
        const { data } = await supabase.from('projects').select('*').eq('id', id).single();
        if (data) {
            setName(data.name);
            setDifficulty(data.xp_multiplier);
            setColorHex(data.color_hex || QUEST_COLORS[0]);
            setExistingIconUrl(data.icon_url);
        }
        setLoading(false);
    };

    const pickImage = async () => {
        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true, aspect: [1, 1], quality: 0.5,
        });
        if (!result.canceled) setImageUri(result.assets[0].uri);
    };

    const saveChanges = async () => {
        if (!name) return alert("Give your quest a name!");
        setSaving(true);
        let finalIconUrl = existingIconUrl;
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
        const { error } = await supabase.from('projects').update({
            name, xp_multiplier: difficulty, color_hex: colorHex, icon_url: finalIconUrl,
        }).eq('id', id);
        if (error) alert(error.message);
        else router.back();
        setSaving(false);
    };

    const deleteQuest = () => {
        if (typeof window !== 'undefined') {
            if (window.confirm('Delete this quest? All session logs will also be removed. This cannot be undone.')) {
                performDelete();
            }
        } else {
            Alert.alert('Delete Quest',
                'All session logs will also be removed. This cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: performDelete },
                ]
            );
        }
    };

    const performDelete = async () => {
        setDeleting(true);
        await supabase.from('active_timers').delete().eq('project_id', id);
        await supabase.from('logs').delete().eq('project_id', id);
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) {
            alert(`Delete failed: ${error.message}`);
            setDeleting(false);
        } else {
            router.back();
        }
    };

    if (loading) {
        return (
            <YStack f={1} backgroundColor={theme.bg} ai="center" jc="center">
                <Spinner size="large" color={theme.accent} />
            </YStack>
        );
    }

    const displayIcon = imageUri || existingIconUrl;

    return (
        <RNScrollView style={{ flex: 1, backgroundColor: theme.bg }}>
            <YStack f={1} ai="center" p="$5" gap="$5" pt="$8" pb="$10">

                <YStack ai="center" gap="$1" mb="$2">
                    <Text fontSize="$2" color={theme.textSecondary} textTransform="uppercase" letterSpacing={3}>
                        Modify Your
                    </Text>
                    <H2 color={theme.text} fontSize={32}>🛠 Quest</H2>
                </YStack>

                <YStack ai="center" gap="$3">
                    <View style={{
                        width: 96, height: 96, borderRadius: 24,
                        borderWidth: 3, borderColor: colorHex,
                        alignItems: 'center', justifyContent: 'center',
                        backgroundColor: theme.card,
                    }}>
                        {displayIcon ? (
                            <Image source={{ uri: displayIcon }}
                                style={{ width: 86, height: 86, borderRadius: 20 }} />
                        ) : (
                            <Text color={theme.textSecondary} fontSize={36}>⚔</Text>
                        )}
                    </View>
                    <Button size="$3" chromeless borderWidth={1} borderColor={theme.border} onPress={pickImage}>
                        <Text color={theme.text} fontSize="$3">
                            {displayIcon ? "Change Icon" : "📷 Set Quest Icon"}
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
                    <Slider defaultValue={[difficulty]} max={2.0} min={0.5} step={0.1}
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

                <Pressable onPress={saveChanges} disabled={saving}
                    style={{ width: '100%', maxWidth: 500, marginTop: 8 }}>
                    <View style={{
                        backgroundColor: colorHex, paddingVertical: 18,
                        borderRadius: 16, alignItems: 'center',
                        opacity: saving ? 0.6 : 1,
                    }}>
                        {saving ? <Spinner color="black" /> : (
                            <Text color="black" fontWeight="900" fontSize="$5">💾 Save Changes</Text>
                        )}
                    </View>
                </Pressable>

                <Button size="$4" chromeless onPress={() => router.back()} mt="$1">
                    <Text color={theme.textSecondary}>Cancel</Text>
                </Button>

                {/* Danger Zone */}
                <YStack w="100%" maxWidth={500} mt="$6" p="$4"
                    backgroundColor={theme.danger + '15'} borderRadius="$6"
                    borderWidth={1} borderColor={theme.danger + '30'}>
                    <Text color={theme.textSecondary} fontSize="$2" mb="$3">
                        Deleting this quest will permanently remove all associated timers and session logs.
                    </Text>
                    <Pressable onPress={deleteQuest} disabled={deleting}>
                        <View style={{
                            backgroundColor: theme.danger + '20',
                            paddingVertical: 14, borderRadius: 12,
                            alignItems: 'center', borderWidth: 1,
                            borderColor: theme.danger + '40',
                            opacity: deleting ? 0.6 : 1,
                        }}>
                            {deleting ? <Spinner color={theme.danger} /> : (
                                <Text color={theme.danger} fontWeight="bold" fontSize="$4">
                                    🗑️ Delete Quest Forever
                                </Text>
                            )}
                        </View>
                    </Pressable>
                </YStack>
            </YStack>
        </RNScrollView>
    );
}

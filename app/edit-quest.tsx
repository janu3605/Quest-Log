import React, { useState, useEffect } from 'react';
import { Image, Alert } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import {
    YStack, XStack, H2, Button, Input, Slider, Text, Label, Spinner, ScrollView
} from 'tamagui';

const QUEST_COLORS = [
    '#6366f1', '#8b5cf6', '#ec4899', '#ef4444',
    '#f97316', '#f5d020', '#22c55e', '#14b8a6',
    '#3b82f6', '#64748b',
];

export default function EditQuestScreen() {
    const router = useRouter();
    const { id } = useLocalSearchParams();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const [name, setName] = useState('');
    const [difficulty, setDifficulty] = useState(1.0);
    const [colorHex, setColorHex] = useState(QUEST_COLORS[0]);
    const [imageUri, setImageUri] = useState<string | null>(null);
    const [existingIconUrl, setExistingIconUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchQuest();
    }, []);

    const fetchQuest = async () => {
        const { data, error } = await supabase
            .from('projects')
            .select('*')
            .eq('id', id)
            .single();

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
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri);
        }
    };

    const saveChanges = async () => {
        if (!name) return alert("Give your quest a name!");

        setSaving(true);
        let finalIconUrl = existingIconUrl;

        // Upload new icon if changed
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

        const { error } = await supabase
            .from('projects')
            .update({
                name,
                xp_multiplier: difficulty,
                color_hex: colorHex,
                icon_url: finalIconUrl,
            })
            .eq('id', id);

        if (error) alert(error.message);
        else router.back();

        setSaving(false);
    };

    const deleteQuest = () => {
        // Use alert for cross-platform confirmation
        if (typeof window !== 'undefined') {
            // Web
            if (window.confirm('Delete this quest? All session logs for this quest will also be removed. This cannot be undone.')) {
                performDelete();
            }
        } else {
            // Native
            Alert.alert(
                'Delete Quest',
                'All session logs for this quest will also be removed. This cannot be undone.',
                [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: performDelete },
                ]
            );
        }
    };

    const performDelete = async () => {
        setDeleting(true);
        // Delete in order: timers → logs → project
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
            <YStack f={1} bc="$background" ai="center" jc="center">
                <Spinner size="large" color="$yellow10" />
            </YStack>
        );
    }

    const displayIcon = imageUri || existingIconUrl;

    return (
        <ScrollView style={{ flex: 1, backgroundColor: '#000' }}>
            <YStack f={1} bc="$background" jc="center" ai="center" p="$4" gap="$4" pt="$8" pb="$10">
                <H2 color="$color">Edit Quest</H2>

                {/* Icon Picker */}
                <YStack ai="center" gap="$2" mb="$2">
                    {displayIcon ? (
                        <Image
                            source={{ uri: displayIcon }}
                            style={{ width: 80, height: 80, borderRadius: 20 }}
                        />
                    ) : (
                        <YStack w={80} h={80} br={20} bc={colorHex} ai="center" jc="center">
                            <Text col="white" fontSize="$5">⚔</Text>
                        </YStack>
                    )}
                    <Button size="$3" chromeless borderColor="$yellow10" onPress={pickImage}>
                        {displayIcon ? "Change Icon" : "Set Quest Icon"}
                    </Button>
                </YStack>

                {/* Name */}
                <YStack w="100%" gap="$2">
                    <Label>Quest Name</Label>
                    <Input
                        size="$4"
                        placeholder="e.g. Learn Rust, Morning Run"
                        onChangeText={setName}
                        value={name}
                    />
                </YStack>

                {/* Color Picker */}
                <YStack w="100%" gap="$2">
                    <Label>Quest Color</Label>
                    <XStack flexWrap="wrap" gap="$3" jc="center">
                        {QUEST_COLORS.map((c) => (
                            <YStack
                                key={c}
                                w={36}
                                h={36}
                                br={18}
                                bc={c}
                                borderWidth={colorHex === c ? 3 : 0}
                                borderColor="white"
                                onPress={() => setColorHex(c)}
                                cursor="pointer"
                                opacity={colorHex === c ? 1 : 0.5}
                                hoverStyle={{ opacity: 0.8 }}
                            />
                        ))}
                    </XStack>
                </YStack>

                {/* Difficulty */}
                <YStack w="100%" gap="$4" p="$4" bc="$backgroundStrong" br="$4">
                    <XStack jc="space-between">
                        <Text color="$color" fontWeight="bold">Difficulty</Text>
                        <Text color="$yellow10" fontWeight="bold">x{difficulty.toFixed(1)} XP</Text>
                    </XStack>

                    <Slider
                        defaultValue={[difficulty]}
                        max={2.0}
                        min={0.5}
                        step={0.1}
                        onValueChange={(val) => setDifficulty(val[0])}
                    >
                        <Slider.Track><Slider.TrackActive bc="$yellow10" /></Slider.Track>
                        <Slider.Thumb size="$2" index={0} circular elevate />
                    </Slider>
                </YStack>

                {/* Save */}
                <Button
                    theme="active"
                    size="$5"
                    onPress={saveChanges}
                    disabled={saving}
                    mt="$4"
                    w="100%"
                >
                    {saving ? <Spinner /> : "Save Changes"}
                </Button>

                {/* Delete */}
                <Button
                    size="$4"
                    chromeless
                    onPress={deleteQuest}
                    disabled={deleting}
                    mt="$2"
                >
                    {deleting ? <Spinner color="$red10" /> : <Text color="$red10">🗑️ Delete Quest</Text>}
                </Button>
            </YStack>
        </ScrollView>
    );
}

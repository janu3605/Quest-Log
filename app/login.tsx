import React, { useState } from 'react';
import { View, Pressable } from 'react-native';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { YStack, H1, Button, Input, Text, Spinner, XStack } from 'tamagui';
import { useAppTheme } from '../lib/theme';

export default function LoginScreen() {
  const router = useRouter();
  const { theme } = useAppTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAuth = async (isSignUp: boolean) => {
    if (!email || !password) {
      setErrorMsg("Please enter both email and password.");
      return;
    }
    setLoading(true);
    setErrorMsg('');
    const { error } = isSignUp
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setErrorMsg(error.message);
    } else {
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <YStack f={1} backgroundColor={theme.bg} jc="center" ai="center" p="$6" gap="$5">
      <View style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        backgroundColor: theme.accent,
      }} />

      <YStack ai="center" gap="$2" mb="$4">
        <Text fontSize={48} mb="$2">🛡️</Text>
        <H1 color={theme.text} fontSize={38} fontWeight="900" letterSpacing={-1}>
          Quest Log
        </H1>
        <Text color={theme.textSecondary} fontSize="$3" textAlign="center">
          Level up your life, one session at a time
        </Text>
      </YStack>

      <YStack w="100%" maxWidth={420} gap="$4"
        p="$5" backgroundColor={theme.card}
        borderRadius="$6" borderWidth={1} borderColor={theme.border}
      >
        <Input
          size="$5"
          placeholder="Email address"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          backgroundColor={theme.cardAlt}
          borderColor={theme.border}
          borderWidth={1}
          color={theme.text}
          placeholderTextColor={theme.textSecondary as any}
          focusStyle={{ borderColor: theme.accent }}
        />
        <Input
          size="$5"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          backgroundColor={theme.cardAlt}
          borderColor={theme.border}
          borderWidth={1}
          color={theme.text}
          placeholderTextColor={theme.textSecondary as any}
          focusStyle={{ borderColor: theme.accent }}
        />

        {errorMsg ? (
          <XStack backgroundColor={theme.accentMuted} p="$3" borderRadius="$4" borderWidth={1} borderColor={theme.danger + '40'}>
            <Text color={theme.danger} fontSize="$3">{errorMsg}</Text>
          </XStack>
        ) : null}

        <YStack gap="$3" mt="$2">
          <Pressable onPress={() => handleAuth(false)} disabled={loading}>
            <View style={{
              backgroundColor: theme.accent,
              paddingVertical: 16, borderRadius: 14,
              alignItems: 'center', opacity: loading ? 0.6 : 1,
            }}>
              {loading ? <Spinner color="black" /> : (
                <Text color={theme.statusBarStyle === 'light' ? 'black' : 'white'} fontWeight="900" fontSize="$5">
                  ⚔ Log In
                </Text>
              )}
            </View>
          </Pressable>

          <Button
            variant="outlined" size="$5"
            onPress={() => handleAuth(true)}
            disabled={loading}
            borderColor={theme.border} borderWidth={1}
          >
            <Text color={theme.text} fontWeight="600">Create Account</Text>
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
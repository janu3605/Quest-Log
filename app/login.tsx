import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useRouter } from 'expo-router';
import { YStack, H1, H4, Button, Input, Text, Spinner, XStack } from 'tamagui';

export default function LoginScreen() {
  const router = useRouter();
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
      // On success, go to Dashboard
      router.replace('/');
    }
    setLoading(false);
  };

  return (
    <YStack f={1} bc="$background" jc="center" ai="center" p="$6" gap="$4">
      <YStack ai="center" gap="$2" mb="$4">
        <H1 col="$color">Quest Log</H1>
        <H4 col="$gray10">Authenticate to continue</H4>
      </YStack>

      <YStack w="100%" gap="$3" maxWidth={400}>
        <Input 
          size="$4" 
          placeholder="Email address" 
          value={email} 
          onChangeText={setEmail} 
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <Input 
          size="$4" 
          placeholder="Password" 
          value={password} 
          onChangeText={setPassword} 
          secureTextEntry 
        />

        {errorMsg ? <Text col="$red10" ta="center">{errorMsg}</Text> : null}

        <YStack gap="$3" mt="$4">
          <Button 
            theme="active" 
            size="$5" 
            onPress={() => handleAuth(false)} 
            disabled={loading}
          >
            {loading ? <Spinner /> : "Log In"}
          </Button>
          
          <Button 
            variant="outlined" 
            size="$5" 
            onPress={() => handleAuth(true)} 
            disabled={loading}
          >
            Create Account
          </Button>
        </YStack>
      </YStack>
    </YStack>
  );
}
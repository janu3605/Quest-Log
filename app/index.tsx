import { View } from 'react-native';
import { YStack, H1, Button, Text } from 'tamagui';
import { Link, useRouter } from 'expo-router';

export default function Dashboard() {
  const router = useRouter();

  return (
    <YStack f={1} bc="$background" ai="center" jc="center" gap="$4" p="$4">
      <H1 col="$color">Quest Log</H1>
      
      <Text col="$gray10" ta="center">
        Your offline-first, RPG life tracker.
      </Text>

      {/* The Button to open your "Add Quest" screen */}
      <Button 
        size="$5" 
        theme="active" 
        onPress={() => router.push('/add-quest')}
      >
        Start New Quest
      </Button>
    </YStack>
  );
}
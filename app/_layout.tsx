import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}>
      <Stack.Screen name="login" />
      <Stack.Screen name="(tabs)"/>
      <Stack.Screen name="delivery-map"/>
      <Stack.Screen name="delivery"/>
      <Stack.Screen name="delivery-action"/>
    </Stack>
  );
}

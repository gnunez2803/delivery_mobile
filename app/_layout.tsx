import { Stack } from 'expo-router';

export default function Layout() {
  return (
    <Stack
      screenOptions={{

      }}>
      <Stack.Screen
        name="(login)"
        options={{ headerShown: false }} 
      />
      <Stack.Screen
        name="delivery-map"
        options={{ headerShown: false}} />
      <Stack.Screen
        name="delivery"
        options={{
          title: 'Marker Details',
        }}
      />
      <Stack.Screen
        name="delivery-action"
        options={{ title: 'Packages'}}

        />
    </Stack>
  );
}

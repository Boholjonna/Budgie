import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { StorageProvider } from '../hooks/StorageContext';

export default function RootLayout() {
  return (
    <StorageProvider>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="add-expense"
          options={{
            presentation:     'modal',
            animation:        'slide_from_bottom',
            headerShown:      false,
          }}
        />
        <Stack.Screen
          name="expense-detail"
          options={{
            animation:   'slide_from_right',
            headerShown: false,
          }}
        />
      </Stack>
    </StorageProvider>
  );
}

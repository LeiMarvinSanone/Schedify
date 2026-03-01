import { Stack } from 'expo-router';
import { ThemeProvider } from '../ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="admin" />
      </Stack>
    </ThemeProvider>
  );
}
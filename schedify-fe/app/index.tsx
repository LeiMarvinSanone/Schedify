import { useEffect, useState } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { Redirect } from 'expo-router';
import { isSessionValid, getCurrentUser } from '../utils/apiClient';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [redirect, setRedirect] = useState<string | null>(null);

  useEffect(() => {
    async function checkSession() {
      try {
        const valid = await isSessionValid();
        if (valid) {
          const user = await getCurrentUser();
          if (user?.role === 'admin') {
            setRedirect('/admin/dashboard');
          } else {
            setRedirect('/student/calendar');
          }
        } else {
          setRedirect('/student/welcome');
        }
      } catch {
        setRedirect('/student/welcome');
      } finally {
        setIsLoading(false);
      }
    }
    checkSession();
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#2d3748' }}>
        <ActivityIndicator size="large" color="#68d391" />
      </View>
    );
  }

  return <Redirect href={redirect as any} />;
}

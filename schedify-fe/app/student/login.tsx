import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ScrollView, StatusBar, Image,
} from 'react-native';
import { router } from 'expo-router';
import Svg, { Path } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { login as apiLogin, googleLogin } from '../../utils/apiClient';
import { registerForPushNotificationsAsync } from '../../utils/notifications';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const GoogleIcon = () => (
  <Svg width="24" height="24" viewBox="0 0 48 48">
    <Path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C36.08 2.34 30.61 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <Path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <Path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    <Path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
  </Svg>
);
  // Configure Google Sign-In once on mount
  React.useEffect(() => {
    GoogleSignin.configure({
      webClientId: '117812296292-kv015a17t53qnrrmrvrelk1pm5lndg6f.apps.googleusercontent.com',
    });
  }, []);

  const handleChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: '' }));
  };

  const handleSubmit = async () => {
    const newErrors: Record<string, string> = {};
    if (!formData.email) newErrors.email = 'Email is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const expoPushToken = await registerForPushNotificationsAsync();
      await apiLogin(
        formData.email,
        formData.password,
        undefined,
        expoPushToken === null ? undefined : expoPushToken
      );
      router.replace('/student/calendar' as any);
    } catch {
      Alert.alert('Error', 'Login failed. Invalid email or password.');
    } finally {
      setIsLoading(false);
    }
  };

  // Google Sign-In handler
  async function handleGoogleSignIn() {
    try {
      await GoogleSignin.hasPlayServices();
      await GoogleSignin.signOut();
      const userInfo = await GoogleSignin.signIn();
      const idToken = userInfo.data?.idToken;

      if (!idToken) {
        Alert.alert('Error', 'No ID token received from Google.');
        return;
      }

      const authData = await googleLogin(idToken);
      router.replace('/student/calendar' as any);

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled, do nothing
        return;
      }

      // No account found — redirect to signup
      if (error.message?.includes('No account found')) {
        Alert.alert(
          'No Account Found',
          'No account is linked to this Google email. Please sign up first.',
          [
            { 
              text: 'Sign Up', 
              onPress: () => router.push('/student/signup' as any) 
            },
            { text: 'Cancel', style: 'cancel' }
          ]
        );
        return;
      }

      Alert.alert('Error', 'Google login failed. Please try again.');
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
    >
      <StatusBar barStyle="light-content" backgroundColor="#2d3748" />

      <Image
        source={require('../../assets/images/logo.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.appName}>
        <Text style={styles.appNameNormal}>Schedify</Text>
      </Text>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errors.email && styles.inputError]}
          value={formData.email}
          onChangeText={(val) => handleChange('email', val)}
          placeholder="Enter your email"
          placeholderTextColor="#a0aec0"
          keyboardType="email-address"
          autoCapitalize="none"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>Password</Text>
        <View style={[styles.passwordContainer, errors.password && styles.inputError]}>
          <TextInput
            style={styles.passwordInput}
            value={formData.password}
            onChangeText={(val) => handleChange('password', val)}
            placeholder="Enter your password"
            placeholderTextColor="#a0aec0"
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity 
            onPress={() => setShowPassword(prev => !prev)} 
            style={styles.eyeButton}
          >
            <Ionicons 
              name={showPassword ? 'eye' : 'eye-off'} 
              size={20} 
              color="#cbd5e0" 
            />
          </TouchableOpacity>
        </View>
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'flex-end' }}>
        <TouchableOpacity onPress={() => router.push('/student/forgot-password' as any)}>
          <Text style={[styles.linkText, { marginTop: 8, marginBottom: 16 }]}>
            Forgot Password?
          </Text>
        </TouchableOpacity>
      </View>

      {/* Google Login Button */}
      {/* Login Button */}
      <TouchableOpacity
        style={styles.button}
        disabled={isLoading}
        onPress={handleSubmit}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isLoading ? 'Logging in...' : 'Login'}
        </Text>
      </TouchableOpacity>

      {/* OR Divider */}
      <View style={styles.orRow}>
        <View style={styles.orLine} />
        <Text style={styles.orText}>or</Text>
        <View style={styles.orLine} />
      </View>

      {/* Google Login Button */}
      <TouchableOpacity
        style={styles.googleButton}
        onPress={handleGoogleSignIn}
        activeOpacity={0.85}
      >
       <GoogleIcon />
        <Text style={styles.googleButtonText}>Continue with Google</Text>
      </TouchableOpacity>

      {/* Sign up row */}
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 24 }}>
        <Text style={{ color: '#a0aec0', fontSize: 15 }}>
          Don&apos;t have an account?{' '}
        </Text>
        <TouchableOpacity onPress={() => router.push('/student/signup' as any)}>
          <Text style={[styles.linkText, {
            fontSize: 15, fontWeight: 'bold', color: '#68d391'
          }]}>
            Sign up
          </Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#2d3748',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    paddingVertical: 48,
  },
  logo: {
    width: 110,
    height: 110,
    marginBottom: 14,
  },
  appName: {
    fontSize: 30,
    marginBottom: 32,
  },
  appNameNormal: {
    color: '#ffffff',
    fontWeight: '400',
    letterSpacing: 1,
  },
  formGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '500',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#5a6778',
    color: '#ffffff',
    padding: 14,
    borderRadius: 8,
    fontSize: 15,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  passwordContainer: {
    backgroundColor: '#5a6778',
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordInput: {
    flex: 1,
    color: '#ffffff',
    padding: 14,
    fontSize: 15,
  },
  eyeButton: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inputError: {
    borderColor: '#fc8181',
  },
  errorText: {
    color: '#fc8181',
    fontSize: 13,
    marginTop: 4,
  },
  button: {
    backgroundColor: '#4a5568',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 24,
    marginBottom: 16,
    height: 56,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#e2e8f0',
    fontSize: 20,
    textAlign: 'center',
  },
  linkText: {
    color: '#e2e8f0',
    textDecorationLine: 'underline',
    fontSize: 14,
    fontWeight: '300',
  },
  // REPLACE with these
  googleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dadce0',
    width: '100%',
    height: 56,
    gap: 12,
  },
  googleButtonText: {
    color: '#3c4043',
    fontSize: 16,
    fontWeight: '500',
  },
  googleIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#4285F4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleIconText: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  orRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginTop: 20,
    marginBottom: 20,
    gap: 10,
  },
  orLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#4a5568',
  },
  orText: {
    color: '#a0aec0',
    fontSize: 14,
    fontWeight: '400',
  },
});

export default Login;
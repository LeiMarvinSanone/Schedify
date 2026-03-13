import { ScrollView, Text, View, TouchableOpacity, TextInput, StyleSheet, StatusBar, Image, Alert } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { Ionicons } from '@expo/vector-icons';
import { login as apiLogin } from "../../utils/apiClient";

export default function AdminLoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    
    const handleLogin = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        setLoading(true);
        
        try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            const response = await apiLogin(email, password, 'admin');
            
            if (response.token) {
                router.replace('/admin/dashboard' as any);
            } else {
                Alert.alert('Error', 'Failed to login');
            }
        } catch (error: any) {
            console.error('Admin login error:', error);
            Alert.alert('Login Failed', error.message || 'Invalid credentials');
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2d3748" />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <View style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Image
                                source={require('../../assets/images/logo.png')}
                                style={styles.logo}
                                resizeMode="contain"
                            />
                        </View>
                        <Text style={styles.appName}>Schedify</Text>
                        <View style={styles.adminBadge}>
                            <Text style={styles.adminText}>ADMIN</Text>
                        </View>
                    </View>

                    <View style={styles.formContainer}>
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                placeholder="Enter your email"
                                placeholderTextColor="#9ba1a6"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                style={styles.input}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <View style={styles.passwordContainer}>
                                <TextInput 
                                    placeholder="Enter your password"
                                    placeholderTextColor="#9ba1a6"
                                    value={password}
                                    onChangeText={setPassword}
                                    secureTextEntry={!showPassword}
                                    style={styles.passwordInput}
                                />
                                <TouchableOpacity onPress={() => setShowPassword(prev => !prev)} style={styles.eyeButton}>
                                    <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color="#cbd5e0" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        style={[styles.button, loading && { opacity: 0.6 }]}
                        activeOpacity={0.8}
                                            disabled={loading}
                    >
                        <Text style={styles.buttonText}>{loading ? 'Signing in...' : 'Sign in'}</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#2d3748',
        padding: 24,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        gap: 32,
    },
    header: {
        alignItems: 'center',
        gap: 12,
    },
    logoContainer: {
        marginBottom: 8,
    },
    logo: {
        width: 100,
        height: 100,
    },
    appName: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    adminBadge: {
        backgroundColor: '#4a5568',
        paddingHorizontal: 16,
        paddingVertical: 4,
        borderRadius: 4,
    },
    adminText: {
        color: '#cbd5e0',
        fontWeight: '600',
        fontSize: 12,
    },
    formContainer: {
        gap: 16,
    },
    inputGroup: {
        gap: 8,
    },
    label: {
        color: '#e2e8f0',
        fontWeight: '500',
        fontSize: 14,
    },
    input: {
        backgroundColor: '#4a5568',
        color: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#718096',
        fontSize: 16,
    },
    passwordContainer: {
        backgroundColor: '#4a5568',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#718096',
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
        color: '#ffffff',
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    eyeButton: {
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    button: {
        backgroundColor: '#4a5568',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#718096',
        alignItems: 'center',
    },
    buttonText: {
        color: '#e2e8f0',
        fontSize: 16,
        fontWeight: '600',
    },
});
   
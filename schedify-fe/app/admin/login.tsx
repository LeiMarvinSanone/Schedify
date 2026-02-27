import { ScrollView, Text, View, TouchableOpacity, TextInput, StyleSheet, StatusBar, Image } from "react-native";
import { useState } from "react";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

export default function AdminLoginScreen() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    
    const handleLogin = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        console.log("Admin sign in:", { email, password });
        router.push("/admin/dashboard" as any);
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
                            <TextInput 
                                placeholder="Enter your password"
                                placeholderTextColor="#9ba1a6"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                                style={styles.input}
                            />
                        </View>
                    </View>

                    <TouchableOpacity
                        onPress={handleLogin}
                        style={styles.button}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>Sign in</Text>
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
   
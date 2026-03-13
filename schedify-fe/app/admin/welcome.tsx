import { ScrollView, Text, View, TouchableOpacity, StyleSheet, StatusBar, Image } from "react-native";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";

export default function AdminWelcomeScreen() {
    const router = useRouter();

    const handleGetStarted = async () => {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        router.push("/admin/login" as any);
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2d3748" />
            <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
                <View style={styles.content}>
                    <View style={styles.logoContainer}>
                        <Image
                            source={require('../../assets/images/logo.png')}
                            style={styles.logo}
                            resizeMode="contain"
                        />
                    </View>

                    <View style={styles.textContainer}>
                        <Text style={styles.title}>
                            Welcome to Schedify Admin!
                        </Text>
                        <Text style={styles.subtitle}>
                            Smart reminders for your schedules
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.button}
                        onPress={handleGetStarted}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.buttonText}>
                            Get Started
                        </Text>
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
        alignItems: 'center',
        gap: 32,
    },
    logoContainer: {
        marginBottom: 32,
        marginTop: 32,
    },
    logo: {
        width: 150,
        height: 150,
    },
    textContainer: {
        alignItems: 'center',
        gap: 8,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        textAlign: 'center',
        lineHeight: 40,
    },
    subtitle: {
        fontSize: 16,
        color: '#cbd5e0',
        textAlign: 'center',
        lineHeight: 24,
    },
    button: {
        backgroundColor: '#4a5568',
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#718096',
        marginTop: 16,
    },
    buttonText: {
        color: '#e2e8f0',
        fontSize: 16,
        fontWeight: '600',
        textAlign: 'center',
    },
});

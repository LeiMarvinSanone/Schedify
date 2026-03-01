import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  StatusBar, Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../ThemeContext';   
import BottomNav from '../../components/BottomNav';

export default function SettingsScreen() {
 
  const { isDark, toggleTheme, theme } = useTheme();

  const admin = {
    name: 'ADMIN',
    email: 'Admin@gmail.com',
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => router.replace('/login' as any),
      },
    ]);
  };

 
  const screenBg    = theme.bg;
  const cardBg      = theme.card;
  const border      = theme.cardBorder;
  const textPrimary = theme.title;
  const textSecondary = theme.subtitle;
  const signOutBg     = isDark ? '#2a0000' : '#fff1f2';
  const signOutText   = theme.danger;
  const signOutBorder = isDark ? '#fc818133' : '#fecdd3';


  const toggleTrack = isDark ? '#5c6bc0' : '#9fa8da';

  return (
    <View style={[styles.screen, { backgroundColor: screenBg }]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={screenBg}
      />

      <View style={styles.header}>
        <Text style={[styles.pageTitle, { color: textPrimary }]}>Settings</Text>

        <TouchableOpacity
          style={[styles.togglePill, { backgroundColor: isDark ? toggleTrack : '#b0bec5' }]}
          onPress={toggleTheme}          
          activeOpacity={0.85}
        >
          <View style={[
            styles.toggleThumb,
            { transform: [{ translateX: isDark ? 24 : 0 }] },
          ]}>
            <Ionicons
              name={isDark ? 'moon' : 'sunny'}
              size={12}
              color={isDark ? '#3949ab' : '#f57c00'}
            />
          </View>
        </TouchableOpacity>
      </View>

      <View style={[styles.profileCard, { backgroundColor: cardBg, borderColor: border }]}>
        <View style={[styles.avatarCircle, { backgroundColor: screenBg }]}>
          <Ionicons name="person" size={32} color={textSecondary} />
        </View>
        <View style={styles.profileInfo}>
          <Text style={[styles.profileName, { color: textPrimary }]}>{admin.name}</Text>
          <Text style={[styles.profileEmail, { color: textSecondary }]}>{admin.email}</Text>
        </View>
      </View>

      <View style={styles.signOutRow}>
        <TouchableOpacity
          style={[styles.signOutBtn, {
            backgroundColor: signOutBg,
            borderColor: signOutBorder,
          }]}
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <Text style={[styles.signOutText, { color: signOutText }]}>Sign Out</Text>
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }} />

      <BottomNav role="admin" active="settings" />
    </View>
  );
}

// styles
const styles = StyleSheet.create({
  screen: { flex: 1 },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 52,
    paddingBottom: 20,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  togglePill: {
    width: 52,
    height: 28,
    borderRadius: 14,
    padding: 3,
    justifyContent: 'center',
  },
  toggleThumb: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.25,
    shadowRadius: 2,
    elevation: 2,
  },

  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    borderRadius: 12,
    borderWidth: 1,
    padding: 20,
    gap: 16,
    minHeight: 100,
  },
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInfo: { flex: 1 },
  profileName: {
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 1,
    marginBottom: 4,
  },
  profileEmail: { fontSize: 13 },

  signOutRow: {
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    marginTop: 16,
  },
  signOutBtn: {
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderWidth: 1,
  },
  signOutText: {
    fontSize: 14,
    fontWeight: '500',
  },

});
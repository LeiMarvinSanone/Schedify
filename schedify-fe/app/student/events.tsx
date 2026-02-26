import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated, LayoutAnimation,
  Platform, UIManager,
} from 'react-native';
import { router } from 'expo-router';
import { useTheme } from '../../ThemeContext';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type EventType = 'class' | 'suspension' | 'event';

interface ScheduleItem {
  id: string;
  title: string;
  subtitle?: string;
  time?: string;
  room?: string;
  org?: string;
  description?: string;
  date?: string;
}

const DATA: Record<EventType, { label: string; color: string; textColor: string; items: ScheduleItem[] }> = {
  event: {
    label: 'Events',
    color: '#8bb7e7',
    textColor: '#1a1a00',
    items: [
      { id: 'e1', title: 'CICT CON', subtitle: 'CICT Congress', time: '8:00 AM', org: 'CICT CON', date: 'Feb 26', description: 'CICT Congress annual event.' },
      { id: 'e2', title: 'Sports Fest', subtitle: 'University-wide', time: '8:00 AM – 5:00 PM', org: 'SSC', date: 'Feb 27', description: 'University-wide Sports Festival.' },
    ],
  },
  class: {
    label: 'Class Schedules',
    color: '#5cba6a',
    textColor: '#0a1f0e',
    items: [
      { id: 'c1', title: 'IT101 Lec', time: '7:30 AM – 9:00 AM', room: 'Room 301', org: 'CICT Dept', date: 'Feb 24' },
      { id: 'c2', title: 'IT102 Lab', time: '1:00 PM – 4:00 PM', room: 'Lab 2', org: 'CICT Dept', date: 'Feb 26' },
    ],
  },
  suspension: {
    label: 'Suspensions',
    color: '#c94040',
    textColor: '#ffffff',
    items: [
      { id: 's1', title: 'No Classes', time: 'All Day', org: 'University Admin', date: 'Feb 25', description: 'Classes suspended — Local Holiday.' },
    ],
  },
};

// ─── ACCORDION SECTION ─────────────────────────────────────────────
function AccordionSection({ type, isDark }: { type: EventType; isDark: boolean }) {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { label, color, textColor, items } = DATA[type];

  const toggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    Animated.timing(rotateAnim, {
      toValue: open ? 0 : 1,
      duration: 220,
      useNativeDriver: true,
    }).start();
    setOpen(o => !o);
  };

  const rotate = rotateAnim.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  // Theme-aware colors for body/items
  const bodyBg    = isDark ? '#1e2a3a' : '#f8fafc';
  const itemBg    = isDark ? '#151f2e' : '#ffffff';
  const titleColor = isDark ? '#e2e8f0' : '#1e293b';
  const metaColor  = isDark ? '#64748b' : '#94a3b8';
  const descColor  = isDark ? '#4a5878' : '#94a3b8';
  const emptyColor = isDark ? '#4a5878' : '#94a3b8';

  return (
    <View style={acc.wrapper}>
      <TouchableOpacity onPress={toggle} activeOpacity={0.85}
        style={[acc.header, { backgroundColor: color }]}>
        <Text style={[acc.headerText, { color: textColor }]}>{label}</Text>
        <Animated.Text style={[acc.chevron, { color: textColor, transform: [{ rotate }] }]}>
          ⌄
        </Animated.Text>
      </TouchableOpacity>

      {open && (
        <View style={[acc.body, { backgroundColor: bodyBg, borderColor: color + '55' }]}>
          {items.length === 0 ? (
            <Text style={[acc.emptyText, { color: emptyColor }]}>No items scheduled.</Text>
          ) : (
            items.map((item, i) => (
              <View key={item.id}
                style={[acc.item, { borderLeftColor: color, backgroundColor: itemBg },
                  i < items.length - 1 && acc.itemDivider]}>

                {/* Date badge */}
                <View style={[acc.dateBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                  <Text style={[acc.dateText, { color }]}>{item.date?.split(' ')[0]}</Text>
                  <Text style={[acc.dateNum,  { color }]}>{item.date?.split(' ')[1]}</Text>
                </View>

                {/* Details */}
                <View style={acc.itemContent}>
                  <Text style={[acc.itemTitle, { color: titleColor }]}>{item.title}</Text>
                  <View style={acc.itemMeta}>
                    {item.time && <Text style={[acc.metaChip, { color: metaColor }]}>🕐 {item.time}</Text>}
                    {item.room && <Text style={[acc.metaChip, { color: metaColor }]}>📍 {item.room}</Text>}
                    {item.org  && <Text style={[acc.metaChip, { color: metaColor }]}>🏛 {item.org}</Text>}
                  </View>
                  {item.description && (
                    <Text style={[acc.itemDesc, { color: descColor }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      )}
    </View>
  );
}

const acc = StyleSheet.create({
  wrapper: { marginBottom: 14 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderRadius: 12, paddingHorizontal: 20, paddingVertical: 16,
    shadowColor: '#000', shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25, shadowRadius: 6, elevation: 5,
  },
  headerText: { fontSize: 17, fontWeight: '800', letterSpacing: 0.2 },
  chevron: { fontSize: 22, fontWeight: '700', lineHeight: 26 },
  body: {
    borderWidth: 1, borderTopWidth: 0,
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
    overflow: 'hidden', marginTop: -6, paddingTop: 10,
  },
  emptyText: { fontSize: 13, padding: 16, fontStyle: 'italic' },
  item: {
    flexDirection: 'row', alignItems: 'flex-start',
    paddingHorizontal: 14, paddingVertical: 12,
    borderLeftWidth: 3, marginHorizontal: 10,
    borderRadius: 6, marginBottom: 8, gap: 12,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  itemDivider: {},
  dateBadge: {
    width: 36, alignItems: 'center', justifyContent: 'center',
    borderRadius: 8, borderWidth: 1, paddingVertical: 5,
  },
  dateText: { fontSize: 9, fontWeight: '700', letterSpacing: 0.5, textTransform: 'uppercase' },
  dateNum: { fontSize: 15, fontWeight: '800', lineHeight: 18 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  itemMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  metaChip: { fontSize: 11 },
  itemDesc: { fontSize: 11, marginTop: 5, fontStyle: 'italic', lineHeight: 16 },
});

// ─── BOTTOM NAV ────────────────────────────────────────────────────
function BottomNav({ active, isDark }: { active: string; isDark: boolean }) {
  const tabs = [
    { id: 'calendar', label: 'Calendar', icon: '📅' },
    { id: 'events',   label: 'Events',   icon: '☰' },
    { id: 'profile',  label: 'Profile',  icon: '👤' },
  ];
  const navBg     = isDark ? '#131d2a' : '#ffffff';
  const navBorder = isDark ? '#1e2a3a' : '#e2e8f0';
  const labelColor = isDark ? '#4a5878' : '#94a3b8';
  const activeLabelColor = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <View style={[bn.container, { backgroundColor: navBg, borderTopColor: navBorder }]}>
      {tabs.map(t => (
        <TouchableOpacity key={t.id} style={bn.tab}
          onPress={() => t.id !== 'events' && router.push(`/student/${t.id}` as any)}>
          <Text style={[bn.icon, active === t.id && bn.activeIcon]}>{t.icon}</Text>
          <Text style={[bn.label, { color: labelColor }, active === t.id && { color: activeLabelColor, fontWeight: '700' }]}>
            {t.label}
          </Text>
          {active === t.id && <View style={bn.activeDot} />}
        </TouchableOpacity>
      ))}
    </View>
  );
}
const bn = StyleSheet.create({
  container: { flexDirection: 'row', borderTopWidth: 1, paddingBottom: 20, paddingTop: 10 },
  tab: { flex: 1, alignItems: 'center', gap: 2 },
  icon: { fontSize: 22, opacity: 0.35 },
  activeIcon: { opacity: 1 },
  label: { fontSize: 11, fontWeight: '500' },
  activeDot: { position: 'absolute', bottom: -10, width: 18, height: 3, borderRadius: 2, backgroundColor: '#86efac' },
});

// ─── MAIN SCREEN ───────────────────────────────────────────────────
export default function EventsScreen() {
  const { isDark } = useTheme(); // ✅ global theme — syncs with Profile toggle

  const screenBg    = isDark ? '#0f172a' : '#f0f4f8';
  const headerBg    = isDark ? '#131d2a' : '#ffffff';
  const headerBorder = isDark ? '#1e2a3a' : '#e2e8f0';
  const titleColor  = isDark ? '#ffffff' : '#0f172a';
  const subtitleColor = isDark ? '#64748b' : '#94a3b8';

  return (
    <View style={[s.screen, { backgroundColor: screenBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />

      {/* Header */}
      <View style={[s.header, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
        <Text style={[s.title, { color: titleColor }]}>Schedify</Text>
        <Text style={[s.subtitle, { color: subtitleColor }]}>My Schedules</Text>
      </View>

      {/* Accordion list */}
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <AccordionSection type="event"      isDark={isDark} />
        <AccordionSection type="class"      isDark={isDark} />
        <AccordionSection type="suspension" isDark={isDark} />
        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav active="events" isDark={isDark} />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: {
    paddingHorizontal: 20, paddingTop: 56, paddingBottom: 18,
    borderBottomWidth: 1,
  },
  title: { fontSize: 26, fontWeight: '800', letterSpacing: 0.3 },
  subtitle: { fontSize: 13, fontWeight: '500', marginTop: 2 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 20 },
});
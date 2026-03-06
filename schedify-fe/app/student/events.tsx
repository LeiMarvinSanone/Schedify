import React, { useState, useRef, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated, LayoutAnimation,
  Platform, UIManager,
} from 'react-native';
import { useTheme } from '../../ThemeContext';
import { ICONS } from '../../constants/icons';
import BottomNav from '../../components/BottomNav';
import { useFocusEffect } from '@react-navigation/native';
import { getPostedCalendarEvents, subscribeScheduleChanges } from '../../utils/scheduleStore';
import {
  getClassReminderOverrides,
  getDefaultClassReminder,
  reminderOptionLabel,
  setClassReminderSelection,
  type ReminderOption,
  type ReminderSelection,
} from '../../utils/classReminderStore';
import { syncClassReminderNotifications } from '../../utils/classReminderScheduler';

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
  building?: string;
  department?: string;
  org?: string;
  description?: string;
  date?: string;
}

type SectionData = { label: string; color: string; textColor: string; items: ScheduleItem[] };

const REMINDER_CHOICES: ReminderSelection[] = ['use_default', 'off', '10m', '30m', '1h'];

const DEFAULT_DATA: Record<EventType, SectionData> = {
  event: {
    label: 'Events',
    color: '#8bb7e7',
    textColor: '#1a1a00',
    items: [],
  },
  class: {
    label: 'Class Schedules',
    color: '#5cba6a',
    textColor: '#0a1f0e',
    items: [],
  },
  suspension: {
    label: 'Suspensions',
    color: '#c94040',
    textColor: '#ffffff',
    items: [],
  },
};

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatShortDate(dateString: string | undefined): string | undefined {
  if (!dateString) return undefined;
  const [yearStr, monthStr, dayStr] = dateString.split('-');
  const month = Number(monthStr);
  const day = Number(dayStr);
  const year = Number(yearStr);
  if (!year || !month || !day || month < 1 || month > 12) return undefined;
  return `${MONTH_NAMES[month - 1]} ${day}`;
}

function buildEventsData(postedItems: Awaited<ReturnType<typeof getPostedCalendarEvents>>): Record<EventType, SectionData> {
  const merged: Record<EventType, SectionData> = {
    event: { ...DEFAULT_DATA.event, items: [...DEFAULT_DATA.event.items] },
    class: { ...DEFAULT_DATA.class, items: [...DEFAULT_DATA.class.items] },
    suspension: { ...DEFAULT_DATA.suspension, items: [...DEFAULT_DATA.suspension.items] },
  };

  postedItems.forEach((item) => {
    merged[item.type].items.unshift({
      id: item.id,
      title: item.label,
      time: item.time,
      room: item.room,
      building: item.building,
      department: item.department,
      org: item.org,
      description: item.description,
      date: formatShortDate(item.date),
    });
  });

  return merged;
}


function AccordionSection({
  type,
  items,
  isDark,
  defaultReminder,
  reminderOverrides,
  onClassReminderChange,
}: {
  type: EventType;
  items: ScheduleItem[];
  isDark: boolean;
  defaultReminder: ReminderOption;
  reminderOverrides: Record<string, ReminderOption>;
  onClassReminderChange: (eventId: string, value: ReminderSelection) => void;
}) {
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { label, color, textColor } = DEFAULT_DATA[type];

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

                <View style={[acc.dateBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                  <Text style={[acc.dateText, { color }]}>{item.date?.split(' ')[0]}</Text>
                  <Text style={[acc.dateNum,  { color }]}>{item.date?.split(' ')[1]}</Text>
                </View>

                <View style={acc.itemContent}>
                  <Text style={[acc.itemTitle, { color: titleColor }]}>{item.title}</Text>
                  <View style={acc.itemMeta}>
                    {item.time && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.time} {item.time}</Text>}
                    {item.room && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.room} {item.room}</Text>}
                    {item.building && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.building} {item.building}</Text>}
                    {(item.department || item.org) && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.organization} {item.department || item.org}</Text>}
                  </View>
                  {item.description && (
                    <Text style={[acc.itemDesc, { color: descColor }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}

                  {type === 'class' && (
                    <View style={acc.reminderRow}>
                      {REMINDER_CHOICES.map((choice) => {
                        const selected = (reminderOverrides[item.id] ?? 'use_default') === choice;
                        return (
                          <TouchableOpacity
                            key={`${item.id}-${choice}`}
                            style={[
                              acc.reminderChip,
                              { borderColor: color + '55', backgroundColor: color + '12' },
                              selected && { borderColor: color + 'aa', backgroundColor: color + '2a' },
                            ]}
                            onPress={() => onClassReminderChange(item.id, choice)}
                            activeOpacity={0.8}
                          >
                            <Text style={[acc.reminderChipText, { color: selected ? color : metaColor }]}>
                              {choice === 'use_default'
                                ? reminderOptionLabel('use_default', defaultReminder)
                                : reminderOptionLabel(choice)}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
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
  reminderRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 8 },
  reminderChip: { borderWidth: 1, borderRadius: 14, paddingHorizontal: 8, paddingVertical: 5 },
  reminderChipText: { fontSize: 10, fontWeight: '600' },
});

// main
export default function EventsScreen() {
  const { isDark } = useTheme(); 
  const [data, setData] = useState<Record<EventType, SectionData>>(DEFAULT_DATA);
  const [defaultReminder, setDefaultReminder] = useState<ReminderOption>('30m');
  const [reminderOverrides, setReminderOverrides] = useState<Record<string, ReminderOption>>({});

  const reloadEvents = useCallback(async () => {
    const [posted, currentDefault, currentOverrides] = await Promise.all([
      getPostedCalendarEvents(),
      getDefaultClassReminder(),
      getClassReminderOverrides(),
    ]);

    setData(buildEventsData(posted));
    setDefaultReminder(currentDefault);
    setReminderOverrides(currentOverrides);
    await syncClassReminderNotifications(posted, currentDefault, currentOverrides);
  }, []);

  useFocusEffect(
    useCallback(() => {
      let active = true;

      (async () => {
        const posted = await getPostedCalendarEvents();
        if (!active) return;
        setData(buildEventsData(posted));
      })();

      return () => {
        active = false;
      };
    }, [])
  );

  useEffect(() => {
    const unsubscribe = subscribeScheduleChanges(() => {
      void reloadEvents();
    });
    return unsubscribe;
  }, [reloadEvents]);

  const handleClassReminderChange = useCallback(
    async (eventId: string, value: ReminderSelection) => {
      await setClassReminderSelection(eventId, value);

      const [posted, currentOverrides] = await Promise.all([
        getPostedCalendarEvents(),
        getClassReminderOverrides(),
      ]);

      setReminderOverrides(currentOverrides);
      await syncClassReminderNotifications(posted, defaultReminder, currentOverrides);
    },
    [defaultReminder]
  );

  const screenBg    = isDark ? '#0f172a' : '#f0f4f8';
  const headerBg    = isDark ? '#131d2a' : '#ffffff';
  const headerBorder = isDark ? '#1e2a3a' : '#e2e8f0';
  const titleColor  = isDark ? '#ffffff' : '#0f172a';
  const subtitleColor = isDark ? '#64748b' : '#94a3b8';

  return (
    <View style={[s.screen, { backgroundColor: screenBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />

     
      <View style={[s.header, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
        <Text style={[s.title, { color: titleColor }]}>Schedify</Text>
        <Text style={[s.subtitle, { color: subtitleColor }]}>My Schedules</Text>
      </View>

     
      <ScrollView style={s.scroll} contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <AccordionSection
          type="event"
          items={data.event.items}
          isDark={isDark}
          defaultReminder={defaultReminder}
          reminderOverrides={reminderOverrides}
          onClassReminderChange={handleClassReminderChange}
        />
        <AccordionSection
          type="class"
          items={data.class.items}
          isDark={isDark}
          defaultReminder={defaultReminder}
          reminderOverrides={reminderOverrides}
          onClassReminderChange={handleClassReminderChange}
        />
        <AccordionSection
          type="suspension"
          items={data.suspension.items}
          isDark={isDark}
          defaultReminder={defaultReminder}
          reminderOverrides={reminderOverrides}
          onClassReminderChange={handleClassReminderChange}
        />
        <View style={{ height: 20 }} />
      </ScrollView>

      <BottomNav role="student" active="events" />
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
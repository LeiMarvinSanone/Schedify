import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, Animated, LayoutAnimation,
  Platform, UIManager, Alert,
} from 'react-native';
import { ICONS } from '../../constants/icons';
import { useTheme } from '../../ThemeContext';
import BottomNav from '../../components/BottomNav';
import { useFocusEffect } from '@react-navigation/native';
import { getPostedCalendarEvents, deletePostedCalendarEvent } from '../../utils/scheduleStore';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

type PostType = 'class' | 'event' | 'suspension';

interface ScheduleItem {
  id: string;
  title: string;
  tag: string;
  date?: string;
  time?: string;
  room?: string;
  organization?: string;
  description?: string;
}

const DATA: Record<PostType, { label: string; color: string; textColor: string; items: ScheduleItem[] }> = {
  class: {
    label: 'Class Schedules',
    color: '#4ade80',
    textColor: '#0f172a',
    items: [],
  },
  suspension: {
    label: 'Suspensions',
    color: '#ef4444',
    textColor: '#ffffff',
    items: [],
  },
  event: {
    label: 'Events',
    color: '#3b82f6',
    textColor: '#ffffff',
    items: [],
  },
};


function AccordionSection({ type, items, onDelete }: { type: PostType; items: ScheduleItem[]; onDelete?: (id: string) => void }) {
  const { theme } = useTheme();
  const [open, setOpen] = useState(false);
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const { label, color, textColor } = DATA[type];

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


  const bodyBg   = theme.card;
  const itemBg   = theme.bg;
  const metaColor = theme.subtitle;
  const descColor = theme.muted;

  const confirmDelete = (title: string, id: string) => {
    const message = `Are you sure you want to delete "${title}"?\n\nThis action cannot be undone.`;

    if (Platform.OS === 'web') {
      const confirmed = typeof globalThis.confirm === 'function' ? globalThis.confirm(message) : true;
      if (confirmed && onDelete) onDelete(id);
      return;
    }

    Alert.alert(
      'Delete Schedule',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          onPress: () => {
            if (onDelete) onDelete(id);
          },
          style: 'destructive',
        },
      ]
    );
  };

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
            <Text style={[acc.emptyText, { color: metaColor }]}>No items scheduled.</Text>
          ) : (
            items.map((item, i) => (
              <View
                key={item.id}
                style={[
                  acc.item,
                  { borderLeftColor: color, backgroundColor: itemBg },
                  i < items.length - 1 && acc.itemDivider,
                ]}
              >
             
                {item.date && (
                  <View style={[acc.dateBadge, { backgroundColor: color + '22', borderColor: color + '55' }]}>
                    <Text style={[acc.dateText, { color }]}>{item.date?.split(' ')[0]}</Text>
                    <Text style={[acc.dateNum,  { color }]}>{item.date?.split(' ')[1]}</Text>
                  </View>
                )}

                <View style={acc.itemContent}>
                  <Text style={[acc.itemTitle, { color: theme.text }]}>{item.title}</Text>
                  <View style={acc.itemMeta}>
                    {item.time         && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.time} {item.time}</Text>}
                    {item.room         && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.room} {item.room}</Text>}
                    {item.organization && <Text style={[acc.metaChip, { color: metaColor }]}>{ICONS.meta.organization} {item.organization}</Text>}
                  </View>
                  <View style={[acc.tagBadge, { backgroundColor: color + '22' }]}>
                    <Text style={[acc.tagText, { color }]}>{item.tag}</Text>
                  </View>
                  {item.description && (
                    <Text style={[acc.itemDesc, { color: descColor }]} numberOfLines={2}>
                      {item.description}
                    </Text>
                  )}
                </View>

                <TouchableOpacity
                  activeOpacity={0.5}
                  onPress={() => {
                    console.log('DELETE BUTTON PRESSED for:', item.id, item.title);
                    console.log('Confirming delete for:', item.id);
                    confirmDelete(item.title, item.id);
                  }}
                  style={[acc.deleteBtn, { backgroundColor: theme.danger + '20' }]}
                >
                  <Text style={[acc.deleteBtnText, { color: theme.danger }]}>{ICONS.actions.delete}</Text>
                </TouchableOpacity>
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
  dateNum:  { fontSize: 15, fontWeight: '800', lineHeight: 18 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 14, fontWeight: '700', marginBottom: 5 },
  itemMeta: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 6 },
  metaChip: { fontSize: 11 },
  tagBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 6, alignSelf: 'flex-start', marginBottom: 4 },
  tagText: { fontSize: 10, fontWeight: '700' },
  itemDesc: { fontSize: 11, marginTop: 4, fontStyle: 'italic', lineHeight: 16 },
  deleteBtn: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  deleteBtnText: { fontSize: 16, fontWeight: '700' },
});

//  Main Screen 
export default function SchedulesScreen() {
  const { theme, isDark } = useTheme();
  const typeOrder: PostType[] = ['class', 'event', 'suspension'];
  const [data, setData] = useState<Record<PostType, ScheduleItem[]>>({
    class: [],
    event: [],
    suspension: [],
  });

  const loadPostedEvents = async () => {
    try {
      const posted = await getPostedCalendarEvents();
      console.log('Loaded posted events:', posted);
      const newData: Record<PostType, ScheduleItem[]> = {
        class: [],
        event: [],
        suspension: [],
      };
      
      posted.forEach((event) => {
        const formattedDate = event.date
          ? event.date.split('-').slice(1).join('-').replace('-', ' ').replace(/^0/, '')
          : undefined;
        
        const item: ScheduleItem = {
          id: event.id,
          title: event.label,
          tag: event.department || event.org || 'Posted',
          date: formattedDate,
          time: event.time,
          room: event.room,
          organization: event.org,
          description: event.description,
        };
        
        if (newData[event.type]) {
          newData[event.type].unshift(item);
        }
      });
      
      console.log('Data after load:', newData);
      setData(newData);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      loadPostedEvents();
    }, [])
  );

  const handleDelete = async (id: string) => {
    try {
      console.log('=== DELETE START ===');
      console.log('Deleting item with id:', id);
      console.log('Current data state:', data);
      
      await deletePostedCalendarEvent(id);
      console.log('Item deleted from storage');
      
      await loadPostedEvents();
      console.log('Events reloaded, new data state:', data);
      console.log('=== DELETE COMPLETE ===');
    } catch (error) {
      console.error('Delete failed:', error);
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: theme.bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={theme.bg} />

      <ScrollView
        style={styles.scroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <Text style={[styles.pageTitle, { color: theme.title }]}>All Schedules Posted</Text>

        {typeOrder.map(type => (
          <AccordionSection key={type} type={type} items={data[type]} onDelete={handleDelete} />
        ))}

        <View style={{ height: 24 }} />
      </ScrollView>

      <BottomNav role="admin" active="schedules" />
    </View>
  );
}

// ─── Styles 
const styles = StyleSheet.create({
  screen: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 52, paddingBottom: 12 },

  pageTitle: { fontSize: 24, fontWeight: '700', letterSpacing: 0.5, marginBottom: 24 },

});
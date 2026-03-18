import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, StatusBar, TextInput,
  Dimensions, Modal, Animated, FlatList,
} from 'react-native';
import { useTheme } from '../../ThemeContext';
import { ICONS } from '../../constants/icons';
import BottomNav from '../../components/BottomNav';
import { useFocusEffect } from '@react-navigation/native';
import { getSchedules, getCurrentUser } from '../../utils/apiClient';

const { width } = Dimensions.get('window');

const EVENT_COLORS_DARK = {
  class:      { bg: '#1e3a2f', text: '#86efac', border: '#86efac', dot: '#86efac' },
  suspension: { bg: '#3b1f1f', text: '#fca5a5', border: '#fca5a5', dot: '#fca5a5' },
  event:      { bg: '#1e2a3b', text: '#93c5fd', border: '#93c5fd', dot: '#93c5fd' },
};
const EVENT_COLORS_LIGHT = {
  class:      { bg: '#dcfce7', text: '#166534', border: '#16a34a', dot: '#16a34a' },
  suspension: { bg: '#fee2e2', text: '#991b1b', border: '#dc2626', dot: '#dc2626' },
  event:      { bg: '#dbeafe', text: '#1e40af', border: '#3b82f6', dot: '#3b82f6' },
};

const TYPE_LABELS: Record<EventType, string> = { class: 'Class', suspension: 'Suspension', event: 'Event' };
const TYPE_ICONS: Record<EventType, string>  = { class: ICONS.postTypes.class, suspension: ICONS.postTypes.suspension, event: ICONS.postTypes.event };

type EventType = 'class' | 'suspension' | 'event';
type ViewType  = 'Month' | 'Year' | 'Week';

interface CalEvent {
  label: string; type: EventType;
  time?: string; room?: string; building?: string; department?: string; org?: string; tag?: string; description?: string;
}

const DEFAULT_EVENTS: Record<string, CalEvent[]> = {};

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function getDayIndex(value: string): number | undefined {
  const day = value.trim().toLowerCase();
  const short = day.slice(0, 3);
  const dayMap: Record<string, number> = {
    sunday: 0,
    sun: 0,
    monday: 1,
    mon: 1,
    tuesday: 2,
    tue: 2,
    wednesday: 3,
    wed: 3,
    thursday: 4,
    thu: 4,
    friday: 5,
    fri: 5,
    saturday: 6,
    sat: 6,
  };

  return dayMap[day] ?? dayMap[short];
}

function parseIsoLikeDate(value: string): string | undefined {
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}-\d{2}T/.test(value)) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return toIsoDate(parsed);
  }
  return undefined;
}

function normalizeToDateKey(value: string): string {
  const isoDate = parseIsoLikeDate(value);
  if (isoDate) return isoDate;

  const target = getDayIndex(value);
  if (target === undefined) return '';

  const today = new Date();
  const current = today.getDay();
  const diff = (target - current + 7) % 7;
  const next = new Date(today);
  next.setDate(today.getDate() + diff);
  return toIsoDate(next);
}

function recurringDateKeysForDay(value: string, weeksAhead = 16): string[] {
  // Map a day (e.g., "Monday") to all matching days for the next 52 weeks (full year)
  const isoDate = parseIsoLikeDate(value);
  if (isoDate) return [isoDate];

  const target = getDayIndex(value);
  if (target === undefined) {
    return [];
  }

  const today = new Date();
  const current = today.getDay();
  const diff = (target - current + 7) % 7;
  const first = new Date(today);
  first.setDate(today.getDate() + diff);

  const keys: string[] = [];
  const recurrenceWeeks = 52; // Show recurring schedules for a full year
  for (let i = 0; i < recurrenceWeeks; i += 1) {
    const next = new Date(first);
    next.setDate(first.getDate() + i * 7);
    keys.push(toIsoDate(next));
  }
  return keys;
}

function transformBackendSchedules(schedules: Awaited<ReturnType<typeof getSchedules>>): Record<string, CalEvent[]> {
  const events: Record<string, CalEvent[]> = {};  

  schedules.forEach((schedule) => {
    if (!schedule.subjects || schedule.subjects.length === 0) return;

    const eventType: EventType = 
      schedule.type === 'Class Schedules' ? 'class' :
      schedule.type === 'Events' ? 'event' : 'suspension';

    schedule.subjects.forEach((subject) => {
      const dateKeys = schedule.type === 'Class Schedules'
        ? recurringDateKeysForDay(subject.day)
        : [normalizeToDateKey(subject.day)].filter(Boolean);

      // Fallback: if day is malformed, still show the item on schedule creation date.
      const effectiveDateKeys = dateKeys.length > 0
        ? dateKeys
        : [toIsoDate(new Date(schedule.createdAt))];

      effectiveDateKeys.forEach((dateStr) => {
        if (!events[dateStr]) events[dateStr] = [];

        events[dateStr].push({
          label: subject.name,
          type: eventType,
          time: subject.timeRange,
          room: subject.room,
          building: subject.building,
          department: schedule.department,
          tag: schedule.tag,
          description: schedule.course,
        });
      });
    });
  });

  return events;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];
const SHORT_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const WEEK_DAYS = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
const WEEK_DAYS_SUN = ['S','M','T','W','Th','F','S'];

function getDaysInMonth(y: number, m: number) { return new Date(y, m + 1, 0).getDate(); }
function getFirstDaySun(y: number, m: number) { return new Date(y, m, 1).getDay(); }
function dateKey(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
}
// search result
interface SearchResult {
  dateKey: string;
  year: number;
  month: number;
  day: number;
  eventIndex: number;
  event: CalEvent;
}

function buildSearchIndex(eventsByDate: Record<string, CalEvent[]>): SearchResult[] {
  const results: SearchResult[] = [];
  for (const [key, events] of Object.entries(eventsByDate)) {
    const [y, m, d] = key.split('-').map(Number);
    events.forEach((ev, i) => {
      results.push({ dateKey: key, year: y, month: m - 1, day: d, eventIndex: i, event: ev });
    });
  }
  return results;
}


function EventChip({ label, type, onPress, isDark }: { label: string; type: EventType; onPress: () => void; isDark: boolean }) {
  const c = isDark ? EVENT_COLORS_DARK[type] : EVENT_COLORS_LIGHT[type];
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}
      style={[chip.wrap, { backgroundColor: c.bg, borderColor: c.border }]}>
      <View style={[chip.dot, { backgroundColor: c.dot }]} />
      <Text style={[chip.text, { color: c.text }]} numberOfLines={1}>{label}</Text>
    </TouchableOpacity>
  );
}
const chip = StyleSheet.create({
  wrap: { borderRadius: 5, borderWidth: 1, paddingHorizontal: 5, paddingVertical: 3, marginTop: 2, marginHorizontal: 1, flexDirection: 'row', alignItems: 'center', gap: 4 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  text: { fontSize: 9, fontWeight: '700', flexShrink: 1 },
});

// search dropdown
function SearchDropdown({ results, isDark, onSelect, onClose }: {
  results: SearchResult[];
  isDark: boolean;
  onSelect: (r: SearchResult) => void;
  onClose: () => void;
}) {
  const EC = isDark ? EVENT_COLORS_DARK : EVENT_COLORS_LIGHT;
  const bg       = isDark ? '#1e2a3a' : '#ffffff';
  const border   = isDark ? '#2d3f55' : '#e2e8f0';
  const dateClr  = isDark ? '#64748b' : '#94a3b8';
  const emptyClr = isDark ? '#4a5878' : '#94a3b8';

  return (
    <>
      <TouchableOpacity 
        style={sr.backdrop} 
        activeOpacity={1} 
        onPress={onClose}
      />

      <View style={[sr.dropdown, { backgroundColor: bg, borderColor: border, top: 118 }]}>
        {results.length === 0 ? (
          <View style={sr.empty}>
            <Text style={sr.emptyIcon}>🔍</Text>
            <Text style={[sr.emptyText, { color: emptyClr }]}>No events found</Text>
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(r) => `${r.dateKey}-${r.eventIndex}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item: r }) => {
              const c = EC[r.event.type];
              const dateStr = `${MONTHS[r.month]} ${r.day}, ${r.year}`;
              return (
                <TouchableOpacity
                  style={[sr.item, { borderBottomColor: border }]}
                  onPress={() => onSelect(r)}
                  activeOpacity={0.7}
                >
                  <View style={[sr.strip, { backgroundColor: c.border }]} />

                  <View style={sr.itemContent}>
                    <View style={sr.itemTop}>
                      <View style={[sr.typeBadge, { backgroundColor: c.bg, borderColor: c.border + '88' }]}>
                        <Text style={sr.typeIcon}>{TYPE_ICONS[r.event.type]}</Text>
                        <Text style={[sr.typeText, { color: c.text }]}>{TYPE_LABELS[r.event.type]}</Text>
                      </View>
                      <Text style={[sr.dateText, { color: dateClr }]}>{dateStr}</Text>
                    </View>

                    
                    <Text style={[sr.label, { color: isDark ? '#e2e8f0' : '#1e293b' }]} numberOfLines={1}>
                      {r.event.label}
                    </Text>

                   
                    <View style={sr.metaRow}>
                      {r.event.time && <Text style={[sr.meta, { color: isDark ? '#64748b' : '#94a3b8' }]}>{ICONS.meta.time} {r.event.time}</Text>}
                      {r.event.room && <Text style={[sr.meta, { color: isDark ? '#64748b' : '#94a3b8' }]}>{ICONS.meta.room} {r.event.room}</Text>}
                      {r.event.building && (
                        <Text style={[sr.meta, { color: isDark ? '#94a3b8' : '#475569', fontWeight: 'bold', fontSize: 12 }]}>
                          {ICONS.meta.building} {r.event.building}
                        </Text>
                      )}
                      {(r.event.department || r.event.org) && <Text style={[sr.meta, { color: isDark ? '#64748b' : '#94a3b8' }]}>{ICONS.meta.organization} {r.event.department || r.event.org}</Text>}
                      {r.event.tag && <Text style={[sr.meta, { color: isDark ? '#64748b' : '#94a3b8' }]}>🏷 {r.event.tag}</Text>}
                    </View>
                  </View>
                </TouchableOpacity>
              );
            }}
          />
        )}
      </View>
    </>
  );
}
const sr = StyleSheet.create({
  backdrop: { position: 'absolute', top: 118, left: 0, right: 0, bottom: 0, zIndex: 999 },
  dropdown: {
    position: 'absolute', left: 12, right: 12,
    borderRadius: 14, borderWidth: 1,
    maxHeight: 320, overflow: 'hidden',
    elevation: 20, zIndex: 1000,
    shadowColor: '#000', shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.4, shadowRadius: 12,
  },
  empty: { alignItems: 'center', justifyContent: 'center', paddingVertical: 32, gap: 8 },
  emptyIcon: { fontSize: 28 },
  emptyText: { fontSize: 13 },
  item: { flexDirection: 'row', borderBottomWidth: 1 },
  strip: { width: 4 },
  itemContent: { flex: 1, paddingHorizontal: 12, paddingVertical: 10, gap: 3 },
  itemTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  typeBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  typeIcon: { fontSize: 9 },
  typeText: { fontSize: 9, fontWeight: '700' },
  dateText: { fontSize: 10 },
  label: { fontSize: 14, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  meta: { fontSize: 11 },
});

// event details
function EventDetailPanel({ selectedDate, focusedIndex, events, year, month, onClearFocus, isDark }: {
  selectedDate: number | null; focusedIndex: number | null;
  events: CalEvent[]; year: number; month: number;
  onClearFocus: () => void; isDark: boolean;
}) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const EC = isDark ? EVENT_COLORS_DARK : EVENT_COLORS_LIGHT;

  React.useEffect(() => {
    Animated.timing(fadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    return () => { fadeAnim.setValue(0); };
  }, [selectedDate, focusedIndex, fadeAnim]);

  const displayEvents = focusedIndex !== null ? [events[focusedIndex]] : events;
  const dateObj = selectedDate ? new Date(year, month, selectedDate) : null;
  const dayName = dateObj ? ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][dateObj.getDay()] : '';
  const dominantType: EventType = events[0]?.type ?? 'event';
  const accentColor = selectedDate && events.length > 0 ? EC[dominantType].border : (isDark ? '#4a5878' : '#cbd5e0');
  const panelBg    = isDark ? '#1a2536' : '#f8fafc';
  const labelColor = isDark ? '#e2e8f0' : '#1e293b';
  const mutedColor = isDark ? '#4a5878' : '#94a3b8';

  return (
    <View style={[ep.wrapper, { backgroundColor: panelBg, borderTopColor: accentColor }]}>
      <View style={[ep.glowStrip, { backgroundColor: accentColor + '22' }]} />
      <View style={[ep.handle, { backgroundColor: accentColor + '77' }]} />

      {!selectedDate ? (
        <View style={ep.emptyState}>
          <Text style={ep.emptyIcon}>📅</Text>
          <Text style={[ep.emptyText, { color: mutedColor }]}>Tap a date or event to view details</Text>
        </View>
      ) : (
        <Animated.View style={[ep.inner, { opacity: fadeAnim }]}>
          <View style={ep.headerRow}>
            <View style={ep.headerLeft}>
              <View style={[ep.dayBadge, { borderColor: accentColor, backgroundColor: isDark ? '#ffffff08' : '#f1f5f9' }]}>
                <Text style={[ep.dayNum, { color: accentColor }]}>{selectedDate}</Text>
                <Text style={[ep.dayName, { color: accentColor + 'aa' }]}>{dayName}</Text>
              </View>
              <View style={ep.headerMeta}>
                <Text style={[ep.dateLabel, { color: labelColor }]}>{dayName}, {MONTHS[month]} {selectedDate}</Text>
                <View style={ep.dotRow}>
                  {events.length === 0
                    ? <Text style={[ep.noEvt, { color: mutedColor }]}>No events</Text>
                    : (['class','suspension','event'] as EventType[]).map(t => {
                        const cnt = events.filter(e => e.type === t).length;
                        if (!cnt) return null;
                        return (
                          <View key={t} style={ep.dotItem}>
                            <View style={[ep.dot, { backgroundColor: EC[t].dot }]} />
                            <Text style={[ep.dotLabel, { color: mutedColor }]}>{cnt} {TYPE_LABELS[t]}</Text>
                          </View>
                        );
                      })
                  }
                </View>
              </View>
            </View>
            {focusedIndex !== null && events.length > 1 && (
              <TouchableOpacity onPress={onClearFocus}
                style={[ep.showAllBtn, { backgroundColor: isDark ? '#2d3f55' : '#e2e8f0', borderColor: isDark ? '#4a5878' : '#cbd5e0' }]}>
                <Text style={[ep.showAllText, { color: isDark ? '#94a3b8' : '#64748b' }]}>All {events.length}</Text>
              </TouchableOpacity>
            )}
          </View>

          {events.length === 0
            ? <Text style={[ep.nothingText, { color: mutedColor }]}>Nothing scheduled.</Text>
            : (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={ep.cardRow}>
                {displayEvents.map((ev, i) => {
                  const c = EC[ev.type];
                  return (
                    <View key={i} style={[ep.card, { backgroundColor: c.bg, borderLeftColor: c.border }]}>
                      <View style={ep.cardHeader}>
                        <View style={[ep.badge, { backgroundColor: c.border + '25', borderColor: c.border + '55' }]}>
                          <Text style={ep.badgeIcon}>{TYPE_ICONS[ev.type]}</Text>
                          <Text style={[ep.badgeText, { color: c.text }]}>{TYPE_LABELS[ev.type]}</Text>
                        </View>
                      </View>
                      <Text style={[ep.cardTitle, { color: c.text }]} numberOfLines={1}>{ev.label}</Text>
                      <View style={ep.infoLine}>
                        {ev.time && <Text style={[ep.infoChip, { color: isDark ? '#94a3b8' : '#475569' }]}>{ICONS.meta.time} {ev.time}</Text>}
                        {ev.room && <Text style={[ep.infoChip, { color: isDark ? '#94a3b8' : '#475569' }]}>{ICONS.meta.room} {ev.room}</Text>}
                        {ev.building && (
                            <Text style={[ep.infoChip, { color: isDark ? '#94a3b8' : '#475569', fontWeight: 'bold', fontSize: 12 }]}> 
                            {ICONS.meta.building} {ev.building}
                          </Text>
                        )}
                        {(ev.department || ev.org) && <Text style={[ep.infoChip, { color: isDark ? '#94a3b8' : '#475569' }]}>{ICONS.meta.organization} {ev.department || ev.org}</Text>}
                        {ev.tag && <Text style={[ep.infoChip, { color: isDark ? '#94a3b8' : '#475569' }]}>🏷 {ev.tag}</Text>}
                      </View>
                      {ev.description && <Text style={[ep.desc, { color: c.text + '88' }]} numberOfLines={2}>{ev.description}</Text>}
                    </View>
                  );
                })}
              </ScrollView>
            )
          }
        </Animated.View>
      )}
    </View>
  );
}
const ep = StyleSheet.create({
  wrapper: { borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 12, paddingTop: 5, paddingBottom: 8, height: 210, borderTopWidth: 2, shadowColor: '#000', shadowOffset: { width: 0, height: -3 }, shadowOpacity: 0.35, shadowRadius: 8, elevation: 14 },
  glowStrip: { position: 'absolute', top: 0, left: 0, right: 0, height: 28, borderTopLeftRadius: 18, borderTopRightRadius: 18 },
  handle: { width: 36, height: 3, borderRadius: 2, alignSelf: 'center', marginBottom: 7 },
  inner: { flex: 1 },
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  emptyIcon: { fontSize: 22 },
  emptyText: { fontSize: 12 },
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 },
  dayBadge: { width: 36, height: 36, borderRadius: 8, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  dayNum: { fontSize: 13, fontWeight: '800', lineHeight: 15 },
  dayName: { fontSize: 7, fontWeight: '700', letterSpacing: 0.4 },
  headerMeta: { flex: 1 },
  dateLabel: { fontSize: 12, fontWeight: '700' },
  dotRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 2 },
  noEvt: { fontSize: 10 },
  dotItem: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3 },
  dotLabel: { fontSize: 10 },
  showAllBtn: { borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1 },
  showAllText: { fontSize: 10, fontWeight: '600' },
  nothingText: { fontSize: 12, marginTop: 4 },
  cardRow: { flexDirection: 'row', gap: 8, paddingRight: 12 },
  card: { borderRadius: 10, padding: 9, borderLeftWidth: 3, width: 185, justifyContent: 'center' },
  cardHeader: { flexDirection: 'row', marginBottom: 4 },
  badge: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderRadius: 20, paddingHorizontal: 7, paddingVertical: 2 },
  badgeIcon: { fontSize: 9 },
  badgeText: { fontSize: 9, fontWeight: '700' },
  cardTitle: { fontSize: 13, fontWeight: '800', marginBottom: 5, letterSpacing: 0.1 },
  infoLine: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  infoChip: { fontSize: 10 },
  desc: { fontSize: 10, marginTop: 5, fontStyle: 'italic', lineHeight: 14 },
});

// month view
function MonthView({ year, month, onPrev, onNext, onSelectDate, isDark, eventsByDate }: {
  year: number; month: number; onPrev: () => void; onNext: () => void;
  onSelectDate: (date: number, ei: number | null) => void; isDark: boolean;
  eventsByDate: Record<string, CalEvent[]>;
}) {
  const [selectedDate, setSelectedDate] = useState<number | null>(null);
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDaySun(year, month);
  const prevMonthDays = getDaysInMonth(year, month === 0 ? 11 : month - 1);
  const cells: { day: number; current: boolean }[] = [];
  for (let i = firstDay - 1; i >= 0; i--) cells.push({ day: prevMonthDays - i, current: false });
  for (let i = 1; i <= days; i++) cells.push({ day: i, current: true });
  while (cells.length % 7 !== 0) cells.push({ day: cells.length - firstDay - days + 1, current: false });
  const weeks: typeof cells[] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  const today = new Date().getDate();

  const gridBorder   = isDark ? '#2d3f55' : '#e2e8f0';
  const weekDayColor = isDark ? '#64748b' : '#94a3b8';
  const dayColor     = isDark ? '#cbd5e1' : '#334155';
  const fadedColor   = isDark ? '#334155' : '#cbd5e0';
  const cellSelBg    = isDark ? '#1e2a3a' : '#eff6ff';
  const navBtnBg     = isDark ? '#1e2a3a' : '#f1f5f9';
  const navBtnColor  = isDark ? '#e2e8f0' : '#334155';
  const monthColor   = isDark ? '#ffffff' : '#0f172a';
  const legendColor  = isDark ? '#64748b' : '#94a3b8';

  return (
    <View style={{ flex: 1 }}>
      <View style={mv.navRow}>
        <TouchableOpacity onPress={onPrev} style={[mv.navBtn, { backgroundColor: navBtnBg }]}>
          <Text style={[mv.navBtnText, { color: navBtnColor }]}>{'‹'}</Text>
        </TouchableOpacity>
        <Text style={[mv.monthLabel, { color: monthColor }]}>{MONTHS[month]} {year}</Text>
        <TouchableOpacity onPress={onNext} style={[mv.navBtn, { backgroundColor: navBtnBg }]}>
          <Text style={[mv.navBtnText, { color: navBtnColor }]}>{'›'}</Text>
        </TouchableOpacity>
      </View>
      <View style={[mv.weekHeader, { borderBottomColor: gridBorder }]}>
        {WEEK_DAYS.map(d => <Text key={d} style={[mv.weekDay, { color: weekDayColor }]}>{d}</Text>)}
      </View>
      <ScrollView showsVerticalScrollIndicator={false} style={{ flex: 1 }}>
        {weeks.map((week, wi) => (
          <View key={wi} style={[mv.weekRow, { borderBottomColor: gridBorder }]}>
            {week.map((cell, di) => {
              const key = cell.current ? dateKey(year, month, cell.day) : '';
              const evs = eventsByDate[key] || [];
              const isToday    = cell.current && cell.day === today;
              const isSelected = cell.current && cell.day === selectedDate;
              return (
                <TouchableOpacity key={di}
                  style={[mv.cell, { borderRightColor: gridBorder }, isSelected && { backgroundColor: cellSelBg }]}
                  onPress={() => { if (!cell.current) return; setSelectedDate(cell.day); onSelectDate(cell.day, null); }}
                  activeOpacity={0.7}
                >
                  <View style={[mv.dayNumWrap, isToday && mv.dayNumToday, isSelected && mv.dayNumSelected]}>
                    <Text style={[mv.dayNum, { color: dayColor }, !cell.current && { color: fadedColor }, isToday && mv.dayNumTodayText, isSelected && mv.dayNumSelectedText]}>
                      {cell.day}
                    </Text>
                  </View>
                  {evs.slice(0, 2).map((ev, ei) => (
                    <EventChip key={ei} label={ev.label} type={ev.type} isDark={isDark}
                      onPress={() => { setSelectedDate(cell.day); onSelectDate(cell.day, ei); }} />
                  ))}
                  {evs.length > 2 && <Text style={[mv.moreText, { color: legendColor }]}>+{evs.length - 2}</Text>}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
        <View style={[mv.legend, { borderTopColor: gridBorder }]}>
          {(['class','suspension','event'] as EventType[]).map(t => (
            <View key={t} style={mv.legendItem}>
              <View style={[mv.legendDot, { backgroundColor: EVENT_COLORS_DARK[t].border }]} />
              <Text style={[mv.legendText, { color: legendColor }]}>{TYPE_LABELS[t]}</Text>
            </View>
          ))}
        </View>
        <View style={{ height: 12 }} />
      </ScrollView>
    </View>
  );
}
const mv = StyleSheet.create({
  navRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 4, paddingVertical: 10, marginBottom: 4 },
  navBtn: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  navBtnText: { fontSize: 22, fontWeight: '300', lineHeight: 26 },
  monthLabel: { fontSize: 18, fontWeight: '700', letterSpacing: 0.5 },
  weekHeader: { flexDirection: 'row', borderBottomWidth: 1, paddingBottom: 8, marginBottom: 2 },
  weekDay: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '600' },
  weekRow: { flexDirection: 'row', borderBottomWidth: 1 },
  cell: { flex: 1, minHeight: 88, borderRightWidth: 1, padding: 4, paddingBottom: 6 },
  dayNumWrap: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  dayNumToday: { borderWidth: 2, borderColor: '#3b82f6', borderRadius: 8 },
  dayNumSelected: { backgroundColor: '#3b82f6', borderRadius: 8 },
  dayNum: { fontSize: 13, fontWeight: '500' },
  dayNumTodayText: { color: '#3b82f6', fontWeight: '700' },
  dayNumSelectedText: { color: '#ffffff', fontWeight: '700' },
  moreText: { fontSize: 9, marginTop: 2, marginLeft: 5, fontWeight: '600' },
  legend: { flexDirection: 'row', justifyContent: 'center', gap: 16, paddingVertical: 12, borderTopWidth: 1, marginTop: 4 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 8, height: 8, borderRadius: 4 },
  legendText: { fontSize: 11 },
});
// calendar
function MiniCalendar({
  year,
  month,
  isDark,
  eventsByDate,
  onPressDate,
}: {
  year: number;
  month: number;
  isDark: boolean;
  eventsByDate: Record<string, CalEvent[]>;
  onPressDate: (year: number, month: number, day: number) => void;
}) {
  const days = getDaysInMonth(year, month);
  const firstDay = getFirstDaySun(year, month);
  const cells: (number | null)[] = Array(firstDay).fill(null);
  for (let i = 1; i <= days; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  return (
    <View style={[mini.container, { backgroundColor: isDark ? '#1e2a3a' : '#f1f5f9' }]}>
      <Text style={[mini.title, { color: isDark ? '#e2e8f0' : '#1e293b' }]}>{SHORT_MONTHS[month]} {year}</Text>
      <View style={mini.grid}>
        {['S','M','T','W','T','F','S'].map((d, i) => <Text key={i} style={[mini.dayHead, { color: isDark ? '#64748b' : '#94a3b8' }]}>{d}</Text>)}
        {cells.map((d, i) => {
          if (d === null) {
            return <View key={i} style={[mini.cellWrap, { opacity: 0 }]}><Text style={mini.cell}>0</Text></View>;
          }

          const key = dateKey(year, month, d);
          const count = (eventsByDate[key] || []).length;

          return (
            <TouchableOpacity key={i} style={mini.cellWrap} onPress={() => onPressDate(year, month, d)} activeOpacity={0.7}>
              <Text style={[mini.cell, { color: isDark ? '#94a3b8' : '#475569' }]}>{d}</Text>
              {count > 0 && <View style={[mini.dot, { backgroundColor: '#3b82f6' }]} />}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}
const mini = StyleSheet.create({
  container: { borderRadius: 10, padding: 10, margin: 5, flex: 1 },
  title: { fontSize: 10, fontWeight: '700', marginBottom: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  dayHead: { width: '14.28%', textAlign: 'center', fontSize: 8, fontWeight: '700', marginBottom: 2 },
  cellWrap: { width: '14.28%', alignItems: 'center', paddingVertical: 1 },
  cell: { textAlign: 'center', fontSize: 9, minHeight: 12 },
  dot: { width: 4, height: 4, borderRadius: 2, marginTop: 1 },
});

function YearView({
  year,
  isDark,
  eventsByDate,
  onPressDate,
}: {
  year: number;
  isDark: boolean;
  eventsByDate: Record<string, CalEvent[]>;
  onPressDate: (year: number, month: number, day: number) => void;
}) {
  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      {Array.from({ length: 6 }, (_, i) => (
        <View key={i} style={{ flexDirection: 'row', marginBottom: 4 }}>
          <MiniCalendar
            year={year}
            month={i * 2}
            isDark={isDark}
            eventsByDate={eventsByDate}
            onPressDate={onPressDate}
          />
          <MiniCalendar
            year={year}
            month={i * 2 + 1}
            isDark={isDark}
            eventsByDate={eventsByDate}
            onPressDate={onPressDate}
          />
        </View>
      ))}
    </ScrollView>
  );
}

// week view
function WeekView({
  isDark,
  year,
  month,
  selectedDate,
  eventsByDate,
}: {
  isDark: boolean;
  year: number;
  month: number;
  selectedDate: number | null;
  eventsByDate: Record<string, CalEvent[]>;
}) {
  const baseDate = selectedDate
    ? new Date(year, month, selectedDate)
    : new Date(year, month, 1);

  const weekStart = new Date(baseDate);
  weekStart.setDate(baseDate.getDate() - baseDate.getDay());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const headerBg   = isDark ? '#1e2a3a' : '#f1f5f9';
  const headerText = isDark ? '#e2e8f0' : '#334155';
  const cardBg     = isDark ? '#1a2536' : '#ffffff';
  const cardBorder = isDark ? '#2d3f55' : '#e2e8f0';
  const mutedText  = isDark ? '#94a3b8' : '#64748b';
  const labelText  = isDark ? '#e2e8f0' : '#1e293b';

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View style={[wv.header, { backgroundColor: headerBg }]}>
        {WEEK_DAYS_SUN.map((d, i) => (
          <View key={i} style={wv.headerCell}>
            <Text style={[wv.headerText, { color: headerText }]}>{d}</Text>
          </View>
        ))}
      </View>

      {weekDates.map((d) => {
        const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
        const dayEvents = eventsByDate[key] || [];

        return (
          <View key={key} style={[wv.dayCard, { backgroundColor: cardBg, borderColor: cardBorder }]}> 
            <View style={wv.dayHeader}>
              <Text style={[wv.dayTitle, { color: labelText }]}>{MONTHS[d.getMonth()]} {d.getDate()}</Text>
              <Text style={[wv.dayCount, { color: mutedText }]}>{dayEvents.length} event{dayEvents.length === 1 ? '' : 's'}</Text>
            </View>

            {dayEvents.length === 0 ? (
              <Text style={[wv.emptyText, { color: mutedText }]}>No events</Text>
            ) : (
              <View style={wv.eventList}>
                {dayEvents.map((ev, i) => (
                  <View key={`${key}-${i}`} style={[wv.eventItem, { borderLeftColor: isDark ? EVENT_COLORS_DARK[ev.type].border : EVENT_COLORS_LIGHT[ev.type].border }]}>
                    <Text style={[wv.eventLabel, { color: labelText }]} numberOfLines={1}>{ev.label}</Text>
                    <Text style={[wv.eventMeta, { color: mutedText }]} numberOfLines={1}>
                      {TYPE_LABELS[ev.type]}{ev.time ? ` • ${ev.time}` : ''}{ev.room ? ` • ${ev.room}` : ''}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        );
      })}
    </ScrollView>
  );
}
const wv = StyleSheet.create({
  header: { flexDirection: 'row', borderRadius: 8, marginBottom: 6, paddingVertical: 10 },
  headerCell: { flex: 1, alignItems: 'center' },
  headerText: { fontSize: 13, fontWeight: '700' },
  dayCard: { borderWidth: 1, borderRadius: 10, padding: 10, marginBottom: 8 },
  dayHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  dayTitle: { fontSize: 13, fontWeight: '700' },
  dayCount: { fontSize: 11 },
  emptyText: { fontSize: 12 },
  eventList: { gap: 6 },
  eventItem: { borderLeftWidth: 3, paddingLeft: 8 },
  eventLabel: { fontSize: 12, fontWeight: '700' },
  eventMeta: { fontSize: 10 },
});

function ViewSwitcher({ current, onChange, isDark }: { current: ViewType; onChange: (v: ViewType) => void; isDark: boolean }) {
  const [visible, setVisible] = useState(false);
  const [pos, setPos] = useState({ top: 0, right: 0 });
  const btnRef = useRef<View>(null);
  const open = () => { btnRef.current?.measureInWindow((x, y, w, h) => { setPos({ top: y + h + 6, right: width - x - w }); setVisible(true); }); };
  const select = (v: ViewType) => { onChange(v); setVisible(false); };
  return (
    <>
      <TouchableOpacity ref={btnRef} onPress={open} style={[vs.trigger, { backgroundColor: isDark ? '#1e2a3a' : '#f1f5f9' }]}>
        <Text style={vs.icon}>📆</Text>
      </TouchableOpacity>
      <Modal transparent visible={visible} animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={StyleSheet.absoluteFill} activeOpacity={1} onPress={() => setVisible(false)} />
        <View style={[vs.menu, { top: pos.top, right: pos.right, backgroundColor: isDark ? '#1e2a3a' : '#ffffff', borderColor: isDark ? '#2d3f55' : '#e2e8f0' }]}>
          {(['Year','Month','Week'] as ViewType[]).map(v => (
            <TouchableOpacity key={v} style={[vs.item, { borderBottomColor: isDark ? '#2d3f55' : '#f1f5f9' }, current === v && { backgroundColor: isDark ? '#2d3f55' : '#eff6ff' }]} onPress={() => select(v)}>
              <Text style={[vs.itemText, { color: isDark ? '#64748b' : '#64748b' }, current === v && { color: isDark ? '#ffffff' : '#1e293b', fontWeight: '700' }]}>{v} View</Text>
              {current === v && <Text style={vs.checkmark}>✓</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </Modal>
    </>
  );
}
const vs = StyleSheet.create({
  trigger: { borderRadius: 8, padding: 8, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 20 },
  menu: { position: 'absolute', borderRadius: 10, overflow: 'hidden', borderWidth: 1, minWidth: 130, elevation: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.5, shadowRadius: 8 },
  item: { paddingVertical: 13, paddingHorizontal: 18, borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  itemText: { fontSize: 14 },
  checkmark: { color: '#3b82f6', fontSize: 14, fontWeight: '700' },
});
// main
export default function CalendarScreen() {
  const { isDark } = useTheme();
  const today = new Date();

  const [view, setView]           = useState<ViewType>('Month');
  const [year, setYear]           = useState(today.getFullYear());
  const [month, setMonth]         = useState(today.getMonth());
  const [search, setSearch]       = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedDate, setSelectedDate]         = useState<number | null>(null);
  const [focusedEventIndex, setFocusedEventIndex] = useState<number | null>(null);
  const [eventsByDate, setEventsByDate] = useState<Record<string, CalEvent[]>>(DEFAULT_EVENTS);


  // Helper to normalize strings for robust comparison
  function normalize(str?: string) {
    return (str || '').trim().toLowerCase().replace(/\s+/g, '');
  }

  const loadSchedules = useCallback(async (searchText?: string) => {
    try {
      const [schedules, student] = await Promise.all([
        getSchedules(searchText),
        getCurrentUser(),
      ]);
      if (!student) {
        setEventsByDate(DEFAULT_EVENTS);
        return;
      }
      const filteredSchedules = schedules.filter(schedule => {
        return (
          normalize(schedule.department) === normalize(student.department) &&
          normalize(schedule.course) === normalize(student.course) &&
          normalize(schedule.yearLevel) === normalize(student.yearLevel) &&
          (
            normalize(schedule.block) === normalize(student.block) ||
            normalize(schedule.tag) === normalize(`${student.course} ${student.block}`)
          )
        );
      });
      setEventsByDate(transformBackendSchedules(filteredSchedules));
    } catch (error) {
      console.error('Failed to load schedules:', error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setSearch('');
      setShowDropdown(false);
      void loadSchedules();
      return undefined;
    }, [loadSchedules])
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadSchedules(search);
    }, 250);

    return () => clearTimeout(timer);
  }, [search, loadSchedules]);

  const searchIndex = useMemo(() => buildSearchIndex(eventsByDate), [eventsByDate]);

  const searchResults = useMemo<SearchResult[]>(() => {
    const q = search.trim();
    if (!q) return [];
    return searchIndex;
  }, [search, searchIndex]);

  const handleSearchChange = (text: string) => {
    setSearch(text);
    setShowDropdown(text.trim().length > 0);
  };

  const handleSelectResult = (r: SearchResult) => {
    setShowDropdown(false);
    setSearch('');
    setView('Month');
    setYear(r.year);
    setMonth(r.month);
    setSelectedDate(r.day);
    setFocusedEventIndex(r.eventIndex);
  };

  const handlePressYearDate = (targetYear: number, targetMonth: number, targetDay: number) => {
    setView('Month');
    setYear(targetYear);
    setMonth(targetMonth);
    setSelectedDate(targetDay);
    setFocusedEventIndex(null);
  };

  const screenBg      = isDark ? '#0f172a' : '#f0f4f8';
  const headerBg      = isDark ? '#131d2a' : '#ffffff';
  const headerBorder  = isDark ? '#1e2a3a' : '#e2e8f0';
  const titleColor    = isDark ? '#ffffff' : '#0f172a';
  const subtitleColor = isDark ? '#4a5878' : '#94a3b8';
  const searchBg      = isDark ? '#1e2a3a' : '#f1f5f9';
  const searchBorder  = isDark ? '#2d3f55' : '#e2e8f0';
  const searchColor   = isDark ? '#e2e8f0' : '#1e293b';
  const searchPh      = isDark ? '#4a5878' : '#94a3b8';

  const handleSelectDate = (date: number, eventIndex: number | null) => {
    setSelectedDate(date); setFocusedEventIndex(eventIndex);
  };
  const handlePrev = () => {
    setSelectedDate(null);
    if (month === 0) { setMonth(11); setYear(y => y - 1); } else setMonth(m => m - 1);
  };
  const handleNext = () => {
    setSelectedDate(null);
    if (month === 11) { setMonth(0); setYear(y => y + 1); } else setMonth(m => m + 1);
  };

  const selectedDateEvents = selectedDate ? (eventsByDate[dateKey(year, month, selectedDate)] || []) : [];

  return (
    <View style={[s.screen, { backgroundColor: screenBg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={headerBg} />

      <View style={[s.header, { backgroundColor: headerBg, borderBottomColor: headerBorder }]}>
        <View>
          <Text style={[s.title, { color: titleColor }]}>Schedify</Text>
          <Text style={[s.subtitle, { color: subtitleColor }]}>{MONTHS[month]} {year}</Text>
        </View>
        <View style={s.headerRight}>
          <View style={[s.searchBar, { backgroundColor: searchBg, borderColor: showDropdown ? '#3b82f6' : searchBorder }]}>
            <Text style={s.searchIcon}>🔍</Text>
            <TextInput
              style={[s.searchInput, { color: searchColor }]}
              value={search}
              onChangeText={handleSearchChange}
              placeholder="Search events…"
              placeholderTextColor={searchPh}
              returnKeyType="search"
              onFocus={() => { if (search.trim()) setShowDropdown(true); }}
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => { setSearch(''); setShowDropdown(false); }} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <Text style={[s.clearBtn, { color: searchPh }]}>✕</Text>
              </TouchableOpacity>
            )}
          </View>
          <ViewSwitcher current={view} onChange={setView} isDark={isDark} />
        </View>
      </View>

      {showDropdown && (
        <SearchDropdown
          results={searchResults}
          isDark={isDark}
          onSelect={handleSelectResult}
          onClose={() => { setShowDropdown(false); setSearch(''); }}
        />
      )}

      <View style={[s.content, { backgroundColor: screenBg }]}>
        {view === 'Month' && (
          <MonthView year={year} month={month} onPrev={handlePrev} onNext={handleNext}
            onSelectDate={handleSelectDate} isDark={isDark} eventsByDate={eventsByDate} />
        )}
        {view === 'Year'  && (
          <YearView
            year={year}
            isDark={isDark}
            eventsByDate={eventsByDate}
            onPressDate={handlePressYearDate}
          />
        )}
        {view === 'Week'  && (
          <WeekView
            isDark={isDark}
            year={year}
            month={month}
            selectedDate={selectedDate}
            eventsByDate={eventsByDate}
          />
        )}
      </View>

      {view === 'Month' && (
        <EventDetailPanel
          selectedDate={selectedDate} focusedIndex={focusedEventIndex}
          events={selectedDateEvents} year={year} month={month}
          onClearFocus={() => setFocusedEventIndex(null)} isDark={isDark}
        />
      )}

      <BottomNav role="student" active="calendar" />
    </View>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 52, paddingBottom: 14, borderBottomWidth: 1 },
  title: { fontSize: 22, fontWeight: '800', letterSpacing: 0.5 },
  subtitle: { fontSize: 11, fontWeight: '500', marginTop: 1 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBar: { flexDirection: 'row', alignItems: 'center', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6, gap: 4, borderWidth: 1 },
  searchIcon: { fontSize: 12 },
  searchInput: { fontSize: 13, width: 90, paddingVertical: 0 },
  clearBtn: { fontSize: 12, paddingLeft: 4 },
  content: { flex: 1, paddingHorizontal: 12, paddingTop: 4 },
});
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList, StyleSheet } from 'react-native';

interface Option {
  label: string;
  value: string;
}

interface CustomDropdownProps {
  options: Option[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  dark?: boolean;
}

const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  disabled = false,
  dark = false,
}) => {
  const [visible, setVisible] = useState(false);
  const selected = options.find(o => o.value === value);
  const bg = dark ? '#232b36' : '#fff';
  const txt = dark ? '#fff' : '#232b36';
  const border = dark ? '#3b4252' : '#cbd5e1';
  return (
    <>
      <TouchableOpacity
        style={[styles.input, { backgroundColor: bg, borderColor: border }, disabled && styles.disabled]}
        onPress={() => !disabled && setVisible(true)}
        activeOpacity={0.7}
        disabled={disabled}
      >
        <Text style={{ color: selected ? txt : '#8a9bb0' }}>
          {selected ? selected.label : placeholder}
        </Text>
      </TouchableOpacity>
      <Modal visible={visible} transparent animationType="fade" onRequestClose={() => setVisible(false)}>
        <TouchableOpacity style={styles.overlay} activeOpacity={1} onPress={() => setVisible(false)} />
        <View style={[styles.dropdown, { backgroundColor: bg, borderColor: border }]}> 
          <FlatList
            data={options}
            keyExtractor={o => o.value}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.option}
                onPress={() => { onChange(item.value); setVisible(false); }}
              >
                <Text style={{ color: txt }}>{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    borderRadius: 8,
    borderWidth: 1,
    paddingVertical: 12,
    paddingHorizontal: 14,
    minHeight: 44,
    justifyContent: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  dropdown: {
    position: 'absolute',
    left: 32,
    right: 32,
    top: '40%',
    borderRadius: 10,
    borderWidth: 1,
    maxHeight: 260,
    zIndex: 1000,
    elevation: 20,
    paddingVertical: 6,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 18,
  },
});

export default CustomDropdown;

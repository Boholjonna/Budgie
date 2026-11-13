import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/colors';
import { CATEGORIES, CategoryKey, Category } from '../constants/categories';
import { useAppStorage } from '../hooks/StorageContext';

interface Props {
  selected:  CategoryKey | string;
  onChange:  (key: CategoryKey | string) => void;
}

// Emoji picker - simple predefined list
const EMOJI_OPTIONS = ['🎯', '💰', '🎨', '🏠', '⚡', '🌟', '🎵', '📱', '💼', '🎁', '🌈', '🔥', '✈️', '☕', '🎬', '📖'];
const COLOR_OPTIONS = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#F7B731', '#A29BFE', '#FD79A8', '#B2BEC3', '#00D2D3', '#FF6348', '#5F27CD'];

export default function CategoryPicker({ selected, onChange }: Props) {
  const { customCategories, addCategory } = useAppStorage();
  const [modalOpen, setModalOpen] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [selectedEmoji, setSelectedEmoji] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#FF6B6B');

  const allCategories = [...CATEGORIES, ...customCategories];

  const handleAddCategory = async () => {
    if (!newLabel.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    try {
      const newCat = await addCategory({
        label: newLabel.trim(),
        emoji: selectedEmoji,
        color: selectedColor,
      });
      onChange(newCat.key);
      setModalOpen(false);
      setNewLabel('');
      setSelectedEmoji('🎯');
      setSelectedColor('#FF6B6B');
    } catch (error) {
      Alert.alert('Error', 'Failed to add category');
    }
  };

  return (
    <>
      <View style={styles.grid}>
        {allCategories.map((cat) => {
          const isSelected = cat.key === selected;
          return (
            <TouchableOpacity
              key={cat.key}
              style={[styles.chip, isSelected && styles.chipSelected]}
              onPress={() => onChange(cat.key)}
              activeOpacity={0.7}
            >
              <Text style={styles.emoji}>{cat.emoji}</Text>
              <Text style={[styles.label, isSelected && styles.labelSelected]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          );
        })}
        
        {/* Add New Button */}
        <TouchableOpacity
          style={styles.addChip}
          onPress={() => setModalOpen(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add-circle" size={24} color={Colors.primary} />
          <Text style={styles.addLabel}>Add New</Text>
        </TouchableOpacity>
      </View>

      {/* Add Category Modal */}
      <Modal
        visible={modalOpen}
        transparent
        animationType="slide"
        onRequestClose={() => setModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>New Category</Text>
              <TouchableOpacity onPress={() => setModalOpen(false)}>
                <Ionicons name="close" size={24} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              {/* Category Name */}
              <Text style={styles.inputLabel}>Category Name</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Entertainment"
                placeholderTextColor={Colors.muted}
                value={newLabel}
                onChangeText={setNewLabel}
                maxLength={15}
              />

              {/* Emoji Picker */}
              <Text style={styles.inputLabel}>Select Emoji</Text>
              <View style={styles.emojiGrid}>
                {EMOJI_OPTIONS.map((emoji) => (
                  <TouchableOpacity
                    key={emoji}
                    style={[
                      styles.emojiOption,
                      selectedEmoji === emoji && styles.emojiSelected,
                    ]}
                    onPress={() => setSelectedEmoji(emoji)}
                  >
                    <Text style={styles.emojiText}>{emoji}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Color Picker */}
              <Text style={styles.inputLabel}>Select Color</Text>
              <View style={styles.colorGrid}>
                {COLOR_OPTIONS.map((color) => (
                  <TouchableOpacity
                    key={color}
                    style={[
                      styles.colorOption,
                      { backgroundColor: color },
                      selectedColor === color && styles.colorSelected,
                    ]}
                    onPress={() => setSelectedColor(color)}
                  />
                ))}
              </View>

              {/* Buttons */}
              <View style={styles.modalButtons}>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.cancelBtn]}
                  onPress={() => setModalOpen(false)}
                >
                  <Text style={styles.cancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalBtn, styles.addBtn]}
                  onPress={handleAddCategory}
                >
                  <Text style={styles.addBtnText}>Add Category</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  grid: {
    flexDirection:  'row',
    flexWrap:       'wrap',
    gap:            8,
  },
  chip: {
    width:           '22%',
    flexGrow:        1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 10,
    borderRadius:    10,
    borderWidth:     2,
    borderColor:     Colors.border,
    backgroundColor: Colors.surface,
    gap:             4,
  },
  chipSelected: {
    borderColor:     Colors.primary,
    backgroundColor: Colors.primary + '14',
  },
  emoji: { fontSize: 20 },
  label: {
    fontSize:   10,
    fontWeight: '600',
    color:      Colors.muted,
    textAlign:  'center',
  },
  labelSelected: {
    color: Colors.primary,
  },
  addChip: {
    width:           '22%',
    flexGrow:        1,
    alignItems:      'center',
    justifyContent:  'center',
    paddingVertical: 10,
    borderRadius:    10,
    borderWidth:     2,
    borderColor:     Colors.primary,
    borderStyle:     'dashed',
    backgroundColor: Colors.primaryLight,
    gap:             4,
  },
  addLabel: {
    fontSize:   10,
    fontWeight: '700',
    color:      Colors.primary,
    textAlign:  'center',
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: Colors.text,
  },
  modalBody: {
    padding: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: Colors.bg,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emojiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  emojiOption: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.bg,
  },
  emojiSelected: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryLight,
  },
  emojiText: {
    fontSize: 24,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  colorOption: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 3,
    borderColor: 'transparent',
  },
  colorSelected: {
    borderColor: Colors.text,
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelBtn: {
    backgroundColor: Colors.bg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  addBtn: {
    backgroundColor: Colors.primary,
  },
  addBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
});

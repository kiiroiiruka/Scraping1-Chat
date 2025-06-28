// group/components/ColorPicker.js
import React, { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import WheelColorPicker from 'react-native-wheel-color-picker';

export default function ColorPicker({ initialColor, onSelect, onCancel }) {
  const [selectedColor, setSelectedColor] = useState(initialColor);

  useEffect(() => {
    setSelectedColor(initialColor);
  }, [initialColor]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>色を選択</Text>
      <WheelColorPicker
        color={selectedColor}
        onColorChange={(color) => setSelectedColor(color)}
        thumbStyle={styles.thumb}
        sliderSize={20}
        swatches={false}
      />
      <View style={[styles.preview, { backgroundColor: selectedColor }]} />
      <View style={styles.buttonRow}>
        <Button title="決定" onPress={() => onSelect(selectedColor)} />
        <Button title="キャンセル" onPress={onCancel} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 16,
  },
  title: {
    fontSize: 16,
    marginBottom: 12,
  },
  thumb: {
    height: 30,
    width: 30,
    borderRadius: 15,
  },
  preview: {
    width: 100,
    height: 40,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: 8,
  },
});

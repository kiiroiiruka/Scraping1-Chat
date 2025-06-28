// group/StampPicker.js
import React from 'react';
import {
  Modal,
  View,
  FlatList,
  TouchableOpacity,
  Image,
  StyleSheet,
  Text,
} from 'react-native';

export default function StampPicker({ visible, stamps, onSelect, onClose }) {
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>スタンプを選択</Text>
          <FlatList
            data={stamps}
            keyExtractor={(item) => item.id}
            numColumns={4}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.stampWrapper}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Image source={{ uri: item.url }} style={styles.stamp} />
              </TouchableOpacity>
            )}
          />
          <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
            <Text style={styles.closeText}>閉じる</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: 320,
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
  },
  stampWrapper: {
    flex: 1 / 4,
    padding: 8,
  },
  stamp: {
    width: '100%',
    aspectRatio: 1,
  },
  closeBtn: {
    marginTop: 12,
    alignSelf: 'center',
  },
  closeText: {
    fontSize: 14,
    color: '#007AFF',
  },
});

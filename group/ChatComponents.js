import React from 'react';
import { View, Text, FlatList, Image, StyleSheet } from 'react-native';
import Slider from '@react-native-community/slider';
import { Button } from 'react-native';

// 日付ヘッダーコンポーネント
export function DateHeader({ date }) {
  const today = new Date();
  const label = (date.getFullYear() === today.getFullYear() && date.getMonth() === today.getMonth() && date.getDate() === today.getDate())
    ? '今日'
    : `${date.getMonth() + 1}/${date.getDate()}`;
  return (
    <View style={styles.headerDateRow}>
      <Text style={styles.headerDateText}>{label}</Text>
    </View>
  );
}

// メッセージアイテムコンポーネント
export function MessageItem({ item, isMe, textColor }) {
  const time = item.timestamp?.toDate?.().toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' }) || '';
  return (
    <View style={styles.messageRow}>
      <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
        <Text style={[styles.sender, { textAlign: isMe ? 'right' : 'left' }]}>{item.senderName}</Text>
        {item.image
          ? <Image source={{ uri: item.image }} style={styles.stampImage} />
          : <Text style={[styles.message, { color: item.color || textColor, textAlign: isMe ? 'right' : 'left' }]}>{item.text}</Text>
        }
        <Text style={[styles.timestamp, { textAlign: isMe ? 'right' : 'left' }]}>{time}</Text>
      </View>
    </View>
  );
}

// メッセージリストコンポーネント
export function MessageList({ messages, uid, textColor }) {
  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return <DateHeader date={item.date} />;
    }
    const isMe = item.senderId === uid;
    return <MessageItem item={item} isMe={isMe} textColor={textColor} />;
  };

  return (
    <FlatList
      data={messages}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={styles.listContainer}
    />
  );
}

// カラーピッカーモーダル
export function ColorPickerModal({ visible, r, g, b, onChangeR, onChangeG, onChangeB, onClose }) {
  const hex = `#${[r, g, b].map(x => x.toString(16).padStart(2,'0')).join('')}`;
  return (
    <View style={[styles.modalBg, { display: visible ? 'flex' : 'none' }]}>
      <View style={styles.modalContent}>
        <Text>色を選択してください</Text>
        <Text>R: {r}</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={r} onValueChange={onChangeR} />
        <Text>G: {g}</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={g} onValueChange={onChangeG} />
        <Text>B: {b}</Text>
        <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={b} onValueChange={onChangeB} />
        <View style={[styles.preview, { backgroundColor: hex }]} />
        <Button title='決定' onPress={onClose} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: { padding: 12 },
  headerDateRow: { alignItems: 'center', paddingVertical: 4 },
  headerDateText: { fontSize: 12, color: 'gray' },
  messageRow: { marginBottom: 12 },
  sender: { fontWeight: 'bold', fontSize: 14 },
  message: { fontSize: 16, marginTop: 4 },
  timestamp: { fontSize: 10, color: 'gray', marginTop: 2 },
  stampImage: { width: 80, height: 80, marginVertical: 4 },
  modalBg: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 16, borderRadius: 8, width: 320, alignItems: 'center' },
  slider: { width: 250, height: 40, marginVertical: 4 },
  preview: { width: 100, height: 40, borderWidth: 1, borderColor: '#ccc', marginVertical: 8 },
});

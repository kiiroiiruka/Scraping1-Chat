// group/ChatScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Share,
  Modal,
  Image,
} from 'react-native';
import Slider from '@react-native-community/slider';
import { getFirestore, collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { sendMessage } from './chatService';
import { app } from './firebaseConfig';
import StampPicker from './StampPicker';

export default function ChatScreen({ route, navigation }) {
  const { groupId, uid, displayName, fromCreate = false } = route.params;
  const db = getFirestore(app);

  // メッセージ関連
  const [message, setMessage] = useState('');
  const [messageItems, setMessageItems] = useState([]);

  // テキストカラー選択関連
  const [r, setR] = useState(0);
  const [g, setG] = useState(0);
  const [b, setB] = useState(0);
  const [textColor, setTextColor] = useState('#000000');
  const [colorModalVisible, setColorModalVisible] = useState(false);

  // スタンプ関連
  const [stamps, setStamps] = useState([]);
  const [pickerVisible, setPickerVisible] = useState(false);

  // メッセージをリアルタイム購読
  useEffect(() => {
    const q = query(
      collection(db, 'groups', groupId, 'messages'),
      orderBy('timestamp', 'asc')
    );
    const unsubscribe = onSnapshot(q, snap => {
      const raw = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const items = [];
      let lastDate = null;
      raw.forEach(msg => {
        const d = msg.timestamp?.toDate();
        const dateStr = d?.toDateString();
        if (dateStr && dateStr !== lastDate) {
          items.push({ type: 'header', id: 'h-' + dateStr, date: d });
          lastDate = dateStr;
        }
        items.push({ type: 'message', ...msg });
      });
      setMessageItems(items);
    });
    return () => unsubscribe();
  }, [db, groupId]);

  // スタンプ一覧をリアルタイム購読
  useEffect(() => {
    const q = query(
      collection(db, 'groups', groupId, 'stamps'),
      orderBy('createdAt', 'asc')
    );
    const unsubscribe = onSnapshot(q, snap => {
      const list = snap.docs.map(doc => ({
        id: doc.id,
        url: doc.data().url,
      }));
      setStamps(list);
    });
    return () => unsubscribe();
  }, [db, groupId]);

  // カラープレビュー更新
  useEffect(() => {
    setTextColor(rgbToHex(r, g, b));
  }, [r, g, b]);

  // RGB → HEX
  const rgbToHex = (r, g, b) => {
    const toHex = x => {
      const h = x.toString(16);
      return h.length === 1 ? '0' + h : h;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  };

  // 今日判定つき日付ヘッダー
  const formatDateHeader = dateObj => {
    const today = new Date();
    if (
      dateObj.getFullYear() === today.getFullYear() &&
      dateObj.getMonth() === today.getMonth() &&
      dateObj.getDate() === today.getDate()
    ) {
      return '今日';
    }
    return `${dateObj.getMonth() + 1}/${dateObj.getDate()}`;
  };

  // テキストメッセージ送信
  const onSend = async () => {
    if (!message.trim()) return;
    await sendMessage(groupId, uid, displayName, message.trim(), textColor, null);
    setMessage('');
  };

  // スタンプ選択時の送信
  const onSelectStamp = async (stamp) => {
  try {
    // 第1～3引数：groupId, uid, displayName
    // 第4引数 text は空文字、第5引数 color は null
    // 第6引数 image にスタンプの URL を渡す
    await sendMessage(groupId, uid, displayName, '', null, stamp.url);
  } catch (error) {
    console.error('スタンプ送信エラー:', error);
  }
};

  // グループコード共有
  const shareCode = async () => {
    try {
      await Share.share({ message: `グループコード: ${groupId}` });
    } catch (e) {
      console.error(e);
    }
  };

  // メッセージ／スタンプのレンダリング
  const renderItem = ({ item }) => {
    if (item.type === 'header') {
      return (
        <View style={styles.headerDateRow}>
          <Text style={styles.headerDateText}>{formatDateHeader(item.date)}</Text>
        </View>
      );
    }
    const isMe = item.senderId === uid;
    const time = item.timestamp
      ?.toDate()
      .toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' });

    return (
      <View style={styles.messageRow}>
        <View style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
          <Text style={[styles.sender, { textAlign: isMe ? 'right' : 'left' }]}>
            {item.senderName}
          </Text>
          {item.image ? (
            <Image source={{ uri: item.image }} style={styles.stampMessage} />
          ) : (
            <Text
              style={[
                styles.message,
                { color: item.color || '#000', textAlign: isMe ? 'right' : 'left' },
              ]}
            >
              {item.text}
            </Text>
          )}
          <Text style={[styles.timestamp, { textAlign: isMe ? 'right' : 'left' }]}>{time}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={80}
    >
      {/* ヘッダー */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={shareCode}>
          <Text style={styles.menu}>・・・</Text>
        </TouchableOpacity>
        {fromCreate && <Button title="ホームに戻る" onPress={() => navigation.popToTop()} />}
        <Button
          title="＋スタンプ追加"
          onPress={() => navigation.navigate('StampUpload', { groupId })}
        />
      </View>

      {/* メッセージリスト */}
      <FlatList
        data={messageItems}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 12 }}
      />

      {/* 入力欄 */}
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.input, { color: textColor }]}
          placeholder="メッセージを入力"
          value={message}
          onChangeText={setMessage}
        />
        <Button title="スタンプ" onPress={() => setPickerVisible(true)} />
        <Button title="色" onPress={() => setColorModalVisible(true)} />
        <Button title="送信" onPress={onSend} />
      </View>

      {/* カラーピッカー */}
      <Modal visible={colorModalVisible} transparent animationType="slide">
        <View style={styles.modalBg}>
          <View style={styles.modalContent}>
            <Text>色を選択してください</Text>
            <Text>R: {r}</Text>
            <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={r} onValueChange={setR} />
            <Text>G: {g}</Text>
            <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={g} onValueChange={setG} />
            <Text>B: {b}</Text>
            <Slider style={styles.slider} minimumValue={0} maximumValue={255} step={1} value={b} onValueChange={setB} />
            <View style={[styles.preview, { backgroundColor: textColor }]} />
            <Button title="決定" onPress={() => setColorModalVisible(false)} />
          </View>
        </View>
      </Modal>

      {/* スタンプピッカー */}
      <StampPicker
        visible={pickerVisible}
        stamps={stamps}
        onSelect={onSelectStamp}
        onClose={() => setPickerVisible(false)}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, backgroundColor: '#fff' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', padding: 8, borderBottomWidth: 1, borderColor: '#ccc' },
  menu: { fontSize: 24 },
  headerDateRow: { alignItems: 'center', paddingVertical: 4 },
  headerDateText: { fontSize: 12, color: 'gray' },
  messageRow: { marginBottom: 12 },
  sender: { fontWeight: 'bold', fontSize: 14 },
  message: { fontSize: 16, marginTop: 4 },
  timestamp: { fontSize: 10, color: 'gray', marginTop: 2 },
  stampMessage: { width: 120, height: 120, resizeMode: 'contain', marginTop: 4 },
  inputRow: { flexDirection: 'row', padding: 8, borderTopWidth: 1, borderColor: '#ccc' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 4, padding: 8, marginRight: 8 },
  modalBg: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: 'white', padding: 16, borderRadius: 8, width: 320, alignItems: 'center' },
  slider: { width: 250, height: 40, marginVertical: 4 },
  preview: { width: 100, height: 40, borderWidth: 1, borderColor: '#ccc', marginVertical: 8 },
});

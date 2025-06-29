// group/HomeScreen.js
import React, { useState, useEffect, useContext } from 'react';
import { View, Button, StyleSheet, Image, ActivityIndicator, Text } from 'react-native';
import { getFirestore, doc, onSnapshot } from 'firebase/firestore';
import { app } from './firebaseConfig';

export default function HomeScreen({ navigation, route }) {
  const { uid, displayName } = route.params;
  const [iconUrl, setIconUrl] = useState(null);
  const [loading, setLoading] = useState(true);


  const db = getFirestore(app);

  useEffect(() => {
    const userRef = doc(db, 'users', uid);
    const unsub = onSnapshot(
      userRef,
      snapshot => {
        if (snapshot.exists()) {
          setIconUrl(snapshot.data().iconUrl || null);
        }
        setLoading(false);
      },
      error => {
        console.log('アイコン購読エラー', error);
        setLoading(false);
      }
    );
    return () => unsub();
  }, [db, uid]);

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" />
      ) : iconUrl ? (
        <Image source={{ uri: iconUrl }} style={styles.icon} />
      ) : (
        <View style={[styles.icon, styles.placeholder]}>
          <Text style={styles.placeholderText}>{displayName.charAt(0)}</Text>
        </View>
      )}

      {/* ✅ Context から取得した値を表示 */}
      <Text style={styles.contextText}>ユーザーID:{displayName }</Text>

      <Button
        title="アイコン設定"
        onPress={() => navigation.navigate('IconUpload', { uid })}
      />
      <View style={styles.spacer} />
      <Button
        title="グループを作成"
        onPress={() => navigation.navigate('CreateGroup', { uid, displayName })}
      />
      <View style={styles.spacer} />
      <Button
        title="グループに参加"
        onPress={() => navigation.navigate('JoinGroup', { uid, displayName })}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
  },
  icon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#ccc',
  },
  placeholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: 32,
    color: '#666',
  },
  spacer: {
    height: 16,
  },
  contextText: {
    marginVertical: 12,
    fontSize: 16,
    color: '#333',
  },
});

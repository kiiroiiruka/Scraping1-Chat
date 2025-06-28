// group/StampUploadScreen.js

import React, { useState, useEffect } from 'react';
import {
  View,
  Button,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
  TouchableOpacity,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { app } from './firebaseConfig';

export default function StampUploadScreen({ route, navigation }) {
  const { groupId } = route.params;
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const db = getFirestore(app);

  // Cloudinary 設定 — ご自身の値に置き換えてください
  const CLOUD_NAME    = 'da4hhafsi';  
  const UPLOAD_PRESET = 'takiosan';

  // ギャラリー権限リクエスト
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('エラー', '写真ライブラリへのアクセスを許可してください');
      }
    })();
  }, []);

  // 画像を選択
const pickImage = async () => {
   try {
     const result = await ImagePicker.launchImageLibraryAsync({
       // ↓ 正しい定数に修正
       mediaTypes: ImagePicker.MediaTypeOptions.Images,
       quality: 0.8,
     });
     // SDK バージョンで cancelled / canceled が異なる場合があるので両方チェック
     const didCancel = result.cancelled ?? result.canceled ?? false;
     // assets があればそちらを、なければ旧 API の uri を参照
     const uri =
       result.assets?.[0]?.uri ??
       (result.uri ? result.uri : null);
     if (!didCancel && uri) {
       setImageUri(uri);
     }
   } catch (e) {
     console.error('pickImage error:', e);
     Alert.alert('エラー', '画像の選択に失敗しました');
   }
 };

  // Cloudinary へアップロード＆Firestore に保存
  const uploadStamp = async () => {
    if (!imageUri) {
      Alert.alert('エラー', '先に画像を選択してください');
      return;
    }
    setUploading(true);
    try {
      const data = new FormData();
      data.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: 'stamp.jpg',
      });
      data.append('upload_preset', UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
        { method: 'POST', body: data }
      );
      const json = await res.json();
      if (json.error || !json.secure_url) {
        const msg = json.error?.message ?? 'secure_url が取得できませんでした';
        Alert.alert('アップロードエラー', msg);
        throw new Error(msg);
      }

      // Firestore にスタンプ URL を追加
      await addDoc(
        collection(db, 'groups', groupId, 'stamps'),
        {
          url: json.secure_url,
          createdAt: serverTimestamp(),
        }
      );

      Alert.alert('完了', 'スタンプをアップロードしました');
      navigation.goBack();
    } catch (e) {
      console.error('Stamp upload error', e);
      Alert.alert('エラー', e.message || 'アップロードに失敗しました');
    } finally {
      setUploading(false);
    }
  };

  return (
    <View style={styles.container}>
      {imageUri ? (
        <Image source={{ uri: imageUri }} style={styles.preview} />
      ) : (
        <TouchableOpacity
          style={[styles.preview, styles.placeholder]}
          onPress={pickImage}
        >
          <Text>ここをタップしてスタンプ画像を選択</Text>
        </TouchableOpacity>
      )}

      <View style={styles.buttonRow}>
        <Button title="画像を選択" onPress={pickImage} />
        {uploading ? (
          <ActivityIndicator style={styles.loader} size="large" />
        ) : (
          <Button title="アップロード" onPress={uploadStamp} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  loader: {
    marginLeft: 16,
  },
});

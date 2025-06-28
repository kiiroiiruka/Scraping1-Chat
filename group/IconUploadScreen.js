// group/IconUploadScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Button,
  Image,
  StyleSheet,
  Alert,
  ActivityIndicator,
  Text,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { getFirestore, doc, updateDoc } from 'firebase/firestore';
import { app } from './firebaseConfig';

export default function IconUploadScreen({ route, navigation }) {
  const { uid } = route.params;
  const [imageUri, setImageUri] = useState(null);
  const [uploading, setUploading] = useState(false);

  const db = getFirestore(app);

  // Cloudinary 設定（ご自身のものに置き換えてください）
const CLOUD_NAME   = 'da4hhafsi';   // あなたの Cloudinary Cloud Name
const UPLOAD_PRESET = 'takiosan'; 

  // ギャラリー権限リクエスト
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('エラー', '写真ライブラリのアクセスを許可してください');
      }
    })();
  }, []);

  // 画像を選択
  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    const cancelled = result.canceled ?? result.cancelled;
    const assets = result.assets ?? (result.uri ? [{ uri: result.uri }] : []);
    if (!cancelled && assets.length > 0) {
      setImageUri(assets[0].uri);
    }
  };

  // Cloudinary にアップロード
const uploadToCloudinary = async () => {
  if (!imageUri) {
    Alert.alert('エラー', '先に画像を選択してください');
    return;
  }
  setUploading(true);
  try {
    // ローカル URI → Blob
    const data = new FormData();
     data.append('file', {
       uri: imageUri,
       type: 'image/jpeg',   // 必ず MIME タイプを指定
       name: 'upload.jpg',   // 任意のファイル名
     });
     data.append('upload_preset', UPLOAD_PRESET);

    // Cloudinary に POST
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/upload`,
      { method: 'POST', body: data }
    );

    // ↓ ② レスポンスを JSON にしてログ出力
    const json = await res.json();
    console.log('Cloudinary response:', json);

    // ↓ ③ エラーが返ってきたらアラート
    if (json.error) {
      Alert.alert('アップロードエラー', json.error.message);
      throw new Error(json.error.message);
    }

    // secure_url が無ければ例外
    if (!json.secure_url) {
      Alert.alert('アップロードエラー', 'secure_url が取得できませんでした');
      throw new Error('No secure_url');
    }

    // Firestore のユーザー情報に保存
    await updateDoc(doc(db, 'users', uid), { iconUrl: json.secure_url });

    Alert.alert('完了', 'アイコンを更新しました');
    navigation.goBack();
  } catch (e) {
    console.error('upload error', e);
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
        <View style={[styles.preview, styles.placeholder]}>
          <Text>ここをタップして画像を選択</Text>
        </View>
      )}

      <Button title="画像を選択" onPress={pickImage} />

      <View style={{ height: 16 }} />

      {uploading ? (
        <ActivityIndicator size="large" />
      ) : (
        <Button title="アップロード" onPress={uploadToCloudinary} />
      )}
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
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 1,
    borderColor: '#ccc',
    marginBottom: 24,
  },
  placeholder: {
    backgroundColor: '#eee',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

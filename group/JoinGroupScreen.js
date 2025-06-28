// group/JoinGroupScreen.js
import React, { useState } from "react";
import { View, TextInput, Button, Alert, StyleSheet } from "react-native";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { app } from "./firebaseConfig";

const db = getFirestore(app);

export default function JoinGroupScreen({ navigation, route }) {
  const [groupId, setGroupId] = useState("");
  const { uid, displayName } = route.params;

  const onJoin = async () => {
    if (!groupId.trim()) {
      return Alert.alert("エラー", "グループIDを入力してください");
    }

    try {
      const groupRef = doc(db, "groups", groupId.trim());
      const snapshot = await getDoc(groupRef);

      if (!snapshot.exists()) {
        return Alert.alert("エラー", "指定されたグループは存在しません");
      }

      // 参加処理
      const memberRef = doc(db, "groups", groupId.trim(), "members", uid);
      await setDoc(memberRef, {
        displayName,
        joinedAt: serverTimestamp(),
      });

      Alert.alert("完了", "グループに参加しました");

      navigation.navigate("Chat", {
        groupId: groupId.trim(),
        uid,
        displayName,
      });

    } catch (e) {
      console.error("参加失敗", e);
      Alert.alert("エラー", "参加処理に失敗しました");
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="グループIDを入力"
        value={groupId}
        onChangeText={setGroupId}
        style={styles.input}
      />
      <Button title="グループに参加" onPress={onJoin} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 8,
    borderRadius: 4,
    marginBottom: 12,
  },
});

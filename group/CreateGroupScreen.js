import React, { useState } from "react";
import { View, TextInput, Button, Alert } from "react-native";
import { createGroup } from "./firestoreService";

export default function CreateGroupScreen({ navigation, route }) {
  const [groupName, setGroupName] = useState("");
  const { uid, displayName } = route.params;

  const onCreate = async () => {
  if (!groupName.trim()) {
    return Alert.alert("エラー", "グループ名を入力してください");
  }

  try {
    const groupId = await createGroup(groupName.trim(), uid, displayName);
    Alert.alert("完了", `グループを作成しました（ID: ${groupId}）`);
    navigation.navigate("Chat", { groupId, uid, displayName }); // ← チャット画面へ遷移
  } catch {
    Alert.alert("エラー", "グループ作成に失敗しました");
  }
};

  return (
    <View style={{ padding: 16 }}>
      <TextInput
        placeholder="グループ名を入力"
        value={groupName}
        onChangeText={setGroupName}
        style={{
          borderWidth: 1,
          borderColor: "#ccc",
          padding: 8,
          marginBottom: 16,
          borderRadius: 4,
        }}
      />
      <Button title="グループ作成" onPress={onCreate} />
    </View>
  );
} 

import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { signUp } from './firebaseConfig';  // firebaseConfigからインポート

export default function SignUpScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSignUp = async () => {
    try {
      setError('');  // エラーをリセット
      await signUp(email, password); // firebaseConfigのsignUp関数を呼び出し
      navigation.navigate('Login');
    } catch (error) {
      setError('サインアップに失敗しました。');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>新規登録</Text>
      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        placeholder="メールアドレス"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="パスワード"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <Text style={styles.buttonText}>新規登録</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>ログイン画面へ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f4f7fc',
    padding: 30,
  },
  header: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E2A47',
    marginBottom: 50,
  },
  input: {
    width: '100%',
    height: 55,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 20,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
    elevation: 1, // 少し影を付けて立体感を出す
  },
  button: {
    width: '100%',
    height: 55,
    backgroundColor: '#4CAF50',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    elevation: 3, // ボタンに影をつけて立体感を加える
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  link: {
    color: '#007BFF',
    fontSize: 16,
    textDecorationLine: 'underline',
    marginTop: 10,
  },
  error: {
    color: '#FF4040',
    fontSize: 14,
    marginBottom: 15,
    fontWeight: 'bold',
  },
});

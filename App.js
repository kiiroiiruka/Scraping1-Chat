import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './group/firebaseConfig'; // auth をインポート

import HomeScreen from './group/HomeScreen';
import IconUploadScreen from './group/IconUploadScreen';
import CreateGroupScreen from './group/CreateGroupScreen';
import JoinGroupScreen from './group/JoinGroupScreen';
import ChatScreen from './group/ChatScreen';
import LoginScreen from './group/LoginScreen';
import SignUpScreen from './group/SignUpScreen';
import StampUploadScreen from './group/StampUploadScreen';

const Stack = createStackNavigator();

export default function App() {
  const [user, setUser] = useState(null);  // ユーザー情報を保持する状態
  const [loading, setLoading] = useState(true);  // 初期ローディング状態

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.displayName || 'ユーザー',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe(); // クリーンアップ
  }, []);

  if (loading) return null; // ローディング中は何も表示しない

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Home' : 'Login'}>
        {/* ログインしている場合 */}
        {user ? (
          <>
            <Stack.Screen
              name="Home"
              component={HomeScreen}
              options={{ title: 'ホーム' }}
              initialParams={user}  // user オブジェクトを渡す
            />
            <Stack.Screen
              name="IconUpload"
              component={IconUploadScreen}
              options={{ title: 'アイコン設定' }}
              initialParams={user}
            />
            <Stack.Screen
              name="CreateGroup"
              component={CreateGroupScreen}
              initialParams={user}
            />
            <Stack.Screen
              name="JoinGroup"
              component={JoinGroupScreen}
              initialParams={user}
            />
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              initialParams={user}
            />
            <Stack.Screen
              name="StampUpload"
              component={StampUploadScreen}
              options={{ title: 'スタンプアップロード' }}
            />
          </>
        ) : (
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ title: 'ログイン' }}
            />
            <Stack.Screen
              name="SignUp"
              component={SignUpScreen}
              options={{ title: '新規登録' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

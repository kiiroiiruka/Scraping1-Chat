// App.jsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

import HomeScreen from './group/HomeScreen';
import IconUploadScreen from './group/IconUploadScreen';
import CreateGroupScreen from './group/CreateGroupScreen';
import JoinGroupScreen from './group/JoinGroupScreen';
import ChatScreen from './group/ChatScreen';
// 追加：StampUploadScreen をインポート
import StampUploadScreen from './group/StampUploadScreen';

const Stack = createStackNavigator();

export default function App() {
  const mockUser = { uid: 'user123', displayName: '太郎' };

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: 'ホーム' }}
          initialParams={mockUser}
        />
        <Stack.Screen
          name="IconUpload"
          component={IconUploadScreen}
          options={{ title: 'アイコン設定' }}
          initialParams={mockUser}
        />
        <Stack.Screen
          name="CreateGroup"
          component={CreateGroupScreen}
          initialParams={mockUser}
        />
        <Stack.Screen
          name="JoinGroup"
          component={JoinGroupScreen}
          initialParams={mockUser}
        />
        <Stack.Screen
          name="Chat"
          component={ChatScreen}
          initialParams={mockUser}
        />
        {/* ここに StampUploadScreen を追加 */}
        <Stack.Screen
          name="StampUpload"
          component={StampUploadScreen}
          options={{ title: 'スタンプアップロード' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

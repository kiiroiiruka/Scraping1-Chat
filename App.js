import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './group/firebaseConfig';
import HomeScreen from './group/HomeScreen';
import IconUploadScreen from './group/IconUploadScreen';
import CreateGroupScreen from './group/CreateGroupScreen';
import JoinGroupScreen from './group/JoinGroupScreen';
import ChatScreen from './group/ChatScreen';
import LoginScreen from './group/LoginScreen';
import SignUpScreen from './group/SignUpScreen';
import StampUploadScreen from './group/StampUploadScreen';

const Stack = createStackNavigator();

// 内部コンポーネントに分けると useContext を安全に使用できます
function AppContent() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser({
          uid: currentUser.uid,
          displayName: currentUser.email|| 'ユーザー',
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  if (loading) return null; // ローディング中は何も表示しない

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={user ? 'Home' : 'Login'}>
        {user ? (
          <>
            <Stack.Screen name="Home" component={HomeScreen} initialParams={user} />
            <Stack.Screen name="IconUpload" component={IconUploadScreen} initialParams={user} />
            <Stack.Screen name="CreateGroup" component={CreateGroupScreen} initialParams={user} />
            <Stack.Screen name="JoinGroup" component={JoinGroupScreen} initialParams={user} />
            <Stack.Screen name="Chat" component={ChatScreen} initialParams={user} />
            <Stack.Screen name="StampUpload" component={StampUploadScreen} />
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// 最終的な App のエクスポート
export default function App() {
  return <AppContent />;
}

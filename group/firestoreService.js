// firestoreService.js
import { app } from "./firebaseConfig";
import {
  getFirestore,
  collection,
  setDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc
} from "firebase/firestore";

import { generateShortId } from "./utils/generateShortId"; // ←追加！

const db = getFirestore(app);

export async function createGroup(groupName, uid, displayName) {
  let groupId;
  let exists = true;

  // 重複チェック付きでユニークな短いIDを生成
  while (exists) {
    groupId = generateShortId();
    const docRef = doc(db, "groups", groupId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      exists = false;
    }
  }

  const groupRef = doc(db, "groups", groupId);
  await setDoc(groupRef, {
    groupName,
    ownerId: uid,
    createdAt: serverTimestamp(),
    members: {
      [uid]: {
        displayName,
        joinedAt: serverTimestamp(),
      },
    },
  });

  // ユーザーの所属グループとしても記録
  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    [`joinedGroups.${groupId}`]: true,
  }).catch(async () => {
    await setDoc(userRef, {
      joinedGroups: {
        [groupId]: true,
      },
    });
  });

  return groupId;
}

export async function joinGroup(groupId, uid, displayName) {
  const groupRef = doc(db, "groups", groupId);
  const groupSnap = await getDoc(groupRef);
  if (!groupSnap.exists()) throw new Error("グループが存在しません");

  await updateDoc(groupRef, {
    [`members.${uid}`]: {
      displayName,
      joinedAt: serverTimestamp(),
    },
  });

  const userRef = doc(db, "users", uid);
  await updateDoc(userRef, {
    [`joinedGroups.${groupId}`]: true,
  }).catch(async () => {
    await setDoc(userRef, {
      joinedGroups: {
        [groupId]: true,
      },
    });
  });
}

export async function getUserGroups(uid) {
  const userRef = doc(db, "users", uid);
  const snap = await getDoc(userRef);
  if (!snap.exists()) return [];
  const data = snap.data();
  return Object.keys(data.joinedGroups || {});
}

export async function updateDisplayName(userId, newDisplayName) {
  if (!userId || !newDisplayName) {
    throw new Error('userIdとnewDisplayNameは必須です');
  }

  try {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      displayName: newDisplayName
    });
    console.log('displayName 更新成功');
  } catch (error) {
    console.error('displayName の更新に失敗:', error);
    throw error;
  }
}

export async function getDisplayName(userId) {
  if (!userId) {
    throw new Error('userId は必須です');
  }

  try {
    const userRef = doc(db, 'users', userId);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      const data = userSnap.data();
      return data.displayName || null;
    } else {
      console.warn('ユーザーが見つかりません');
      return null;
    }
  } catch (error) {
    console.error('displayName の取得に失敗:', error);
    throw error;
  }
}

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


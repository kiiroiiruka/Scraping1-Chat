// group/chatService.js

import { app } from "./firebaseConfig";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp
} from "firebase/firestore";

const db = getFirestore(app);

/**
 * チャットメッセージ／スタンプを送信する
 * @param {string} groupId      - グループID
 * @param {string} uid          - 送信者のUID
 * @param {string} displayName  - 送信者の表示名
 * @param {string} [text]       - メッセージ内容（スタンプ送信時は空文字 or null 可）
 * @param {string|null} [color] - テキストの色（スタンプ送信時は null）
 * @param {string|null} [image] - 画像（スタンプ）URL（スタンプ送信時に指定）
 */
export async function sendMessage(
  groupId,
  uid,
  displayName,
  text = "",
  color = null,
  image = null
) {
  try {
    // 空のテキスト＆画像なしは何もしない
    if (!image && !text.trim()) return;

    // 共通ペイロード
    const payload = {
      senderId: uid,
      senderName: displayName,
      timestamp: serverTimestamp(),
    };

    if (image) {
      // スタンプ／画像メッセージの場合
      payload.image = image;
    } else {
      // テキストメッセージの場合
      payload.text = text.trim();
      payload.color = color || "#000000";
    }

    await addDoc(
      collection(db, "groups", groupId, "messages"),
      payload
    );
    console.log("メッセージ送信成功", payload);
  } catch (error) {
    console.error("メッセージ送信失敗: ", error);
    throw error;
  }
}

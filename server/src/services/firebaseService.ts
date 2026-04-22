import * as admin from 'firebase-admin';
import * as path from 'path';
import * as fs from 'fs';

// Firebase Admin SDK 初期化（キーファイルが存在する場合のみ）
const serviceAccountPath = path.join(__dirname, '../../firebase-key.json');

if (!admin.apps.length && fs.existsSync(serviceAccountPath)) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath as any),
    projectId: process.env.FIREBASE_PROJECT_ID || 'anchor-firebase',
  });
}

const db = admin.apps.length ? admin.firestore() : null as any;

/**
 * チャットメッセージを保存
 */
export const saveMessage = async (
  matchId: number,
  userId: number,
  message: string
): Promise<string> => {
  try {
    const docRef = await db.collection('chats').doc(`match_${matchId}`).collection('messages').add({
      userId,
      message,
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      isRead: false,
    });

    return docRef.id;
  } catch (err) {
    console.error('メッセージ保存エラー:', err);
    throw err;
  }
};

/**
 * チャットメッセージを取得
 */
export const getMessages = async (
  matchId: number,
  limit: number = 50
): Promise<any[]> => {
  try {
    const snapshot = await db
      .collection('chats')
      .doc(`match_${matchId}`)
      .collection('messages')
      .orderBy('timestamp', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }));
  } catch (err) {
    console.error('メッセージ取得エラー:', err);
    throw err;
  }
};

/**
 * メッセージを既読にマーク
 */
export const markMessagesAsRead = async (
  matchId: number,
  userId: number
): Promise<void> => {
  try {
    const snapshot = await db
      .collection('chats')
      .doc(`match_${matchId}`)
      .collection('messages')
      .where('isRead', '==', false)
      .where('userId', '!=', userId)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach((doc: any) => {
      batch.update(doc.ref, { isRead: true });
    });

    await batch.commit();
  } catch (err) {
    console.error('既読更新エラー:', err);
    throw err;
  }
};

/**
 * リアルタイムリスナー登録（メッセージ受信）
 */
export const subscribeToMessages = (
  matchId: number,
  callback: (messages: any[]) => void
): (() => void) => {
  const unsubscribe = db
    .collection('chats')
    .doc(`match_${matchId}`)
    .collection('messages')
    .orderBy('timestamp', 'desc')
    .onSnapshot((snapshot: any) => {
      const messages = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback(messages);
    });

  return unsubscribe;
};

/**
 * Firestore 接続テスト
 */
export const testFirestoreConnection = async (): Promise<boolean> => {
  try {
    await db.collection('test').doc('ping').set({ timestamp: new Date() });
    await db.collection('test').doc('ping').delete();
    return true;
  } catch (err) {
    console.error('Firestore 接続エラー:', err);
    return false;
  }
};

export default db;

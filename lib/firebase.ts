import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyD3nS6kiXDLS3daup6ley0pa433zqSeuZE",
  authDomain: "hindukushsarai-87db1.firebaseapp.com",
  projectId: "hindukushsarai-87db1",
  storageBucket: "hindukushsarai-87db1.firebasestorage.app",
  messagingSenderId: "697597164389",
  appId: "1:697597164389:web:bcc4f9ded8c86f9bc5bf8c",
  measurementId: "G-0166DE7JDL"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});

const auth = getAuth(app);

export { app, auth, db };

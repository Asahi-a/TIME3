// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyDk70iZiBryZiDM2bGNv_zcGU1TzW5bIi0",
  authDomain: "suggestionofv5multi.firebaseapp.com",
  projectId: "suggestionofv5multi",
  storageBucket: "suggestionofv5multi.firebasestorage.app",
  messagingSenderId: "870213136635",
  appId: "1:870213136635:web:5a2b1747e532b09be7c05e",
  measurementId: "G-ERZSNF13VE"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// HTMLエスケープ（XSS対策）
function escapeHTML(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// コメント投稿（スパム対策・空投稿防止）
let lastPostTime = 0; // 前回投稿時刻

function postComment() {
  const name = document.getElementById("name").value.trim();
  const message = document.getElementById("message").value.trim();

  // 空投稿禁止
  if (!name || !message) {
    alert("名前とコメントを入力してください");
    return;
  }

  // 文字数制限（JS側）
  if (message.length > 300) {
    alert("コメントは300文字以内でお願いします");
    return;
  }

  // 投稿間隔制限（30秒）
  const now = Date.now();
  if (now - lastPostTime < 30000) {
    alert("連続投稿は30秒あけてください");
    return;
  }
  lastPostTime = now;

  // Firestore に保存
  db.collection("comments").add({
    name: name,
    message: message,
    time: new Date()
  });

  // 入力欄をクリア
  document.getElementById("message").value = "";
}

// コメント一覧をリアルタイム表示
db.collection("comments")
  .orderBy("time", "desc")
  .onSnapshot((snapshot) => {
    const commentsDiv = document.getElementById("comments");
    commentsDiv.innerHTML = "";

    snapshot.forEach((doc) => {
      const c = doc.data();

      const safeName = escapeHTML(c.name);
      const safeMessage = escapeHTML(c.message);
      const date = c.time.toDate().toLocaleString("ja-JP");

      const p = document.createElement("p");
      p.innerHTML = `<b>${safeName}</b> (${date})<br>${safeMessage}`;
      commentsDiv.appendChild(p);
    });
  });


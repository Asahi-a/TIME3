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

// コメント投稿
function postComment() {
  const name = document.getElementById("name").value;
  const message = document.getElementById("message").value;

  db.collection("comments").add({
    name: name,
    message: message,
    time: new Date()
  });
}

// コメント一覧をリアルタイム表示
db.collection("comments")
  .orderBy("time", "desc")
  .onSnapshot((snapshot) => {
    const commentsDiv = document.getElementById("comments");
    commentsDiv.innerHTML = "";
    snapshot.forEach((doc) => {
  const c = doc.data();
  const date = c.time.toDate().toLocaleString("ja-JP");

  commentsDiv.innerHTML += `
    <p>
      <b>${c.name}</b> (${date})<br>
      ${c.message}
    </p>`;
});

  });

// Baynna comments compatibility module.
// Authentication is initialized by the main page; this file must remain safe
// if loaded independently.
const db = firebase.firestore();

function addComment(postId) {
  const input = document.getElementById("commentInput-" + postId);
  const text = input ? input.value.trim() : "";
  const user = firebase.auth().currentUser;
  if (!input || !text || !user || !postId) return;

  db.collection("users").doc(user.uid).get()
    .then(function (doc) {
      const data = doc.exists ? doc.data() : {};
      return db.collection("posts").doc(postId).collection("comments").add({
        text: text,
        username: data.username || user.displayName || user.email || "مستخدم",
        userId: user.uid,
        parentId: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(function () { input.value = ""; })
    .catch(function (error) { console.error("Baynna comment failed:", error); });
}

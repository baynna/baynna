const db = firebase.firestore();

// إضافة تعليق
function addComment(postId) {
const input = document.getElementById(`commentInput-${postId}`);
const text = input.value.trim();

if (!text) return;

db.collection("posts")
.doc(postId)
.collection("comments")
.add({
text: text,
username: currentUsername,
createdAt: firebase.firestore.FieldValue.serverTimestamp()
})
.then(() => {
input.value = "";
loadComments(postId);
});
}

// تحميل التعليقات
function loadComments(postId) {
const container = document.getElementById(`comments-${postId}`);
container.innerHTML = "";

db.collection("posts")
.doc(postId)
.collection("comments")
.orderBy("createdAt", "asc")
.get()
.then((snapshot) => {
snapshot.forEach((doc) => {
const c = doc.data();

```
    const div = document.createElement("div");
    div.className = "comment";

    div.innerHTML = `
      <strong>${c.username}</strong>
      <p>${c.text}</p>
    `;

    container.appendChild(div);
  });
});
```

}

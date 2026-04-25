function addComment(postId) {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value;

  if (!text) return;

  db.collection("posts")
    .doc(postId)
    .collection("comments")
    .add({
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      input.value = "";
      loadComments(postId);
    });
}

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
        const comment = doc.data();

        const p = document.createElement("p");
        p.textContent = "💬 " + comment.text;

        container.appendChild(p);
      });
    });
}

const db = firebase.firestore();

function addComment(postId) {
  const input = document.getElementById("commentInput_" + postId);
  const text = input.value.trim();

  if (!text) return;

  db.collection("comments").add({
    postId: postId,
    text: text,
    username: firebase.auth().currentUser?.email || "مستخدم",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = "";
}

function loadComments(postId) {
  const container = document.getElementById("comments_" + postId);

  db.collection("comments")
    .where("postId", "==", postId)
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {
      container.innerHTML = "";

      snapshot.forEach((doc) => {
        const c = doc.data();

        const div = document.createElement("div");
        div.className = "comment";

        div.innerHTML = `
          <div class="username">${c.username}</div>
          <div>${c.text}</div>
        `;

        container.appendChild(div);
      });
    });
}

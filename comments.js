const db = firebase.firestore();

// إضافة تعليق
function addComment(postId) {
  const input = document.getElementById("commentInput_" + postId);
  const text = input.value.trim();

  if (!text) return;

  db.collection("comments").add({
    postId: postId,
    text: text,
    likes: 0,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

  input.value = "";
}

// لايك للتعليق
function likeComment(commentId) {
  db.collection("comments").doc(commentId).update({
    likes: firebase.firestore.FieldValue.increment(1)
  });
}

// عرض التعليقات (Real-time)
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
        div.style.marginTop = "6px";
        div.style.padding = "6px";
        div.style.background = "#f1f3f5";
        div.style.borderRadius = "6px";

        div.innerHTML = `
          <span>${c.text}</span>
          <button onclick="likeComment('${doc.id}')">
            👍 (${c.likes || 0})
          </button>
        `;

        container.appendChild(div);
      });
    });
}

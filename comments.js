function addComment(postId) {
  const input = document.getElementById(`commentInput-${postId}`);
  const text = input.value.trim();

  if (!text) {
    alert("اكتب تعليق");
    return;
  }

  db.collection("comments")
    .add({
      postId: postId,
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    })
    .then(() => {
      input.value = "";
      loadComments(postId);
    });
}

function loadComments(postId) {
  const container = document.getElementById(`comments-${postId}`);
  container.innerHTML = "";

  db.collection("comments")
    .where("postId", "==", postId)
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const c = doc.data();

        const div = document.createElement("div");

        // 🔥 تنسيق احترافي
        div.style.background = "#f1f3f5";
        div.style.padding = "8px 10px";
        div.style.marginTop = "6px";
        div.style.borderRadius = "8px";
        div.style.fontSize = "14px";

        div.innerHTML = `
          <div style="color:#333;">
            ${c.text}
          </div>
        `;

        container.appendChild(div);
      });
    });
}

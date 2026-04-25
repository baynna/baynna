function addComment(postId) {
  const input = document.getElementById(`commentInput-${postId}`);
  const text = input.value.trim();

  if (!text) {
    alert("اكتب تعليق");
    return;
  }

  db.collection("comments").add({
    postId: postId,
    text: text,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }).then(() => {
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
    .then(snapshot => {
      snapshot.forEach(doc => {
        const c = doc.data();

        const div = document.createElement("div");
        div.style.marginTop = "5px";
        div.style.fontSize = "14px";

        div.innerText = c.text;

        container.appendChild(div);
      });
    });
}

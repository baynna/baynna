const db = firebase.firestore();

// إضافة تعليق
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

        // 🔥 تصميم التعليق
        div.style.background = "#f8f9fa";
        div.style.padding = "8px 10px";
        div.style.marginTop = "6px";
        div.style.borderRadius = "10px";
        div.style.border = "1px solid #eee";

        div.innerHTML = `
          <strong>${c.username || "مستخدم"}</strong><br>
          <span>${c.text}</span>
        `;

        container.appendChild(div);
      });
    });
}

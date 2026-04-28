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

        const div = document.createElement("div");

        div.style.background = "#f9f9f9";
        div.style.padding = "10px";
        div.style.marginTop = "8px";
        div.style.borderRadius = "8px";
        div.style.border = "1px solid #eee";

        div.innerHTML = `
          <strong>${comment.username || "مستخدم"}</strong>
          <p style="margin:5px 0;">${comment.text}</p>

          <small style="color:gray;">
            ${
              comment.createdAt
                ? new Date(comment.createdAt.seconds * 1000).toLocaleString()
                : ""
            }
          </small>
        `;

        container.appendChild(div);
      });
    });
}

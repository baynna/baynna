const db = firebase.firestore();

// عرض المنشورات
function renderPosts() {
  const container = document.getElementById("postsContainer");
  container.innerHTML = "";

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {
      snapshot.forEach((doc) => {
        const post = doc.data();

        const div = document.createElement("div");

        div.style.background = "#fff";
        div.style.padding = "15px";
        div.style.margin = "10px 0";
        div.style.borderRadius = "10px";
        div.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)";

        div.innerHTML = `
          <h3>${post.username || "مستخدم"}</h3>
          <p>${post.content || ""}</p>

          <button onclick="likePost('${doc.id}')">
            👍 إعجاب (${post.likes || 0})
          </button>

          <p style="color:gray; font-size:12px;">
            ${post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : ""}
          </p>
        `;

        container.appendChild(div);
      });
    });
}

// الإعجاب
function likePost(postId) {
  db.collection("posts").doc(postId).update({
    likes: firebase.firestore.FieldValue.increment(1),
  }).then(() => {
    renderPosts();
  });
}

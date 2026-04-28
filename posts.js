const db = firebase.firestore();

function renderPosts() {
  const container = document.getElementById("postsContainer");

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .onSnapshot((snapshot) => {
      container.innerHTML = "";

      snapshot.forEach((doc) => {
        const post = doc.data();

        const div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
          <h3>${post.username || "مستخدم"}</h3>
          <p>${post.content || ""}</p>

          <button onclick="likePost('${doc.id}')">
            👍 (${post.likes || 0})
          </button>

          <div class="comment-box">
            <input id="commentInput_${doc.id}" placeholder="اكتب تعليق">
            <button onclick="addComment('${doc.id}')">إرسال</button>
          </div>

          <div id="comments_${doc.id}" class="comments"></div>

          <div class="time">
            ${
              post.createdAt
                ? new Date(post.createdAt.seconds * 1000).toLocaleString()
                : ""
            }
          </div>
        `;

        container.appendChild(div);

        loadComments(doc.id);
      });
    });
}

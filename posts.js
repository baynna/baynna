const db = firebase.firestore();

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
        div.className = "post-card";

        div.innerHTML = `
          <div class="post-header">
            <div class="avatar">${(post.username || "م")[0]}</div>
            <div class="user-info">
              <div class="username">${post.username || "مستخدم"}</div>
              <div class="date">
                ${
                  post.createdAt
                    ? new Date(post.createdAt.seconds * 1000).toLocaleString()
                    : ""
                }
              </div>
            </div>
          </div>

          <div class="post-content">
            ${post.content || ""}
          </div>

          ${
            post.imageUrl
              ? `<img src="${post.imageUrl}" class="post-image" />`
              : ""
          }

          <div class="post-actions">
            <button onclick="likePost('${doc.id}')">
              👍 ${post.likes || 0}
            </button>
          </div>

          <div class="comments-section">
            <div class="add-comment">
              <input id="commentInput-${doc.id}" placeholder="اكتب تعليق..." />
              <button onclick="addComment('${doc.id}')">إرسال</button>
            </div>

            <div id="comments-${doc.id}" class="comments-list"></div>
          </div>
        `;

        container.appendChild(div);

        loadComments(doc.id);
      });
    });
}

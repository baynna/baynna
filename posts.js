const db = firebase.firestore();

async function renderPosts() {
  const container = document.getElementById("postsContainer");
  container.innerHTML = "";

  const snapshot = await db.collection("posts")
    .orderBy("createdAt", "desc")
    .get();

  snapshot.forEach((doc) => {
    const post = doc.data();

    const postDiv = document.createElement("div");
    postDiv.className = "post";

    postDiv.innerHTML = `
      <h3>${post.username || "مستخدم"}</h3>
      <p>${post.content || ""}</p>

      <button onclick="likePost('${doc.id}')">
        👍 إعجاب (${post.likes || 0})
      </button>

      <div class="comment-box">
        <input id="commentInput-${doc.id}" placeholder="اكتب تعليق">
        <button onclick="addComment('${doc.id}')">إرسال</button>
      </div>

      <div id="comments-${doc.id}" class="comments"></div>

      <p class="time">
        ${
          post.createdAt
            ? new Date(post.createdAt.seconds * 1000).toLocaleString()
            : ""
        }
      </p>
    `;

    container.appendChild(postDiv);

    loadComments(doc.id);
  });
}

renderPosts();

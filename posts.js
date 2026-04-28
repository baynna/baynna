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

        // 🔥 تصميم احترافي
        div.style.background = "#ffffff";
        div.style.padding = "15px";
        div.style.margin = "15px 0";
        div.style.borderRadius = "12px";
        div.style.boxShadow = "0 4px 12px rgba(0,0,0,0.08)";
        div.style.border = "1px solid #eee";

        div.innerHTML = `
          <h3 style="margin-bottom:5px;">
            ${post.username || "مستخدم"}
          </h3>

          <p style="margin-bottom:10px;">
            ${post.content || ""}
          </p>

          <button onclick="likePost('${doc.id}')">
            👍 إعجاب (${post.likes || 0})
          </button>

          <br><br>

          <input id="commentInput_${doc.id}" placeholder="اكتب تعليق"
                 style="padding:8px; width:70%; border-radius:8px; border:1px solid #ddd;">

          <button onclick="addComment('${doc.id}')">
            إرسال
          </button>

          <div id="comments_${doc.id}" style="margin-top:10px;"></div>

          <p style="color:gray; font-size:12px; margin-top:10px;">
            ${
              post.createdAt
                ? new Date(post.createdAt.seconds * 1000).toLocaleString()
                : ""
            }
          </p>
        `;

        container.appendChild(div);

        loadComments(doc.id);
      });
    });
}

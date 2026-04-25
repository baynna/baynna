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

          <br><br>

          <input id="commentInput_${doc.id}" placeholder="اكتب تعليق">
          <button onclick="addComment('${doc.id}')">إرسال</button>

          <div id="comments_${doc.id}"></div>

          <p style="color:gray; font-size:12px;">
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

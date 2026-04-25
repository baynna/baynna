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

          <br><br>

          <input id="comment-${doc.id}" placeholder="اكتب تعليق..." />
          <button onclick="addComment('${doc.id}')">إرسال</button>

          <div id="comments-${doc.id}" style="margin-top:10px;"></div>

          <p style="color:gray; font-size:12px;">
            ${post.createdAt ? new Date(post.createdAt.seconds * 1000).toLocaleString() : ""}
          </p>
        `;

        container.appendChild(div);

        // عرض التعليقات
        loadComments(doc.id);
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

// إضافة تعليق
function addComment(postId) {
  const input = document.getElementById(`comment-${postId}`);
  const text = input.value;

  if (!text) return;

  db.collection("posts")
    .doc(postId)
    .collection("comments")
    .add({
      text: text,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    })
    .then(() => {
      input.value = "";
      loadComments(postId);
    });
}

// عرض التعليقات
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

        const p = document.createElement("p");
        p.textContent = "💬 " + comment.text;

        container.appendChild(p);
      });
    });
}

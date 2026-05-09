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

            <!-- 🔥 التفاعلات الجديدة (بدون تخريب) -->
            <div style="margin-top:5px;">
              <button onclick="react('${doc.id}','like')">👍</button>
              <button onclick="react('${doc.id}','love')">❤️</button>
              <button onclick="react('${doc.id}','laugh')">😂</button>
              <button onclick="react('${doc.id}','angry')">😡</button>
            </div>

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

        // لا نلمس هذا
        loadComments(doc.id);
      });
    });
}


// =======================
// التعليقات (كما هي)
// =======================
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  db.collection("comments")
    .where("postId", "==", postId)
    .orderBy("createdAt", "asc")
    .onSnapshot((snapshot) => {

      box.innerHTML = "";

      snapshot.forEach((doc) => {
        const c = doc.data();

        box.innerHTML += `
          <div class="comment">
            <b>${c.username || "مستخدم"}:</b> ${c.text || ""}
          </div>
        `;
      });

    });
}


// =======================
// إضافة تعليق
// =======================
function addComment(postId) {

  const input = document.getElementById("commentInput-" + postId);
  const text = input.value.trim();

  if (!text) return;

  const user = firebase.auth().currentUser;
  if (!user) return;

  db.collection("users").doc(user.uid).get().then((doc) => {

    let username = "مستخدم";

    if (doc.exists && doc.data().username) {
      username = doc.data().username;
    }

    db.collection("comments").add({
      postId: postId,
      text: text,
      username: username,
      userId: user.uid,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    input.value = "";
  });
}

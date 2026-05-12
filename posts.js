const db = firebase.firestore();

// =======================
// عرض المنشورات
// =======================
function renderPosts() {
  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "";

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then((snapshot) => {

      snapshot.forEach((doc) => {
        const post = doc.data();

        const div = document.createElement("div");
        div.className = "post-card";

        let dateText = "";
        if (post.createdAt && post.createdAt.toDate) {
          dateText = post.createdAt.toDate().toLocaleString();
        }

        div.innerHTML = `
          <div class="post-header">
            <div class="avatar">${(post.username || "م")[0]}</div>
            <div class="user-info">
              <div class="username">${post.username || "مستخدم"}</div>
              <div class="date">${dateText}</div>
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

        loadComments(doc.id);
      });

    });
}


// =======================
// عرض التعليقات + الردود
// =======================
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  db.collection("posts")
    .doc(postId)
    .collection("comments")
    .orderBy("createdAt")
    .onSnapshot((snapshot) => {

      box.innerHTML = "";

      let comments = [];

      snapshot.forEach((doc) => {
        const c = doc.data();
        c.id = doc.id;
        comments.push(c);
      });

      let mainComments = comments.filter(c => !c.parentId);
      let replies = comments.filter(c => c.parentId);

      mainComments.forEach(c => {

        let html = `
          <div style="background:#eef3ff;padding:8px;border-radius:8px;margin-top:5px;">
            <b>${c.username}:</b> ${c.text}

            <div style="margin-top:5px;">
              <input id="replyInput-${c.id}" placeholder="رد..." />
              <button onclick="addReply('${postId}','${c.id}')">رد</button>
            </div>
        `;

        replies
          .filter(r => r.parentId === c.id)
          .forEach(r => {
            html += `
              <div style="margin-top:5px;margin-right:15px;background:#fff;padding:6px;border-radius:6px;">
                <b>${r.username}:</b> ${r.text}
              </div>
            `;
          });

        html += `</div>`;

        box.innerHTML += html;
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

    db.collection("posts")
      .doc(postId)
      .collection("comments")
      .add({
        text,
        username,
        userId: user.uid,
        parentId: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    input.value = "";
  });
}


// =======================
// الرد على تعليق
// =======================
function addReply(postId, parentId) {

  const input = document.getElementById("replyInput-" + parentId);
  const text = input.value.trim();
  if (!text) return;

  const user = firebase.auth().currentUser;
  if (!user) return;

  db.collection("users").doc(user.uid).get().then((doc) => {

    let username = "مستخدم";
    if (doc.exists && doc.data().username) {
      username = doc.data().username;
    }

    db.collection("posts")
      .doc(postId)
      .collection("comments")
      .add({
        text,
        username,
        userId: user.uid,
        parentId: parentId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    input.value = "";
  });
}

const db = firebase.firestore();

let currentUser = null;

// تسجيل الدخول
firebase.auth().onAuthStateChanged(function(user) {
  if (!user) return;
  currentUser = user;
  loadFeed();
});


// =======================
// تحميل المنشورات
// =======================
function loadFeed() {

  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "جاري التحميل...";

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(function(postsSnap) {

      container.innerHTML = "";

      postsSnap.forEach(function(doc) {

        const post = doc.data();

        const div = document.createElement("div");
        div.style.border = "1px solid #ddd";
        div.style.padding = "10px";
        div.style.marginBottom = "10px";

        div.innerHTML = `
          <h3>${post.username || "مستخدم"}</h3>
          <p>${post.content || ""}</p>

          ${
            post.imageUrl
            ? `<img src="${post.imageUrl}" style="width:100%">`
            : ""
          }

          <br>

          <button onclick="likePost('${doc.id}')">
            👍 ${post.likes || 0}
          </button>

          <br><br>

          <input id="commentInput-${doc.id}" placeholder="اكتب تعليق">
          <button onclick="addComment('${doc.id}')">إرسال</button>

          <div id="comments-${doc.id}"></div>
        `;

        container.appendChild(div);

        loadComments(doc.id);

      });

    });
}


// =======================
// عرض التعليقات
// =======================
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  const comments = JSON.parse(localStorage.getItem("comments_" + postId)) || [];

  box.innerHTML = "";

  comments.forEach(function(c) {

    box.innerHTML += `
      <div style="background:#f0f0f0;margin-top:5px;padding:5px;">
        <b>${c.username}:</b> ${c.text}
      </div>
    `;

  });
}


// =======================
// إضافة تعليق
// =======================
function addComment(postId) {

  const input = document.getElementById("commentInput-" + postId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  const username = currentUser.email || "مستخدم";

  let comments = JSON.parse(localStorage.getItem("comments_" + postId)) || [];

  comments.push({
    text: text,
    username: username
  });

  localStorage.setItem("comments_" + postId, JSON.stringify(comments));

  input.value = "";

  loadComments(postId);
}

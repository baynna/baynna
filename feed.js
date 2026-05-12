const db = firebase.firestore();

let currentUser = null;

// انتظار تسجيل الدخول
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

  container.innerHTML = "<p>جاري تحميل المنشورات...</p>";

  db.collection("users")
    .doc(currentUser.uid)
    .collection("following")
    .get()
    .then(function(snapshot) {

      let followingIds = [];

      snapshot.forEach(function(doc) {
        followingIds.push(doc.id);
      });

      followingIds.push(currentUser.uid);

      db.collection("posts")
        .orderBy("createdAt", "desc")
        .get()
        .then(function(postsSnap) {

          container.innerHTML = "";

          postsSnap.forEach(function(doc) {

            const post = doc.data();

            if (!followingIds.includes(post.userId)) return;

            const div = document.createElement("div");
            div.className = "post";

            div.innerHTML = `
              <h3 style="cursor:pointer;color:#4a6cf7;"
              onclick="openProfile('${post.userId}')">
              ${post.username || "مستخدم"}
              </h3>

              <p>${post.content || ""}</p>

              ${
                post.imageUrl
                ? `<img src="${post.imageUrl}" style="width:100%;border-radius:10px;">`
                : ""
              }

              <br><br>

              <button onclick="likePost('${doc.id}')">
                👍 ${post.likes || 0}
              </button>

              <button onclick="toggleSave('${doc.id}')">
                💾 حفظ
              </button>

              <br><br>

              <!-- 🔥 التعليقات -->
              <input id="commentInput-${doc.id}" placeholder="اكتب تعليق..." />
              <button onclick="addComment('${doc.id}')">إرسال</button>

              <div id="comments-${doc.id}"></div>
            `;

            container.appendChild(div);

            loadComments(doc.id); // 🔥 مهم جداً

          });

        });

    });

}


// =======================
// عرض التعليقات
// =======================
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  db.collection("comments")
    .where("postId", "==", postId)
    .onSnapshot(function(snapshot) {

      box.innerHTML = "";

      snapshot.forEach(function(doc) {
        const c = doc.data();

        box.innerHTML += `
          <div style="background:#eef3ff;padding:6px;border-radius:6px;margin-top:5px;">
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

  db.collection("users").doc(user.uid).get().then(function(doc) {

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


// فتح البروفايل
function openProfile(userId) {
  window.location.href = "profile.html?uid=" + userId;
}

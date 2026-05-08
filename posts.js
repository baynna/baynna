const db = firebase.firestore();

let currentUser = null;

// انتظار تسجيل الدخول
firebase.auth().onAuthStateChanged(function(user) {

  if (!user) {
    console.log("بانتظار تسجيل الدخول...");
    return;
  }

  currentUser = user;

  setTimeout(function() {
    renderPosts();
  }, 300);

});


// عرض المنشورات
function renderPosts() {

  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "";

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(function(snapshot) {

      snapshot.forEach(function(doc) {

        const post = doc.data();

        const div = document.createElement("div");
        div.style.background = "#fff";
        div.style.padding = "15px";
        div.style.marginBottom = "10px";
        div.style.borderRadius = "10px";

        div.innerHTML = `
          <h3>${post.username || "مستخدم"}</h3>
          <p>${post.content || ""}</p>

          ${
            post.imageUrl
              ? `<img src="${post.imageUrl}" style="width:100%;border-radius:10px;margin-top:10px;">`
              : ""
          }

          <br><br>

          <!-- 🔥 Reactions -->
          <div style="margin-top:10px;">
            <button onclick="react('${doc.id}', 'like')">👍</button>
            <button onclick="react('${doc.id}', 'love')">❤️</button>
            <button onclick="react('${doc.id}', 'laugh')">😂</button>
            <button onclick="react('${doc.id}', 'angry')">😡</button>
          </div>

          <br>

          <button onclick="toggleSave('${doc.id}')">
            💾 حفظ
          </button>

          <br><br>

          <input id="commentInput-${doc.id}" placeholder="اكتب تعليق">
          <button onclick="addComment('${doc.id}')">إرسال</button>

          <div id="comments-${doc.id}"></div>
        `;

        container.appendChild(div);

        if (typeof loadComments === "function") {
          loadComments(doc.id);
        }

      });

    })
    .catch(function(error) {
      console.log("خطأ:", error.message);
    });

}


// 🔥 نظام التفاعلات
function react(postId, type) {

  if (!currentUser) {
    return;
  }

  const ref = db.collection("posts")
    .doc(postId)
    .collection("reactions")
    .doc(currentUser.uid);

  ref.get().then(function(doc) {

    if (doc.exists) {
      // تغيير التفاعل
      ref.update({
        type: type
      });
    } else {
      // إضافة تفاعل
      ref.set({
        type: type,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

  });

}


// 🔥 الحفظ
function toggleSave(postId) {

  if (!currentUser) {
    return;
  }

  const ref = db.collection("users")
    .doc(currentUser.uid)
    .collection("saved")
    .doc(postId);

  ref.get().then(function(doc) {

    if (doc.exists) {
      ref.delete();
    } else {
      ref.set({
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

  });

}

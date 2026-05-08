const db = firebase.firestore();

let currentUser = null;

// انتظار تسجيل الدخول
firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    console.log("بانتظار تسجيل الدخول...");
    return;
  }
  currentUser = user;
  renderPosts();
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
        div.className = "post";

        div.innerHTML = `
          <h3>${post.username || "مستخدم"}</h3>
          <p>${post.content || ""}</p>

          ${
            post.imageUrl
              ? `<img src="${post.imageUrl}" style="width:100%;border-radius:10px;margin-top:10px;">`
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

          <input id="commentInput-${doc.id}" placeholder="اكتب تعليق">
          <button onclick="addComment('${doc.id}')">إرسال</button>

          <div id="comments-${doc.id}"></div>
        `;

        container.appendChild(div);

        // 🔥 تحميل التعليقات من داخل البوست (Subcollection)
        loadComments(doc.id);

      });

    })
    .catch(function(error) {
      console.log("خطأ:", error.message);
    });

}


// 🔥 تحميل التعليقات (Subcollection)
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  db.collection("posts")
    .doc(postId)
    .collection("comments")
    .orderBy("createdAt")
    .onSnapshot(function(snapshot) {

      box.innerHTML = "";

      snapshot.forEach(function(doc) {

        const c = doc.data();

        box.innerHTML += `
          <div style="margin-top:5px;padding:5px;background:#f0f0f0;border-radius:6px;">
            <b>${c.username || "مستخدم"}:</b> ${c.text || ""}
          </div>
        `;

      });

    }, function(error) {
      console.log("Comments error:", error.message);
    });

}


// 🔥 إضافة تعليق
function addComment(postId) {

  const input = document.getElementById("commentInput-" + postId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  if (!currentUser) {
    return;
  }

  db.collection("users").doc(currentUser.uid).get().then(function(userDoc) {

    let username = "مستخدم";

    if (userDoc.exists && userDoc.data().username) {
      username = userDoc.data().username;
    }

    db.collection("posts")
      .doc(postId)
      .collection("comments")
      .add({
        text: text,
        userId: currentUser.uid,
        username: username,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });

    input.value = "";

  });

}


// 🔥 الحفظ (كما هو)
function toggleSave(postId) {

  if (!currentUser) return;

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

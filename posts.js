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


// =====================
// عرض المنشورات
// =====================
function renderPosts() {

  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "";

  db.collection("posts")
    .orderBy("time", "desc")
    .get()
    .then(function(snapshot) {

      snapshot.forEach(function(doc) {

        const post = doc.data();

        const div = document.createElement("div");
        div.className = "post";

        div.innerHTML = `
          <h3>${post.name || "مستخدم"}</h3>
          <p>${post.text || ""}</p>

          ${
            post.image
              ? `<img src="${post.image}" style="width:100%;border-radius:10px;margin-top:10px;">`
              : ""
          }

          <br><br>

          <button onclick="likePost('${doc.id}')">
            👍 ${(post.likes || []).length}
          </button>

          <button onclick="toggleSave('${doc.id}')">
            💾 حفظ
          </button>

          <br><br>

          <!-- إضافة تعليق -->
          <input id="commentInput-${doc.id}" placeholder="اكتب تعليق">
          <button onclick="addComment('${doc.id}')">إرسال</button>

          <div id="comments-${doc.id}"></div>
        `;

        container.appendChild(div);

        // تحميل التعليقات والردود
        loadComments(doc.id);

      });

    })
    .catch(function(error) {
      console.log("خطأ:", error.message);
    });
}



// =====================
// تحميل التعليقات + الردود
// =====================
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  db.collection("comments")
    .where("postId", "==", postId)
    .orderBy("createdAt")
    .onSnapshot(function(snapshot) {

      box.innerHTML = "";

      let all = [];

      snapshot.forEach(function(doc) {
        let data = doc.data();
        data.id = doc.id;
        all.push(data);
      });

      // تقسيم التعليقات
      let roots = all.filter(c => !c.parentId);
      let replies = all.filter(c => c.parentId);

      roots.forEach(function(c) {

        let html = `
          <div style="margin-top:8px;padding:8px;background:#eef3ff;border-radius:8px;">
            <b>${c.username || "مستخدم"}:</b> ${c.text || ""}
            
            <div style="margin-top:5px;">
              <input id="replyInput-${c.id}" placeholder="رد...">
              <button onclick="reply('${postId}','${c.id}')">رد</button>
            </div>
        `;

        // الردود
        replies
          .filter(r => r.parentId === c.id)
          .forEach(function(r) {

            html += `
              <div style="margin-top:5px;margin-right:15px;padding:6px;background:#ffffff;border-radius:6px;">
                <b>${r.username || "مستخدم"}:</b> ${r.text || ""}
              </div>
            `;

          });

        html += `</div>`;

        box.innerHTML += html;

      });

    }, function(error) {
      console.log("Comments error:", error.message);
    });

}



// =====================
// إضافة تعليق
// =====================
function addComment(postId) {

  const input = document.getElementById("commentInput-" + postId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  if (!currentUser) return;

  db.collection("users").doc(currentUser.uid).get().then(function(userDoc) {

    let username = "مستخدم";

    if (userDoc.exists && userDoc.data().username) {
      username = userDoc.data().username;
    }

    db.collection("comments").add({
      postId: postId,
      text: text,
      userId: currentUser.uid,
      username: username,
      parentId: null,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    input.value = "";

  });

}



// =====================
// الرد على تعليق
// =====================
function reply(postId, parentId) {

  const input = document.getElementById("replyInput-" + parentId);
  if (!input) return;

  const text = input.value.trim();
  if (!text) return;

  if (!currentUser) return;

  db.collection("users").doc(currentUser.uid).get().then(function(userDoc) {

    let username = "مستخدم";

    if (userDoc.exists && userDoc.data().username) {
      username = userDoc.data().username;
    }

    db.collection("comments").add({
      postId: postId,
      text: text,
      userId: currentUser.uid,
      username: username,
      parentId: parentId,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });

    input.value = "";

  });

}



// =====================
// الحفظ
// =====================
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

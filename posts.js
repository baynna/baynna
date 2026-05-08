
const db = firebase.firestore();

// عرض المنشورات
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
        div.style.background = "#fff";
        div.style.padding = "15px";
        div.style.marginBottom = "10px";
        div.style.borderRadius = "10px";

        div.innerHTML = `
          <h3 style="color:#4a6cf7;">
            ${post.username || "مستخدم"}
          </h3>

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

        if (typeof loadComments === "function") {
          loadComments(doc.id);
        }

      });

    });
}


// 🔥 دالة الحفظ
function toggleSave(postId) {

  const user = firebase.auth().currentUser;

  if (!user) {
    alert("يجب تسجيل الدخول");
    return;
  }

  const ref = db.collection("users")
    .doc(user.uid)
    .collection("saved")
    .doc(postId);

  ref.get().then((doc) => {

    if (doc.exists) {
      ref.delete();
      alert("تم إزالة الحفظ");
    } else {
      ref.set({
        savedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      alert("تم حفظ المنشور");
    }

  });

}


// تشغيل
renderPosts();

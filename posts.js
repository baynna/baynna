const db = firebase.firestore();

let currentUser = null;

// 🔥 ننتظر تسجيل الدخول
firebase.auth().onAuthStateChanged(function(user) {

  if (!user) {
    console.log("لم يتم تسجيل الدخول بعد");
    return;
  }

  currentUser = user;

  // 🔥 لا نعرض المنشورات إلا بعد التأكد
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

    })
    .catch(function(error) {
      console.error("خطأ:", error);
    });
}


// 🔥 دالة الحفظ
function toggleSave(postId) {

  if (!currentUser) {
    alert("انتظر لحظة...");
    return;
  }

  const ref = db.collection("users")
    .doc(currentUser.uid)
    .collection("saved")
    .doc(postId);

  ref.get().then(function(doc) {

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

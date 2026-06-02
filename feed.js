const db = firebase.firestore();

let currentUser = null;

// تسجيل الدخول
firebase.auth().onAuthStateChanged(function(user) {
  if (!user) {
    alert("❌ يجب تسجيل الدخول أولاً");
    return;
  }
  currentUser = user;
  loadPosts();
});


// =======================
// عرض المنشورات
// =======================
function loadPosts() {

  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "جاري التحميل...";

  db.collection("posts").get().then(function(snapshot) {

    container.innerHTML = "";

    snapshot.forEach(function(doc) {

      const post = doc.data();

      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.marginBottom = "10px";
      div.style.padding = "10px";

      div.innerHTML = `
        <h3>${post.username || "مستخدم"}</h3>
        <p>${post.content || ""}</p>

        <input id="comment-${doc.id}" placeholder="اكتب تعليق">
        <button id="btn-${doc.id}">إرسال</button>

        <div id="comments-${doc.id}"></div>
      `;

      container.appendChild(div);

      document.getElementById("btn-" + doc.id)
        .addEventListener("click", function() {
          sendComment(doc.id);
        });

      loadComments(doc.id);

    });

  });
}


// =======================
// إرسال تعليق
// =======================
function sendComment(postId) {

  const input = document.getElementById("comment-" + postId);
  const text = input.value.trim();

  if (!text) {
    alert("اكتب تعليق");
    return;
  }

  if (!currentUser) {
    alert("يجب تسجيل الدخول");
    return;
  }

  db.collection("comments").add({
    postId: String(postId),
    text: text,
    userId: currentUser.uid,
    username: currentUser.email || "مستخدم",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(function() {
    input.value = "";
    alert("تم إرسال التعليق ✅");
  })
  .catch(function(error) {
    alert("خطأ ❌: " + error.message);
    console.log(error);
  });
}


// =======================
// عرض التعليقات (بدون فلترة 🔥)
// =======================
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  db.collection("comments")
    .onSnapshot(function(snapshot) {

      box.innerHTML = "";

      snapshot.forEach(function(doc) {

        const c = doc.data();

        // 🔥 نفلتر يدويًا بدل Firestore
        if (c.postId !== postId) return;

        const div = document.createElement("div");
        div.style.background = "#eee";
        div.style.marginTop = "5px";
        div.style.padding = "5px";

        div.textContent = (c.username || "مستخدم") + ": " + c.text;

        box.appendChild(div);
      });

    });

}

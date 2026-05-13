const db = firebase.firestore();

let currentUser = null;

window.addEventListener("error", function(e) {
  console.log("JS ERROR:", e.message);
});

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

          <br><br>

          <button onclick="testAddComment('${doc.id}')">
            🔥 اضغط لاختبار التعليق
          </button>

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

  db.collection("comments")
    .get()
    .then(function(snapshot) {

      box.innerHTML = "";

      snapshot.forEach(function(doc) {
        const c = doc.data();

        box.innerHTML += `
          <div style="background:#eee;margin-top:5px;padding:5px;">
            ${c.text}
          </div>
        `;
      });

    });
}


// =======================
// 🔥 اختبار الحفظ (الحاسم)
// =======================
function testAddComment(postId) {

  alert("تم الضغط ✔");

  db.collection("comments").add({
    text: "TEST COMMENT",
    createdAt: new Date()
  })
  .then(function() {
    alert("✅ تم الحفظ في Firebase");
  })
  .catch(function(error) {
    alert("❌ فشل الحفظ: " + error.message);
  });
}

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

  container.innerHTML = "جاري التحميل...";

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

              <!-- إضافة تعليق -->
              <input id="commentInput-${doc.id}" placeholder="اكتب تعليق">
              <button onclick="addComment('${doc.id}')">إرسال</button>

              <!-- عرض التعليقات -->
              <div id="comments-${doc.id}"></div>
            `;

            container.appendChild(div);

            loadComments(doc.id);

          });

        });

    });

}


// =======================
// عرض التعليقات (مصَحَّح)
// =======================
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  db.collection("comments")
    .onSnapshot(function(snapshot) {

      box.innerHTML = "";

      snapshot.forEach(function(doc) {

        const c = doc.data();

        // 🔥 فلترة صحيحة
        if (c.postId !== postId) return;

        box.innerHTML += `
          <div style="background:#f0f0f0;margin-top:5px;padding:5px;">
            <b>${c.username || "مستخدم"}:</b> ${c.text || ""}
          </div>
        `;

      });

    });

}


// =======================
// إضافة تعليق (مصَحَّحة 100%)
// =======================
function addComment(postId) {

  const input = document.getElementById("commentInput-" + postId);
  if (!input) {
    alert("❌ لم يتم العثور على مربع التعليق");
    return;
  }

  const text = input.value.trim();
  if (!text) {
    alert("❌ اكتب تعليق أولاً");
    return;
  }

  const user = firebase.auth().currentUser;
  if (!user) {
    alert("❌ يجب تسجيل الدخول");
    return;
  }

  const username = user.email || "مستخدم";

  db.collection("comments").add({
    postId: String(postId),   // 🔥 مهم جداً
    text: text,
    username: username,
    userId: user.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(function() {
    alert("✅ تم إرسال التعليق");
    input.value = "";
  })
  .catch(function(error) {
    alert("❌ خطأ: " + error.message);
    console.log(error);
  });

}


// فتح البروفايل
function openProfile(userId) {
  window.location.href = "profile.html?uid=" + userId;
}

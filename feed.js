const db = firebase.firestore();

let currentUser = null;

// انتظار تسجيل الدخول
firebase.auth().onAuthStateChanged(function(user) {

  if (!user) return;

  currentUser = user;

  loadFeed();
});


// 🔥 تحميل المنشورات الذكية
function loadFeed() {

  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "<p>جاري تحميل المنشورات...</p>";

  // جلب من أتابعهم
  db.collection("users")
    .doc(currentUser.uid)
    .collection("following")
    .get()
    .then(function(snapshot) {

      let followingIds = [];

      snapshot.forEach(function(doc) {
        followingIds.push(doc.id);
      });

      // 🔥 أضف نفسك أيضاً
      followingIds.push(currentUser.uid);

      if (followingIds.length === 0) {
        container.innerHTML = "لا توجد منشورات بعد";
        return;
      }

      // جلب المنشورات
      db.collection("posts")
        .orderBy("createdAt", "desc")
        .get()
        .then(function(postsSnap) {

          container.innerHTML = "";

          postsSnap.forEach(function(doc) {

            const post = doc.data();

            // 🔥 فلترة ذكية
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
            `;

            container.appendChild(div);

          });

        });

    });

}


// فتح البروفايل
function openProfile(userId) {
  window.location.href = "profile.html?uid=" + userId;
}

const db = firebase.firestore();

// عرض المنشورات
function renderPosts() {
  const container = document.getElementById("postsContainer");
  container.innerHTML = "";

  db.collection("posts")
    .orderBy("createdAt", "desc")
    .get()
    .then(snapshot => {
      snapshot.forEach(doc => {
        const post = doc.data();

        const div = document.createElement("div");
        div.style = "background:#fff;padding:15px;margin:10px 0;border-radius:10px";

        div.innerHTML = `
          <h3>${post.title || "بدون عنوان"}</h3>
          <p>${post.content || ""}</p>
        `;

        container.appendChild(div);
      });
    });
}

// تشغيل تلقائي
window.onload = function () {
  renderPosts();
};

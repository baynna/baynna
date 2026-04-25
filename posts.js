function loadPosts() {
  db.collection("posts")
    .orderBy("createdAt", "desc")
    .onSnapshot(function(snapshot) {

      const postsContainer = document.getElementById("posts");
      if (!postsContainer) return;

      postsContainer.innerHTML = "";

      snapshot.forEach(function(doc) {
        const post = doc.data();

        const div = document.createElement("div");
        div.innerHTML = `
          <div style="padding:10px;border:1px solid #ccc;margin-bottom:10px">
            <strong>${post.username || "مستخدم"}</strong>
            <p>${post.content || ""}</p>
          </div>
        `;

        postsContainer.appendChild(div);
      });

    });
}

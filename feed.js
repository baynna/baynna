const db = firebase.firestore();

// =======================
// تحميل المنشورات
// =======================
function loadPosts() {

  const container = document.getElementById("postsContainer");
  if (!container) return;

  container.innerHTML = "Loading...";

  db.collection("posts").get().then(function(snapshot) {

    container.innerHTML = "";

    snapshot.forEach(function(doc) {

      const post = doc.data();

      const div = document.createElement("div");
      div.style.border = "1px solid #ccc";
      div.style.marginBottom = "10px";
      div.style.padding = "10px";

      div.innerHTML = `
        <h3>${post.username || "user"}</h3>
        <p>${post.content || ""}</p>

        <input id="comment-${doc.id}" placeholder="write comment">
        <button onclick="sendComment('${doc.id}')">Send</button>

        <div id="comments-${doc.id}"></div>
      `;

      container.appendChild(div);

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
    alert("write something");
    return;
  }

  db.collection("comments").add({
    postId: postId,
    text: text,
    username: "test-user",
    likes: 0   // 🔥 مهم لتهيئة اللايك
  })
  .then(function() {
    input.value = "";
    alert("DONE ✅");
  })
  .catch(function(e) {
    alert("ERROR: " + e.message);
  });
}


// =======================
// لايك التعليق
// =======================
function likeComment(commentId) {

  db.collection("comments").doc(commentId).update({
    likes: firebase.firestore.FieldValue.increment(1)
  })
  .catch(function(e) {
    console.log(e);
  });

}


// =======================
// عرض التعليقات
// =======================
function loadComments(postId) {

  const box = document.getElementById("comments-" + postId);
  if (!box) return;

  db.collection("comments")
    .onSnapshot(function(snapshot) {

      box.innerHTML = "";

      snapshot.forEach(function(doc) {

        const c = doc.data();

        if (c.postId != postId) return;

        const d = document.createElement("div");
        d.style.background = "#eee";
        d.style.marginTop = "5px";
        d.style.padding = "5px";

        d.innerHTML = `
          ${c.username}: ${c.text}
          <br>
          <button onclick="likeComment('${doc.id}')">👍</button>
          ${c.likes || 0}
        `;

        box.appendChild(d);
      });

    });
}


// تشغيل
loadPosts();

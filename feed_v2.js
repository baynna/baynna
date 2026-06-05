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
    likes: 0,
    reactions: {}   // 🔥 جديد
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
// لايك التعليق (كما هو)
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
// التفاعل (❤️ 😂 😡 🔥)
// =======================
function reactComment(commentId, type) {

  let userId = localStorage.getItem("userId");

  if (!userId) {
    userId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("userId", userId);
  }

  const ref = db.collection("comments").doc(commentId);

  ref.get().then(function(doc) {

    if (!doc.exists) return;

    const data = doc.data();
    let reactions = data.reactions || {};

    reactions[userId] = type;

    ref.update({
      reactions: reactions
    });

  });

}


// =======================
// حساب التفاعلات
// =======================
function countReactions(reactions) {

  const counts = {
    like: 0,
    love: 0,
    laugh: 0,
    angry: 0,
    sad: 0,
    fire: 0
  };

  if (!reactions) return counts;

  Object.values(reactions).forEach(type => {
    if (counts[type] !== undefined) {
      counts[type]++;
    }
  });

  return counts;
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

        const counts = countReactions(c.reactions);

        const d = document.createElement("div");
        d.style.background = "#eee";
        d.style.marginTop = "5px";
        d.style.padding = "5px";

        d.innerHTML = `
          ${c.username}: ${c.text}
          <br>

          👍 ${counts.like}
          ❤️ ${counts.love}
          😂 ${counts.laugh}
          😡 ${counts.angry}
          😢 ${counts.sad}
          🔥 ${counts.fire}

          <br>

          <button onclick="likeComment('${doc.id}')">👍</button>

          <button onclick="reactComment('${doc.id}','like')">👍</button>
          <button onclick="reactComment('${doc.id}','love')">❤️</button>
          <button onclick="reactComment('${doc.id}','laugh')">😂</button>
          <button onclick="reactComment('${doc.id}','angry')">😡</button>
          <button onclick="reactComment('${doc.id}','sad')">😢</button>
          <button onclick="reactComment('${doc.id}','fire')">🔥</button>
        `;

        box.appendChild(d);
      });

    });
}


// تشغيل
loadPosts();

const db = firebase.firestore();

let currentUser = null;

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
    .orderBy("createdAt", "desc")
    .get()
    .then(function(postsSnap) {

      container.innerHTML = "";

      postsSnap.forEach(function(doc) {

        const post = doc.data();

        const div = document.createElement("div");
        div.style.border = "1px solid #ddd";
        div.style.padding = "10px";
        div.style.marginBottom = "10px";

        // نبني عناصر حقيقية بدل HTML onclick
        const title = document.createElement("h3");
        title.textContent = post.username || "مستخدم";

        const content = document.createElement("p");
        content.textContent = post.content || "";

        const likeBtn = document.createElement("button");
        likeBtn.textContent = "👍 " + (post.likes || 0);
        likeBtn.onclick = function() {
          if (typeof likePost === "function") likePost(doc.id);
        };

        const input = document.createElement("input");
        input.id = "commentInput-" + doc.id;
        input.placeholder = "اكتب تعليق";

        const sendBtn = document.createElement("button");
        sendBtn.textContent = "إرسال";

        // 🔥 ربط مباشر (هذا يحل المشكلة نهائيًا)
        sendBtn.addEventListener("click", function() {
          addComment(doc.id);
        });

        const commentsBox = document.createElement("div");
        commentsBox.id = "comments-" + doc.id;

        div.appendChild(title);
        div.appendChild(content);

        if (post.imageUrl) {
          const img = document.createElement("img");
          img.src = post.imageUrl;
          img.style.width = "100%";
          div.appendChild(img);
        }

        div.appendChild(document.createElement("br"));
        div.appendChild(likeBtn);

        div.appendChild(document.createElement("br"));
        div.appendChild(document.createElement("br"));

        div.appendChild(input);
        div.appendChild(sendBtn);
        div.appendChild(commentsBox);

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
    .where("postId", "==", postId)
    .onSnapshot(function(snapshot) {

      box.innerHTML = "";

      snapshot.forEach(function(doc) {
        const c = doc.data();

        const d = document.createElement("div");
        d.style.background = "#eee";
        d.style.marginTop = "5px";
        d.style.padding = "5px";
        d.textContent = (c.username || "مستخدم") + ": " + (c.text || "");

        box.appendChild(d);
      });

    });
}


// =======================
// إضافة تعليق (نهائي)
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
    postId: postId,
    text: text,
    username: username,
    userId: user.uid,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  })
  .then(function() {
    input.value = "";
    alert("✅ تم إرسال التعليق");
  })
  .catch(function(error) {
    alert("❌ خطأ: " + error.message);
    console.log(error);
  });
}

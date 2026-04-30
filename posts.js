const db = firebase.firestore();

function renderPosts() {
const container = document.getElementById("postsContainer");
container.innerHTML = "";

db.collection("posts")
.orderBy("createdAt", "desc")
.get()
.then((snapshot) => {
snapshot.forEach((doc) => {
const post = doc.data();

```
    const div = document.createElement("div");
    div.className = "post";

    div.innerHTML = `
      <!-- اسم المستخدم (يفتح صفحة جديدة) -->
      <h3 style="cursor:pointer;color:#4a6cf7;"
          onclick="window.location.href='profile.html?uid=${post.userId}'">
        ${post.username || "مستخدم"}
      </h3>

      <!-- النص -->
      <p>${post.content || ""}</p>

      <!-- الصورة -->
      ${
        post.imageUrl
          ? `<img src="${post.imageUrl}" style="width:100%;border-radius:10px;margin-top:10px;">`
          : ""
      }

      <!-- لايك -->
      <button onclick="likePost('${doc.id}')">
        👍 ${post.likes || 0}
      </button>

      <br><br>

      <!-- تعليق -->
      <input id="commentInput-${doc.id}" placeholder="اكتب تعليق">
      <button onclick="addComment('${doc.id}')">إرسال</button>

      <!-- عرض التعليقات -->
      <div id="comments-${doc.id}"></div>

      <!-- التاريخ -->
      <p style="color:gray;font-size:12px;">
        ${
          post.createdAt
            ? new Date(post.createdAt.seconds * 1000).toLocaleString()
            : ""
        }
      </p>
    `;

    container.appendChild(div);

    // تحميل التعليقات
    if (typeof loadComments === "function") {
      loadComments(doc.id);
    }
  });
});
```

}

// تشغيل
renderPosts();

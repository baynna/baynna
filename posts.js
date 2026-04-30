const db = firebase.firestore();

// ⚠️ ضع رابط موقعك هنا
const BASE_URL = window.location.origin;

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
      <h3 style="cursor:pointer;color:#4a6cf7;"
          onclick="goProfile('${post.userId}')">
        ${post.username || "مستخدم"}
      </h3>

      <p>${post.content || ""}</p>

      ${
        post.imageUrl
          ? `<img src="${post.imageUrl}" style="width:100%;border-radius:10px;margin-top:10px;">`
          : ""
      }

      <button onclick="likePost('${doc.id}')">
        👍 ${post.likes || 0}
      </button>

      <br><br>

      <input id="commentInput-${doc.id}" placeholder="اكتب تعليق">
      <button onclick="addComment('${doc.id}')">إرسال</button>

      <div id="comments-${doc.id}"></div>
    `;

    container.appendChild(div);

    loadComments(doc.id);
  });
});
```

}

// 🔥 انتقال مضمون
function goProfile(userId) {
if (!userId) {
alert("لا يوجد userId");
return;
}

window.location.href = BASE_URL + "/profile.html?uid=" + userId;
}

renderPosts();

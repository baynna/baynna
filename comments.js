const db = firebase.firestore();

// Baynna comments v1 — authenticated comments and replies.
function addComment(postId) {
  const input = document.getElementById("commentInput-" + postId);
  const text = input ? input.value.trim() : "";
  const user = firebase.auth().currentUser;
  if (!input || !text || !user || !postId) return;

  db.collection("users").doc(user.uid).get()
    .then(function (doc) {
      const data = doc.exists ? doc.data() : {};
      const username = data.username || user.displayName || user.email || "مستخدم";
      return db.collection("posts").doc(postId).collection("comments").add({
        text: text,
        username: username,
        userId: user.uid,
        parentId: null,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(function () {
      input.value = "";
    })
    .catch(function (error) {
      console.error("Baynna comment failed:", error);
    });
}

function addReply(postId, parentId) {
  const input = document.getElementById("replyInput-" + parentId);
  const text = input ? input.value.trim() : "";
  const user = firebase.auth().currentUser;
  if (!input || !text || !user || !postId || !parentId) return;

  db.collection("users").doc(user.uid).get()
    .then(function (doc) {
      const data = doc.exists ? doc.data() : {};
      const username = data.username || user.displayName || user.email || "مستخدم";
      return db.collection("posts").doc(postId).collection("comments").add({
        text: text,
        username: username,
        userId: user.uid,
        parentId: parentId,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .then(function () {
      input.value = "";
    })
    .catch(function (error) {
      console.error("Baynna reply failed:", error);
    });
}

function loadComments(postId) {
  const box = document.getElementById("comments-" + postId);
  if (!box || !postId) return;

  db.collection("posts").doc(postId).collection("comments")
    .orderBy("createdAt", "asc")
    .onSnapshot(function (snapshot) {
      box.innerHTML = "";
      const comments = [];
      snapshot.forEach(function (doc) {
        const data = doc.data();
        comments.push({ id: doc.id, ...data });
      });

      comments.filter(function (c) { return !c.parentId; }).forEach(function (c) {
        const wrapper = document.createElement("div");
        wrapper.style.cssText = "background:#eef3ff;padding:8px;border-radius:8px;margin-top:5px;";

        const header = document.createElement("div");
        const strong = document.createElement("b");
        strong.textContent = (c.username || "مستخدم") + ": ";
        header.appendChild(strong);
        header.appendChild(document.createTextNode(c.text || ""));
        wrapper.appendChild(header);

        const row = document.createElement("div");
        row.style.marginTop = "5px";
        const input = document.createElement("input");
        input.id = "replyInput-" + c.id;
        input.placeholder = "رد...";
        const button = document.createElement("button");
        button.textContent = "رد";
        button.onclick = function () { addReply(postId, c.id); };
        row.appendChild(input);
        row.appendChild(button);
        wrapper.appendChild(row);

        comments.filter(function (r) { return r.parentId === c.id; }).forEach(function (r) {
          const reply = document.createElement("div");
          reply.style.cssText = "margin-top:5px;margin-right:15px;background:#fff;padding:6px;border-radius:6px;";
          const replyStrong = document.createElement("b");
          replyStrong.textContent = (r.username || "مستخدم") + ": ";
          reply.appendChild(replyStrong);
          reply.appendChild(document.createTextNode(r.text || ""));
          wrapper.appendChild(reply);
        });

        box.appendChild(wrapper);
      });
    }, function (error) {
      console.error("Baynna comments listener failed:", error);
    });
}

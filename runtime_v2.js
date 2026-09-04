/* Baynna runtime hardening v2
 * Loaded after the legacy page so broken handlers are replaced without
 * rewriting the large index.html in-place.
 */
(function () {
  "use strict";

  if (!window.firebase || !window.firebase.firestore || !window.firebase.auth) return;

  const db = window.firebase.firestore();
  const auth = window.firebase.auth();
  const FV = window.firebase.firestore.FieldValue;

  function errorText(error) {
    const code = error && error.code ? " [" + error.code + "]" : "";
    return (error && error.message) ? error.message + code : "حدث خطأ غير معروف.";
  }

  function toast(message, success) {
    let box = document.getElementById("baynna-runtime-toast");
    if (!box) {
      box = document.createElement("div");
      box.id = "baynna-runtime-toast";
      box.setAttribute("role", "status");
      box.style.cssText = "position:fixed;bottom:18px;left:18px;right:18px;z-index:99999;padding:13px 16px;border-radius:14px;background:#fff;border:1px solid;box-shadow:0 12px 30px rgba(0,0,0,.14);font:14px Tahoma,Arial,sans-serif;direction:rtl;text-align:right";
      document.body.appendChild(box);
    }
    box.style.borderColor = success ? "#a7f3d0" : "#fecaca";
    box.style.color = success ? "#065f46" : "#7f1d1d";
    box.textContent = message;
    clearTimeout(box._timer);
    box._timer = setTimeout(function () { if (box.parentNode) box.parentNode.removeChild(box); }, 6000);
  }

  function userOrNotify() {
    const user = auth.currentUser;
    if (!user) { toast("يجب تسجيل الدخول أولاً.", false); return null; }
    return user;
  }

  function rerender() {
    if (typeof window.renderPosts === "function") {
      try { window.renderPosts(); } catch (e) { console.error("Baynna render error", e); }
    }
  }

  function displayName(uid, fallback) {
    try {
      const map = window.usersMap || {};
      const p = map[uid];
      if (p && typeof p.username === "string" && p.username.trim()) return p.username.trim();
    } catch (_) {}
    return fallback || "مستخدم";
  }

  // One notification schema everywhere: users/{uid}/notifications/{id}.
  window.createNotification = async function (targetUid, payload) {
    if (!targetUid || !payload || targetUid === (auth.currentUser && auth.currentUser.uid)) return;
    const clean = Object.assign({}, payload, {
      time: typeof payload.time === "number" ? payload.time : Date.now(),
      read: payload.read === true
    });
    try {
      await db.collection("users").doc(targetUid).collection("notifications").add(clean);
    } catch (e) {
      console.error("Baynna notification error", e);
    }
  };

  window.sendPost = async function () {
    const user = userOrNotify();
    if (!user) return;
    const titleEl = document.getElementById("postTitleInput");
    const textEl = document.getElementById("text");
    const visibilityEl = document.getElementById("postVisibility");
    const title = titleEl ? titleEl.value.trim() : "";
    const text = textEl ? textEl.value.trim() : "";
    const visibility = visibilityEl && visibilityEl.value ? visibilityEl.value : "public";
    let image = "";
    try { if (typeof selectedImageBase64 === "string") image = selectedImageBase64; } catch (_) {}
    if (!image && typeof window.selectedImageBase64 === "string") image = window.selectedImageBase64;
    if (!title && !text && !image) { toast("اكتب عنواناً أو نصاً أو أضف صورة أولاً.", false); return; }
    if (image && image.length > 650000) { toast("الصورة كبيرة جداً. اختر صورة أصغر من 450KB تقريباً.", false); return; }
    let mood = "";
    try { if (typeof currentMood === "string") mood = currentMood; } catch (_) {}
    const payload = { title: title, text: text, image: image, mood: mood, visibility: visibility, name: user.email || "مستخدم", uid: user.uid, time: Date.now(), likes: [] };
    const buttons = Array.prototype.slice.call(document.querySelectorAll("button"));
    const publishButton = buttons.find(function (b) { return b.textContent.trim() === "نشر"; });
    if (publishButton) publishButton.disabled = true;
    try {
      await db.collection("posts").add(payload);
      if (titleEl) titleEl.value = "";
      if (textEl) textEl.value = "";
      if (visibilityEl) visibilityEl.value = "public";
      if (typeof window.clearMoodSelection === "function") window.clearMoodSelection();
      if (typeof window.removeSelectedImage === "function") window.removeSelectedImage();
      toast("تم نشر المنشور بنجاح.", true);
      rerender();
    } catch (e) { toast(errorText(e), false); }
    finally { if (publishButton) publishButton.disabled = false; }
  };

  window.toggleLike = async function (postId, liked) {
    const user = userOrNotify();
    if (!user || !postId) return;
    try {
      await db.collection("posts").doc(postId).update({ likes: liked ? FV.arrayRemove(user.uid) : FV.arrayUnion(user.uid) });
      if (!liked) {
        let post = null;
        try { const snap = await db.collection("posts").doc(postId).get(); if (snap.exists) post = snap.data(); } catch (_) {}
        if (post && post.uid && post.uid !== user.uid) await window.createNotification(post.uid, { type:"like", fromUid:user.uid, fromName:displayName(user.uid,user.email), postId:postId, text:displayName(user.uid,user.email)+" أعجب بمنشورك", time:Date.now(), read:false });
      }
      rerender();
    } catch (e) { toast(errorText(e), false); }
  };

  window.addComment = async function (postId) {
    const user = userOrNotify();
    if (!user || !postId) return;
    const input = document.getElementById("commentText-" + postId);
    const text = input ? input.value.trim() : "";
    if (!text) { toast("اكتب تعليقاً أولاً.", false); return; }
    try {
      const postRef = db.collection("posts").doc(postId);
      const postSnap = await postRef.get();
      if (!postSnap.exists) { toast("المنشور غير موجود.", false); return; }
      const post = postSnap.data();
      await postRef.collection("comments").add({ text:text, name:user.email || "مستخدم", uid:user.uid, time:Date.now() });
      if (input) input.value = "";
      if (post.uid && post.uid !== user.uid) await window.createNotification(post.uid, { type:"comment", fromUid:user.uid, fromName:displayName(user.uid,user.email), postId:postId, text:displayName(user.uid,user.email)+" علّق على منشورك", time:Date.now(), read:false });
      rerender();
    } catch (e) { toast(errorText(e), false); }
  };

  window.addReply = async function (postId, commentId) {
    const user = userOrNotify();
    if (!user || !postId || !commentId) return;
    const input = document.getElementById("replyText-" + postId + "-" + commentId);
    const text = input ? input.value.trim() : "";
    if (!text) { toast("اكتب رداً أولاً.", false); return; }
    try {
      const commentRef = db.collection("posts").doc(postId).collection("comments").doc(commentId);
      const commentSnap = await commentRef.get();
      const comment = commentSnap.exists ? commentSnap.data() : null;
      await commentRef.collection("replies").add({ text:text, name:user.email || "مستخدم", uid:user.uid, time:Date.now() });
      if (input) input.value = "";
      const from = displayName(user.uid,user.email);
      if (comment && comment.uid && comment.uid !== user.uid) await window.createNotification(comment.uid, { type:"reply", fromUid:user.uid, fromName:from, postId:postId, text:from+" رد على تعليقك", time:Date.now(), read:false });
      rerender();
    } catch (e) { toast(errorText(e), false); }
  };

  window.deletePost = async function (postId) {
    const user = userOrNotify();
    if (!user || !postId) return;
    if (!window.confirm("هل تريد حذف هذا المنشور؟")) return;
    try { await db.collection("posts").doc(postId).delete(); toast("تم حذف المنشور.", true); rerender(); }
    catch (e) { toast(errorText(e), false); }
  };

  window.deleteComment = async function (postId, commentId) {
    const user = userOrNotify();
    if (!user || !postId || !commentId) return;
    if (!window.confirm("هل تريد حذف هذا التعليق؟")) return;
    try { await db.collection("posts").doc(postId).collection("comments").doc(commentId).delete(); toast("تم حذف التعليق.", true); rerender(); }
    catch (e) { toast(errorText(e), false); }
  };

  window.deleteReply = async function (postId, commentId, replyId) {
    const user = userOrNotify();
    if (!user || !postId || !commentId || !replyId) return;
    if (!window.confirm("هل تريد حذف هذا الرد؟")) return;
    try { await db.collection("posts").doc(postId).collection("comments").doc(commentId).collection("replies").doc(replyId).delete(); toast("تم حذف الرد.", true); rerender(); }
    catch (e) { toast(errorText(e), false); }
  };

  window.login = async function () {
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const email = emailEl ? emailEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value.trim() : "";
    if (!email || !password) { toast("اكتب البريد وكلمة المرور.", false); return; }
    try { await auth.signInWithEmailAndPassword(email,password); toast("تم تسجيل الدخول.", true); }
    catch (e) { toast(errorText(e), false); }
  };

  window.register = async function () {
    const emailEl = document.getElementById("email");
    const passwordEl = document.getElementById("password");
    const email = emailEl ? emailEl.value.trim() : "";
    const password = passwordEl ? passwordEl.value.trim() : "";
    if (!email || !password) { toast("اكتب البريد وكلمة المرور.", false); return; }
    if (password.length < 6) { toast("كلمة المرور يجب أن تكون 6 أحرف على الأقل.", false); return; }
    try { await auth.createUserWithEmailAndPassword(email,password); toast("تم إنشاء الحساب.", true); }
    catch (e) { toast(errorText(e), false); }
  };

  window.logout = async function () {
    try { await auth.signOut(); toast("تم تسجيل الخروج.", true); }
    catch (e) { toast(errorText(e), false); }
  };

  // Make image rendering safer for both data URLs and remote URLs.
  function sanitizeImages(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("img.post-image").forEach(function (img) {
      const raw = (img.getAttribute("src") || "").trim();
      if (!raw) return;
      if (raw.indexOf("data:image/") === 0) { img.loading="lazy"; img.decoding="async"; return; }
      try {
        const u = new URL(raw, location.href);
        const allowed = u.protocol === "https:" || (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1"));
        if (!allowed) { img.removeAttribute("src"); img.style.display="none"; return; }
        img.loading="lazy"; img.decoding="async"; img.referrerPolicy="no-referrer";
      } catch (_) { img.removeAttribute("src"); img.style.display="none"; }
    });
  }

  window.BaynnaRuntime = Object.freeze({ version:"2.0", hardened:true, firestore:true });

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", function(){ sanitizeImages(document); }, {once:true});
  else sanitizeImages(document);
})();

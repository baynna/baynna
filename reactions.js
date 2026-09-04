/* Baynna interaction recovery v1
 * Loaded last by index.html so it can safely replace broken legacy handlers
 * without rewriting the large stable page in-place.
 */
(function () {
  "use strict";

  const firebaseApi = window.firebase;
  if (!firebaseApi || !firebaseApi.firestore) return;

  const db = firebaseApi.firestore();
  const auth = firebaseApi.auth();

  function messageForError(error) {
    const code = error && error.code ? " [" + error.code + "]" : "";
    return (error && error.message ? error.message : String(error || "خطأ غير معروف")) + code;
  }

  function showDiagnostic(message) {
    console.error("Baynna:", message);
    let box = document.getElementById("baynna-runtime-diagnostic");
    if (!box) {
      box = document.createElement("div");
      box.id = "baynna-runtime-diagnostic";
      box.setAttribute("role", "alert");
      box.style.cssText = "position:fixed;bottom:16px;left:16px;right:16px;z-index:99999;padding:13px 16px;border-radius:14px;background:#fff;color:#7f1d1d;border:1px solid #fecaca;box-shadow:0 12px 30px rgba(0,0,0,.14);font:14px Tahoma,Arial,sans-serif;direction:rtl;text-align:right";
      document.body.appendChild(box);
    }
    box.textContent = "تعذر تنفيذ العملية: " + String(message || "خطأ غير معروف");
    clearTimeout(box._hideTimer);
    box._hideTimer = setTimeout(function () {
      if (box.parentNode) box.parentNode.removeChild(box);
    }, 9000);
  }

  // The old page hid every alert, which made Firebase failures look like dead buttons.
  window.alert = showDiagnostic;

  window.addEventListener("error", function (event) {
    if (event && event.error) console.error("Baynna uncaught error:", event.error);
  });

  window.addEventListener("unhandledrejection", function (event) {
    showDiagnostic(messageForError(event && event.reason));
  });

  function requireUser() {
    const user = auth.currentUser;
    if (!user) {
      showDiagnostic("يجب تسجيل الدخول أولاً.");
      return null;
    }
    return user;
  }

  function safeRender() {
    if (typeof window.renderPosts === "function") {
      try { window.renderPosts(); } catch (error) { console.error(error); }
    }
  }

  // Reliable post publishing. The existing data model is preserved.
  window.sendPost = async function () {
    const user = requireUser();
    if (!user) return;

    const titleEl = document.getElementById("postTitleInput");
    const textEl = document.getElementById("text");
    const visibilityEl = document.getElementById("postVisibility");
    const title = titleEl ? titleEl.value.trim() : "";
    const text = textEl ? textEl.value.trim() : "";
    const visibility = visibilityEl ? (visibilityEl.value || "public") : "public";
    const image = typeof window.selectedImageBase64 === "string" ? window.selectedImageBase64 : "";

    // selectedImageBase64 is a global lexical variable in index.html; the fallback below
    // also supports older pages where it is not exposed as window property.
    let selectedImage = image;
    try {
      if (!selectedImage && typeof selectedImageBase64 === "string") selectedImage = selectedImageBase64;
    } catch (_) {}

    if (!title && !text && !selectedImage) {
      showDiagnostic("اكتب عنواناً أو نصاً أو أضف صورة أولاً.");
      return;
    }

    // Firestore documents are limited to 1 MiB. Keep embedded images comfortably below it.
    if (selectedImage && selectedImage.length > 650000) {
      showDiagnostic("الصورة كبيرة على Firestore. اختر صورة أصغر (يفضل أقل من 450KB).");
      return;
    }

    const payload = {
      title: title,
      text: text,
      image: selectedImage || "",
      mood: (typeof window.currentMood === "string" ? window.currentMood : ""),
      visibility: visibility,
      name: user.email || "مستخدم",
      uid: user.uid,
      time: Date.now(),
      likes: []
    };

    try {
      if (typeof currentMood === "string") payload.mood = currentMood;
    } catch (_) {}

    const buttons = document.querySelectorAll("button");
    let publishButton = null;
    buttons.forEach(function (button) {
      if (!publishButton && button.textContent.trim() === "نشر") publishButton = button;
    });

    if (publishButton) publishButton.disabled = true;

    try {
      await db.collection("posts").add(payload);
      if (titleEl) titleEl.value = "";
      if (textEl) textEl.value = "";
      if (visibilityEl) visibilityEl.value = "public";
      if (typeof window.clearMoodSelection === "function") window.clearMoodSelection();
      if (typeof window.removeSelectedImage === "function") window.removeSelectedImage();
      showDiagnostic("تم نشر المنشور بنجاح.");
      safeRender();
    } catch (error) {
      showDiagnostic(messageForError(error));
    } finally {
      if (publishButton) publishButton.disabled = false;
    }
  };

  // Reliable like/unlike using the existing likes: [uid] schema.
  window.toggleLike = async function (postId, liked) {
    const user = requireUser();
    if (!user || !postId) return;

    const ref = db.collection("posts").doc(postId);
    try {
      await ref.update({
        likes: liked
          ? firebaseApi.firestore.FieldValue.arrayRemove(user.uid)
          : firebaseApi.firestore.FieldValue.arrayUnion(user.uid)
      });
      safeRender();
    } catch (error) {
      showDiagnostic(messageForError(error));
    }
  };

  // Reliable comments using the current nested collection schema.
  window.addComment = async function (postId) {
    const user = requireUser();
    if (!user || !postId) return;

    const input = document.getElementById("commentText-" + postId);
    const text = input ? input.value.trim() : "";
    if (!text) {
      showDiagnostic("اكتب تعليقاً أولاً.");
      return;
    }

    try {
      await db.collection("posts").doc(postId).collection("comments").add({
        text: text,
        name: user.email || "مستخدم",
        uid: user.uid,
        time: Date.now()
      });
      if (input) input.value = "";
      safeRender();
    } catch (error) {
      showDiagnostic(messageForError(error));
    }
  };

  // Keep reply behavior consistent with the same data model.
  window.addReply = async function (postId, commentId) {
    const user = requireUser();
    if (!user || !postId || !commentId) return;

    const input = document.getElementById("replyText-" + postId + "-" + commentId);
    const text = input ? input.value.trim() : "";
    if (!text) {
      showDiagnostic("اكتب رداً أولاً.");
      return;
    }

    try {
      await db.collection("posts").doc(postId)
        .collection("comments").doc(commentId)
        .collection("replies").add({
          text: text,
          name: user.email || "مستخدم",
          uid: user.uid,
          time: Date.now()
        });
      if (input) input.value = "";
      safeRender();
    } catch (error) {
      showDiagnostic(messageForError(error));
    }
  };

  // Reactions remain available as a separate authenticated subcollection.
  window.react = async function (postId, type) {
    const user = requireUser();
    if (!user || !postId || !type) return;

    const ref = db.collection("posts").doc(postId).collection("reactions").doc(user.uid);
    try {
      await ref.set({
        type: type,
        createdAt: firebaseApi.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      showDiagnostic(messageForError(error));
    }
  };

  function sanitizeImages(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("img.post-image").forEach(function (img) {
      const raw = (img.getAttribute("src") || "").trim();
      if (!raw) return;
      if (raw.indexOf("data:image/") === 0) {
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        return;
      }
      try {
        const url = new URL(raw, window.location.href);
        const allowed = url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
        if (!allowed) {
          img.removeAttribute("src");
          img.setAttribute("alt", "رابط الصورة غير مسموح");
          img.style.display = "none";
          return;
        }
        img.setAttribute("loading", "lazy");
        img.setAttribute("decoding", "async");
        img.referrerPolicy = "no-referrer";
      } catch (_) {
        img.removeAttribute("src");
        img.style.display = "none";
      }
    });
  }

  function start() {
    sanitizeImages(document);
    if (!window.MutationObserver || !document.body) return;
    const observer = new MutationObserver(function (mutations) {
      mutations.forEach(function (mutation) {
        mutation.addedNodes.forEach(function (node) {
          if (node.nodeType === 1) sanitizeImages(node);
        });
      });
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})();

const db = firebase.firestore();

function react(postId, type) {
  const user = firebase.auth().currentUser;
  if (!user || !postId || !type) return;

  const ref = db.collection("posts")
    .doc(postId)
    .collection("reactions")
    .doc(user.uid);

  ref.get().then((doc) => {
    if (doc.exists) return ref.update({ type: type });
    return ref.set({
      type: type,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
    });
  }).catch((error) => {
    console.error("Baynna reaction error:", error);
  });
}

/* Experimental runtime guard: visible diagnostics + media URL hardening. */
(function installRuntimeGuard() {
  "use strict";

  function showDiagnostic(message) {
    console.error("Baynna:", message);
    let box = document.getElementById("baynna-runtime-diagnostic");
    if (!box) {
      box = document.createElement("div");
      box.id = "baynna-runtime-diagnostic";
      box.setAttribute("role", "status");
      box.style.cssText = "position:fixed;bottom:16px;left:16px;right:16px;z-index:99999;padding:12px 16px;border-radius:14px;background:#fff;color:#7f1d1d;border:1px solid #fecaca;box-shadow:0 12px 30px rgba(0,0,0,.12);font:14px Tahoma,Arial,sans-serif;direction:rtl;text-align:right";
      document.body.appendChild(box);
    }
    box.textContent = "حدث خطأ تقني: " + String(message || "خطأ غير معروف");
    clearTimeout(box._hideTimer);
    box._hideTimer = setTimeout(function () {
      if (box.parentNode) box.parentNode.removeChild(box);
    }, 7000);
  }

  window.alert = showDiagnostic;

  window.addEventListener("error", function (event) {
    if (event && event.error) console.error("Baynna uncaught error:", event.error);
  });

  window.addEventListener("unhandledrejection", function (event) {
    showDiagnostic(event && event.reason ? event.reason.message || event.reason : "Promise غير معالج");
  });

  function sanitizeImages(root) {
    const scope = root && root.querySelectorAll ? root : document;
    scope.querySelectorAll("img.post-image").forEach(function (img) {
      const raw = (img.getAttribute("src") || "").trim();
      if (!raw) return;
      try {
        const url = new URL(raw, window.location.href);
        const allowed = url.protocol === "https:" || (url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname));
        if (!allowed) {
          img.removeAttribute("src");
          img.setAttribute("alt", "رابط الصورة غير مسموح");
          img.style.display = "none";
          console.warn("Baynna blocked unsafe image URL");
        }
      } catch (error) {
        img.removeAttribute("src");
        img.setAttribute("alt", "رابط الصورة غير صالح");
        img.style.display = "none";
      }
      img.setAttribute("loading", "lazy");
      img.setAttribute("decoding", "async");
      img.referrerPolicy = "no-referrer";
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

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start, { once: true });
  else start();
})();

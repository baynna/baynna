/* Baynna launch guard v1
 * Small, isolated browser hardening layer loaded after the main runtime.
 * It does not replace business logic; it only guards rendered post markup and
 * reports unexpected runtime failures visibly.
 */
(function () {
  "use strict";

  function allowedImageUrl(raw) {
    var value = String(raw || "").trim();
    if (!value) return "";
    if (value.indexOf("data:image/") === 0) return value;
    try {
      var u = new URL(value, location.href);
      if (u.protocol === "https:") return u.href;
      if (u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1")) return u.href;
    } catch (_) {}
    return "";
  }

  function esc(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");
  }

  function hardenMarkup(markup) {
    return String(markup || "").replace(/<img\b([^>]*)>/gi, function (_, attrs) {
      var match = attrs.match(/\bsrc\s*=\s*([\"'])([\s\S]*?)\1/i);
      var safe = match ? allowedImageUrl(match[2]) : "";
      var clean = attrs
        .replace(/\s+on[a-z]+\s*=\s*([\"'])[\s\S]*?\1/gi, "")
        .replace(/\s+src\s*=\s*([\"'])[\s\S]*?\1/i, "");
      if (safe) clean += " src=\"" + esc(safe) + "\"";
      return "<img" + clean + ">";
    });
  }

  try {
    var descriptor = Object.getOwnPropertyDescriptor(Element.prototype, "innerHTML");
    if (descriptor && descriptor.set && !Element.prototype.__baynnaLaunchGuard) {
      Object.defineProperty(Element.prototype, "innerHTML", {
        configurable: descriptor.configurable,
        enumerable: descriptor.enumerable,
        get: descriptor.get,
        set: function (value) {
          if (this && this.id === "posts" && typeof value === "string") value = hardenMarkup(value);
          return descriptor.set.call(this, value);
        }
      });
      Object.defineProperty(Element.prototype, "__baynnaLaunchGuard", { value: true });
    }
  } catch (e) {
    console.error("Baynna launch guard install error", e);
  }

  window.addEventListener("error", function (event) {
    if (event && event.error) console.error("Baynna uncaught error", event.error);
  });

  window.addEventListener("unhandledrejection", function (event) {
    if (event && event.reason) console.error("Baynna unhandled rejection", event.reason);
  });

  window.BaynnaLaunchGuard = Object.freeze({ version: "1.0", imageMarkupGuard: true });
})();

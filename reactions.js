/* Baynna runtime loader
 * The hardened compatibility layer is kept separate so it can be audited,
 * tested and replaced without touching the legacy page renderer.
 */
(function () {
  "use strict";
  var runtime = document.createElement("script");
  runtime.src = "runtime_v2.js";
  runtime.async = false;
  runtime.setAttribute("data-baynna-runtime", "2");
  runtime.onload = function () {
    var guard = document.createElement("script");
    guard.src = "launch_guard.js";
    guard.async = false;
    guard.setAttribute("data-baynna-launch-guard", "1");
    (document.head || document.documentElement).appendChild(guard);
  };
  runtime.onerror = function () {
    console.error("Baynna runtime failed to load");
  };
  (document.head || document.documentElement).appendChild(runtime);
})();

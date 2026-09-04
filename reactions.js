/* Baynna runtime loader
 * The hardened compatibility layer is kept separate so it can be audited,
 * tested and replaced without touching the legacy page renderer.
 */
(function () {
  "use strict";
  var script = document.createElement("script");
  script.src = "runtime_v2.js";
  script.async = false;
  script.setAttribute("data-baynna-runtime", "2");
  (document.head || document.documentElement).appendChild(script);
})();

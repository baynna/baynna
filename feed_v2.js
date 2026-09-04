/*
 * Baynna compatibility shim — v2
 *
 * The main feed renderer lives in index.html. This file is loaded by the
 * current page for historical compatibility, so it must not redefine or
 * auto-run loadPosts/loadComments/sendComment/likeComment.
 *
 * New feed features must be implemented in a dedicated versioned module and
 * integrated only after testing. Keeping this shim inert prevents legacy
 * code from overwriting the production renderer at runtime.
 */
(function () {
  "use strict";
  window.BaynnaFeedV2 = Object.freeze({
    version: "2-compat",
    active: false
  });
})();

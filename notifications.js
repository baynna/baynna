/* Baynna notification compatibility shim
 * The main page owns notification listeners/rendering.
 * This file stays inert to prevent duplicate Firestore reads and conflicting listeners.
 */
(function () {
  "use strict";
  window.BaynnaNotifications = Object.freeze({
    version: "compat",
    active: false
  });
})();

const db = firebase.firestore();

// Baynna reactions v1 — safe, authenticated, single reaction per user.
function react(postId, type) {
  const user = firebase.auth().currentUser;
  if (!user || !postId || !type) return;

  const ref = db.collection("posts")
    .doc(postId)
    .collection("reactions")
    .doc(user.uid);

  ref.set({
    type: type,
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  }, { merge: true }).catch(function (error) {
    console.error("Baynna reaction failed:", error);
  });
}

/*
 * Notification/follow compatibility layer.
 * index.html contains the main UI; these functions are defined here as the
 * final loaded implementations so follow actions use one consistent schema.
 */
window.BaynnaFollow = Object.freeze({ version: "test-v1" });

function followUser(targetUid) {
  const user = firebase.auth().currentUser;
  if (!user || !targetUid || targetUid === user.uid) return;

  const followingRef = db.collection("users").doc(user.uid)
    .collection("following").doc(targetUid);
  const followerRef = db.collection("users").doc(targetUid)
    .collection("followers").doc(user.uid);
  const notificationRef = db.collection("users").doc(targetUid)
    .collection("notifications").doc();

  const batch = db.batch();
  batch.set(followingRef, {
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  batch.set(followerRef, {
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });
  batch.set(notificationRef, {
    type: "follow",
    fromUid: user.uid,
    fromName: user.displayName || user.email || "مستخدم",
    text: "قام " + (user.displayName || user.email || "مستخدم") + " بمتابعتك",
    read: false,
    time: firebase.firestore.FieldValue.serverTimestamp()
  });

  batch.commit()
    .then(function () {
      if (typeof updatePublicProfileBox === "function") updatePublicProfileBox();
    })
    .catch(function (error) {
      console.error("Baynna follow failed:", error);
    });
}

function unfollowUser(targetUid) {
  const user = firebase.auth().currentUser;
  if (!user || !targetUid || targetUid === user.uid) return;

  const followingRef = db.collection("users").doc(user.uid)
    .collection("following").doc(targetUid);
  const followerRef = db.collection("users").doc(targetUid)
    .collection("followers").doc(user.uid);

  const batch = db.batch();
  batch.delete(followingRef);
  batch.delete(followerRef);

  batch.commit()
    .then(function () {
      if (typeof updatePublicProfileBox === "function") updatePublicProfileBox();
    })
    .catch(function (error) {
      console.error("Baynna unfollow failed:", error);
    });
}

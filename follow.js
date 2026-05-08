const db = firebase.firestore();

// متابعة
function followUser(targetUserId) {

  const user = firebase.auth().currentUser;

  if (!user) {
    alert("سجل دخول أولاً");
    return;
  }

  db.collection("follows")
    .doc(user.uid + "_" + targetUserId)
    .set({
      follower: user.uid,
      following: targetUserId
    })
    .then(() => {
      loadFollowButton(targetUserId);
    });

}

// إلغاء متابعة
function unfollowUser(targetUserId) {

  const user = firebase.auth().currentUser;

  db.collection("follows")
    .doc(user.uid + "_" + targetUserId)
    .delete()
    .then(() => {
      loadFollowButton(targetUserId);
    });

}

// حالة الزر
function loadFollowButton(targetUserId) {

  const user = firebase.auth().currentUser;
  if (!user) return;

  const btn = document.getElementById("followBtn");

  db.collection("follows")
    .doc(user.uid + "_" + targetUserId)
    .get()
    .then(doc => {

      if (doc.exists) {
        btn.innerText = "إلغاء المتابعة";
        btn.onclick = function() {
          unfollowUser(targetUserId);
        };
      } else {
        btn.innerText = "متابعة";
        btn.onclick = function() {
          followUser(targetUserId);
        };
      }

    });

}

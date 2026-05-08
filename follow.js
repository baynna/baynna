
const db = firebase.firestore();

let currentUser = null;

// انتظار تسجيل الدخول
firebase.auth().onAuthStateChanged(function(user) {
  if (!user) return;
  currentUser = user;
});

// متابعة
function followUser(targetUserId) {

  if (!currentUser) {
    alert("انتظر لحظة...");
    return;
  }

  // إضافة في following
  db.collection("users")
    .doc(currentUser.uid)
    .collection("following")
    .doc(targetUserId)
    .set({});

  // إضافة في followers
  db.collection("users")
    .doc(targetUserId)
    .collection("followers")
    .doc(currentUser.uid)
    .set({});

  // 🔥 إرسال إشعار
  db.collection("notifications").add({
    toUserId: targetUserId,
    text: "قام " + (currentUser.email || "مستخدم") + " بمتابعتك",
    createdAt: firebase.firestore.FieldValue.serverTimestamp()
  });

}

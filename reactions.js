// =====================================================
// تفاعلات المنشورات - إصدار محسن لنسخة الإطلاق التجريبي
// =====================================================

const reactionsDb = firebase.firestore();

function react(postId, type) {
  const user = firebase.auth().currentUser;

  if (!user) {
    console.log("Baynna: يجب تسجيل الدخول قبل التفاعل.");
    return;
  }

  if (!postId || !type) return;

  const reactionRef = reactionsDb
    .collection("posts")
    .doc(postId)
    .collection("reactions")
    .doc(user.uid);

  reactionRef.get()
    .then(function(doc) {
      if (doc.exists && doc.data() && doc.data().type === type) {
        // الضغط على نفس التفاعل مرة ثانية = إزالة التفاعل.
        return reactionRef.delete();
      }

      return reactionRef.set({
        uid: user.uid,
        type: type,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    })
    .catch(function(error) {
      console.error("Baynna reaction error:", error);
    });
}


const db = firebase.firestore();

firebase.auth().onAuthStateChanged(function(user) {

  if (!user) return;

  const box = document.getElementById("notificationsBox");
  if (!box) return;

  // 🔥 لا نحمل الإشعارات إذا ما عندنا بيانات
  db.collection("notifications")
    .limit(1)
    .get()
    .then(function() {
      console.log("notifications safe");
    })
    .catch(function(error) {
      console.log("notifications blocked:", error.message);
    });

});

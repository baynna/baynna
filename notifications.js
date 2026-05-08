const db = firebase.firestore();
let currentUser = null;

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) return;
  currentUser = user;
  loadNotifications();
});

function loadNotifications() {
  db.collection("notifications")
    .where("toUserId", "==", currentUser.uid)
    .orderBy("createdAt", "desc")
    .onSnapshot(function(snapshot) {

      const box = document.getElementById("notificationsBox");
      if (!box) return;

      box.innerHTML = "";

      snapshot.forEach(function(doc) {
        const n = doc.data();

        box.innerHTML += "<div style='background:#fff;padding:10px;margin:5px;border-radius:8px;'>"
          + n.text +
        "</div>";
      });

    });
}

const db = firebase.firestore();

let currentUser = null;

firebase.auth().onAuthStateChanged(function(user) {
  if (!user) return;
  currentUser = user;
  loadNotifications();
});

function loadNotifications() {

  const box = document.getElementById("notificationsBox");
  if (!box) return;

  // 🔥 لا تستخدم orderBy حتى لا تُرفض من القواعد/الفهارس
  db.collection("notifications")
    .where("toUserId", "==", currentUser.uid)
    .onSnapshot(function(snapshot) {

      box.innerHTML = "";

      snapshot.forEach(function(doc) {
        const n = doc.data();

        box.innerHTML += `
          <div style="background:#fff;padding:10px;margin:5px;border-radius:8px;">
            ${n.text || ""}
          </div>
        `;
      });

    }, function(error) {
      // لا نُظهر أي alert للمستخدم
      console.log("Notifications error:", error.message);
    });

}

const db = firebase.firestore();

let currentUser = null;

firebase.auth().onAuthStateChanged(function(user) {

  if (!user) return;

  currentUser = user;

  loadNotifications();
});

function loadNotifications() {

  db.collection("notifications")
    .where("toUserId", "==", currentUser

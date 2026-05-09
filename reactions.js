const db = firebase.firestore();

function react(postId, type) {

  const user = firebase.auth().currentUser;
  if (!user) return;

  const ref = db.collection("posts")
    .doc(postId)
    .collection("reactions")
    .doc(user.uid);

  ref.get().then((doc) => {

    if (doc.exists) {
      ref.update({ type: type });
    } else {
      ref.set({
        type: type,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      });
    }

  });

}

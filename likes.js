function likePost(postId) {
  db.collection("posts").doc(postId).update({
    likes: firebase.firestore.FieldValue.increment(1)
  }).then(() => {
    renderPosts();
  });
}

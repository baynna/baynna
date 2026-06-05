// =======================
// لايك المنشور (كما هو)
// =======================
function likePost(postId) {
  db.collection("posts").doc(postId).update({
    likes: firebase.firestore.FieldValue.increment(1)
  }).then(() => {
    renderPosts();
  }).catch((e) => {
    console.log(e);
  });
}


// =======================
// لايك التعليق (إضافة جديدة)
// =======================
function likeComment(commentId) {

  db.collection("comments").doc(commentId).update({
    likes: firebase.firestore.FieldValue.increment(1)
  })
  .then(() => {
    console.log("comment liked");
  })
  .catch((e) => {
    console.log(e);
  });

}

// =======================
// نظام التفاعلات الكامل
// =======================

function reactComment(commentId, type) {

  let userId = localStorage.getItem("userId");

  if (!userId) {
    userId = "user_" + Math.random().toString(36).substr(2, 9);
    localStorage.setItem("userId", userId);
  }

  const ref = db.collection("comments").doc(commentId);

  ref.get().then(function(doc) {

    if (!doc.exists) return;

    const data = doc.data();

    let reactions = data.reactions || {};

    // 🔥 كل مستخدم له تفاعل واحد فقط
    if (reactions[userId]) {
      alert("غيرت تفاعلك");
    }

    reactions[userId] = type;

    ref.update({
      reactions: reactions
    });

  }).catch((e) => {
    console.log(e);
  });

}


// =======================
// حساب التفاعلات
// =======================

function countReactions(reactions) {

  const counts = {
    like: 0,
    love: 0,
    laugh: 0,
    angry: 0,
    sad: 0,
    fire: 0
  };

  if (!reactions) return counts;

  Object.values(reactions).forEach(type => {
    if (counts[type] !== undefined) {
      counts[type]++;
    }
  });

  return counts;
}

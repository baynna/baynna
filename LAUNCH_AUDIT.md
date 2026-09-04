# بيننا — Launch Audit

## Branch under test

`valen/stabilize-v1`

## Verified by source inspection

- The composer uses `postTitleInput`, `text`, `postVisibility`, and `postImageInput`.
- Comment inputs use `commentText-{postId}`.
- Reply inputs use `replyText-{postId}-{commentId}`.
- Posts store `title`, `text`, `image`, `mood`, `visibility`, `name`, `uid`, `time`, and `likes` as an array of user IDs.
- Comments are nested at `posts/{postId}/comments/{commentId}`.
- Replies are nested at `posts/{postId}/comments/{commentId}/replies/{replyId}`.
- Notifications are nested at `users/{uid}/notifications/{notificationId}`.
- The current page already contains its own follow/unfollow implementation; the legacy `follow.js` is not loaded by the current `index.html`.
- The hardened runtime is loaded through `reactions.js` and replaces the critical publish, like, comment, reply, delete, login, register, logout, and notification handlers.
- The runtime now restores visible error feedback because the legacy page previously replaced `alert()` with a silent no-op.
- Registration creates the Firebase Auth account and attempts to create/merge the corresponding user profile document.
- Image rendering rejects non-HTTPS remote image URLs (except localhost) and lazy-loads allowed images.

## Important launch gates still external to source-only verification

1. Firebase Firestore security rules must be reviewed and deployed deliberately. The rules file in this branch is a draft and is **not claimed to be deployed**.
2. The feed currently performs a broad `posts.orderBy("time", "desc")` listener. Privacy-sensitive visibility rules must be designed together with compatible Firestore queries before enabling restrictive production rules; Firestore rules are not query filters.
3. The current user directory listener reads all `users` documents. Public profile data and private account fields should be separated or protected before a public launch.
4. A real browser session with Firebase Auth is still required to verify end-to-end login, registration, publishing, image upload, likes, comments, replies, follow/unfollow, notifications, editing, deletion, and private visibility.
5. GitHub Pages for `main` is not a valid test of this branch. This branch has not been published by this audit.

## Release decision

**Not yet marked production-ready.** Source-level stabilization has progressed, but the external Firebase configuration/rules and real browser verification remain release gates.

## Safety rule

Do not merge or publish this branch merely because this document exists. Publishing requires explicit authorization and a successful final verification pass.

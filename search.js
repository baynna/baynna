const db = firebase.firestore();

const searchInput = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

function searchUsers() {

    const keyword = searchInput.value.trim().toLowerCase();

    if (keyword === "") {
        searchResults.innerHTML = "";
        return;
    }

    db.collection("users").get().then(function(snapshot) {

        searchResults.innerHTML = "";

        snapshot.forEach(function(doc){

            const user = doc.data();

            const username = (user.username || "").toLowerCase();
            const fullname = (user.fullName || "").toLowerCase();

            if(
                username.includes(keyword) ||
                fullname.includes(keyword)
            ){

                const card = document.createElement("div");

                card.className = "search-card";

                card.innerHTML = `
                    <img src="${user.photoURL || 'https://via.placeholder.com/60'}">

                    <div>

                        <h3>${user.fullName || ""}</h3>

                        <p>@${user.username || ""}</p>

                    </div>
                `;

                card.onclick = function(){

                    window.location =
                    "profile.html?uid=" + doc.id;

                };

                searchResults.appendChild(card);

            }

        });

    });

}

searchInput.addEventListener("keyup", searchUsers);

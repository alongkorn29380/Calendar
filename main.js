function login(event) {
    event.preventDefault();

    const username = document.getElementById("usernameInput").value.trim();

    localStorage.setItem("username", username);

    window.location.href = "calendar.html";
}

// Make logo change perspective based on mouse position
const logoElem = document.querySelector("div.header>div.logo");
document.addEventListener("mousemove", (e) => {
    const { clientX: mx, clientY: my } = e;
    const { x, y, height, width } = logoElem.getBoundingClientRect();
    const constraint = 700;
    const calcX = -(my - y - (height / 2)) / constraint;
    const calcY = (mx - x - (width / 2)) / constraint;
    window.requestAnimationFrame(() => {
        logoElem.style.transform = `perspective(100px) rotateX(${calcX}deg) rotateY(${calcY}deg)`;
    });
});

// Add currently playing song on Spotify to the site
const aboutMeListElem = document.getElementById("about-me-list");
fetch("https://splaying.sohamsen.workers.dev/np/?uid=f4d46cc927d3cd6a203359693f0439d1ceab6da7ae884cb656a8589d65c91aea")
    .then(resp => resp.json())
    .then(data => {
        if (data.spotify_running !== true || data.error !== undefined) {
            return;
        };
        const d = data.item;
        const listItem = document.createElement("li");
        listItem.innerHTML = `I am currently listening to <a href="${d.external_urls.spotify}" class="link">${d.name}</a>`
            + ` by <a href="${d.artists[0].external_urls.spotify}" class="link">${d.artists[0].name}</a>.`;
        aboutMeListElem.append(listItem);
    });
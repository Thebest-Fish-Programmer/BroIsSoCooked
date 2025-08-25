const images = document.querySelectorAll('.moving-image');

function moveImages() {
    const maxY = 3000;
    const maxX = window.innerWidth - 950;

    images.forEach(img => {
        const x = Math.random() * maxX;
        const y = Math.random() * maxY;
        img.style.transform = `translate(${x}px, ${y}px)`;
    });
}

setInterval(moveImages, 3000);
moveImages();



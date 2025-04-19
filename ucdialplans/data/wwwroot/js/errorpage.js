var percentage = 0;
window.addEventListener('load', PercentProgress);

function PercentProgress() {
    percentage += parseInt(Math.random() * 10);
    if (percentage > 100) {
        percentage = 100;
    }
    document.getElementById("percentage").innerText = percentage;
    if (percentage == 100) { return; }
    ProgressInterval();
}

function ProgressInterval() {
    setTimeout(PercentProgress, Math.random() * (1000 - 500) + 500)
}
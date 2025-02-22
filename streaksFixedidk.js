const streakElement = document.createElement("div");
streakElement.className = "streak bg text-1";
streakElement.id = "streakelement";
streakElement.innerText = "Streak: 0";

const observer = new MutationObserver(() => {
    const killTextElement = document.getElementsByClassName("kill bg text-1")[0];
    const deathTextElement = document.getElementsByClassName("death bg text-1")[0];

    if (killTextElement && deathTextElement) {
        let killCount = parseInt(killTextElement.innerText) || 0;
        let deathCount = parseInt(deathTextElement.innerText) || 0;

        // Reset streak on death
        if (deathCount > 0) {
            streakElement.innerText = "Streak: 0";
        }

        // Increment streak on kill
        else if (killCount > 0) {
            let currentStreak = parseInt(streakElement.innerText.replace("Streak: ", "")) || 0;
            streakElement.innerText = `Streak: ${currentStreak + 1}`;
        }
    }
});

// Ensure streak resets when a death is detected
document.body.appendChild(streakElement);
const config = { subtree: true, childList: true };
observer.observe(document, config);

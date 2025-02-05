const script = document.createElement('script');
script.src = "https://akuma-doesnt-get-paid.github.io/Domshelperbotapi/Jmac/questClicker.js";
script.async = true; // Ensures the script loads asynchronously
document.head.appendChild(script);

script.onload = () => {
    console.log("questClicker Script loaded successfully!");
};

script.onerror = () => {
    console.error("Failed to load the questClicker script.");
};

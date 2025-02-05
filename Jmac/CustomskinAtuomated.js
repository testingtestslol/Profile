const script = document.createElement('script');
script.src = "https://akuma-doesnt-get-paid.github.io/Domshelperbotapi/Jmac/Customskin.js";
script.async = true; // Ensures the script loads asynchronously
document.head.appendChild(script);

script.onload = () => {
    console.log("Custom skin loaded successfully!");
};

script.onerror = () => {
    console.error("Failed to load the customSkin script.");
};

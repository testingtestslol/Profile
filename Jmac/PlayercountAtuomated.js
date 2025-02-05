const script = document.createElement('script');
script.src = "https://akuma-doesnt-get-paid.github.io/Domshelperbotapi/Jmac/Playercount.js";
script.async = true; // Ensures the script loads asynchronously
document.head.appendChild(script);

script.onload = () => {
    console.log("Playercount Script loaded successfully!");
};

script.onerror = () => {
    console.error("Failed to load the Playercount script.");
};

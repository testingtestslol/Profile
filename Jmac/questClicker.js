// ==UserScript==
// @name         BKC Auto Quest Claimer
// @description  It should auto claim quests, like previously in BKC client.
// @version      0.1
// @author       infi, boden, skywalk
// @github       blah.
// ==/UserScript==

setInterval(async () => {
    if (localStorage.token === "") return;
    let quests = await fetch("https://api.kirka.io/api/quests", {
        "headers": {
            "accept": "application/json, text/plain, */*",
            "authorization": "Bearer " + localStorage.getItem("token"),
            "content-type": "application/json;charset=UTF-8",
            "csrf": "token",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-site"
        },
        "referrer": "https://kirka.io/",
        "referrerPolicy": "strict-origin-when-cross-origin",
        "body": "{}",
        "method": "POST",
        "mode": "cors",
        "credentials": "include"
    });
    if (quests.status >= 400) return
    quests = await quests.json();
    for (let quest of quests) {
        if (quest.progress.completed && !quest.progress.rewardTaken) {
            let claimQuest = await fetch("https://api.kirka.io/api/rewards/take", {
                "headers": {
                    "accept": "application/json, text/plain, */*",
                    "authorization": "Bearer " + localStorage.getItem("token"),
                    "content-type": "application/json;charset=UTF-8",
                    "csrf": "token",
                    "sec-fetch-mode": "cors",
                    "sec-fetch-site": "same-site"
                },
                "referrer": "https://kirka.io/",
                "referrerPolicy": "strict-origin-when-cross-origin",
                body: JSON.stringify({source: "quest:" + quest.id}),
                "method": "POST",
                "mode": "cors",
                "credentials": "include"
            });
            console.log("claimed quest", await claimQuest);

        }
    }
}, 15000);

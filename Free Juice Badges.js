let shortId = "Y2OOB2"; //shortid (6 chars long)
let linked_badge = true; //true or false
let booster_badge = true; //true or false
let badges = [];
badges.push("https://akuma-doesnt-get-paid.github.io/Domshelperbotapi/Untitled_2.webp") //example, you can insert as many as you want
let type = "override"; //keep original badges and add only your badge = append | remove all original badges only add your own badge = override

/* DONT CHANGE ANYTHING BELOW */

const originalFetch = window.fetch;

window.fetch = async function (...args) {
  if (args[0] === "https://juice-api.irrvlo.xyz/api/customizations") {
    const response = await originalFetch(...args);

    const clonedResponse = response.clone();

    let data = await clonedResponse.json();

    let obj = {
      shortId: shortId,
      booster: booster_badge,
      badges: badges,
    };
    if (linked_badge) {
      obj.discord = "123";
    }
    if (type === "append") {
      data.push(obj);
    } else if (type === "override") {
      data = [obj];
    }

    const modifiedResponse = new Response(JSON.stringify(data), {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });

    return modifiedResponse;
  }

  return originalFetch(...args);
};

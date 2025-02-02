//I (Sheriff) made this script so everybody can use the badges for free only for yousefl
//People shouldn't be forced to link

//The script manipulates the api request for the juice, it might not work first try, just refresh it and it worked

let shortId = "Y2OOB2"; //shortid (6 chars long)
let linked_badge = true; //true or false
let booster_badge = true; //true or false
let badges = [];
badges.push("file:///C:/Users/Public.DESKTOP-HMN7ECH/Desktop/Untitled_2.webp") //example, you can insert as many as you want
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

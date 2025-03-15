const fetch = require("node-fetch");
const WebSocket = require("ws");

class KirkaAPI {
  constructor(url) {
    this.websocket = null;
    if (typeof url !== "undefined") {
      this.url = url;
    } else {
      this.url = `kirka.io`;
    }
  }

  //
  // WebSocket affiliated Stuff
  //

  connectWebSocket(token) {
    if (token) {
      this.websocket = new WebSocket(`wss://chat.${this.url}/`, token);
    } else {
      this.websocket = new WebSocket(`wss://chat.${this.url}/`);
    }

    this.websocket.on("open", () => {
      console.log("WebSocket connection established.");
    });

    this.websocket.on("message", (message) => {
      message = JSON.parse(message);
      if (this.onMessage) {
        this.onMessage(message);
      }
      if (this.tradeMessage) {
        if (message["type"] == 13 && message["user"] == null) {
          this.tradeMessage(message);
        }
      }
      if (this.tradeSend) {
        if (
          message["type"] == 13 &&
          message["user"] == null &&
          message["message"].includes("is offering their")
        ) {
          this.tradeSend(message);
        }
      }
      if (this.tradeAccepted) {
        if (
          message["type"] == 13 &&
          message["user"] == null &&
          message["message"].includes("** accepted **") &&
          message["message"].includes("**'s offer")
        ) {
          this.tradeAccepted(message);
        }
      }
      if (this.tradeCancel) {
        if (
          message["type"] == 13 &&
          message["user"] == null &&
          message["message"].includes("cancelled their trade")
        ) {
          this.tradeCancel(message);
        }
      }
    });

    this.websocket.on("error", () => {
      if (this.onclose) {
        this.onclose();
      }
    });

    this.websocket.on("close", () => {
      if (this.onclose) {
        this.onclose();
      }
    });
  }

  sendGlobalChat(message) {
    if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
      this.websocket.send(message);
      return "POSTED MESSAGE";
    } else {
      return "WebSocket is not open or not connected.";
    }
  }
  setTrademessageHandler(handler) {
    this.tradeMessage = handler;
  }

  setOnTradeAccepted(handler) {
    this.tradeAccepted = handler;
  }

  setOnTradeSend(handler) {
    this.tradeSend = handler;
  }

  setOnTradeCancel(handler) {
    this.tradeCancel = handler;
  }

  setOnCloseHandler(handler) {
    this.onclose = handler;
  }

  setOnMessageHandler(handler) {
    this.onMessage = handler;
  }

  closeWebSocket() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
    }
  }

  //
  // user
  //

  async getStats(shortId) {
    try {
      shortId = shortId.toUpperCase();
      shortId = shortId.replace(/#/gm, "");
      let req = await fetch(`https://api.${this.url}/api/user/getProfile`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${shortId}","isShortId":true}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getStatsLongID(longid) {
    try {
      let req = await fetch(`https://api.${this.url}/api/user/getProfile`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${longid}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getMyProfile(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/user`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async sendFriendrequest(token, shortId) {
    try {
      shortId = shortId.toUpperCase();
      shortId = shortId.replace(/#/gm, "");
      let req = await fetch(
        `https://api.${this.url}/api/user/offerFriendship`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"shortId":"${shortId}"}`,
          method: "POST",
        },
      );
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async acceptFriendrequest(token, longid) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/user/acceptFriendship`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"userId":"${longid}"}`,
          method: "POST",
        },
      );
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async declineFriendrequest(token, longid) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/user/cancelFriendship`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"userId":"${longid}"}`,
          method: "POST",
        },
      );
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async removeFriend(token, longid) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/user/cancelFriendship`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"userId":"${longid}"}`,
          method: "POST",
        },
      );
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async rename(token, name) {
    try {
      let req = await fetch(`https://api.${this.url}/api/user/updateProfile`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"name":"${name}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  //
  // inventory
  //

  async getInventory(apikey, longid) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/inventory/get_${apikey}`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"id":"${longid}"}`,
          method: "POST",
        },
      );
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getMyInventory(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getAllItems(apikey) {
    try {
      if (apikey) {
        let req = await fetch(
          `https://api.${this.url}/api/inventory/getAllItems_${apikey}`,
          {
            headers: {
              accept: "application/json, text/plain, */*",
              "content-type": "application/json;charset=UTF-8",
            },
            body: null,
            method: "GET",
          },
        );
        return await req.json();
      } else {
        let url = `https://${this.url}`;
        let response = await fetch(url);
        let html = await response.text();
        let jsRegex = /\/assets\/js\/app\..{1,10}\.js/im;
        url = `https://${this.url}` + jsRegex.exec(html)[0];
        let app = await fetch(url);
        app = await app.text();
        let skinRegex = /\/.{3,12}\/skins\/.{1,25}\/texture\.webp/gm;
        let skins = new Set();
        let foundSkin;
        while ((foundSkin = skinRegex.exec(app)) !== null) {
          if (!foundSkin[0].includes("undefined")) {
            let tempArr = foundSkin[0].split("skins/");
            let finalSkin = (
              tempArr[0].replace(/\//gm, "") +
              ": " +
              tempArr[1].split("/texture.webp")[0]
            ).replace(/\\x20/gm, " ");
            skins.add(finalSkin);
          }
        }

        let charRegex = /'.\/.{1,20}\/texture.png'/gm;
        let chars = new Set();
        let foundChars;
        while ((foundChars = charRegex.exec(app)) !== null) {
          if (!foundChars[0].includes("undefined")) {
            let finalChar = foundChars[0]
              .replace(/\\x20/gm, " ")
              .replace(/\/texture\.png/gm, "")
              .replace(/\.\//gm, "")
              .replace(/\'/gm, "");
            chars.add(finalChar);
          }
        }
        let skinobject = { skins: [...skins], characters: [...chars] };
        return skinobject;
      }
    } catch (e) {
      return e;
    }
  }

  async openChest(token, itemId) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory/openChest`, {
        headers: {
          accept: "application/json, text/plain, /",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${itemId}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async openGoldenChest(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory/openChest`, {
        headers: {
          accept: "application/json, text/plain, /",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"077a4cf2-7b76-4624-8be6-4a7316cf5906"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async openIceChest(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory/openChest`, {
        headers: {
          accept: "application/json, text/plain, /",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"ec230bdb-4b96-42c3-8bd0-65d204a153fc"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async openWoodChest(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory/openChest`, {
        headers: {
          accept: "application/json, text/plain, /",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"71182187-109c-40c9-94f6-22dbb60d70ee"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async openCharacterCard(token, itemId) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/inventory/openCharacterCard`,
        {
          headers: {
            accept: "application/json, text/plain, /",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"id":"${itemId}"}`,
          method: "POST",
        },
      );
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async openColdCharacterCard(token) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/inventory/openCharacterCard`,
        {
          headers: {
            accept: "application/json, text/plain, /",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"id":"723c4ba7-57b3-4ae4-b65e-75686fa77bf2"}`,
          method: "POST",
        },
      );
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async openGirlsBandCharacterCard(token) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/inventory/openCharacterCard`,
        {
          headers: {
            accept: "application/json, text/plain, /",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"id":"723c4ba7-57b3-4ae4-b65e-75686fa77bf1"}`,
          method: "POST",
        },
      );
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async openPartyCharacterCard(token) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/inventory/openCharacterCard`,
        {
          headers: {
            accept: "application/json, text/plain, /",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"id":"6281ed5a-663a-45e1-9772-962c95aa4605"}`,
          method: "POST",
        },
      );
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async openSoldiersCharacterCard(token) {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/inventory/openCharacterCard`,
        {
          headers: {
            accept: "application/json, text/plain, /",
            authorization: `Bearer ${token}`,
            "content-type": "application/json;charset=UTF-8",
          },
          body: `{"id":"9cc5bd60-806f-4818-a7d4-1ba9b32bd96c"}`,
          method: "POST",
        },
      );
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async equipItem(token, itemId) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory/take`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${itemId}"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async listItem(token, itemId, price) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory/market`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${itemId}","price":${price}}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async quickSell(token, itemId, amount) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory/sell`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${itemId}","amount":${amount}}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async quickSellOne(token, itemId) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inventory/sell`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${itemId}","amount":1}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  //
  // market
  //

  async getMarket(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/market`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: '{"search":"","rarity":""}',
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async searchMarket(token, skin, rarity) {
    try {
      if (!skin) {
        skin = "";
      }
      if (!rarity) {
        rarity = "";
      }
      let req = await fetch(`https://api.${this.url}/api/market`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"search":"${skin}","rarity":"${rarity}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async marketBuy(token, longid, itemId) {
    try {
      let req = await fetch(`https://api.${this.url}/api/market/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"userId":"${longid}","itemId":"${itemId}"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  //
  // rewards
  //

  async getRewards(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/rewards`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getAds(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/rewards/ad`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getAdReward() {
    try {
      let req = await fetch(`https://api.${this.url}/api/rewards/ad`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async claimRewards(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/rewards/take`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async claimAd(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/rewards/claimAd`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  //
  // clans
  //

  async getClan(name) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/${name}`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async inviteClan(token, shortId) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/invite`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"shortId":"${shortId}"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async getMyClan(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/mine`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async updateClanDescription(token, clanId, description) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/updateClan`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${clanId} ","description":"${description}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async updateClanDiscordLink(token, clanId, discordLink) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/updateClan`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${clanId} ","discordLink":"${discordLink}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async acceptInvite(token, inviteId) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/acceptInvite`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"inviteId":"${inviteId}"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async declineInvite(token, inviteId) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/cancelInvite`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"inviteId":"${inviteId}"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async leaveClan(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/leave`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async setRole(token, longid, role) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/updateMember`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"memberId":"${longid}","role":"${role}"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async setOfficer(token, longid) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/updateMember`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"memberId":"${longid}","role":"OFFICER"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async setNewbie(token, longid) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/updateMember`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"memberId":"${longid}","role":"NEWBIE"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }
  async setLeader(token, longid) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/updateMember`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"memberId":"${longid}","role":"LEADER"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async clanKick(token, longid) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/kickMember`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"memberId":"${longid}"}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async createClan(token, name) {
    try {
      let req = await fetch(`https://api.${this.url}/api/clans/create`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "accept-language": "de",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"name":"${name}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  //
  // notification
  //

  async getNotification(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/notification`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async sawNotification(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/notification/saw`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  //
  // leaderboard
  //

  async getSoloLeaderboard() {
    try {
      let req = await fetch(`https://api.${this.url}/api/leaderboard/solo`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }
  async getClanLeaderboard() {
    try {
      let req = await fetch(
        `https://api.${this.url}/api/leaderboard/clanChampionship`,
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
          },
          body: null,
          method: "GET",
        },
      );
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  //
  // shop
  //

  async getSets() {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/sets`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getBundles() {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/bundles`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async storeBuy(token, id) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${id}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async storeBuyset(token, id) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buySet`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":"${id}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async buyWood(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":1}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async buyIce(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":2}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async buyGolden(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":3}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async buyParty(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":4}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async buySoldiers(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":5}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async buyGirlsBand(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":6}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  async buyCold(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop/buy`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"id":30}`,
        method: "POST",
      });
      let status = await req.status;
      try {
        let json = await req.json();
        if (json) {
          return json;
        } else {
          return status;
        }
      } catch {
        return status;
      }
    } catch (e) {
      return e;
    }
  }

  //
  // quests
  //

  async getAllQuests(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/quests`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: "{}",
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getDailyQuests(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/quests`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: '{"type":"daily"}',
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getEventQuests(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/quests`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: '{"type":"event"}',
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getHourlyQuests(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/quests`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: '{"type":"hourly"}',
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getQuests(token, type) {
    try {
      let req = await fetch(`https://api.${this.url}/api/quests`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: `{"type":"${type}"}`,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  //
  // content
  //

  async getVideos() {
    try {
      let req = await fetch(`https://api.${this.url}/api/videos`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getStreams() {
    try {
      let req = await fetch(`https://api.${this.url}/api/twitch`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  //
  // matchmaker
  //

  async getLobbies(region) {
    try {
      let req = await fetch(`https://${region}.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getEULobbies() {
    try {
      let req = await fetch(`https://eu1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getNALobbies() {
    try {
      let req = await fetch(`https://na1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getSALobbies() {
    try {
      let req = await fetch(`https://sa1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getASIALobbies() {
    try {
      let req = await fetch(`https://asia1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getOCELobbies() {
    try {
      let req = await fetch(`https://oceania1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getSTAGINGLobbies() {
    try {
      let req = await fetch(`https://staging-na.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  async getPlayercount(region) {
    let playercountnumber = 0;
    try {
      let req = await fetch(`https://${region}.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      req.forEach((element) => {
        playercountnumber += element.clients;
      });
    } catch {}
    return playercountnumber;
  }

  async getEUPlayercount() {
    let playercountnumber = 0;
    try {
      let req = await fetch(`https://eu1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      req.forEach((element) => {
        playercountnumber += element.clients;
      });
    } catch {}
    return playercountnumber;
  }

  async getNAPlayercount() {
    let playercountnumber = 0;
    try {
      let req = await fetch(`https://na1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      req.forEach((element) => {
        playercountnumber += element.clients;
      });
    } catch {}
    return playercountnumber;
  }

  async getSAPlayercount() {
    let playercountnumber = 0;
    try {
      let req = await fetch(`https://sa1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      req.forEach((element) => {
        playercountnumber += element.clients;
      });
    } catch {}
    return playercountnumber;
  }

  async getASIAPlayercount() {
    let playercountnumber = 0;
    try {
      let req = await fetch(`https://asia1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      req.forEach((element) => {
        playercountnumber += element.clients;
      });
    } catch {}
    return playercountnumber;
  }

  async getOCEPlayercount() {
    let playercountnumber = 0;
    try {
      let req = await fetch(`https://oceania1.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      req.forEach((element) => {
        playercountnumber += element.clients;
      });
    } catch {}
    return playercountnumber;
  }

  async getSTAGINGPlayercount() {
    let playercountnumber = 0;
    try {
      let req = await fetch(`https://staging-na.${this.url}/matchmake/`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      req.forEach((element) => {
        playercountnumber += element.clients;
      });
    } catch {}
    return playercountnumber;
  }

  //
  // NO API FETCHES
  //

  async getCharacterRender(skinname) {
    try {
      let regexRenderUrl = /"assets\/img\/render\.[A-Za-z0-9]{0,20}\.png"/gm;
      let url = `https://${this.url}`;
      let response = await fetch(url);
      let html = await response.text();
      let jsFileRegex = /\/assets\/js\/chunk-.{1,10}\..{1,10}\.js/gim;
      const jsFileMatches = html.match(jsFileRegex);

      for (const item of jsFileMatches) {
        url = `https://${this.url}${item}`;
        let jsChunkFile = await fetch(url);
        jsChunkFile = await jsChunkFile.text();
        if (
          jsChunkFile.includes("Kod") &&
          jsChunkFile.includes("assets/img/render")
        ) {
          let charsearching = jsChunkFile
            .split('"./' + skinname + '/render.png":')[1]
            .split('",')[0]
            .replace(/"/gm, "")
            .replace(/ /gm, "");
          let CopyOfTheChunkFile = jsChunkFile;
          let RenderUrlFinder = CopyOfTheChunkFile.split(charsearching + ":");
          RenderUrlFinder = RenderUrlFinder[1];
          if (RenderUrlFinder == undefined) {
            RenderUrlFinder = CopyOfTheChunkFile.split(charsearching + '":');
            RenderUrlFinder = RenderUrlFinder[1];
          }

          try {
            RenderUrlFinder = RenderUrlFinder.split("},");
            RenderUrlFinder = RenderUrlFinder[0];
            RenderUrlFinder = RenderUrlFinder.split("exports")[1];

            if (
              RenderUrlFinder.includes("data:image/") &&
              RenderUrlFinder.includes("base64")
            ) {
              //Base64
              let Base64RenderUrlFinder = RenderUrlFinder.split('"')[1];
              return Base64RenderUrlFinder;
            } else {
              //Normal
              let UrlRenderUrlFinder = regexRenderUrl.exec(RenderUrlFinder)[0];
              UrlRenderUrlFinder = UrlRenderUrlFinder.replace(
                /"/gm,
                "",
              ).replace(/ /gm, "");
              return `https://${this.url}/${UrlRenderUrlFinder}`;
            }
          } catch {}
        }
      }
      return null;
    } catch (e) {
      return e;
    }
  }

  async getLevelRewards() {
    try {
      let url = `https://${this.url}`;
      let response = await fetch(url);
      let html = await response.text();
      let jsFileRegex = /\/assets\/js\/chunk-.{1,10}\..{1,10}\.js/gim;
      const jsFileMatches = html.match(jsFileRegex);

      for (const item of jsFileMatches) {
        url = `https://${this.url}${item}`;
        let jsChunkFile = await fetch(url);
        jsChunkFile = await jsChunkFile.text();
        if (
          jsChunkFile.includes("xpSinceLastLevel") &&
          jsChunkFile.includes("xpUntilNextLevel") &&
          jsChunkFile.includes("Tomahawk")
        ) {
          let CopyOfTheChunkFile = jsChunkFile;
          CopyOfTheChunkFile = CopyOfTheChunkFile.split("={2:")[1];
          CopyOfTheChunkFile = '{"2":' + CopyOfTheChunkFile;
          CopyOfTheChunkFile = CopyOfTheChunkFile.split(";")[0];
          let NumbersConverted = CopyOfTheChunkFile.replace(
            /,(\d{1,3}):/gm,
            ',"$1":',
          );

          let NameConverted = NumbersConverted.replace(/name/gm, '"name"');
          let AmountConverted = NameConverted.replace(/amount/gm, '"amount"');
          let HiddenConverted = AmountConverted.replace(/hidden/gm, '"hidden"');
          let ImagesRemoved1 = HiddenConverted.replace(
            /,img:.\(".{1,6}"\)/gm,
            "",
          );
          let NumberTranslated1 = ImagesRemoved1.replace(/!1/gm, "0");
          let NumberTranslated2 = NumberTranslated1.replace(/!0/gm, "1");
          let ImagesRemoved2 = NumberTranslated2.replace(/,img:0/gm, "");
          let jsonobject = JSON.parse(ImagesRemoved2);
          return jsonobject;
        }
      }
      return null;
    } catch (e) {
      return e;
    }
  }

  async pricebvl(skinname) {
    try {
      let req = await fetch(
        "https://opensheet.elk.sh/1tzHjKpu2gYlHoCePjp6bFbKBGvZpwDjiRzT9ZUfNwbY/Alphabetical",
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
          },
          body: null,
          method: "GET",
        },
      );
      req = await req.json();
      let found = false;
      let value = 0;
      skinname = skinname.toLowerCase();
      if (Array.isArray(req)) {
        req.forEach((listitem) => {
          if (
            found == false &&
            listitem &&
            listitem["Skin Name"] &&
            listitem["Price"]
          ) {
            if (
              listitem["Skin Name"].toLowerCase() == skinname &&
              found == false
            ) {
              found = true;
              value = Number(
                listitem["Price"]
                  .split(" ")[0]
                  .split("?")[0]
                  .replace(/\,/gm, "")
                  .replace(/\./gm, ""),
              );
            }
          }
        });
      }
      if (isNaN(value)) {
        value = 0;
      }
      return value;
    } catch (e) {
      return e;
    }
  }

  async priceyzzzmtz(skinname) {
    try {
      let req = await fetch(
        "https://opensheet.elk.sh/1VqX9kwJx0WlHWKCJNGyIQe33APdUSXz0hEFk6x2-3bU/Sorted+View",
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
          },
          body: null,
          method: "GET",
        },
      );
      req = await req.json();
      let found = false;
      let value = 0;
      skinname = skinname.toLowerCase();
      if (Array.isArray(req)) {
        req.forEach((listitem) => {
          if (
            found == false &&
            listitem &&
            listitem["Name"] &&
            listitem["Base Value"]
          ) {
            if (listitem["Name"].toLowerCase() == skinname && found == false) {
              found = true;
              value = Number(
                listitem["Base Value"]
                  .split(" ")[0]
                  .split("?")[0]
                  .replace(/\,/gm, "")
                  .replace(/\./gm, ""),
              );
            }
          }
        });
      }
      if (isNaN(value)) {
        value = 0;
      }
      return value;
    } catch (e) {
      return e;
    }
  }

  async pricecustom(skinname, namefield, pricefield, opensheeturl) {
    try {
      let req = await fetch(`${opensheeturl}`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      let found = false;
      let value = 0;
      skinname = skinname.toLowerCase();
      if (Array.isArray(req)) {
        req.forEach((listitem) => {
          if (
            found == false &&
            listitem &&
            listitem[namefield] &&
            listitem[pricefield]
          ) {
            if (
              listitem[namefield].toLowerCase() == skinname &&
              found == false
            ) {
              found = true;
              value = Number(
                listitem[pricefield]
                  .split(" ")[0]
                  .split("?")[0]
                  .replace(/\,/gm, "")
                  .replace(/\./gm, ""),
              );
            }
          }
        });
      }
      if (isNaN(value)) {
        value = 0;
      }
      return value;
    } catch (e) {
      return e;
    }
  }

  async inventoryvaluebvl(inventory) {
    try {
      let req = await fetch(
        "https://opensheet.elk.sh/1tzHjKpu2gYlHoCePjp6bFbKBGvZpwDjiRzT9ZUfNwbY/Alphabetical",
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
          },
          body: null,
          method: "GET",
        },
      );
      req = await req.json();
      let value = 0;
      inventory.forEach((inventoryitem) => {
        let found = false;
        if (Array.isArray(req)) {
          req.forEach((listitem) => {
            if (listitem && listitem["Price"] && listitem["Skin Name"]) {
              let number = listitem["Price"]
                .split(" ")[0]
                .split("?")[0]
                .replace(/\,/gm, "")
                .replace(/\./gm, "");
              if (
                listitem["Skin Name"].toLowerCase() ==
                  inventoryitem.item.name.toLowerCase() &&
                found == false
              ) {
                found = true;
                if (isNaN(number)) {
                  value += inventoryitem.item.salePrice * inventoryitem.amount;
                } else {
                  value +=
                    Number(number.split(" ")[0].replace(/,/gm, "")) *
                    inventoryitem.amount;
                }
              }
            }
          });
        }
        if (found == false) {
          value += inventoryitem.item.salePrice * inventoryitem.amount;
        }
      });
      return value;
    } catch (e) {
      return e;
    }
  }

  async inventoryvalueyzzzmtz(inventory) {
    try {
      let req = await fetch(
        "https://opensheet.elk.sh/1VqX9kwJx0WlHWKCJNGyIQe33APdUSXz0hEFk6x2-3bU/Sorted+View",
        {
          headers: {
            accept: "application/json, text/plain, */*",
            "content-type": "application/json;charset=UTF-8",
          },
          body: null,
          method: "GET",
        },
      );
      req = await req.json();
      let value = 0;
      inventory.forEach((inventoryitem) => {
        let found = false;
        if (Array.isArray(req)) {
          req.forEach((listitem) => {
            if (listitem && listitem["Base Value"] && listitem["Name"]) {
              let number = listitem["Base Value"]
                .split(" ")[0]
                .split("?")[0]
                .replace(/\,/gm, "")
                .replace(/\./gm, "");
              if (
                listitem["Name"].toLowerCase() ==
                  inventoryitem.item.name.toLowerCase() &&
                found == false
              ) {
                found = true;
                if (isNaN(number)) {
                  value += inventoryitem.item.salePrice * inventoryitem.amount;
                } else {
                  value +=
                    Number(number.split(" ")[0].replace(/,/gm, "")) *
                    inventoryitem.amount;
                }
              }
            }
          });
        }
        if (found == false) {
          value += inventoryitem.item.salePrice * inventoryitem.amount;
        }
      });
      return value;
    } catch (e) {
      return e;
    }
  }

  async inventoryvaluecustom(inventory, namefield, pricefield, opensheeturl) {
    try {
      let req = await fetch(`${opensheeturl}`, {
        headers: {
          accept: "application/json, text/plain, */*",
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      req = await req.json();
      let value = 0;
      inventory.forEach((inventoryitem) => {
        let found = false;
        if (Array.isArray(req)) {
          req.forEach((listitem) => {
            if (listitem && listitem[pricefield] && listitem[namefield]) {
              let number = listitem[pricefield]
                .split(" ")[0]
                .split("?")[0]
                .replace(/\,/gm, "")
                .replace(/\./gm, "");
              if (
                listitem[namefield].toLowerCase() ==
                  inventoryitem.item.name.toLowerCase() &&
                found == false
              ) {
                found = true;
                if (isNaN(number)) {
                  value += inventoryitem.item.salePrice * inventoryitem.amount;
                } else {
                  value +=
                    Number(number.split(" ")[0].replace(/,/gm, "")) *
                    inventoryitem.amount;
                }
              }
            }
          });
        }
        if (found == false) {
          value += inventoryitem.item.salePrice * inventoryitem.amount;
        }
      });
      return value;
    } catch (e) {
      return e;
    }
  }

  //
  // NO API STUFF
  //

  async requestErrorCodeTranslate(requestcode) {
    switch (requestcode) {
      case 101:
        return "User is already your friend";
        break;
      case 102:
        return "User not found";
        break;
      case 103:
        return "User cannot change name";
        break;
      case 104:
        return "Already sent friend request";
        break;
      case 105:
        return "User hasn't sent you a friend request";
        break;
      case 106:
        return "User already sent you a friend request";
        break;
      case 107:
        return "You do not have shared connections with this user";
        break;
      case 108:
        return "You don't have enough coins";
        break;
      case 109:
        return "You cannot buy your own item";
        break;
      case 110:
        return "Your profile cannot contain bad words";
        break;
      case 201:
        return "Item is not in the user's inventory";
        break;
      case 202:
        return "Item already selected";
        break;
      case 203:
        return "Item not selectable";
        break;
      case 204:
        return "Item cannot be sold";
        break;
      case 205:
        return "Item cannot be opened";
        break;
      case 206:
        return "User doesn't have this amount of the item";
        break;
      case 207:
        return "Item is locked. Reason: trade offer";
        break;
      case 301:
        return "Item not found";
        break;
      case 302:
        return "Leader positions error";
        break;
      case 303:
        return "Item ID should exist";
        break;
      case 401:
        return "Clan name already taken";
        break;
      case 402:
        return "You can create only one clan";
        break;
      case 403:
        return "Clan not found";
        break;
      case 404:
        return "User already invited to the clan";
        break;
      case 405:
        return "User is in this clan";
        break;
      case 406:
        return "User already belongs to another clan";
        break;
      case 407:
        return "User is not a clan memeber";
        break;
      case 408:
        return "Invite not found or not relate to the user";
        break;
      case 409:
        return "Your clan name cannot contain bad words";
        break;
      case 501:
        return "Shop element not found";
        break;
      case 502:
        return "Not enough money";
        break;
      case 503:
        return "Item already purchased";
        break;
      case 504:
        return "You can already change your name";
        break;
      case 601:
        return "This item isn't for sale anymore";
        break;
      case 602:
        return "You need level 10 to use the market";
        break;
      case 801:
        return "You have not linked your Twitch account";
        break;
      case 802:
        return "Token expired, re-connect your Twitch account";
        break;
      case 9901:
        return "Database error";
        break;
      case 9902:
        return "You do not have permission for this";
        break;
      case 9903:
        return "Cannot do it to yourself";
        break;
      case 9904:
        return "Exceeded length limit";
        break;
      case 9905:
        return "Notification not found or not relate to the user";
        break;
      case 9906:
        return "Something went wrong";
        break;
      case 9907:
        return "Small level for this action";
        break;
      case 9908:
        return "Your friend exceeds the friends limit";
        break;
      case 9909:
        return "Exceeded limit of friend requests per day";
        break;
      case 9910:
        return "Rate limit exceeded";
        break;
      case 9911:
        return "Service temporary unavailable";
        break;
      default:
        return "Unknown error";
        break;
    }
  }

  //
  // FORBIDDEN RESOURCES
  //

  // 20th October 2023 - Forbidden Resource
  async getShop(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/shop`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "GET",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }

  // 20th October 2023 - Forbidden Resource
  async reports(token) {
    try {
      let req = await fetch(`https://api.${this.url}/api/inspector/reports`, {
        headers: {
          accept: "application/json, text/plain, */*",
          authorization: `Bearer ${token}`,
          "content-type": "application/json;charset=UTF-8",
        },
        body: null,
        method: "POST",
      });
      return await req.json();
    } catch (e) {
      return e;
    }
  }
}

module.exports = KirkaAPI;

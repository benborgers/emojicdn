import emojiDataset from "./emoji.json";

const signal = async (type, payload) => {
  await fetch("https://nom.telemetrydeck.com/v2/", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify([
      {
        appID: "A6A644A4-1CAC-4269-8090-37B2EA3DD238",
        clientUser: "default",
        type,
        payload,
      },
    ]),
  });
};

const emoji = [];

for (const e of emojiDataset) {
  emoji.push(e);
  if (e.skin_variations) {
    for (const v of Object.values(e.skin_variations)) {
      emoji.push({ ...e, ...v });
    }
  }
}

const ALLOWED_STYLES = ["apple", "google", "facebook", "twitter"];

const STYLE_TO_FOLDER = {
  apple: "img-apple-160",
  google: "img-google-136",
  facebook: "img-facebook-96",
  twitter: "img-twitter-72",
};

const leftPad = (string, length, character) => {
  return string.length >= length
    ? string
    : new Array(length - string.length + 1).join(character) + string;
};

const buildRedirectUrl = (style, path) => {
  return `https://cdn.jsdelivr.net/gh/iamcal/emoji-data/${STYLE_TO_FOLDER[style]}/${path}`;
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    const style = url.searchParams.get("style") ?? "apple";

    if (path === "") {
      return Response.redirect("https://github.com/benborgers/emojicdn");
    }

    if (path === "favicon.ico") {
      return new Response("");
    }

    if (path === "random") {
      const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
      return Response.redirect(buildRedirectUrl(style, randomEmoji.image));
    }

    if (!ALLOWED_STYLES.includes(style)) {
      await signal("invalid_style", { style });
      return new Response(
        "Invalid style. Valid styles are: " + ALLOWED_STYLES.join(", "),
        { status: 400 }
      );
    }

    const emojiText = decodeURIComponent(path);
    const code = Array.from(emojiText)
      .map((char) => leftPad(char.codePointAt(0).toString(16), 4, "0"))
      .join("-");

    const emojiData = emoji.find(
      (e) =>
        e.unified.toLowerCase() === code.toLowerCase() ||
        // -feof just means "display as emoji"
        e.unified.toLowerCase() === code.toLowerCase().replace(/-fe0f$/g, "") ||
        e.unified.toLowerCase() === code.toLowerCase() + "-fe0f" ||
        e.name.toLowerCase().replace(/ /g, "-") === emojiText.toLowerCase()
    );

    if (!emojiData) {
      await signal("emoji_not_found", { emoji: emojiText });
      return new Response("Emoji not found", { status: 404 });
    }

    return Response.redirect(buildRedirectUrl(style, emojiData.image));
  },
};

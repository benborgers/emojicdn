import emojiDataset from "./emoji.json";

const emoji: (typeof emojiDataset)[number][] = [];

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

const ONE_WEEK = 60 * 60 * 24 * 7;
const ONE_MONTH = 60 * 60 * 24 * 30;

const redirect = (url: string) => {
  return new Response("", {
    status: 302,
    headers: {
      Location: url,
      "Access-Control-Allow-Origin": "*",
    },
  });
};

const respondWithImage = async (url: string, random = false) => {
  const image = await fetch(url);
  return new Response(image.body, {
    headers: {
      "Content-Type": "image/png",
      "Access-Control-Allow-Origin": "*",
      "Cache-Control": random
        ? "public, s-maxage=0, max-age=0"
        : `public, s-maxage=${ONE_MONTH}, max-age=${ONE_WEEK}`,
    },
  });
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");
    const style = url.searchParams.get("style") ?? "apple";

    if (path === "") {
      return redirect("https://github.com/benborgers/emojicdn");
    }

    if (path === "favicon.ico") {
      return new Response("");
    }

    if (path === "random") {
      const randomEmoji = emoji[Math.floor(Math.random() * emoji.length)];
      return respondWithImage(buildRedirectUrl(style, randomEmoji.image), true);
    }

    if (!ALLOWED_STYLES.includes(style)) {
      return new Response(
        "Invalid style. Valid styles are: " + ALLOWED_STYLES.join(", "),
        { status: 400 }
      );
    }

    const emojiText = decodeURIComponent(path);
    const code = Array.from(emojiText)
      .map((char) => leftPad(char.codePointAt(0)!.toString(16), 4, "0"))
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
      return new Response("Emoji not found", { status: 404 });
    }

    return respondWithImage(buildRedirectUrl(style, emojiData.image));
  },
};

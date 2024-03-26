import emoji from "./emoji.json";

const leftPad = (string, length, character) => {
  return string.length >= length
    ? string
    : new Array(length - string.length + 1).join(character) + string;
};

export default {
  async fetch(request) {
    const url = new URL(request.url);
    const path = url.pathname.replace(/^\/+|\/+$/g, "");

    if (path === "") {
      return Response.redirect("https://github.com/benborgers/emojicdn");
    }

    if (path === "favicon.ico") {
      return new Response("");
    }

    const emojiText = decodeURIComponent(path);
    const code = Array.from(emojiText)
      .map((char) => leftPad(char.codePointAt(0).toString(16), 4, "0"))
      .join("-");

    const emojiData = emoji.find(
      (e) => e.unified.toLowerCase() === code.toLowerCase()
    );

    if (!emojiData) {
      return new Response("Emoji not found", { status: 404 });
    }

    return Response.redirect(
      `https://cdn.jsdelivr.net/gh/iamcal/emoji-data/img-apple-160/${emojiData.image}`
    );
  },
};

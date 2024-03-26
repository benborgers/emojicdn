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

    function emojiToUnicodeCodePoints(emoji) {
      // Get the code point for the emoji itself, in hexadecimal
      let baseCodePoint = emoji.codePointAt(0).toString(16).toUpperCase();

      // Initialize the result with the base emoji code point
      let result = baseCodePoint;

      // Check if there's a variation selector or another part (e.g., skin tone modifiers)
      // Since an emoji can be composed of multiple code points, we use `Array.from` to split it properly
      if (Array.from(emoji).length > 1) {
        // Iterate through each character (considering surrogate pairs) in the emoji string after the first character
        for (let i = 1; i < Array.from(emoji).length; i++) {
          // Get the code point of the current part of the emoji, in hexadecimal
          let additionalCodePoint = emoji
            .codePointAt(i)
            .toString(16)
            .toUpperCase();

          // Append the additional code point to the result string, with a dash
          result += "-" + additionalCodePoint;

          // Consider emojis that might be represented by more than one code point
          // Adjust the loop counter by the number of code units the current code point takes up
          // This is a precaution if emojis in future Unicode versions take up more than 2 code units
          if (emoji.codePointAt(i) > 0xffff) {
            i++; // Skip the next because we already handled a surrogate pair
          }
        }
      }

      return result;
    }

    console.log(decodeURIComponent(path));
    console.log("HERE: " + emojiToUnicodeCodePoints(decodeURIComponent(path)));

    return Response.json({});
  },
};

const fetch = require("node-fetch")

module.exports = async (req, res) => {
  let { emoji, style } = req.query
  const allowedStyles = {
    "apple": 237,
    "google": 263,
    "microsoft": 209,
    "messenger": 65,
    "samsung": 265,
    "whatsapp": 268,
    "twitter": 259,
    "facebook": 230,
    "joypixels": 257,
    "openmoji": 252,
    "emojidex": 112,
    "lg": 57,
    "htc": 122,
    "mozilla": 36,
    "softbank": 145
  }

  const send404Error = error => {
    res.setHeader("content-type", "text/plain")
    res.status(404).send(error)
  }

  const send400Error = error => {
    res.setHeader("content-type", "text/plain")
    res.status(400).send(error)
  }

  if (!style) style = "apple"
  style = style.toLowerCase()
  if (!allowedStyles[style])
    return send400Error("Invalid style.")

  // convert emoji to hex and use style number from emojipedia to find style within img srcset url
  const re = new RegExp(`srcset="(.+\/${allowedStyles[style]}.+${emoji.codePointAt(0).toString(16)}.+?png) 2x"`, "g");

  const request = await fetch(`https://emojipedia.org/${encodeURIComponent(emoji)}`)
  if (!request.ok)
    return send404Error("Emoji not found.")

  const text = await request.text()
  const urlArray = text.match(re)
  if (!urlArray)
    return send404Error("Style not found for this emoji.")
  const url = urlArray[0].match(/src.*?="(.*?)"/g).reverse()[0].replace(/src.*=/g, "").replace(/"/g, "").replace(" 2x", "")
  // take the last src/srcset url, since that's the highest quality
  const image = await fetch(url)

  res.setHeader("content-type", "image/png")
  res.setHeader("cache-control", "s-maxage=31000000") // cache on CDN for one year (the max)
  image.body.pipe(res)
}

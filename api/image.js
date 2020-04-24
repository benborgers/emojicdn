const fetch = require("node-fetch")

module.exports = async (req, res) => {
  let { emoji, style } = req.query
  const allowedStyles = [
    "apple",
    "google",
    "microsoft",
    "samsung",
    "whatsapp",
    "twitter",
    "facebook",
    "joypixels",
    "openmoji",
    "emojidex",
    "messenger",
    "lg",
    "htc",
    "mozilla"
  ]

  const send404Error = error => {
    res.status(404).send(error)
  }

  const send400Error = error => {
    res.status(400).send(error)
  }

  if (!style) style = "apple"
  if (!allowedStyles.includes(style.toLowerCase()))
    return send400Error("Invalid style.")
  const re = new RegExp(`<img.*src.*="(\\S.*?${style.toLowerCase()}\\S.*?)"`, "g"); // find style within img src/srcset url

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

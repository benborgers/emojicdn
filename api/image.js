const fetch = require("node-fetch")

module.exports = async (req, res) => {
  const { emoji } = req.query

  const sendError = () => {
    res.setHeader("content-type", "text/plain")
    res.status(404)
    res.send("Emoji not found.")
  }

  const request = await fetch(`https://emojipedia.org/${encodeURIComponent(emoji)}`)
  if(!request.ok) return sendError()

  const text = await request.text()
  const src = text.match(/<img.*srcset="(?<src>.+?)"/).groups.src.split(" ")[0]
  const image = await fetch(src)

  res.setHeader("cache-control", "s-maxage=31000000") // cache on CDN for one year (the max)
  image.body.pipe(res)
}
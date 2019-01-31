const fs = require('fs');
const fetch = require('node-fetch');
const puppeteer = require('puppeteer');

fs.mkdirSync('site');

fs.readdirSync('src').forEach(file => {
  if(file == 'index.html') {
    let html = fs.readFileSync('src/index.html', 'utf8');
    let date = (new Date()).toLocaleString('en-US', {
      timeZone: 'America/New_York',
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    })
    html = html.replace(/!NOW/g, date);
    fs.writeFileSync('site/index.html', html);
  } else {
    fs.copyFileSync('src/' + file, 'site/' + file)
  }
});

(async () => {
  let emojiLinks = [];
  await fetch('https://emojipedia.org/apple/')
    .then(res => res.text())
    .then(res => {
      let pieces = res.split('<ul class="emoji-grid">')[1].split('</ul>')[0].split('</li>');
      pieces.forEach(piece => {
        try {
          let link = piece.split('<a href="')[1].split('"')[0];
          emojiLinks.push('https://emojipedia.org' + link);
        } catch {
          console.log(`Failed to get individual page for emoji: ${piece}`)
        }
      })
    })
    
  const getEmoji = async url => {
    const page = await browser.newPage();
    await page.goto(url);
    let emoji = await page.title();
    emoji = emoji.split(' ')[0];
    let imageUrl = await page.evaluate(`document.querySelector('.vendor-image').querySelector('img').srcset`);
    imageUrl = imageUrl.split(' ')[0];
    
    await fetch(imageUrl)
      .then(res => {
        const dest = fs.createWriteStream(`site/${emoji}.png`);
        res.body.pipe(dest);
        
        dest.on('finish', () => {
          page.close();
          emojiToFetch = emojiToFetch + 1;
          console.log(`Downloaded ${emoji} (${emojiToFetch}/${emojiLinks.length})`)
          
          if(emojiToFetch < emojiLinks.length) {
            getEmoji(emojiLinks[emojiToFetch]);
          } else {
            console.log(`Done! Site built.`);
            process.exit();
          }
        })
      })
  }
    
  const browser = await puppeteer.launch({ headless: true });
  
  let emojiToFetch = 2750;
  getEmoji(emojiLinks[emojiToFetch]);
  
  for(let i=0; i<9; i++) {
    emojiToFetch = emojiToFetch + 1;
    getEmoji(emojiLinks[emojiToFetch]);
  }
})()
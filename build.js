const fs = require('fs');
const fetch = require('node-fetch');

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

const blacklist = ['#️⃣'];

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

  const emojiArray = [] 
    
  const getEmoji = async url => {
    fetch(url)
      .then(res => res.text())
      .then(res => {
        const emoji = res.split('<title>')[1].split(' ')[0].trim();
        emojiArray.push(emoji)
        if(!blacklist.includes(emoji)) {
          let imageUrl = /srcset="(?<imageUrl>.*?)"/.exec(res).groups.imageUrl.replace(' 2x', '');
          
          fetch(imageUrl)
            .then(res => {
              const dest = fs.createWriteStream(`site/${emoji}.png`);
              res.body.pipe(dest);
              
              dest.on('finish', () => {
                emojiToFetch = emojiToFetch + 1;
                console.log(`Downloaded ${emoji} (${emojiToFetch}/${emojiLinks.length})`);
                
                if(emojiToFetch < emojiLinks.length) {
                  getEmoji(emojiLinks[emojiToFetch]);
                } else {
                  console.log(`Done! Site built.`);
                  fs.writeFileSync(`site/list.json`, JSON.stringify(emojiArray))
                  process.exit();
                }
              })
            })
        } else {
          emojiToFetch = emojiToFetch + 1;
          getEmoji(emojiLinks[emojiToFetch]);
        }
      })
  }
  
  let emojiToFetch = 0;
  getEmoji(emojiLinks[emojiToFetch]);
  
  for(let i=0; i<9; i++) {
    emojiToFetch = emojiToFetch + 1;
    getEmoji(emojiLinks[emojiToFetch]);
  }
})()
const keepAlive = require('./keepAlive');
keepAlive(); // GỌI server lên

const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  retryLimit: Infinity, // luôn retry
  restRequestTimeout: 60000, // tăng timeout
});


const mangas = [
  {
    url: process.env.MANGA_URL_1,
    name: process.env.MANGA_NAME_1,
    lastChapter: null,
  },
  {
    url: process.env.MANGA_URL_2,
    name: process.env.MANGA_NAME_2,
    lastChapter: null,
  }
];

client.once('ready', () => {
  console.log(`🤖 Bot đã đăng nhập với tên ${client.user.tag}`);
  checkForNewChapters();
  setInterval(checkForNewChapters, 5 * 60 * 1000); // Kiểm tra mỗi 5 phút
});

client.on('guildMemberAdd', async (member) => {
  const channel = client.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (!channel) return;

  // Gửi text
  channel.send(
    `✨ **Thành viên mới** ✨\n` +
    `🎉 Chào mừng bạn **${member.user.username}** đến với server **和栗 薫子**!!!\n` +
    `💖 Chúc bạn có những phút giây thật tuyệt vời tại server của chúng tớ!`
  );

  // Gửi ảnh tĩnh từ file sẵn
  const { AttachmentBuilder } = require('discord.js');
  const path = require('path');
  const attachment = new AttachmentBuilder(path.join(__dirname, 'assets', 'nen-chao.png'));

  channel.send({ files: [attachment] });
});



async function checkForNewChapters() {
  for (const manga of mangas) {
    try {
      const response = await axios.get(manga.url);
      const $ = cheerio.load(response.data);
      let latestChapter = '';

      if (manga.url.includes('nettrom.com')) {
        latestChapter = $('.chapters a').first().text().trim();
      } else if (manga.url.includes('mangapill.com')) {
        latestChapter = $('a.chapter-link').first().text().trim();
      } else {
        console.log(`❗ Không nhận dạng được trang của ${manga.name}`);
        continue;
      }

      if (manga.lastChapter && latestChapter !== manga.lastChapter) {
        const channel = client.channels.cache.get(process.env.NOTIFY_CHANNEL_ID);
        if (channel) {
          channel.send(`📢 **${manga.name}** vừa ra chap mới: **${latestChapter}**!\n🔗 Link: ${manga.url}`);
        }
      }

      manga.lastChapter = latestChapter;
    } catch (error) {
      console.error(`❌ Lỗi khi kiểm tra ${manga.name}:`, error.message);
    }
  }
}

client.login(process.env.BOT_TOKEN);






const fetch = require("node-fetch"); // Nếu bạn chưa require

setInterval(() => {
  fetch("https://waguribot-production.up.railway.app")
    .then(() => console.log("🔁 Self-ping sent"))
    .catch((err) => console.error("❌ Self-ping failed:", err));
}, 5 * 60 * 1000); // 5 phút


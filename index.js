// index.js
const keepAlive = require('./keepAlive');
keepAlive(); // Gọi server lên

const express = require('express');
const app = express();


const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, EmbedBuilder, AttachmentBuilder } = require('discord.js');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config();

const chapterDataPath = path.join(__dirname, 'chapterData.json');

// đọc/ghi chap đã thông báo
function readChapterData() {
  try {
    return JSON.parse(fs.readFileSync(chapterDataPath));
  } catch {
    return {};
  }
}
function writeChapterData(data) {
  fs.writeFileSync(chapterDataPath, JSON.stringify(data, null, 2));
}

// client Discord
const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMembers],
  retryLimit: Infinity,
  restRequestTimeout: 60000,
});

const mangas = [
  { url: process.env.MANGA_URL_1, name: process.env.MANGA_NAME_1 },
  { url: process.env.MANGA_URL_2, name: process.env.MANGA_NAME_2 },
];

client.once('ready', () => {
  console.log(`🤖 Bot online as ${client.user.tag}`);
  checkForNewChapters(); // chạy ngay lúc startup

  setInterval(checkForNewChapters, 5 * 60 * 1000); // 5 phút tự check
});




client.on('guildMemberAdd', async member => {
  const channel = member.guild.channels.cache.get(process.env.WELCOME_CHANNEL_ID);
  if (!channel) return;

  // Đường dẫn ảnh lời chào
  const imgPath = path.join(__dirname, 'assets', 'nen-chao.png');
  const attachment = new AttachmentBuilder(imgPath);

  // Embed chào mừng
  const welcomeEmbed = new EmbedBuilder()
    .setTitle('✨ Thành viên mới ✨')
    .setDescription(
      `🌸 Chào mừng **${member.user.username}** đến với server **和栗 薫子**!\n\n` +
      `✅ Vào <#1345212870975164549> để giao lưu\n📚 Vào <#1352516703438897172> để dùng bot\n🎭 Ấn vô phòng thoại tên Tap để tạo phòng để tạo phòng <#1395600452866932756>\n\n` +
      `Chúc bạn có những phút giây tuyệt vời tại đây :heart_fly:`
    )
    .setColor('#FF92BB') // Hồng pastel giống server bạn
    .setImage('attachment://nen-chao.png'); // Gắn ảnh vào embed bằng attachment

  // Gửi 1 message duy nhất gồm embed + ảnh đính kèm
  channel.send({
    embeds: [welcomeEmbed],
    files: [attachment]
  });
});


// kiểm tra chap mới
async function checkForNewChapters() {
  const data = readChapterData();
  for (const manga of mangas) {
    try {
      const resp = await axios.get(manga.url);
      console.log('[CHECK]', manga.name, '-', manga.url);

      const $ = cheerio.load(resp.data);
      let latest = '';

      if (manga.url.includes('cuutruyen.net')) {
        latest = $('.chapters a').first().text().trim();
      } else if (manga.url.includes('mangapill.com')) {
        latest = $('a.chapter-link').first().text().trim();
      }

      const key = manga.name;
      const old = data[key];

      if (old && latest && latest !== old) {
        const ch = client.channels.cache.get(process.env.NOTIFY_CHANNEL_ID);
        if (ch) {
          ch.send(`📢 **${manga.name}** vừa ra chap mới: **${latest}**\n🔗 ${manga.url}`);
        }
      }

      data[key] = latest;
    } catch (err) {
      console.error(`❌ lỗi khi check ${manga.name}`, err.message);
    }
  }
  writeChapterData(data);
}

client.login(process.env.BOT_TOKEN);

// tự ping để giữ Replit không ngủ
const fetch = require('node-fetch');
const SELF = process.env.SELF_URL;
if (SELF) {
  setInterval(() => {
    fetch(SELF)
      .then(r => console.log('🔁 ping OK', r.status))
      .catch(e => console.error('❌ ping failed', e));
  }, 4 * 60 * 1000);
}





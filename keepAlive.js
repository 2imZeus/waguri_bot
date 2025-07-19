const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Bot is alive!');
});

function keepAlive() {
  app.listen(3000, () => {
    console.log('✅ Web server đang hoạt động ở cổng 3000');
  });
}

module.exports = keepAlive;

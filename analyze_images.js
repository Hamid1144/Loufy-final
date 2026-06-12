const https = require('https');

const urls = [
  "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205983/portfolio/base64_8ffa221224572bbd.webp",
  "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205985/portfolio/base64_c66ccad9a81c5e6f.webp",
  "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205987/portfolio/base64_8d2b98fcd72dccbe.webp",
  "https://res.cloudinary.com/dtr3yvjac/image/upload/v1781205988/portfolio/base64_31dcb4482ba62266.webp"
];

function getHeaders(url) {
  return new Promise((resolve) => {
    https.get(url, (res) => {
      resolve({
        url: url.split('/').pop(),
        size: res.headers['content-length'],
        type: res.headers['content-type']
      });
    }).on('error', (e) => {
      resolve({ url, error: e.message });
    });
  });
}

Promise.all(urls.map(getHeaders)).then(console.log);

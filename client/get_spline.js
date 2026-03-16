import https from 'https';

https.get('https://app.spline.design/community/file/264e7d01-1d82-4c97-8fc1-70888ad08ec0', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    const match = data.match(/https:\/\/prod\.spline\.design\/[a-zA-Z0-9_-]+\/scene\.splinecode/);
    if (match) {
      console.log('FOUND:', match[0]);
    } else {
      console.log('NOT FOUND');
    }
  });
}).on("error", (err) => {
  console.log("Error: " + err.message);
});

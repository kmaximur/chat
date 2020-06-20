const redis = require("redis")
let client
if (process.env.REDISTOGO_URL) {
    const rtg   = require("url").parse(process.env.REDISTOGO_URL);
    client = redis.createClient(rtg.port, rtg.hostname);
    client.auth(rtg.auth.split(":")[1]);
} else {
    client = redis.createClient();
}

client.on("error", function(error) {
    console.error('redis error: ', error);
});

module.exports = client
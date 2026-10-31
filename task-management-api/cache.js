const NodeCache = require("node-cache");

// Initialize cache with 60 seconds default TTL
const cache = new NodeCache({ stdTTL: 60 });

module.exports = cache;


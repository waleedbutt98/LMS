const METHOD = "http",
	IP = "localhost",
	BE_PORT = process.env.BE_PORT || 6968,
	URL = METHOD + "://" + IP,
	URI_BE = URL + ":" + BE_PORT;

module.exports = global.config = {
	METHOD: METHOD,
	IP: IP,
	BE_PORT: BE_PORT,
	URI_BE: URI_BE,
	URL: URL,
};

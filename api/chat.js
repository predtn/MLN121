const { handleChat, sendJson, setSecurityHeaders } = require("../server");

module.exports = async function handler(req, res) {
  setSecurityHeaders(res);

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    sendJson(res, 405, { error: "Endpoint này chỉ chấp nhận phương thức POST." });
    return;
  }

  await handleChat(req, res);
};

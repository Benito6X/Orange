const { clearSessionCookie } = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  clearSessionCookie(res);
  res.end(JSON.stringify({ ok: true }));
};

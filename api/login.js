const { setSessionCookie } = require('./_auth');

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  setSessionCookie(res);
  return res.end(JSON.stringify({ ok: true, pinDisabled: true }));
};

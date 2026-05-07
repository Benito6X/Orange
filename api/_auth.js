async function readBody(req) {
  return await new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => {
      try { resolve(data ? JSON.parse(data) : {}); }
      catch (_) { resolve({}); }
    });
  });
}

function requireAuth(req, res) {
  // TEST MODE: PIN desactivado temporalmente para probar Aura sin login.
  return true;
}

function createToken() { return 'test-mode-no-pin'; }
function verifyToken() { return true; }
function parseCookies() { return {}; }
function setSessionCookie(res) {
  res.setHeader('Set-Cookie', 'aura_session=test-mode-no-pin; Path=/; SameSite=Strict; Max-Age=2592000');
}
function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'aura_session=; Path=/; SameSite=Strict; Max-Age=0');
}
function getPin() { return 'PIN_DISABLED_FOR_TEST'; }
function getSecret() { return 'PIN_DISABLED_FOR_TEST'; }

module.exports = { createToken, verifyToken, parseCookies, requireAuth, setSessionCookie, clearSessionCookie, readBody, getPin, getSecret };

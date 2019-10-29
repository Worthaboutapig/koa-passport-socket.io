import cookie from 'cookie';

export default function({ store, cookieName, userDeserializer }) {
  return async function(socket, next) {
    if (!socket.handshake.headers.cookie) {
      await next('No cookies available on the socket handshake');
    }

    const cookies = cookie.parse(socket.handshake.headers.cookie);
    const sessionId = typeof cookieName === 'function' ? cookieName(cookies, socket) : cookies[cookieName];
    if (sessionId) {
      const session = await store.get(sessionId);
      if (!session) {
        return next(`Could not locate any user session in the session store using id: ${sessionId}`);
      }

      if (!session.passport || !session.passport.user) {
        return next(`Session passport user missing using  id: ${sessionId}`);
      }

      socket.user = await userDeserializer(session.passport.user);
      await next();
    } else {
      await next(`Could not locate any session cookie for cookie name: ${cookieName}`);
    }
  };
}

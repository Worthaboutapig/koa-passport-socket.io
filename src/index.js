import cookie from "cookie";

export default function({ store, cookieName, userDeserializer, logger } = {}) {
  return async function(socket, next) {
    try {
      const _cookie =
        socket.handshake.headers.cookie || socket.request.headers.cookie;
      if (!_cookie) {
        return await next("No cookies available on the socket handshake");
      }

      if (typeof _cookie !== "string") {
        logger &&
          logger.error("Cookie is not a string", {
            data: {
              cookie: _cookie,
              handshakeHeaders: socket.handshake.headers,
              requestHeaders: socket.request.headers.cookie
            }
          });
      }

      const cookies = cookie.parse(_cookie);
      const sessionId =
        typeof cookieName === "function"
          ? cookieName(cookies, socket)
          : cookieName && cookies[cookieName];
      if (sessionId) {
        const session = await store.get(sessionId);
        if (!session) {
          return next(
            `Could not locate any user session in the session store using id: ${sessionId}`
          );
        }

        if (!session.passport || !session.passport.user) {
          return next(`Session passport user missing using  id: ${sessionId}`);
        }

        socket.user = await userDeserializer(session.passport.user);
        await next();
      } else {
        await next(
          `Could not locate any session cookie for cookie name: ${cookieName}`
        );
      }
    } catch (error) {
      logger && logger.error(error);
      await next("Error identiting user.");
    }
  };
}

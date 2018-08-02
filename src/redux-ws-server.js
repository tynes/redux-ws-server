/*
 * redux-socket-server.js backend
 * Copyright (c) 2018, Mark Tyneway <mark.tyneway@gmail.com> (MIT License)
 * Copyright (c) 2018, The Bcoin Developers (MIT License)
 */

const http = require('http');
const qs = require('querystring');
const assert = require('assert');
const bsock = require('bsock').createServer();

const Logger = require('./logger');
const { enforce } = require('./helpers');

/*
 * configurable environment variables
 *
 * REDUX_WS_SERVER_PORT=8084
 * REDUX_WS_SERVER_USE_BASIC_AUTH=true
 * REDUX_WS_SERVER_BASIC_AUTH_USER=default
 * REDUX_WS_SERVER_BASIC_AUTH_PASSWORD=default
 * REDUX_WS_SERVER_LOG_LEVEL=debug
 *
*/

// constants
const PORT = +process.env.REDUX_WS_SERVER_PORT || 8084;
const USE_BASIC_AUTH = process.env.REDUX_WS_SERVER_USE_BASIC_AUTH || true;
const BASIC_AUTH_USER = process.env.REDUX_WS_SERVER_BASIC_AUTH_USER || 'default';
const BASIC_AUTH_PASSWORD = process.env.REDUX_WS_SERVER_BASIC_AUTH_PASSWORD || 'default';
const LOG_LEVEL = process.env.REDUX_WS_SERVER_LOG_LEVEL || 'debug';

const messages = {
  SUCCESS: message => `{"status": "success", "message": "${message}"}`,
  ERROR: message => `{"status": "error", "message": "${message}"}`,
}

// global logger
const logger = new Logger(LOG_LEVEL);

let handle;
// get a reference to the socket
bsock.on('socket', (socket) => {
  logger.info('socket connected');
  handle = socket;
});

// TODO: https
const httpServer = http.createServer(async (req, res) => {
  try {
    logger.debug('incoming request')

    try {
      if (USE_BASIC_AUTH) {
        // handle basic auth
        // assuming format: 'Basic <base64 encoded string>'
        const authHeader = req.headers.authorization;
        const authTokens = authHeader.split(' ');
        enforce(() => authTokens[0] === 'Basic', 'Invalid Basic Auth format');
        enforce(() => authTokens.length === 2, 'Invalid Basic Auth format');

        // parse the secret
        let b64 = authTokens[1];
        b64 = Buffer.from(b64, 'base64');
        const auth = b64.toString('ascii')

        enforce(() => auth !== undefined || auth !== '')

        const [user, password] = auth.split(':')

        enforce(() => user === BASIC_AUTH_USER)
        enforce(() => password === BASIC_AUTH_PASSWORD)
        logger.debug('successful auth')
      }
    } catch (e) {
      res.statusCode = 401;
      return res.end(messages.ERROR('bad authorization'));
    }


    // parse POST requests
    if (req.method === 'POST') {
      // assert socket connection has been established
      enforce(() => handle !== undefined, `must connect to socket server at port ${PORT}`)

      // parse POST body
      let body = '';
      req.on('data', d => {
        // prevent bodies larger than 1MB
        if (body.length > 1e6)
          req.connection.destroy();
        body += d
      });

      req.on('end', async () => {
        let data;
        // normalize content-type header
        const contentType = req.headers['content-type'].toLowerCase();
        if (contentType === 'application/json')
          data = JSON.parse(body);
        else
          data = qs.parse(body);

        try {
          enforce(() => data !== undefined, 'must send data')
          // enforce payload and type
          const { payload, type } = data;
          enforce(() => payload !== undefined, 'must send payload')
          enforce(() => type !== undefined, 'must send type')

          // serialize data and turn into buffer
          data = JSON.stringify(data)
          logger.debug(`firing 'action': ${data}`)
          data = Buffer.from(data, 'ascii')

          handle.fire('action', data)

        } catch (e) {
          res.statusCode = 400;
          return res.end(messages.ERROR(e));
        }

        return res.end(messages.SUCCESS('sucessful fire'));
      })
    } else if (req.method == 'GET') {
      let msg;
      if (handle)
        msg = `socket listening on port ${PORT}`;
      else
        msg = 'socket not connected'
      return res.end(messages.SUCCESS(msg));
    } else {
      // unsupported request method
      throw new Error(`unsupported request method: ${req.method}`);
    }
  } catch (e) {
    logger.error(e);
    res.statusCode = 400;
    return res.end(messages.ERROR(e));
  }
});

httpServer.on('listening', () => {
  logger.info(`listening on port ${PORT}`);
})

logger.info('starting server');
bsock.attach(httpServer);
httpServer.listen(PORT);



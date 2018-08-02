/*
 * redux-ws-server front end
 * Copyright (c) 2018, Mark Tyneway <mark.tyneway@gmail.com> (MIT License)
 * Copyright (c) 2018, The Bcoin Developers (MIT License)
 */

import bsock from 'bsock';
import Logger from './logger.js';
import { PORT } from './constants';

const logger = new Logger();

const cb = (socket, dispatch) => data => {
  try {
    data = data.toString('ascii');
    data = JSON.parse(data)
    // TODO: add assertions around shape of data
    return dispatch(data);

  } catch (e) {
    console.error(`error: ${e}`)
  }
}

export default function sockerServer(options) {
  // TODO: parse options
  // TODO: retry on bad connect
  const socket = bsock.connect(PORT)
  logger.info(`redux-server connected on ${PORT}`)

  // use as "pointer" to dispatch function
  let dp;

  socket.on('connect', () => {
    socket.bind('action', cb(socket, dp));
  })

  return ({ dispatch }) => next => action => {
    dp = dispatch;
    next(action);
  }
}



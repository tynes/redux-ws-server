# Redux Websocket Server

### Usage

Proxy requests from an HTTP webserver via websockets to
redux middleware and dispatch the action.

Very light on dependencies, no `express`,
no `socket.io`.

The webserver is currently password protected
via basic authentication.

### API

- `GET /` - get the server status
- `POST /` - the post body is interpreted as the action

Actions generally have the shape of:

```bash
{
  "type": "BAZ",
  "payload": { "foo": "bar" }
}
```

### Configuration

Configure the server with runtime environment
variables.

```bash
REDUX_WS_SERVER_PORT=8084
REDUX_WS_SERVER_USE_BASIC_AUTH=true
REDUX_WS_SERVER_BASIC_AUTH_USER=default
REDUX_WS_SERVER_BASIC_AUTH_PASSWORD=default
REDUX_WS_SERVER_LOG_LEVEL=debug
```

### TODO

- serve via https 


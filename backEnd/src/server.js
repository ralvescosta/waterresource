const createError = require('http-errors');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//Inport Raouter Files
const usersRouter = require('../routes/users');
const gatewayRouter = require('../routes/gateway');

//WebSocket
const app = express();
const server = require("http").Server(app);
const io = require("socket.io")(server);

//WebSocket Middleware
app.use((req,res,next)=>{
  req.io = io;
  return next();
})

//Service features
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));


/////// Creat Routers /////////
app.use('/users', usersRouter);
app.use('/gateway', gatewayRouter);
///////////////////////////////

//////////////////////////////////////// SERVER ///////////////////////////////////////
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({ 
    errCode: err.status,
    errBody: err.body, 
    errMessage: 'Invalid Message Type' 
  });
});

// Set Aplications Port
const port = normalizePort(process.env.PORT || '3333');
app.set('port', port);

//Litening Aplication on Port Defined
server.listen(port, '0.0.0.0',() => console.log(`Listening with port ${port} at ${server.address().address}` ));
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  const port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  const bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  const addr = server.address();
  const bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
}


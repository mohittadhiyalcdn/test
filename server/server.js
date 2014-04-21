
  var fs = require('fs'),
    path = require('path'),
    sio = require('socket.io'),
    static = require('node-static');
    
    
    
	io = sio.listen(app),
	nstatic = static; // for serving files
  var fileServer = new nstatic.Server('./');
  var app = require('http').createServer(handler);
  
  app.listen(9000);

  var file = new static.Server(path.join(__dirname, '..', 'public'));

  function handler(req, res) {
    file.serve(req, res);
  }
  if (process.env.HEROKU === 'true') {
    io.configure(function () {
        io.set("transports", ["xhr-polling"]);
        io.set("polling duration", 10);
    });
}
  var io = sio.listen(app),
    nicknames = {};

  io.sockets.on('connection', function (socket) {

    socket.on('user message', function (msg) {
   
      socket.broadcast.emit('user message', socket.nickname, msg);
    });

    socket.on('user image', function (msg) {
     
      socket.broadcast.emit('user image', socket.nickname, msg);
    });
    
    socket.on('shake screen', function (msg) {
     
      socket.broadcast.emit('shake screen',msg);
    });
    
    
    socket.on('mousemove', function (data) {
		
		// This line sends the event (broadcasts it)
		// to everyone except the originating client.
		socket.broadcast.emit('moving', data);
	});
    socket.on('nickname', function (nick, fn) {
      if (nicknames[nick]) 
      {

        fn(true);
      }
      else 
      {
        console.log("-----------------------1");
        fn(false);
        nicknames[nick] = socket.nickname = nick;
        socket.broadcast.emit('announcement', nick + ' connected');
        io.sockets.emit('nicknames', nicknames);
      }
    });

    socket.on('disconnect', function () {

      if (!socket.nickname) {

        return;
      }

      delete nicknames[socket.nickname];
      socket.broadcast.emit('announcement', socket.nickname + ' disconnected');
      socket.broadcast.emit('nicknames', nicknames);
    });
  });

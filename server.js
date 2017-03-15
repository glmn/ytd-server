var app = require('express')(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	logger = require('bug-killer');

server.listen(3000);

io.on('connection', function(socket){
	logger.log('Connected');
	socket.on('disconnect', function(socket){
		Logger.log('Disconnected')
	})
})
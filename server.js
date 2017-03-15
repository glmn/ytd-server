var app = require('express')(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	logger = require('bug-killer');

server.listen(3000);

io.on('connection', function(socket){
	logger.log('Connected');

	socket.on('nodes-request', function(){
		var data = {
			id: 1,
			data: 'test',
			uploaded: 0,
			status: 'Making video'
		}
		io.emit('nodes-response', data);
	})



	socket.on('disconnect', function(socket){
		logger.log('Disconnected');
	})
})
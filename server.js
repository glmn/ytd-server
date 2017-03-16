var app = require('express')(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	sqlite = require('sqlite3').verbose(),
	logger = require('bug-killer');

server.listen(3000);

var db = new sqlite.Database('hotels.db', sqlite.OPEN_READWRITE);
db.on('open', function(){
	io.on('connection', function(socket){
		logger.log('Connected');


		//Workers
		socket.on('hotel-request', function(){

		})

		//Admin
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
});
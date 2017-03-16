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
			Promise.resolve()
				.then(Hotel.getNew)
				.then(function(hotel){
					return Hotel.setStatus(hotel,Hotel.RESERVED);
				})
				.then(function(hotel){
					socket.emit('hotel-response', hotel);
				})
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

function Hotel(){
	const NOT_USED = 0;
	const RESERVED = 1;
	const COMPLETED = 2;
	const ERROR = 3;
}

Hotel.prototype.getNew = function(){
	return new Promise(function(resolve, reject){
		Db.get("SELECT * FROM hotels WHERE photos_count >= 5 AND status = 0 ORDER BY ID DESC LIMIT 1", null, function(err,hotel){
			if(err) reject(err);
			resolve(hotel);
		});
	})
}

Hotel.prototype.setStatus = function(hotel,status){
	return new Promise(function(resolve, reject){
		Db.run("UPDATE hotels SET status = ? WHERE id = ?", status, hotel.id, function(err){
			if(err) reject(err);
			resolve(hotel);
		});
	})
}
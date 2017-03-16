var app = require('express')(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	sqlite = require('sqlite3').verbose(),
	debug = require('bug-killer');

server.listen(3000);

var db = new sqlite.Database('hotels.db', sqlite.OPEN_READWRITE);

db.on('open', function(){
	io.on('connection', function(socket){
		debug.log('Connected');

		//Workers
		
		socket.on('hotel-request', function(){
			Promise.resolve()
				.then(Hotel.getNew)
				.then(function(hotel){
					return Hotel.setStatus(hotel,Hotel.RESERVED);
				})
				.catch(debug.warn)
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
			debug.log('Disconnected');
		})
	})
});

class Hotel {

	static get NOT_USED(){ return 0 };
	static get RESERVED(){ return 1 };
	static get COMPLETED(){ return 2 };
	static get ERROR(){ return 3 };

	static getNew(){
		return new Promise(function(resolve, reject){
			db.get("SELECT * FROM hotels WHERE photos_count >= 5 AND status = 0 ORDER BY ID DESC LIMIT 1", function(err,hotel){
				if(err) reject(err);
				resolve(hotel);
			});
		})
	}

	static setStatus(hotel,status){
		return new Promise(function(resolve, reject){
			db.run("UPDATE hotels SET status = ? WHERE id = ?", status, hotel.id, function(err){
				if(err) reject(err);
				resolve(hotel);
			});
		})
	}
}

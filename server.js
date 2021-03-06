"use strict";

var app = require('express')(),
	server = require('http').Server(app),
	io = require('socket.io')(server),
	sqlite = require('sqlite3').verbose(),
	debug = require('bug-killer');

var workers = [];

server.listen(3000);

var db = new sqlite.Database('hotels.db', sqlite.OPEN_READWRITE);

db.on('open', () => {
	io.on('connection', (socket) => {
		
		//Workers
		socket.on('worker:hello', (worker) => {
			if(socket.workerId === undefined){
				worker.droplet.ip = socket.request.connection.remoteAddress;
				socket.workerId = workers.push(worker) - 1;
			}
		});

		socket.on('worker:hotel-request', () => {
			Promise.resolve()
				.then(Hotel.getNew)
				.then((hotel) => {
					return Hotel.setStatus(hotel,Hotel.RESERVED);
				})
				.catch(debug.error)
				.then((hotel) => {
					socket.emit('worker:hotel-response', hotel);
				})
		})

		socket.on('worker:hotel-status-complete', ([hotel,video]) => {
			Promise.resolve([hotel,video])
				.then(([hotel,video]) => {
					Hotel.setVideoId(hotel,video).then((hotel) => {
						Hotel.setStatus(hotel,Hotel.COMPLETED);
					})
				})
		})

		socket.on('worker:update-status', (worker) => {
			workers[socket.workerId] = worker;
			io.emit('admin:workers-response', workers);
			debug.log(workers);
		})



		//Admin
		socket.on('admin:workers-request', () => {
			io.emit('admin:workers-response', workers);
		})


		//Disconnect
		socket.on('disconnect', (socket) => {
			workers.splice(socket.workerId,1);
			io.emit('admin:workers-response', workers);
			debug.log('Disconnected');
		})
	})
});

class Hotel {

	static get NOT_USED(){ return 0 };
	static get RESERVED(){ return 1 };
	static get COMPLETED(){ return 2 };
	static get ERROR(){ return 3 };

	static getNew()
	{
		return new Promise((resolve, reject) => {
			db.get("SELECT * FROM hotels WHERE photos_count >= 5 AND status = 0 ORDER BY ID DESC LIMIT 1", (err,hotel) => {
				if(err) reject(err);
				resolve(hotel);
			});
		})
	}

	static setStatus(hotel,status)
	{
		return new Promise((resolve, reject) => {
			db.run("UPDATE hotels SET status = ? WHERE id = ?", status, hotel.id, (err) => {
				if(err) reject(err);
				resolve(hotel);
			});
		})
	}

	static setVideoId(hotel,video)
	{
		return new Promise((resolve,reject) => {
			db.run("UPDATE hotels SET videoid = ? WHERE id = ?", video.id, hotel.id, (err) => {
				if(err) reject(err)
				resolve(hotel);
			});
		})
	}
}

var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io').listen(server);

app.use('/', express.static(__dirname + '/public'));

var usernames = {};
var pairCount = 0, id, pgmstart = 0;
var scores = {};


server.listen(3000, () => {
    console.log(`Server is running on port 3000`);
});


app.get('/', function (req, res) {
	res.sendFile(__dirname + '/index.html');
});

const questions = [
	{ question: 'How many elements are in the periodic table?', options: ["100", "140", "96", "118"], answer: 3 },
	{ question: 'How many dots appear on a pair of dice?', options: ["38", "42", "40", "45"], answer: 1 },
	{ question: 'What is the capital of India?', options: ["Delhi", "Karnataka", "Maharastra", "Tamil Nadu"], answer: 0 },
	{ question: 'Which country drinks the most coffee?', options: ["Netherland", "Australia", "America", "Finland"], answer: 3 },
	{ question: 'What is the National Sport of India ?', options: ["Cricket", "Kabadi", "Hockey", "Football"], answer: 2 }
];

io.sockets.on('connection', function (socket) {
	console.log("New Client Arrived!");

	socket.on('addClient', function (username) {
		socket.username = username;
		usernames[username] = username;
		scores[socket.username] = 0;
		pairCount++;
		if (pairCount === 1) {
			id = Math.round((Math.random() * 1000000));
			socket.room = id;
			pairCount = 1;
			console.log(pairCount + " " + id);
			socket.join(id);
			pgmstart = 1;
		} else if (pairCount === 2) {
			console.log(pairCount + " " + id);
			socket.join(id);
			pgmstart = 2;
		}

		console.log(username + " joined to " + id);

		socket.emit('updatechat', 'SERVER', 'You are connected! <br> Waiting for other player to connect...', id);

		socket.broadcast.to(id).emit('updatechat', 'SERVER', username + ' has joined to this game !', id);


		if (pgmstart == 2) {

			io.sockets.in(id).emit('sendQuestions', questions);
			console.log("Player2");
		} else {
			console.log("Player1");

		}





	});


	socket.on('result', function (usr, rst) {

		io.sockets.in(rst).emit('viewresult', usr);
	});




	socket.on('disconnect', function () {

		delete usernames[socket.username];
		io.sockets.emit('updateusers', usernames);
		socket.leave(socket.room);
	});
});



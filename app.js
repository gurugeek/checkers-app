var express = require('express')
var path = require('path');
var app = module.exports = express.createServer();
var io = require('socket.io')(app);

app.listen(4004, function(){
  console.log("Запустили сервер на %d порту", app.address().port);
});

// Конфигурация express

app.configure(function(){
  //app.set('views', __dirname + '/views');
  //app.set('view engine', 'jade');
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  //app.use(app.router);
  //app.use(express.static(__dirname + '/public'));
  //app.use(express.static('public'));
  app.use(express.static(path.join(__dirname, 'public')));
});

app.configure('development', function(){
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
  app.use(express.errorHandler());
});

// Передача index.html

var public_dir = './public/';

app.get('/', function(req, res) {
  res.sendFile(public_dir + 'index.html');
});

// Функции

var flag = false;
var freeroom;
var userHost;
var serverUsers = {};
var clientUsers = {};
var conRoom;
var userteam = {};
var inroomuser = {};
var rooms = {};
var startgame;
var lastroom;

function joinRoom(socket, room, username) {

  if (flag) {
    socket.join(freeroom);
    iduser = room;
    userteam[iduser] = 2;
    rooms[room] = freeroom;
    startgame = 1;
    socket.emit('joinResult', {room: rooms[room], userHost: userHost, userteam: userteam[iduser]});
	socket.emit('userteam', {room: rooms[room], iduser: iduser});
    socket.broadcast.to(freeroom).emit('startgame', {startgame: startgame});
    socket.broadcast.to(freeroom).emit('userconnecttoroom', {user2: username});
	console.log(username + ' играет черными!');
    flag = false;
    clientUsers[freeroom] = username;
    inroomuser[freeroom] = 2;
    console.log('В комнате ' + freeroom + ' ' + inroomuser[freeroom] + ' игрока.')
  } else {

    socket.join(room);

    iduser = room;
    userteam[iduser] = 1;
    flag = true;
    freeroom = room;
    lastroom = room;
    rooms[room] = room;
    userHost = username;
    serverUsers[room] = username;
    inroomuser[freeroom] = 1;

    console.log(serverUsers[room] + ' создал комнату');

    console.log('В комнате ' + room + ' ' + inroomuser[room] + ' игрок.')

    socket.emit('joinResult', {room: room, userHost: serverUsers[room], userteam: userteam[iduser]});
	socket.emit('userteam', {room: rooms[room], iduser: iduser});
    console.log(username + ' играет белыми! Он хозяин-барин)');

  }

  if (inroomuser[conRoom] == 2) {
    console.log('Хозяин комнаты ' + conRoom + ': ' + serverUsers[conRoom]);
  }
}

//Socket,.io

var usernames = {};
var numUsers = 0;
var currentRoom = {};

io.on('connection', function(socket){

  var ID = (socket.id).toString().substr(0, 6);

  /*
  socket.on('startGame', function(startGame){
    console.log(startGame);
  });
  */

  socket.on('disconnect', function () {
    // remove the username from global usernames list

    if ((serverUsers[rooms[ID]] == socket.username) && (usernames[socket.username] = socket.username)){
      console.log('Админ вышел');
      socket.broadcast.to(rooms[ID]).emit('userexit', {text: 'Создатель комнаты внезапно вышел'});
      flag = false;
    }
    if ((clientUsers[rooms[ID]] == socket.username) && (usernames[socket.username] = socket.username) ){
      console.log('Клиент прервал игрулю!');
      socket.broadcast.to(rooms[ID]).emit('userexit', {text: 'Ваш соперник ушел! Видимо обиделся :)'});
      flag = false;
    }


    console.log('Отключился: ' + ID);

    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;
    }

  });

  var addedUser = false;

  socket.on('shodiltouser', function(data){
	  socket.broadcast.to(rooms[ID]).emit('movesbyserver', {moves_from_start: data.moves_from_start, checkers: data.checkers});
  })

  socket.on('add user', function (username) {
    // we store the username in the socket session for this client
    socket.username = username;
    // add the client's username to the global list

    usernames[username] = username;
    ++numUsers;

    var time = (new Date).toLocaleTimeString();
    console.log('Подключился пользователь с id: ' + ID + ' в ' + time);
    console.log('Его зовут ' + username);
    joinRoom(socket, ID, username);
    console.log('Онлайн: ' + numUsers);

    addedUser = true;

  });

});




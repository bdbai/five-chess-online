var express = require('express');
var app  =express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
server.listen(process.env.PORT || 3000,process.env.IP || '0.0.0.0', function() {
	var addr = server.address();
	var host = addr.address;
	var port = addr.port;
	console.log('listen',host,port);
});

app.use('/client', express.static(
  path.join(__dirname, '../client')
));
app.get('/', function (req, res) {
  res.sendfile(path.join(__dirname, '../client/index.html'));
});

var table = {
    hasOccupied: false,
    status: []
}
for (var i = 0; i < 15; i++) {
    table.status[i] = [];
    for (var j = 0; j < 15; j++) {
        table.status[i][j] = 0;
    }
}
table.status[7][7] = 1;

io.on('connection', function(socket) {
    console.log('conn!');
    socket.emit('assign', { table: table });
    table.hasOccupied = !table.hasOccupied;
    socket.on('play', function(data) {
        console.log(data);
        if (table.status[data.i][data.j] === 0){
          table.status[data.i][data.j] = data.color;
          console.log(table);
          io.sockets.emit('played', { i: data.i, j: data.j, color: data.color });
        }
    });
});


/**
 * back-end, server-side
 *
 * @author jialingliu
 */
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);

require('jade');
app.use(express.static(__dirname + '/public'));
app.set('views', __dirname + '/views');
app.set('view engine', 'jade');
app.engine('jade', require('jade').__express);
app.get('/', function(req, res){
    res.render('ui-view');
});

var chatroomObj = require('./chatroom');
var chatroom = new chatroomObj("Jenny's chat room");

io.on('connection', function(socket){
    // user join
    socket.on("join", function(name){
        var joined = chatroom.join(name, socket.id);
        if (joined){
            io.emit("user joined", name);
            io.emit("refresh online users", chatroom.getUsers());
            //load existing messages from the DB
            var msgs = chatroom.getMessages();
            for (var index = 0; index < msgs.length; index++) {
                socket.emit('send message', msgs[index]);
            }
        } else {
            socket.emit("join failure", "Joining room failed. Name " + name + " already taken.");
        }
    });

    // user logout
    socket.on("user logout", function(){
        logout(socket);
    });

    // any unexpected logout such as closing the tab or browser
    socket.on('disconnect', function() {
        logout(socket);
    });

    // user send message
    socket.on('send message', function(msg){
        var current_time = new Date();
        current_time = current_time.toLocaleTimeString() + ' ' + current_time.toDateString();
        chatroom.sendMessage(socket.id, msg, current_time);
        io.emit('send message', {name: chatroom.getUsers()[socket.id], time: current_time, message: msg});
    });
});

// user disconnected
var logout = function(socket) {
    var name = chatroom.getUsers()[socket.id];
    if(name != null) {
        chatroom.leave(socket.id);
        io.emit("user logout", name);
        io.emit("refresh online users", chatroom.getUsers());
    }
};

server.listen(3001, function(){
    console.log('listening on port 3001');
});
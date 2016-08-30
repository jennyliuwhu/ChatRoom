/**
 * back-end
 *
 * @author jialingliu
 */
var _ = require('underscore');
var chatroom = function (chatroom) {
    var sqlite3 = require("sqlite3").verbose();
    var db = new sqlite3.Database(chatroom + ".db");
    var room = this;
    room.users = {}; // user map, socket_id : username
    room.messages = []; // messages array of maps, {message: content, name: user_name, time: sent_time}

    // getters
    room.getUsers = function() {
        return room.users;
    };

    room.getMessages = function() {
        return room.messages;
    };

    //create sqlite table messages
    db.serialize(function() {
        db.run("CREATE TABLE IF NOT EXISTS history (name TEXT, message TEXT, time TEXT)");
    });

    room.db = db;

    //load history from db
    db.all("SELECT * FROM history", function(err, records) {
        if (err) {
            console.log(err);
        }
        room.messages = records;
    });

    room.join = function(name, id) {
        // invert the key-value in users map, check if the socketid for the name is defined
        if ((_.invert(room.users))[name] != undefined) return false;
        room.users[id] = name;
        return true;
    };
    
    room.leave = function(id) {
        delete room.users[id];
    };

    room.sendMessage = function(userid, message_content, message_time) {
        db.serialize(function() {
            var stmt = db.prepare("INSERT INTO history VALUES (?,?,?)");
            stmt.run(room.users[userid], message_content, message_time);
            stmt.reset();
        });
        room.messages.push({message: message_content, name: room.users[userid], time: message_time});
    };
};
module.exports = chatroom;
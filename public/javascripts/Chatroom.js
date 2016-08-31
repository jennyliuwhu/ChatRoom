/**
 * back-end
 *
 * @author jialingliu
 */
var _ = require('underscore');
var sqlite3 = require("sqlite3").verbose();

function Chatroom(chatroom) {
    // var room = this;
    this.users = {}; // user map, socket_id : username
    this.messages = []; // messages array of maps, {message: content, name: user_name, time: sent_time}
    //create sqlite table messages
    var db = new sqlite3.Database(chatroom + ".db");
    db.serialize(function () {
        db.run("CREATE TABLE IF NOT EXISTS history (name TEXT, message TEXT, time TEXT)");
    });
    //load history from db
    var messages = this.messages;
    db.all("SELECT * FROM history", function (err, records) {
        if (err) {
            console.log(err);
        }
        messages = records;
    });

    this.db = db;

    this.getUsers = function () {
        return this.users;
    };

    this.getMessages = function () {
        return this.messages;
    };

    this.join = function (name, id) {
        // invert the key-value in users map, check if the socketid for the name is defined
        if ((_.invert(this.users))[name] != undefined) return false;
        this.users[id] = name;
        return true;
    };

    this.leave = function (id) {
        delete this.users[id];
    };

    this.sendMessage = function (userid, message_content, message_time) {
        var users = this.users;
        this.db.serialize(function () {
            var stmt = db.prepare("INSERT INTO history VALUES (?,?,?)");
            stmt.run(users[userid], message_content, message_time);
            stmt.reset();
        });
        this.messages.push({message: message_content, name: users[userid], time: message_time});
    }
}
module.exports = Chatroom;
/**
 * front-end, client-side
 *
 * @author jialingliu
 */
var socket = io();

$(document).ready(function() {
    socket.emit('user logout', $('#name').val());
    $('#chatroom').hide();
});

$('#join-form').submit(function() {
    var name = $("#name").val();
    if(name.length == 0) {
        alert('Empty name');
        return false;
    }
    socket.emit('join', name);
    return false;
});

$('#send').submit(function() {
    var message=$("#m").val();
    if(message.length == 0) return false;
    socket.emit('send message', message);
    $("#m").val('');
    return false;
});

$('.disconnect').click(function() {
    socket.emit('user logout', $('#name').val());
    $('#join').show();
    $('#chatroom').hide();
    return false;
});

$('#seeUsers').click(function() {
    $('#onlineUsers').toggle();
});

socket.on('user joined', function(name){
    if (name == $('#name').val()){
        $('#join').hide();
        $('#chatroom').show();
        $('#onlineUsers').hide();
        $('#name').text(name);
    }
    else{
        $('#messages').append("<li><span class='alert alert-success'>" + name + " joined</span></li>");
    }
});

socket.on('join failure', function(msg) {
    alert(msg);
});

socket.on('user logout', function(name){
    if (name != $('#name').val()){
        $('#messages').append("<li><span class='alert alert-warning'>" + name + " left</span></li>");
    }
});

socket.on('refresh online users', function(users){
    $('#users').empty();
    $.each(users, function(index, user) {
        $('#users').append("<li class='media'><div class='media-body'>" + user + "</div></li>");
    });
});

socket.on('send message', function(msg) {
    var msg = "<li class='media'> <span class='text-success'>" + msg.name+ " @ " + msg.time + ": <br> <span class='text-muted'>" + msg.message + "<hr></li>";
    $('#messages').append(msg);
    var panel = $('#messages-panel');
    panel.animate({'scrollTop': panel.prop("scrollHeight") - panel.height() }, 10);
});
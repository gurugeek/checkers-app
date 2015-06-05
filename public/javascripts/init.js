/**
 * Created by s-d-1 on 22.05.15.
 */

var FADE_TIME = 150; // ms
var TYPING_TIMER_LENGTH = 400; // ms
var COLORS = [
    '#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'
];

// Initialize varibles
var $window = $(window);
var $usernameInput = $('.usernameInput'); // Input for username
var $messages = $('.messages'); // Messages area
var $inputMessage = $('.inputMessage'); // Input message input box

var $loginPage = $('.login.page'); // The login page
var $chatPage = $('.chat.page'); // The chatroom page

// Prompt for setting a username
var username;
var connected = false;
var typing = false;
var lastTypingTime;
var $currentInput = $usernameInput.focus();
var alertUser = false;

var socket = io();

socket.on('id', function(ID) {

});

//var ID = (socket.id).toString().substr(0, 6);


// Sets the client's username
function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
        $loginPage.fadeOut();
        $chatPage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();





        // Tell the server your username
        socket.emit('add user', username);

        var Ids = (socket.id).toString().substr(0, 6);

        document.getElementById('socketUsernameID').innerHTML = '<b>' + username + '</b>' + ', Ваш ID: ' + Ids;



    }

}

// Prevents input from having injected markup
function cleanInput (input) {
    return $('<div/>').text(input).text();
}
// Keyboard events

$window.keydown(function (event) {
    // Auto-focus the current input when a key is typed
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
    }
    // When the client hits ENTER on their keyboard
    if (event.which === 13) {
        if (username) {
            sendMessage();
            socket.emit('stop typing');
            typing = false;
        } else {
            setUsername();
        }
    }
});

// Focus input when clicking anywhere on login page
$loginPage.click(function () {
    $currentInput.focus();
});

// Whenever the server emits 'login', log the login message
socket.on('login', function (data) {
    connected = true;
    // Display the welcome message
    var message = "Welcome to Socket.IO Chat – ";
    log(message, {
        prepend: true
    });
    addParticipantsMessage(data);
});

// Whenever the server emits 'user joined', log it in the chat body
socket.on('user joined', function (data) {
    log(data.username + ' joined');

    addParticipantsMessage(data);
});

socket.on('joinResult', function(result) {

    if (result.userteam == 1){
        $('#room-list').text('Вы играете белыми шашками!');
    }
    if (result.userteam == 2){
        $('#room').text('Вы вошли в комнату к '+ result.userHost);
        $('#room-list').text('Вы играете черными шашками!');
    }
});

socket.on('userconnecttoroom', function(usertoroom){
    //userConnectToRoom(data);
    console.log('К вам присоединился угу');
    $('#room').text('К вам присоединился: ' + usertoroom.user2);
})



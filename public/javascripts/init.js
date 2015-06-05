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

// Инициализация переменных
var $window = $(window);
var $usernameInput = $('.usernameInput'); // Input для username
var $messages = $('.messages'); // Область сообщений
var $inputMessage = $('.inputMessage'); // Input для ввода сообщений

var $loginPage = $('.login.page'); // Страница входа/ввода имени
var $gamePage = $('.game.page'); // Игровая страница

// Prompt for setting a username
var username;
var connected = false;
var typing = false;
var lastTypingTime;
var $currentInput = $usernameInput.focus();
var alertUser = false;

var socket = io();

// Присваивание имени пользователю
function setUsername () {
    username = cleanInput($usernameInput.val().trim());

    // If the username is valid
    if (username) {
        $loginPage.fadeOut();
        $gamePage.show();
        $loginPage.off('click');
        $currentInput = $inputMessage.focus();

        // говорим это серверу
        socket.emit('add user', username);

        var Ids = (socket.id).toString().substr(0, 6);

        document.getElementById('socketUsernameID').innerHTML = '<b>' + username + '</b>' + ', Ваш ID: ' + Ids;

    }

}

// очищаем input
function cleanInput (input) {
    return $('<div/>').text(input).text();
}
// для ввода через клавиатуру

$window.keydown(function (event) {
    // ctrl, alt ...
    if (!(event.ctrlKey || event.metaKey || event.altKey)) {
        $currentInput.focus();
    }
    // enter
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

// focus на input
$loginPage.click(function () {
    $currentInput.focus();
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



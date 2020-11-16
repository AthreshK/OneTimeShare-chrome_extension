const passForm = document.getElementById('pass-form');
const passMessages=document.getElementById('message-container');
// var aesjs = require('aes-js');
var key_128 = [];

const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});

const socket=io("http://localhost:3000/");
console.log(username,room);
socket.emit('joinRoom', { username, room });
socket.on('message', data => {
    // appendMessage(`${data.name}: ${data.message}`)
    outputMessage(data);

    var aesCtr = new aesjs.ModeOfOperation.ctr(key_128, new aesjs.Counter(5));
    console.log("I got this" +data.text);
    var encryptedBytes = aesjs.utils.hex.toBytes(data.text);
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    console.log("I made it  "+decryptedText);
    var username=data.username;
    var time=data.time;
    outputMessage({username,text:decryptedText,time});
    console.log(data);
    passMessages.scrollTop=passMessages.scrollHeight;

  });
  socket.on('welcoming', data => {
    // appendMessage(`${data.name}: ${data.message}`)
    outputMessage(data);
    console.log(data);
    passMessages.scrollTop=passMessages.scrollHeight;
  });
  socket.on('keySend',data =>{
    key_128=data.text;
    console.log("Recived new key "+data.text);
  })
  passForm.addEventListener('submit',e =>{
    e.preventDefault();
    const pass=e.target.elements.passChat.value;
  
  if (!pass){
    return false;
  }
  var textBytes = aesjs.utils.utf8.toBytes(pass);
  var aesCtr = new aesjs.ModeOfOperation.ctr(key_128, new aesjs.Counter(5));
  var encryptedBytes = aesCtr.encrypt(textBytes);
  var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
    socket.emit('sentPassword', encryptedHex);
    e.target.elements.passChat.value='';
    e.target.elements.passChat.focus();
  });
function outputMessage(message){
  const div= document.createElement('div');
  div.classList.add('container-fluid', 'p-3', 'my-3', 'bg-primary', 'text-white');
  console.log(message.text)
  div.innerHTML=`${message.username} sent ${message.text}. The decrypted password has been copied to your clipboard and automatically set in password field.`;
  passMessages.appendChild(div)
}

function getPwdInputs() 
{   // If not, use Robusto's solution
  var ary = []; 
  var inputs = document.getElementsByTagName("input"); 
  for (var i=0; i<inputs.length; i++) { 
    if (inputs[i].type.toLowerCase() === "password") { 
      ary.push(inputs[i]); 
    } 
  } 
  return ary; 
} 
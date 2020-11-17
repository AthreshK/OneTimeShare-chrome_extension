//Get message send form element from DOM
const passForm = document.getElementById('pass-form');
//Get Container having all messages from DOM
const passMessages=document.getElementById('message-container');
//Delare blank key
var key_128 = [];
//Get username and roomID from URL after login.
const { username, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true
});
//listen to socket.io at default port 3000 on local server
const socket=io("http://localhost:3000/");
console.log(username,room);

//emit message to join that particular room to server
socket.emit('joinRoom', { username, room });

//On reciving of socket "message",
socket.on('message', data => {
  //Initialize counter with key
    var aesCtr = new aesjs.ModeOfOperation.ctr(key_128, new aesjs.Counter(5));
    //Log recived password
    console.log("I recived :" +data.text);
    //Convert recived Hex message to Bytes
    var encryptedBytes = aesjs.utils.hex.toBytes(data.text);
    //Decrypt the Bytes with the help of counter
    var decryptedBytes = aesCtr.decrypt(encryptedBytes);
    //Convert to readable form (string) from bytes
    var decryptedText = aesjs.utils.utf8.fromBytes(decryptedBytes);
    //Log Decrypted password
    console.log("I Decrypted to :"+decryptedText);
    //Copy the decrypted password to clipboard.
    //Create dummy object to put on DOM to select and copy.
    var dummy = $('<input>').val(decryptedText).appendTo('body').select();
    document.execCommand('copy');
    //Remove dummy object.
    dummy.remove();
  //Display the message to client. 
  outputMessage(data);
  //Scroll to last message in the container.
    passMessages.scrollTop=passMessages.scrollHeight;
    

  });

  //On reciving socket of "welcoming"
  socket.on('welcoming', data => {
    //Display welcome / user join / user left messages client.
    outputWelcoming(data);
      //Scroll to last message in the container.
    passMessages.scrollTop=passMessages.scrollHeight;
  });
    //On reciving socket of "KeySend"
  socket.on('keySend',data =>{
    //Store the new key into local variable.
    key_128=data
    console.log("Recived new key "+data);
  })
  //Add event lister to send button in password send form.
  passForm.addEventListener('submit',e =>{
    e.preventDefault();
    //Get value of password typed.
    const pass=e.target.elements.passChat.value;
  
  if (!pass){
    return false;
  }
  //Convert password to bytes
  var textBytes = aesjs.utils.utf8.toBytes(pass);
    //Initialize counter with key
  var aesCtr = new aesjs.ModeOfOperation.ctr(key_128, new aesjs.Counter(5));
  //Encrypt the converted bytes with the help of counter.
  var encryptedBytes = aesCtr.encrypt(textBytes);
  //Convert to Hex before sending to sending to server.
  var encryptedHex = aesjs.utils.hex.fromBytes(encryptedBytes);
  //Send the encrypted hex password to server via socket channel "sentPassword"
    socket.emit('sentPassword', encryptedHex);
    //Clear password field
    e.target.elements.passChat.value='';
    //Set focus to password field.
    e.target.elements.passChat.focus();
  });

//This function is used to display any password recived to user
function outputMessage(message){
  //Make message using a div container
  const div= document.createElement('div');
  div.classList.add('container-fluid', 'p-3', 'my-3', 'bg-primary', 'text-white');
  console.log(message.text)
  //Add information
  div.innerHTML=`${message.username} sent ${message.text}. The decrypted password has been copied to your clipboard.`;
  //Push as a child
  passMessages.appendChild(div)

}
//This function is used to display any information passed by OneTimeShare Bot on welcome/user join /user left.
function outputWelcoming(message){
    //Make message using a div container

  const div= document.createElement('div');
  div.classList.add('container-fluid', 'p-3', 'my-3', 'bg-primary', 'text-white');
  console.log(message.text)
    //Add information

  div.innerHTML=`${message.text}`;
    //Push as a child
  passMessages.appendChild(div)
  
}
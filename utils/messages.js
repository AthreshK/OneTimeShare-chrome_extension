const moment= require('moment');
//Format message into a JSON object to send and recive multiple information.
function formatMessage(username,text){
    return{
        username,text,time:moment().format('h:mm a')
    }
}
module.exports=formatMessage;
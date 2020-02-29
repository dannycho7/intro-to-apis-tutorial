require('dotenv').config();

const bent = require('bent');
const getJSON = bent('json');
const twilio = require('twilio');

var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN;   // Your Auth Token from www.twilio.com/console
var fromNumber = process.env.TWILIO_FROM_NUMBER; // Your Trial Number from www.twilio.com/console

const client = new twilio(accountSid, authToken);

async function broadcastRandomFact(numbers, fromNumber) {
    let obj = await getJSON('https://uselessfacts.jsph.pl/random.json?language=en');
    let customMessagePrefix = "A useless fact from Danny:\nDid you know?"; // customize this!

    Promise.all(numbers.map(number => {
        return client.messages.create({
            body: `${customMessagePrefix} ${obj['text']}`,
            to: number,  // Text this number
            from: fromNumber // From a valid Twilio number
        })
    }))
        .then((messages) => {
            messages.forEach(message => {
                console.log(`Sent message to ${message['to']}: ${message['body']}`);
            });
        })
        .catch(err => console.error(err));
}

var toNumber = '7147224294'; // Change this to your number to test it out!
broadcastRandomFact([toNumber], fromNumber); 

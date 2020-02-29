require('dotenv').config();

const bent = require('bent');
const getJSON = bent('json');
const twilio = require('twilio');

var accountSid = process.env.TWILIO_ACCOUNT_SID; // Your Account SID from www.twilio.com/console
var authToken = process.env.TWILIO_AUTH_TOKEN; // Your Auth Token from www.twilio.com/console
var fromNumber = process.env.TWILIO_FROM_NUMBER; // Your Trial Number from www.twilio.com/console

const twilioClient = new twilio(accountSid, authToken);

async function broadcastRandomFact(subscribers, fromNumber) {
    let obj = await getJSON('https://uselessfacts.jsph.pl/random.json?language=en');
    let customMessagePrefix = "A useless fact from Danny:\nDid you know?"; // customize this!

    console.log(`Sending messages to ${subscribers.size} subscribers`);

    outboundMessages = [];
    subscribers.forEach(number => {
        let outboundMessage = twilioClient.messages.create({
            body: `${customMessagePrefix} ${obj['text']}`,
            to: number,  // Text this number
            from: fromNumber // From a valid Twilio number
        });
        outboundMessages.push(outboundMessage);
    });

    Promise.all(outboundMessages)
        .then((messages) => {
            messages.forEach(message => {
                console.log(`Sent message to ${message['to']}: ${message['body']}`);
            });
        })
        .catch(err => console.error(err));
}
// resolve: formatted phone number
// reject: invalid phone number
function validateNumber(number) {
    invalidNumberErr = `Received invalid number '${number}'`;
    return new Promise((resolve, reject) => {
        if (!number) {
            reject(invalidNumberErr);
        } else {
            twilioClient.lookups.phoneNumbers(number)
                .fetch({ countryCode: 'US', type: ['carrier'] })
                .then(numberInfo => {
                    resolve(numberInfo.phoneNumber);
                })
                .catch(err => {
                    console.error(err);
                    reject(invalidNumberErr);
                });
        }
    });
}

const path = require('path');
const express = require('express');
const app = express();

// common good practice for default port to listen on and configurable through env variable for deployment purposes
const port = process.env.PORT || 3000;

// global variable + unpersisted state for sake of simplicity
const subscribers = new Set();

// used to parse form input
const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});

app.post('/subscribe', (req, res) => {
    let number = req.body.number;
    console.log(`Received subscription request from '${number}'`);
    validateNumber(number)
        .then((formattedNumber) => {
            console.log(`Adding '${formattedNumber}' to subscribers`);
            subscribers.add(formattedNumber);
        })
        .catch(err => console.error(err))
        .finally(() => {
            res.redirect('/'); // take them back to the homepage  
        });
});

app.listen(port, () => {
    let sendInterval = process.env.SEND_INTERVAL || 60000; // defaults to 60000 ms == 60 seconds == 1 minute
    console.log(`Started subscription service at port ${port} with a send interval of ${sendInterval} ms`)
    setInterval(() => {
        broadcastRandomFact(subscribers, fromNumber);
    }, sendInterval);
});

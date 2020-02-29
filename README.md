# Intro to APIs Workshop
This is an introductory workshop given at Whitney High School's Code Jam Hackathon. The aim of this workshop is to introduce students to APIs and guide them in building a simple subscription-based random facts service (via Twilio and a random facts generator). In this README, we'll guide the development of this service.

## Part 1 - Setup
To start, we'll be working through building a node.js application. This will require a terminal. Please install one if you don't have it installed already.

In your terminal, we'll create a new node.js project:
```bash
mkdir api-workshop
cd api-workshop
npm init
```

## Part 2 - A broadcast script
You will need to setup a Twilio account and can do so for free on their website. Twilio API usage is well documented at https://www.twilio.com/docs/usage/api.

We will be using a random facts generator that can be access at https://uselessfacts.jsph.pl/random.json?language=en. Test this endpoint with postman to see which fields will be useful to access.

For this part, we will be writing a node.js script that broadcasts a random fact to any number.

We will be downloading some npm modules to create this script.
```bash
npm i dotenv bent twilio --save 
```

We may end up with something like this:
```node.js
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
```

You will also need a `.env` file that looks like:
```bash
TWILIO_ACCOUNT_SID=_PASTE_YOUR_TWILIO_ACCOUNT_SID_HERE_
TWILIO_AUTH_TOKEN=_PASTE_YOUR_TWILIO_AUTH_TOKEN_HERE_
TWILIO_FROM_NUMBER=_PASTE_YOUR_TWILIO_TRIAL_NUMBER_HERE_
```

To run the script:
```bash
node index.js
```

## Part 3
WIP
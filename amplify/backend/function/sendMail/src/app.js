/*
import { dedent } from './node_modules/ts-dedent/esm/index';
Copyright 2017 - 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with the License. A copy of the License is located at
    http://aws.amazon.com/apache2.0/
or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and limitations under the License.
*/




const express = require('express')
const bodyParser = require('body-parser')
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware')
const { createTransport } = require('nodemailer')
const { default: dedent } = require('ts-dedent')

// declare a new express app
const app = express()
app.use(bodyParser.json())
app.use(awsServerlessExpressMiddleware.eventContext())

// Enable CORS for all methods
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*")
  res.header("Access-Control-Allow-Headers", "*")
  next()
});

/****************************
* Example post method *
****************************/

const getTransport = () => {
  const { SENDER_EMAIL, SENDER_EMAIL_PASSWORD } = process.env;
  return createTransport({
    service: "gmail",
    auth: {
      user: SENDER_EMAIL,
      pass: SENDER_EMAIL_PASSWORD,
    },
  })
}

app.post('/send-mail', function(req, res) {
  const { months, amountUSD, rateBs, captureUrl } = req.body;

  const { TARGET_EMAIL, SENDER_EMAIL, TOKEN } = process.env;

  const authorizationHeader = req.get("Authorization");
  if (!authorizationHeader) {
    return res.status(400).send({
      sent: false, 
      body: req.body, 
      message: "No authorization header" 
    });
  }

  const [ authorizationScheme, authorizationToken ] = authorizationHeader.split(" ");
  if (authorizationScheme !== "Basic") {
    return res.status(403).send({
      sent: false, 
      body: req.body, 
      message: "Unauthorized" 
    });
  }
  if (authorizationToken !== TOKEN) {
    return res.status(403).send({ 
      sent: false, 
      body: req.body, 
      message: "Invalid token" 
    });
  }

  getTransport()
    .sendMail({
      subject: "Test Condo Mail",
      from: `Marco <${SENDER_EMAIL}>`,
      to: TARGET_EMAIL,
      html: dedent(
        `Monto: ${amountUSD}
        Tasa: ${rateBs}`
      )
    })
      .then(() => res.json({ sent: true, body: req.body }))
      .catch((err) => {
        console.log(err);
        res.status(500).json({ sent: false, body: req.body, message: err.message || null});
      });


});

app.listen(3000, function() {
    console.log("App started")
});

// Export the app object. When executing the application local this does nothing. However,
// to port it to AWS Lambda we will create a wrapper around that will load the app from
// this file
module.exports = app

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
const { CognitoJwtVerifier } = require("aws-jwt-verify");

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

// app.use(async (req, res, next) => {
//   const { REGION } = process.env;
//   const COGNITO_URL = `https://cognito-idp.${REGION}.amazonaws.com/`;
//   try {
//       const accessToken = req.headers.authorization.split(" ")[1];

//       const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
      
//       const res = await fetch(
//           COGNITO_URL,
//           {
//               method: "POST",
//               headers: {
//                 "Content-Type": "application/x-amz-json-1.1",
//                 "X-Amz-Target": "AWSCognitoIdentityProviderService.GetUser"
//               },
//               body: {
//                 AccessToken: accessToken,
//               },
//           },
//       );

//       const data = await res.json();

//       req.user = data;
//       next();
//   } catch (error) {
//       console.log(error)
//       return res.status(401).json({
//           message: 'Auth failed'
//       });
//   }
// });

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

app.post('/send-mail', async function(req, res) {
  const context = req.apiGateway.context;
  const event = req.apiGateway.event;

  console.log("USER", req.user);
  const { months, amountUSD, rateBs, captureUrl } = req.body;

  const { TARGET_EMAIL, SENDER_EMAIL, VERIFY_JWT_USER_ID_POOL, VERIFY_JWT_CLIENT_ID } = process.env;

  // Verifier that expects valid access tokens:
  const token = req.headers.authorization.split(' ')[1];

  const verifier = CognitoJwtVerifier.create({
    userPoolId: VERIFY_JWT_USER_ID_POOL,
    tokenUse: "id",
    clientId: VERIFY_JWT_CLIENT_ID,
  });

  try {
    const payload = await verifier.verify(token);
    console.log("Token is valid. Payload:", payload);

    if (payload.email !== SENDER_EMAIL) {
      return res.status(403).send({ sent:false, body: req.body, message: "Email unauthorized" });
    }
  } catch(err) {
    console.log("Token not valid!", err);
    return res.status(403).send({ sent:false, body: req.body, message: "Token not valid" });
  }
  

  // const authorizationHeader = req.get("Authorization");
  // if (!authorizationHeader) {
  //   return res.status(400).send({
  //     sent: false, 
  //     body: req.body, 
  //     message: "No authorization header" 
  //   });
  // }

  // const [ authorizationScheme, authorizationToken ] = authorizationHeader.split(" ");
  // if (authorizationScheme !== "Basic") {
  //   return res.status(403).send({
  //     sent: false, 
  //     body: req.body, 
  //     message: "Unauthorized" 
  //   });
  // }
  // if (authorizationToken !== TOKEN) {
  //   return res.status(403).send({ 
  //     sent: false, 
  //     body: req.body, 
  //     message: "Invalid token" 
  //   });
  // }

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
      .then(() => res.json({ sent: true, body: req.body, user: req.user }))
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

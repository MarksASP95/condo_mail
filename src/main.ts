import './style.css'
import amplifyConfig from "./aws-exports";
import { Amplify, API } from "aws-amplify";
import { SendMailInput } from './models/mail';

Amplify.configure(amplifyConfig);

const sendMailInput: SendMailInput = {
  amountUSD: 20,
  captureUrl: "some-capture-url",
  months: ["Abril", "Mayo"],
  rateBs: 25,
};

// API.post("cmapi", "/send-mail", { body: sendMailInput})
//   .then((response) => console.log("RESPONSE", response))
//   .catch((err) => console.log("ERROR", err));
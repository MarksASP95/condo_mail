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

const form = document.forms[0];
form.addEventListener("submit", handleFormSubmit);

const uploadingTextEl: HTMLParagraphElement = document.querySelector(".uploading-capture-text")!;

function handleFormSubmit(e: SubmitEvent) {
  e.preventDefault();
  const amount = new FormData(e.target! as HTMLFormElement).get("amount");
  const rate = new FormData(e.target! as HTMLFormElement).get("rate");
  const monthtsStr = new FormData(e.target! as HTMLFormElement).get("months");
  const file = new FormData(e.target! as HTMLFormElement).get("file");
  console.log({ amount, rate, monthtsStr, file})

  setShowUploadingText(true);
  
  return;
  API.post(
      "cmapi", 
      "/send-mail", 
      { 
        body: sendMailInput, 
        headers: {
          "Authorization": `Basic ${import.meta.env.VITE_API_TOKEN}`
        },
      }
    )
      .then((response) => console.log("RESPONSE", response))
      .catch((err) => console.log("ERROR", err));
}

function setShowUploadingText(show: boolean) {
  if (show) return uploadingTextEl.classList.add("shown");
  return uploadingTextEl.classList.remove("shown");
}
import './style.css'
import amplifyConfig from "./aws-exports";
import { Amplify, API, Storage } from "aws-amplify";
import { SendMailInput } from './models/mail';

const uploadingTextEl: HTMLParagraphElement = document.querySelector(".uploading-capture-text")!;
const inputCaptureEl = document.getElementById("input-capture")! as HTMLInputElement;

Amplify.configure(amplifyConfig);

const sendMailInput: SendMailInput = {
  amountUSD: 20,
  captureUrl: "some-capture-url",
  months: ["Abril", "Mayo"],
  rateBs: 25,
};

const form = document.forms[0];
inputCaptureEl.addEventListener("change", handleCaptureInputElementChange);
form.addEventListener("submit", handleFormSubmit);

Storage.list("")
  .then((value) => {
    console.log("value", value)
  })
  .catch((err) => console.log("error", err))

Storage.get("transfonter.org-20230109-183817.zip")
  .then((value) => console.log("DONE", value))
  .catch((err) => console.log("ERROR", err));

function handleCaptureInputElementChange(e: Event) {
  const file = inputCaptureEl.files![0];
  console.log("uploading");
  Storage.put(file.name, file, {
    contentType: file.type,
    resumable: true,
    progressCallback: (progress) => {
      console.log("PROGRESS CALLBACK", progress);
      setShowUploadingText(true);
      setUploadingTextPerc((progress.loaded * 100) / progress.total)
    },
    errorCallback: (err) => {
      console.log("ERROR CALLBACK", err);
    },
    completeCallback: (event) => {
      console.log("COMPLETE CALLBACK", event);
    },
  }).resume();
}

function handleFormSubmit(e: SubmitEvent) {
  e.preventDefault();
  const fd = new FormData(e.target! as HTMLFormElement);
  const fdData: any = {};
  fd.forEach((value, key) => {
    fdData[key] = value;
  });
  const amountStr = fd.get("amount");
  const rateStr = fd.get("rate");
  const monthtsStr = fd.get("months");
  const captureUrl = fd.get("captureUrl");

  if (!amountStr) return;
  if (!rateStr) return;
  if (!monthtsStr) return;
  if (!captureUrl) return;

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

function setUploadingTextPerc(perc: number) {
  uploadingTextEl.innerHTML = `Subiendo... ${perc}%`
}
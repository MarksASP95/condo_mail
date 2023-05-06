import './style.css'
import amplifyConfig from "./aws-exports";
import { Amplify, API, Storage, Auth } from "aws-amplify";
import { SendMailInput } from './models/mail';

const uploadingTextEl: HTMLParagraphElement = document.querySelector(".uploading-capture-text")!;
const inputCaptureEl = document.getElementById("input-capture")! as HTMLInputElement;
const submitButtonEl = document.querySelector('button[type="submit"]')! as HTMLButtonElement;
const inputCaptureUrlEl = document.getElementById("capture-url-input")! as HTMLInputElement;

Amplify.configure(amplifyConfig);

const form = document.forms[0];
inputCaptureEl.addEventListener("change", handleCaptureInputElementChange);
form.addEventListener("submit", handleFormSubmit);
form.addEventListener("input", handleFormInput);

function signOutUser() {
  Auth.signOut()
    .then(() => {
      console.log("SIGNED OUT");
    });
}

function signInUser(email: string, password: string) {
  Auth.signIn(email, password)
    .then((user) => {
      console.log("SIGNED IN", user);
    });
}

function getFormRawData(): Record<string, any> {
  const fd = new FormData(form);
  const fdData: any = {};
  fd.forEach((value, key) => {
    fdData[key] = value;
  });
  const amount = fd.get("amount");
  const rate = fd.get("rate");
  const months = fd.get("months");
  const captureUrl = fd.get("captureUrl");

  return { amount, rate, months, captureUrl };
}

function getFormErrors(): { key: string, error: string }[] {
  const errors = [];

  const {
    amount: amountStr,
    rate: rateStr,
    months: monthsStr,
    captureUrl,
  } = getFormRawData();

  if (!amountStr) errors.push({ key: "amount", error: "empty" });
  if (!rateStr) errors.push({ key: "rate", error: "empty" });
  if (!monthsStr) errors.push({ key: "months", error: "empty" });
  if (!captureUrl) errors.push({ key: "captureUrl", error: "empty" });

  const amountUSD = parseFloat(amountStr);
  if (isNaN(amountUSD)) errors.push({ key: "amount", error: "NaN" });

  const rateBs = parseFloat(rateStr);
  if (isNaN(rateBs)) errors.push({ key: "rate", error: "NaN" });

  return errors;
}

function formIsValid(): boolean {
  return !getFormErrors().length;
}

function getFormData(): SendMailInput | null {
  if (!formIsValid()) return null;

  const {
    amount: amountStr,
    rate: rateStr,
    months: monthsStr,
    captureUrl,
  } = getFormRawData();

  const amountUSD = parseFloat(amountStr);

  const rateBs = parseFloat(rateStr);
  
  const months = (monthsStr as string).split(" ");

  return { amountUSD, rateBs, months, captureUrl };
}

function handleFormInput() {
  console.log("is valid", getFormErrors())
  submitButtonEl.disabled = !formIsValid();
}

function setCaptureUrl(url: string) {
  inputCaptureUrlEl.value = url;
  handleFormInput();
}

function handleCaptureInputElementChange() {
  const file = inputCaptureEl.files![0];
  Storage.put(file.name, file, {
    contentType: file.type,
    resumable: true,
    progressCallback: (progress) => {
      setShowUploadingText(true, (progress.loaded * 100) / progress.total);
    },
    errorCallback: (err) => {
      console.log("ERROR UPLOADING FILE", err);
      setShowUploadingText(false);
    },
    completeCallback: (event) => {
      Storage.get(event.key!)
        .then((value) => {
          setCaptureUrl(value);
        })
        .catch((err) => console.log("ERROR", err))
        .finally(() => setShowUploadingText(false));
    },
  }).resume();
}

function setSubmitting(itIs: boolean) {
  if (itIs) {
    submitButtonEl.disabled = true;
    submitButtonEl.innerHTML = "Enviando...";
  } else {
    submitButtonEl.disabled = false;
    submitButtonEl.innerHTML = "Enviar";
  }
}

async function handleFormSubmit(e: SubmitEvent) {
  e.preventDefault();
  if (!formIsValid()) return;

  const input = getFormData();
  if (!input) return;

  setSubmitting(true);

  try {
    const session = await Auth.currentSession();
    const jwtToken = session.getIdToken().getJwtToken();
    
    API.post(
        "cmapi", 
        "/send-mail", 
        { 
          body: input, 
          headers: {
            "Authorization": `Bearer ${jwtToken}`
          },
        }
      )
        .then((response) => console.log("RESPONSE", response))
        .catch((err) => console.log("ERROR", err))
        .finally(() => setSubmitting(false));
  } catch (error) {
    console.log("Error sending email", error);
  }
}

function setShowUploadingText(show: boolean, perc?: number) {
  if (perc !== null && perc !== undefined) {
    uploadingTextEl.innerHTML = `Subiendo... ${perc}%`
  } else {
    uploadingTextEl.innerHTML = "Subiendo..."
  }
  if (show) return uploadingTextEl.classList.add("shown");
  return uploadingTextEl.classList.remove("shown");
}
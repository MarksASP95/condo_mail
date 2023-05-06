import amplifyConfig from "./aws-exports";
import { Amplify, API, Storage, Auth } from "aws-amplify";
import { SendMailInput } from './models/mail';
import { 
  getUploadingTextEl, 
  getInputCaptureEl, 
  getSubmitButtonEl, 
  getInputCaptureUrlEl, 
  getSignOutBtnEl,
  getForm,
} from "./domElements";
import { toggleSpinner } from "./spinner";
import { toggleMainContainer } from './utils';

const uploadingTextEl = getUploadingTextEl();
const inputCaptureEl = getInputCaptureEl();
const submitButtonEl = getSubmitButtonEl();
const inputCaptureUrlEl = getInputCaptureUrlEl();

const signOutBtnEl = getSignOutBtnEl();

Amplify.configure(amplifyConfig);

const form = getForm();

signOutBtnEl.addEventListener("click", signOutUser)

Auth.currentSession()
  .then(() => formInit())
  .catch(() => redirectToHome())
  .finally(() => toggleSpinner(false));

function signOutUser() {
  Auth.signOut()
    .then(() => {
      toggleMainContainer(false);
      toggleSpinner(true);
      redirectToHome();
    });
}

function formInit() {
  toggleMainContainer(true);
  inputCaptureEl.addEventListener("change", handleCaptureInputElementChange);
  form.addEventListener("submit", handleFormSubmit);
  form.addEventListener("input", handleFormInput);
}

function redirectToHome() {
  location.href = "/";
}

toggleSpinner(true);

function getFormRawData(): Record<string, any> {
  const fd = new FormData(form);
  const fdData: any = {};
  fd.forEach((value, key) => {
    fdData[key] = value;
  });
  const amount = fd.get("amount");
  const rate = fd.get("rate");
  const period = fd.get("period");
  const captureUrl = fd.get("captureUrl");

  return { amount, rate, period, captureUrl };
}

function getFormErrors(): { key: string, error: string }[] {
  const errors = [];

  const {
    amount: amountStr,
    rate: rateStr,
    period,
    captureUrl,
  } = getFormRawData();

  if (!amountStr) errors.push({ key: "amount", error: "empty" });
  if (!rateStr) errors.push({ key: "rate", error: "empty" });
  if (!period) errors.push({ key: "period", error: "empty" });
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
    period,
    captureUrl,
  } = getFormRawData();

  const amountUSD = parseFloat(amountStr);

  const rateBs = parseFloat(rateStr);

  return { amountUSD, rateBs, period, captureUrl };
}

function handleFormInput() {
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
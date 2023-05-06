import { toggleSpinner } from "./spinner";
import { toggleMainContainer } from "./utils";
import { getForm, getSubmitButtonEl } from "./domElements";
import amplifyConfig from "./aws-exports";
import { Amplify, Auth } from "aws-amplify";

const submitButtonEl = getSubmitButtonEl();
const form = getForm();
const badLoginTextEl = document.getElementById("bad-login-text")! as HTMLParagraphElement;

Amplify.configure(amplifyConfig);

toggleSpinner(true);

Auth.currentSession()
  .then(() => redirectToForm())
  .catch(() => loginInit())
  .finally(() => toggleSpinner(false));

function loginInit() {
  toggleMainContainer(true);
  form.addEventListener("submit", handleSubmit);
}

async function handleSubmit(e: SubmitEvent) {
  e.preventDefault();
  setSubmitting(true);
  toggleErrorText(false);

  const fd = new FormData(form);
  const fdData: any = {};
  fd.forEach((value, key) => {
    fdData[key] = value;
  });
  const email = fd.get("email") as any;
  const password = fd.get("password") as any;

  try {
    await signInUser(email, password);
    redirectToForm();
  } catch (error) {
    console.log("An error has ocurred", error);
    toggleErrorText(true);
  } finally {
    setSubmitting(false);
  }
}

function signInUser(email: string, password: string): Promise<any> {
  return Auth.signIn(email, password);
}

function toggleErrorText(show: boolean) {
  if (show) {
    badLoginTextEl.style.display = "initial";
  } else {
    badLoginTextEl.style.display = "none";
  }
}

function setSubmitting(itIs: boolean) {
  if (itIs) {
    submitButtonEl.disabled = true;
    submitButtonEl.innerHTML = "Espera...";
  } else {
    submitButtonEl.disabled = false;
    submitButtonEl.innerHTML = "Login";
  }
}

function redirectToForm() {
  location.href = "/form/index.html";
}
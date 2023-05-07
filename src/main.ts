import { toggleSpinner } from "./spinner";
import { toggleMainContainer } from "./utils";
import { getForm, getSubmitButtonEl } from "./domElements";
import amplifyConfig from "./aws-exports";
import { Amplify, Auth } from "aws-amplify";
import toastr, { error } from "toastr";

toastr.options.positionClass = "toast-top-center";

const submitButtonEl = getSubmitButtonEl();
const form = getForm();

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
  } catch (err) {
    error("Email o contraseña incorrectos");
    console.log("An error has ocurred", err);
  } finally {
    setSubmitting(false);
  }
}

function signInUser(email: string, password: string): Promise<any> {
  return Auth.signIn(email, password);
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
export const getSpinnerEl = () => document.getElementById("spinner")! as HTMLDivElement;
export const getUploadingTextEl = () => document.querySelector(".uploading-capture-text")! as HTMLParagraphElement;
export const getInputCaptureEl = () => document.getElementById("input-capture")! as HTMLInputElement;
export const getSubmitButtonEl = () => document.querySelector('button[type="submit"]')! as HTMLButtonElement;
export const getInputCaptureUrlEl = () => document.getElementById("capture-url-input")! as HTMLInputElement;
export const getForm = () => document.forms[0] as HTMLFormElement;
export const getSignOutBtnEl = () => document.getElementById("sign-out-btn") as HTMLButtonElement;
export const getMainContainerEl = () => document.getElementById("main-container") as HTMLDivElement;
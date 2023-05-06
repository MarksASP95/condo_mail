import { getMainContainerEl } from "./domElements";

const mainContainerEl = getMainContainerEl();

export function toggleMainContainer(show: boolean) {
  if (show) {
    mainContainerEl.style.display = "initial";
  } else {
    mainContainerEl.style.display = "none";
  }
}
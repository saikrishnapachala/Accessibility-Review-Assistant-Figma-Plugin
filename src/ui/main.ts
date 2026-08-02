import {
  isPluginToUiMessage,
  type PluginToUiMessage,
  type UiToPluginMessage,
} from "../contracts/messages";
import type { EnabledReviewCategories } from "../engines/run-engines";
import type { ReviewCategory } from "../render-plan/types";

function requiredElement<TElement extends Element>(selector: string): TElement {
  const element = document.querySelector<TElement>(selector);
  if (element === null) {
    throw new Error(`The plugin UI is missing required element: ${selector}`);
  }
  return element;
}

const selectedFrame = requiredElement<HTMLElement>("[data-selected-frame]");
const selectionMessage = requiredElement<HTMLElement>("[data-selection-message]");
const status = requiredElement<HTMLElement>("[data-status]");
const generateButton = requiredElement<HTMLButtonElement>("[data-generate]");
const removeButton = requiredElement<HTMLButtonElement>("[data-remove]");
const closeButton = requiredElement<HTMLButtonElement>("[data-close]");
const categoryInputs = Array.from(
  document.querySelectorAll<HTMLInputElement>("[data-category]"),
);

let validSelection = false;
let busy = false;

function post(message: UiToPluginMessage): void {
  parent.postMessage({ pluginMessage: message }, "*");
}

function setBusy(value: boolean): void {
  busy = value;
  generateButton.disabled = value || !validSelection;
  removeButton.disabled = value || !validSelection;
  for (const input of categoryInputs) {
    input.disabled = value;
  }
}

function setStatus(message: string, tone: "error" | "neutral" | "success"): void {
  status.textContent = message;
  status.dataset.tone = tone;
}

function readCategories(): EnabledReviewCategories {
  const enabled: Record<ReviewCategory, boolean> = {
    CONTENT_HIERARCHY: false,
    FOCUS_GROUPING: false,
    TAB_ORDER: false,
    TEXT_ALTERNATIVES: false,
  };

  for (const input of categoryInputs) {
    const category = input.dataset.category as ReviewCategory | undefined;
    if (category !== undefined && category in enabled) {
      enabled[category] = input.checked;
    }
  }
  return enabled;
}

function handlePluginMessage(message: PluginToUiMessage): void {
  switch (message.type) {
    case "selection-state":
      validSelection = message.selection.valid;
      selectedFrame.textContent = message.selection.frameName ?? "No valid frame selected";
      selectionMessage.textContent = message.selection.message;
      selectionMessage.dataset.valid = String(message.selection.valid);
      setBusy(false);
      break;
    case "progress":
      setBusy(true);
      setStatus(message.message, "neutral");
      break;
    case "complete":
      setBusy(false);
      setStatus(
        `Created ${message.sectionCount} sections with ${message.annotationCount} annotations in ${(message.durationMs / 1000).toFixed(1)}s.`,
        "success",
      );
      break;
    case "removed":
      setBusy(false);
      setStatus(
        message.removedCount === 0
          ? "No generated workspace was found for this screen."
          : "Removed the generated review workspace.",
        "success",
      );
      break;
    case "error":
      setBusy(false);
      setStatus(message.message, "error");
      break;
  }
}

generateButton.addEventListener("click", () => {
  const categories = readCategories();
  if (!Object.values(categories).some(Boolean)) {
    setStatus("Enable at least one review category.", "error");
    return;
  }

  setBusy(true);
  setStatus("Starting generation…", "neutral");
  post({ categories, type: "generate" });
});

removeButton.addEventListener("click", () => {
  setBusy(true);
  post({ type: "remove-generated" });
});

closeButton.addEventListener("click", () => {
  post({ type: "close" });
});

window.addEventListener("message", (event: MessageEvent<unknown>) => {
  const payload = event.data;
  if (
    typeof payload === "object" &&
    payload !== null &&
    "pluginMessage" in payload &&
    isPluginToUiMessage(payload.pluginMessage)
  ) {
    handlePluginMessage(payload.pluginMessage);
  }
});

setBusy(false);
post({ type: "refresh-selection" });

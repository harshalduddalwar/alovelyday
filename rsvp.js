// RSVPs are emailed through FormSubmit (https://formsubmit.co), since GitHub Pages has no backend.
// After the first submission, FormSubmit sends an activation email to this address; click it once.
const RSVP_ENDPOINT = "https://formsubmit.co/ajax/alovelyday.us@gmail.com";

const dialog = document.getElementById("rsvp");
const form = document.getElementById("rsvp-form");
const yesFields = document.getElementById("rsvp-yes-fields");
const messageField = document.getElementById("rsvp-message-field");
const errorEl = document.getElementById("rsvp-error");
const submitBtn = document.getElementById("rsvp-submit");
const done = document.getElementById("rsvp-done");

function resetDialog() {
  form.reset();
  form.hidden = false;
  done.hidden = true;
  yesFields.hidden = true;
  messageField.hidden = true;
  errorEl.hidden = true;
  submitBtn.disabled = false;
  submitBtn.textContent = "Submit";
}

document.getElementById("rsvp-open").addEventListener("click", () => {
  resetDialog();
  dialog.showModal();
});

for (const id of ["rsvp-close", "rsvp-done-close"]) {
  document.getElementById(id).addEventListener("click", () => dialog.close());
}

// Close when clicking the backdrop
dialog.addEventListener("click", (e) => {
  if (e.target === dialog) dialog.close();
});

form.addEventListener("change", (e) => {
  if (e.target.name !== "Attending") return;
  yesFields.hidden = e.target.value !== "Yes";
  messageField.hidden = false;
});

function showError(text) {
  errorEl.textContent = text;
  errorEl.hidden = false;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  errorEl.hidden = true;

  const data = new FormData(form);
  const name = (data.get("Name") || "").trim();
  const attending = data.get("Attending");
  const guests = Number(data.get("Guests"));

  if (!name) return showError("Please enter your name.");
  if (!attending) return showError("Please choose yes or no.");
  if (attending === "Yes" && !(guests >= 1)) return showError("Please enter how many people are coming.");

  const payload = {
    _subject: `RSVP: ${name} (${attending === "Yes" ? `Yes, ${guests}` : "No"})`,
    _template: "table",
    _captcha: "false",
    _honey: data.get("_honey"),
    Name: name,
    Attending: attending,
    Guests: attending === "Yes" ? guests : 0,
    Message: (data.get("Message") || "").trim() || "(none)",
  };

  submitBtn.disabled = true;
  submitBtn.textContent = "Sending…";

  try {
    const res = await fetch(RSVP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    // FormSubmit answers 200 even when it didn't send (e.g. not activated yet), so check its reply
    const reply = await res.json().catch(() => ({}));
    if (!res.ok || String(reply.success) !== "true") {
      console.warn("RSVP not sent:", res.status, reply);
      throw new Error(reply.message || res.status);
    }

    document.getElementById("rsvp-done-text").textContent =
      attending === "Yes"
        ? "We can't wait to celebrate with you."
        : "We'll miss you, and thank you for letting us know.";
    form.hidden = true;
    done.hidden = false;
  } catch (err) {
    submitBtn.disabled = false;
    submitBtn.textContent = "Submit";
    const detail = err && err.message && isNaN(err.message) ? ` (${err.message})` : "";
    showError(`Your RSVP didn't send. Please try again in a moment.${detail}`);
  }
});

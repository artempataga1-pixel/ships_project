(function () {
  "use strict";

  const form = document.querySelector("#pb-contact-form");
  if (!form) return;

  const submitButton = form.querySelector(".pb-contact__submit");
  const status = form.querySelector(".pb-contact__status");
  const phone = form.querySelector("input[name='phone']");
  const fields = Array.from(form.querySelectorAll("input[required], textarea[required]"));

  function setStatus(message, state) {
    status.textContent = message;
    if (state) status.dataset.state = state;
    else delete status.dataset.state;
  }

  function normalizePhone(value) {
    return value.replace(/[^\d+()\-\s]/g, "").slice(0, 22);
  }

  function isPhoneValid(value) {
    return value.replace(/\D/g, "").length >= 10;
  }

  function validateField(field) {
    let valid = field.checkValidity();
    if (field.name === "phone") valid = valid && isPhoneValid(field.value);
    field.setAttribute("aria-invalid", String(!valid));
    return valid;
  }

  phone.addEventListener("input", function () {
    const cleaned = normalizePhone(phone.value);
    if (phone.value !== cleaned) phone.value = cleaned;
    phone.removeAttribute("aria-invalid");
  });

  fields.forEach(function (field) {
    field.addEventListener("input", function () {
      field.removeAttribute("aria-invalid");
      setStatus("");
    });
    field.addEventListener("blur", function () {
      if (field.value) validateField(field);
    });
  });

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    setStatus("");

    const firstInvalid = fields.find(function (field) {
      return !validateField(field);
    });

    if (firstInvalid) {
      setStatus("Проверьте правильность заполнения полей.", "error");
      firstInvalid.focus();
      return;
    }

    const formData = new FormData(form);
    if (formData.get("website")) return;

    const payload = Object.fromEntries(formData.entries());
    delete payload.website;
    const endpoint = (form.dataset.endpoint || "").trim();

    submitButton.disabled = true;
    submitButton.setAttribute("aria-busy", "true");

    try {
      if (endpoint) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error("HTTP " + response.status);
      } else {
        /*
          Универсальный способ интеграции без изменения этого файла:
          внешний код может слушать событие contact-form:submit.
        */
        form.dispatchEvent(new CustomEvent("contact-form:submit", {
          bubbles: true,
          detail: payload
        }));
        await new Promise(function (resolve) { window.setTimeout(resolve, 450); });
      }

      form.reset();
      fields.forEach(function (field) { field.removeAttribute("aria-invalid"); });
      setStatus("Спасибо! Заявка принята. Мы скоро свяжемся с вами.", "success");
    } catch (error) {
      console.error("Contact form error:", error);
      setStatus("Не удалось отправить заявку. Попробуйте ещё раз или позвоните нам.", "error");
    } finally {
      submitButton.disabled = false;
      submitButton.removeAttribute("aria-busy");
    }
  });
})();

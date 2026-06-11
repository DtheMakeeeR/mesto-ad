function displayError(formElement, inputElement, errorMessage, config) {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.add(config.inputErrorClass);
  errorElement.textContent = errorMessage;
  errorElement.classList.add(config.errorClass);
}

function hideError(formElement, inputElement, config) {
  const errorElement = formElement.querySelector(`.${inputElement.id}-error`);
  inputElement.classList.remove(config.inputErrorClass);
  errorElement.classList.remove(config.errorClass);
  errorElement.textContent = '';
}

function checkValidity(formElement, inputElement, config) {
  if (inputElement.validity.patternMismatch) {
    inputElement.setCustomValidity(inputElement.dataset.errorMessage);
  } else {
    inputElement.setCustomValidity('');
  }

  if (!inputElement.validity.valid) {
    displayError(formElement, inputElement, inputElement.validationMessage, config);
  } else {
    hideError(formElement, inputElement, config);
  }
}

function hasInvalid(inputs) {
  return inputs.some(function (input) {
    return !input.validity.valid;
  });
}

function disableButton(button, config) {
  button.disabled = true;
  button.classList.add(config.inactiveButtonClass);
}

function enableButton(button, config) {
  button.disabled = false;
  button.classList.remove(config.inactiveButtonClass);
}

function toggleButton(inputs, button, config) {
  if (hasInvalid(inputs)) {
    disableButton(button, config);
  } else {
    enableButton(button, config);
  }
}

function attachEvents(form, config) {
  const inputs = Array.from(form.querySelectorAll(config.inputSelector));
  const button = form.querySelector(config.submitButtonSelector);

  toggleButton(inputs, button, config);

  inputs.forEach(function (input) {
    input.addEventListener('input', function () {
      checkValidity(form, input, config);
      toggleButton(inputs, button, config);
    });
  });
}

export function enableValidation(config) {
  const forms = Array.from(document.querySelectorAll(config.formSelector));
  forms.forEach(function (form) {
    attachEvents(form, config);
  });
}

export function clearValidation(form, config) {
  const inputs = Array.from(form.querySelectorAll(config.inputSelector));
  const button = form.querySelector(config.submitButtonSelector);

  inputs.forEach(function (input) {
    input.setCustomValidity('');
    hideError(form, input, config);
  });

  disableButton(button, config);
}

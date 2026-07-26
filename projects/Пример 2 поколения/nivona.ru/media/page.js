/* Create serial form */





const modal = {
  bindModal() {
    const trigger = document.querySelectorAll('[popup-button]'),
    modal = document.querySelector('[popup-wrapper]'),
    close = document.querySelector('[popup-close]');

    if (!trigger || !modal || !close) {
      console.error('One or more elements not found');
      return false;
    }

    trigger.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target) {
          e.preventDefault();
        }
        this.setContent(modal, e.target);
        this.popupOpen();
      });
    });

    close.addEventListener('click', () => {
      this.popupClose(modal);
    });

    //xxx Закрытие формы по клику вне модального окна
    // modal.addEventListener('click', (e) => {
    //   if (e.target === modal) {
    //     this.popupClose(modal);
    //   }
    // });
  },
  popupOpen() {
    document.body.classList.add('popup-open');
  },
  popupClose(modal) {
    if (!modal) {
      console.error('Modal element not found');
      return new Error('Modal element not found');
    }
    modal.querySelectorAll('[popup-content]').forEach((item) => (item.hidden = true));
    document.body.classList.remove('popup-open');
    document.getElementById('loader').innerText = '';
    document.getElementById('loader').classList.add('hidden');
    clearForm(document.querySelector('#feedback-form'));
  },
  setContent(modal, elem) {
    if (!modal || !elem) {
      console.error('Modal or element not found');
      return new Error('Modal or element not found');
    }
    const content = modal.querySelectorAll(`[popup-content="${elem.getAttribute('popup-content')}"]`);
    if (!content.length) {
      console.error('Content element not found');
      return new Error('Content element not found');
    }
    content.forEach((item) => (item.hidden = false));
  },
};

document.addEventListener('DOMContentLoaded', async function () {
  console.log('%c Create serial form ', 'background:indigo;color:white;padding:5px;');

  if (testUrlActive('/page/servis-i-podderzhka')) {
    document.getElementById('sn_button').appendChild(document.getElementById('sc-feedback'));
  }

  try {
    modal.bindModal();
    inputBehavior();
    observeFormSuccess();

    sendForm();
  } catch (error) {
    console.log('%c Create serial form error >> ', 'background:darkred;color:white;padding:5px;', error);
  }

});

/* BEHAVIOR OF THE FEEDBACK FORM */
function textareaHeight(formWidth) {
  // const maxWidth = document.querySelector('#feedback-form').clientWidth;
  // console.log('maxWidth: ', maxWidth);

  let maxWidth = formWidth || 300;
  const maxHeight = 250;
  const textarea = document.querySelector('textarea[form-textarea]');
  if (!textarea) {
    console.warn('Textarea not found.. Skipping textarea height');
    return;
  }
  textarea.style.maxWidth = maxWidth + 'px';
  textarea.style.minWidth = maxWidth + 'px';
  textarea.addEventListener('input', function () {
    if (this.clientHeight > maxHeight) return;
    if (this.scrollHeight > this.clientHeight) this.style.height = this.scrollHeight + 5 + 'px';
  });

  window.addEventListener('resize', () => {
    maxWidth = document.querySelector('#feedback-form').clientWidth;
    textarea.style.maxWidth = maxWidth + 'px';
    textarea.style.minWidth = maxWidth + 'px';
  });
}

function inputBehavior() {
  const form = document.querySelector('#feedback-form');
  const inputs = form.querySelectorAll('input[type="text"], textarea, select');
  const input_files = form.querySelectorAll('[form-field-file]');
  const serial_num = form.querySelector('#serial');
  if (!form || !inputs || !input_files) {
    console.error('Form or inputs or files not found');
    return;
  }
  // $('#serial[name="serialNumber"]').inputmask('999999999999999', {
  $('#serial[name="serialNumber"]').inputmask('9{17}', {
    clearIncomplete: false,
    showMaskOnHover: false,
    showMaskOnFocus: false,
    placeholder: ' ',
    // oncomplete: function (e) {
    //   console.log('oncomplete ', e);
    // },
    //xxx ODX-2525 Нужно дать возможность отправлять серийные номера 15 и 17 символов.
    onincomplete: function (e) {
      let serialNumberLength = e.currentTarget.value.trim().length;
      let serialNumber = e.currentTarget.value.trim();
      if(serialNumberLength < 15) {
        e.currentTarget.value = '';
      }
      if (serialNumberLength == 16) {
        serialNumber = (e.currentTarget.value.trim()).slice(0, -1);
        e.currentTarget.value = serialNumber;
      }
    },
    // oncleared: function (e) {
    //   console.log('oncleared ', e);
    // }
  });
  inputs.forEach((element) => {
    element.addEventListener('focus', () => {
      element.closest('.feedback-form-group__field').querySelector('label').classList.add('focus');
    });
    element.addEventListener('blur', () => {
      if (element.value.length === 0) {
        element.closest('.feedback-form-group__field').querySelector('label').classList.remove('focus');
      }
    });
  });
  input_files.forEach((element) => {
    let input = element.closest('.form-field-file').querySelector('input[type="file"]');
    checkFiles(input, element);
    element.addEventListener('click', () => {
      element.closest('.form-field-file').querySelector('input[type="file"]').click();
    });
  });
};

function checkFiles(input, element) {
  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      console.log('input.files: ', input.files);
      element.closest('.form-field').querySelector('[form-field-downloaded]').innerText = '';
      for (let i = 0; i < input.files.length; i++) {
        element
          .closest('.form-field')
          .querySelector('[form-field-downloaded]')
          .insertAdjacentHTML(
            'beforeend',
            `<span><small>${input.files[i].name} - ${formatBytes(input.files[i].size)}</small></span>`
          );
      }
      textareaResize();
    } else {
      element.closest('.form-field').querySelector('[form-field-downloaded]').innerText = '';
    }
  });
}

function sendForm() {
  function toggleLoader(mesage) {
    const loader = document.getElementById('loader');
    loader.innerText = mesage || 'Отправка...';
    loader.classList.toggle('hidden');
  }
  function onSuccess(message) {
    console.log(`%c ${message || "Номер успешно зарегестрирован"} `, 'background:darkgreen;color:white;');
    // formNode.classList.toggle('hidden');
    toggleLoader(message || 'Номер успешно зарегестрирован');
    // setTimeout(() => {
    //   document.querySelector('#feedback-form').reset();
    //   document.getElementById('loader').toggle('hidden');
    // }, 8000)
  }
  function onError(error) {
    console.error('Error: ', error.message);
    toggleLoader(error.message || 'Что-то пошло не так... Попробуйте ещё раз');
  }

  async function serializeForm(formNode) {
    const data = await new FormData(formNode);
    let serial = data.get('serialNumber');
    if(serial) {
      serial = serial.trim();
      data.set('serialNumber', serial);
    }
    return data;
  }

  async function sendData(data) {

    try {
      const myHeaders = new Headers();
      const formdata = data;
      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: formdata,
      };

      // const response = await fetch("http://79.111.246.166:8080/api/v1/sn/serialNumberRegistration", requestOptions);
      const response = await fetch("https://ias.omnicrm.ru/serialnum/api/v1/sn/serialNumberRegistration", requestOptions);
      const result = await response.json();
      return result;
    } catch (error) {
      console.log('%c Error >> ', 'background:darkred;color:white;padding:8px;', error);
      return error;
    }
  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    const data = await serializeForm(event.target);
    data.delete('policy');
    data.set('datePurchase', data.get('datePurchase').split('-').reverse().join('.'));
    // console.log('%c handleFormSubmit data >> ', 'background:darkgreen;color:white;padding:5px;', (Object.fromEntries(data)));
    document.getElementById('loader').classList.remove('hidden');
    document.getElementById('loader').innerText = 'Отправка...';

    const resp = await sendData(data);
    console.log('%c resp >> ', 'background:blue;color:white;padding:5px;', resp);
    toggleLoader();

    if(resp.success) {
      console.log('%c resp.message >> ', 'background:darkgreen;color:white;padding:5px;', resp.message || resp.massage);
      onSuccess(resp.message);
    }
    if(!resp.success) {
      console.log('%c resp error>> ', 'background:darkred;color:white;padding:5px;', resp.error[0].text ? resp.error[0].text : resp.error);
      onError(resp.error[0].text ? {message: resp.error[0].text} : {message: 'Что-то пошло не так... Попробуйте ещё раз'});
    }
  }

  const applicantForm = document.querySelector('#feedback-form');
  applicantForm.addEventListener('submit', handleFormSubmit);
  // applicantForm.addEventListener('input', checkValidity);
}

function textareaResize(maxWidth, textarea) {
  if (!textarea) {
    textarea = document.querySelector('textarea[form-textarea]');
  }
  if (!textarea) {
    return;
  }
  if (!maxWidth) {
    maxWidth = document.querySelector('#feedback-form').clientWidth;
  }
  textarea.style.maxWidth = maxWidth + 'px';
  textarea.style.minWidth = maxWidth + 'px';
}

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) {
    return '0';
  } else {
    var k = 1024;
    var dm = decimals < 0 ? 0 : decimals;
    var sizes = ['байт', 'КБ', 'МБ', 'ГБ', 'ТБ'];
    var i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + '\u00A0' + sizes[i];
  }
}

function observeFormSuccess() {
  const successMessage = document.querySelector('body');

  const observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'attributes' && successMessage.classList.contains('popup-open')) {
        const formWidth = document.querySelector('#feedback-form').clientWidth;
        textareaHeight(formWidth);
      }
    }
  });

  observer.observe(successMessage, { attributes: true });
};

function clearForm(formNode) {
  let inputFiles = formNode.querySelectorAll('input[type="file"]');
  formNode.reset();
  // console.log('%c clearForm ', 'background:teal;color:white;padding:5px;');

  inputFiles.forEach((e)=> {
    e.value = null;
    e.closest('.form-field').querySelector('[form-field-downloaded]').innerText = '';
  });
};

function testUrlActive(_url) {
	return window.location.href.indexOf(_url) > -1;
};
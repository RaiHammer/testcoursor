// функционал фидбека скрыт 28.12.2024 из-за ненадобности. Функции ниже остались, но много нюансов, аккуратнее!

document.addEventListener("DOMContentLoaded", function() { 
  if (!_sc_file) {
    console.log('%c File for service centers is not found... ', 'background:darkred;color:white;');
    return false;
  }
  const dataLimit = Number($('.js-select-block').attr('data-limit'));
  getData(_sc_file, dataLimit);

  $(document).on('click', function (e) {
    if (!e.target.classList.contains('js-search-arrow')) {
      $('.js-select-block').attr('data-active', 'false');
    };
    if (e.target.classList.contains('js-search-arrow')) {
      $('.js-select-block').attr('data-active') == 'false' ? $('.js-select-block').attr('data-active', 'true') : $('.js-select-block').attr('data-active', 'false');
    }
    if (e.target.classList.contains('js-select-item')) {
      $('.js-search-field').val(e.target.textContent);
      $('#sc-search-clear').css('display', 'flex');
    }
  })
});

async function getData (_sc_file, limit) {
  let data = await getFile(_sc_file);
  let menuList = renderMenu(data);
  let dataSearch = await searchData(data, 'все города');
  if (dataSearch.length > limit) {
    dataSearch = await chunks(dataSearch, limit);
  }
  let html = await renderData(dataSearch[0]);
  $('.js-sc-wrapper').html('').append(html);
  await renderPagination(dataSearch);

  $('.js-select-item').on('click', async function (e) {
    let search = e.target.textContent;
    let dataSearch = await searchData(data, search);
    //console.log('dataSearch: ', dataSearch);
    if (dataSearch.length > limit) {
      let dataChunks = await chunks(dataSearch, limit);
      let html = await renderData(dataChunks[0]);
      $('.js-sc-wrapper').html('').append(html);
      await renderPagination(dataChunks);
    } else {
      let html = await renderData(dataSearch);
      $('.js-sc-wrapper').html('').append(html);
      $('.js-sc-pagination').html('');
    }
  });

  $('#sc-search-clear').on('click', async function () {
    $('.js-search-field').val('Все города');
    $('#sc-search-clear').css('display', 'none');
    let dataSearch = await searchData(data, 'все города');
    let dataChunks = await chunks(dataSearch, limit);
    let html = await renderData(dataChunks[0]);
    $('.js-sc-wrapper').html('').append(html);
    await renderPagination(dataChunks);
  });

  $('.js-search-field').on('input', async function () {
    if ($(this).val().length == 0) {
      let dataSearch = await searchData(data, 'все города');
      let dataChunks = await chunks(dataSearch, limit);
      let html = await renderData(dataChunks[0]);
      $('.js-sc-wrapper').html('').append(html);
      await renderPagination(dataChunks);
    }
    if ($(this).val().length > 0) {
      $('#sc-search-clear').css('display', 'flex');
    } else {
      $('#sc-search-clear').css('display', 'none');
    }
    if ($(this).val().length > 2) {
      let dataSearch = await searchData(data, $(this).val());
      if (dataSearch.length > limit) {
        let dataChunks = await chunks(dataSearch, limit);
        let html = await renderData(dataChunks[0]);
        $('.js-sc-wrapper').html('').append(html);
        await renderPagination(dataChunks);
      } else {
        let html = await renderData(dataSearch);
        $('.js-sc-wrapper').html('').append(html);
        $('.js-sc-pagination').html('');
      }
    }
  });

  let inputValue = '';
  $('.js-search-field').on('focus', function () {
    // console.log('%c  focus ', 'background:olive;color:white;', $(this).val() );
    if ($(this).val() != '') {
      inputValue = $(this).val();
    }
    $(this).val('');
  });
  $('.js-search-field').on('blur', function () {
    // console.log('%c  blur ', 'background:olive;color:white;', $(this).val() );
    if ($(this).val() == '' && inputValue != '') {
      $(this).val(inputValue);
    }
  });

  let pages = 0;
  $('.js-sc-pagination').on('click', async function (e) {
    let html = '';

    if ($(e.target).closest('[data-navigation]').length > 0 && $(e.target).closest('[data-navigation]').attr('data-navigation') == 'next') {
      pages++;
      //console.log('pages: ', pages);
      html = await renderData(dataSearch[pages]);
      $('.js-sc-wrapper').html('').append(html);
    }
    if ($(e.target).closest('[data-navigation]').length > 0 && $(e.target).closest('[data-navigation]').attr('data-navigation') == 'prev') {
      pages--;
      //console.log('pages: ', pages);
      html = await renderData(dataSearch[pages]);
      $('.js-sc-wrapper').html('').append(html);
    }
    if ($(e.target).closest('[data-page]').length > 0 && $(e.target).closest('[data-page]')) {
      pages = $(e.target).closest('[data-page]').attr('data-page');
      html = await renderData(dataSearch[$(e.target).closest('[data-page]').attr('data-page')]);
      $('.js-sc-wrapper').html('').append(html);
    }
    pages > 0 ? $('[data-navigation="prev"]').removeClass('disabled') : $('[data-navigation="prev"]').addClass('disabled');
    pages < dataSearch.length - 1 ? $('[data-navigation="next"]').removeClass('disabled') : $('[data-navigation="next"]').addClass('disabled');
    $(`[data-page]`).removeClass('active');
    $(`[data-page="${pages}"]`).addClass('active');
  });
}

async function getFile (_sc_file) {
  let responce;
  try {
    await $.ajax({
      url: _sc_file,
      type: 'GET',
      datatype: 'json',
      success: function (data) {
        //console.log('%c >> getFile ', 'background:teal;color:white;', data.Nivona);
        responce = data.Nivona;
      }
    });
  } catch (error) {
    console.log('%c error ', 'background:red;color:white;', error);
  }
  return responce;
}
async function renderMenu (arr) {
  const searchAddresses = arr.map((item) => `<li class="select-list-item js-select-item">${item.Город.replace(/;/g, '')}</li>`).filter((item, index, self) => self.indexOf(item) == index).join('');
  $('.js-select-list').html('').append(`<li class="select-list-item js-select-item">Все города</li>`).append(searchAddresses);
}
async function renderData (data) {
  //console.log('%c >> renderData ', 'background:teal;color:white;', data);
  let template = data.map((item, index) => {
    let phones = item.Телефон.replace(/;/g, '').split(',').map((item) => { return `<div class="sc-block-item__phones-text">${item}</div>`; }).join('');
    return `
        <div class="sc-block" data-city="${item.Город}" data-id="${index}">
          <div class="sc-block-title">${item['Название СЦ']}</div>
          <div class="sc-block-item">
            <div class="sc-block-item__address">
            <div class="sc-block-item__address-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"> <path d="M10 9.36678C11.5075 9.36678 12.7334 8.14087 12.7334 6.63343C12.7334 5.12599 11.5075 3.90009 10 3.90009C8.49257 3.90009 7.26666 5.12599 7.26666 6.63343C7.26666 8.14087 8.49257 9.36678 10 9.36678ZM10 5.26676C10.7537 5.26676 11.3667 5.87971 11.3667 6.63343C11.3667 7.38715 10.7537 8.00011 10 8.00011C9.24629 8.00011 8.63334 7.38715 8.63334 6.63343C8.63334 5.87971 9.24629 5.26676 10 5.26676Z" fill="#E4032E"/> <path d="M9.60367 14.7064C9.71932 14.789 9.85789 14.8334 10 14.8334C10.1421 14.8334 10.2807 14.789 10.3963 14.7064C10.6041 14.5595 15.4865 11.0341 15.4667 6.63344C15.4667 3.61924 13.0142 1.16675 10 1.16675C6.9858 1.16675 4.53331 3.61924 4.53331 6.63003C4.51349 11.0341 9.39593 14.5595 9.60367 14.7064ZM10 2.53342C12.2612 2.53342 14.1 4.37228 14.1 6.63686C14.1144 9.66951 11.1015 12.3926 10 13.2857C8.89915 12.3919 5.88563 9.66814 5.89998 6.63344C5.89998 4.37228 7.73884 2.53342 10 2.53342Z" fill="#E4032E"/> </svg></div>
            <div class="sc-block-item__address-text">${item.Адрес}</div>
            </div>
            <div class="sc-block-item__phones">
            <div class="sc-block-item__phones-icon"><svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"> <path d="M15.3079 9.77683L12.5911 8.55892L12.5808 8.55431C12.4042 8.47817 12.2113 8.44753 12.0198 8.46516C11.8283 8.4828 11.6443 8.54816 11.4846 8.65527C11.4622 8.67026 11.4406 8.68644 11.42 8.70373L10.1328 9.79991C9.38281 9.39317 8.60798 8.62469 8.20067 7.88391L9.30031 6.57657C9.31798 6.55547 9.33436 6.53332 9.34935 6.51022C9.45364 6.35108 9.51697 6.16861 9.53368 5.97907C9.55039 5.78953 9.51996 5.59879 9.44512 5.42386C9.44334 5.42051 9.4418 5.41704 9.4405 5.41347L8.22317 2.69207C8.12324 2.46448 7.95271 2.27511 7.73679 2.15198C7.52087 2.02885 7.27105 1.97851 7.0243 2.0084C6.1868 2.11842 5.41799 2.52953 4.86145 3.16496C4.30491 3.80038 3.9987 4.61667 4 5.46136C4 10.1697 7.83028 14 12.5386 14C13.3833 14.0013 14.1996 13.6951 14.835 13.1386C15.4705 12.582 15.8816 11.8132 15.9916 10.9757C16.0215 10.7289 15.9711 10.4791 15.848 10.2632C15.7249 10.0473 15.5355 9.87675 15.3079 9.77683ZM12.5386 12.6154C10.642 12.6131 8.82367 11.8586 7.48253 10.5175C6.1414 9.17633 5.38694 7.35801 5.38465 5.46136C5.38333 4.98336 5.5456 4.51931 5.84451 4.1463C6.14342 3.7733 6.56096 3.5138 7.02776 3.41093L8.11355 5.83406L7.00814 7.15062C6.99028 7.17191 6.97371 7.19426 6.95853 7.21755C6.84957 7.38402 6.78552 7.57584 6.77258 7.77438C6.75964 7.97293 6.79825 8.17144 6.88468 8.35065C7.42815 9.46298 8.54798 10.5753 9.67185 11.1199C9.85226 11.2055 10.0518 11.2427 10.2509 11.2281C10.45 11.2134 10.6419 11.1473 10.8078 11.0363C10.8301 11.0212 10.8515 11.0049 10.8719 10.9872L12.1659 9.88703L14.5891 10.9722C14.4862 11.439 14.2267 11.8566 13.8537 12.1555C13.4807 12.4544 13.0166 12.6167 12.5386 12.6154Z" fill="#E4032E"/> </svg></div>
            <div class="sc-block-item__phones-list">
              ${phones}
            </div>
            </div>
          </div>
        </div>
      `;
  })

  template = template.filter(element => element != undefined);
  const html = template.join('');
  return html;
  $('.js-sc-wrapper').html('').append(html);
}

async function renderPagination (data) {
  const arrowPrev = `<div class="sc-pagination__item disabled" data-navigation="prev"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"> <path d="M14.4554 6.70538C14.8447 7.09466 14.845 7.72569 14.4562 8.11538L10.58 12L14.4562 15.8846C14.845 16.2743 14.8447 16.9053 14.4554 17.2946C14.0658 17.6842 13.4342 17.6842 13.0446 17.2946L7.75003 12L13.0446 6.70538C13.4342 6.31581 14.0658 6.31581 14.4554 6.70538Z" fill="#13002D"/> </svg></div>`;
  const arrowNext = `<div class="sc-pagination__item" data-navigation="next"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"> <path d="M14.4554 6.70538C14.8447 7.09466 14.845 7.72569 14.4562 8.11538L10.58 12L14.4562 15.8846C14.845 16.2743 14.8447 16.9053 14.4554 17.2946C14.0658 17.6842 13.4342 17.6842 13.0446 17.2946L7.75003 12L13.0446 6.70538C13.4342 6.31581 14.0658 6.31581 14.4554 6.70538Z" fill="#13002D"/> </svg></div>`;
  const template = data.map((item, index) => {
    return `<div class="sc-pagination__item" data-page="${index}">${index + 1}</div>`
  });
  $('.js-sc-pagination').html('').append(template.join(''));
  $('.js-sc-pagination').prepend(arrowPrev).append(arrowNext);
  $('[data-page="0"]').addClass('active');
}
async function searchData (data, search) {
  let template = data.map((item) => {
    if (item.Город.toLowerCase().includes(search.toLowerCase())) {
      return item
    }
    if (search.toLowerCase() == 'все города') {
      return item
    }
  });
  template = template.filter(element => element != undefined);
  return template;
}

function chunks (arr, n) {
  //console.log('arr.length: ', arr.length);
  let chunks = [];
  for (let i = 0; i < arr.length; i += n) {
    chunks.push(arr.slice(i, i + n));
  }
  return chunks;
};




/* POPUP SC FORM */
const modalSCform = {
  bindModal() {
    const trigger = document.querySelectorAll('[popup-button]'),
      modals = document.querySelector('[popup-wrapper]'),
      close = document.querySelector('[popup-close]');

    if (!trigger || !modals || !close) {
      console.error('One or more elements not found');
      return;
    }

    trigger.forEach((item) => {
      item.addEventListener('click', (e) => {
        if (e.target) {
          e.preventDefault();
        }
        this.setContent(modals, e.target);
        this.popupOpen();
      });
    });

    close.addEventListener('click', () => {
      this.popupClose(modals);
    });

    modals.addEventListener('click', (e) => {
      if (e.target === modals) {
        this.popupClose(modals);
      }
    });
  },
  popupOpen() {
    document.body.classList.add('popup-open');
  },
  popupClose(modals) {
    if (!modals) {
      console.error('Modal element not found');
      return;
    }
    modals.querySelectorAll('[popup-content]').forEach((item) => (item.hidden = true));
    document.body.classList.remove('popup-open');
  },
  setContent(modals, elem) {
    if (!modals || !elem) {
      console.error('Modal or element not found');
      return;
    }
    const content = modals.querySelectorAll(`[popup-content="${elem.getAttribute('popup-content')}"]`);
    if (!content.length) {
      console.error('Content element not found');
      return;
    }
    content.forEach((item) => (item.hidden = false));
  },
};


document.addEventListener('DOMContentLoaded', function () {
  modalSCform.bindModal();
  inputBehavior();
  observeFormSuccess();

  sendForm();
});

/* BEHAVIOR OF THE FEEDBACK FORM */
function textareaHeight(formWidth) {
  // const maxWidth = document.querySelector('#feedback-form').clientWidth;
  // console.log('maxWidth: ', maxWidth);

  let maxWidth = formWidth || 300;
  const maxHeight = 250;
  const textarea = document.querySelector('textarea[form-textarea]');
  if (!textarea) {
    console.error('Textarea not found');
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
  if (!form || !inputs || !input_files) {
    console.error('Form or inputs or files not found');
    return;
  }
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
}

function checkFiles(input, element) {
  input.addEventListener('change', () => {
    if (input.files.length > 0) {
      console.log('input.files: ', input.files);
      element.closest('.form-field').querySelector('[form-field-downloaded]').innerText = '';
      for (let i = 0; i < input.files.length; i++) {
        element
          .closest('.form-field')
          .querySelector('[form-field-downloaded]')
          .insertAdjacentHTML('beforeend', `<span><small>${input.files[i].name} - ${formatBytes(input.files[i].size)}</small></span>`);
      };
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
  function onSuccess(formNode) {
    // console.log('%c Заявка успешно отправлена!', 'background:teal;color:white;');
    // formNode.classList.toggle('hidden');
    toggleLoader('Заявка успешно отправлена!');
  }
  function onError(error) {
    console.error(error.message);
  }

  function serializeForm(formNode) {
    const data = new FormData(formNode);
    return data;
  }

  async function sendData(data) {
    // return await fetch('/api/apply/', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'multipart/form-data' },
    //   body: data,
    // });

    //fixme поддельный ответ от сервера:
    return new Promise(resolve => {
      setTimeout(() => {
        resolve({
          status: 200,
          error: null
        })
      }, 2000);
    })

    // return new Promise(resolve => {
    //   setTimeout(() => {
    //     resolve({
    //       status: 400,
    //       error: {
    //         message: 'Что-то пошло не так!'
    //       }
    //     })
    //   }, 2000);
    // })

  }

  async function handleFormSubmit(event) {
    event.preventDefault();
    const data = serializeForm(event.target);

    console.log('%c handleFormSubmit data >> ', 'background:teal;color:white;', Array.from(data.entries()));
    toggleLoader();

    const { status, error } = await sendData(data);
    toggleLoader();

    if (status === 200) onSuccess(event.target);
    else onError(error);
  }

  const applicantForm = document.querySelector('#feedback-form');
  applicantForm.addEventListener('submit', handleFormSubmit);
  // applicantForm.addEventListener('input', checkValidity);
}


function textareaResize(maxWidth, textarea) {
  if (!textarea) {
    textarea = document.querySelector('textarea[form-textarea]');
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

document.addEventListener("DOMContentLoaded", function() {
  var refererCookie = document.cookie.match(/referer_code=([\d]+)/);
  var code = refererCookie && refererCookie[1];
  var refererCodeBlock = document.querySelector('#referer_code_block'); // блок куда подставляется полученный код

  if (!refererCodeBlock) {
    return false // ничего не делаем, если блока для подстановки кода нет на странице
  }

  var expiredDate = new Date();
  expiredDate.setTime(expiredDate.getTime() + 1 * 0.5 * 60 * 60 * 1000); // 30 минут

  if (code) {
    refererCodeBlock.innerHTML = code; // подставляем код в шаблон
    document.cookie = "referer_code=" + code + "; expires=" + expiredDate + "; path=/";
  } else {
    fetch('/referer_code', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=utf-8'
      }
    }).then(function(response) {
      return response.json()
    }).then(function(response) {
      document.cookie = "referer_code=" + response.referer_code + "; expires=" + expiredDate + "; path=/";
      refererCodeBlock.innerHTML = response.referer_code; // подставляем код в шаблон
    })
  }
});

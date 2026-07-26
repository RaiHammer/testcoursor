/**
 * DanForge Dynamic Cart — виджет inSales
 * @author DanForge (danforge.ru)
 * @handle danforge_dynamic_cart
 */
const cartModalCloseButton = document.querySelector('.cart__close');
const cartOverlay = document.querySelector('.cart__overlay');
const cartTitleBase = document.querySelector('.cart__title-base-message');
const cartTitleAddItem = document.querySelector('.cart__title-add-item');



EventBus.subscribe('add_items:insales:cart', data => {
  openAddItemTitle();
  openCartModal();
})

/** Строки заказа из разных форматов ответа Cart/EventBus (иначе список пустой при верной сумме). */
function getOrderLinesFromData(data) {
  if (!data) return null;
  if (data.order_lines && Array.isArray(data.order_lines)) return data.order_lines;
  if (data.order) {
    var o = data.order;
    if (o.order_lines && Array.isArray(o.order_lines)) return o.order_lines;
    if (o.items && Array.isArray(o.items)) return o.items;
  }
  return null;
}

function applyOrderLinesToCartList(lines) {
  if (!lines || !Array.isArray(lines)) return;
  var lineContainer = document.querySelector('[data-cart-line]');
  if (!lineContainer) return;
  lineContainer.innerHTML = getHtmlLine(lines);
  updatePrice(lines);
}

EventBus.subscribe('update_items:insales:cart', data => {
  var method = data.action && data.action.method;
  var lines = getOrderLinesFromData(data) || data.order_lines;

  if (method === 'delete_items' || method === 'add_items' || method === 'remove_items' || method === 'set_items') {
    applyOrderLinesToCartList(lines);
  } else if (lines) {
    applyOrderLinesToCartList(lines);
  }
});

EventBus.subscribe('always:insales:cart', function (data) {
  var lines = getOrderLinesFromData(data);
  if (lines) applyOrderLinesToCartList(lines);
});




const updatePrice = (arr) => {
  const tPrice = arr.reduce((acc, item) => {
    return acc + (item.sale_price * item.quantity)
  }, 0);
  
  // Обновлять DOM, а не только console.log
  const totalElement = document.querySelector('[data-cart-total-price]');
  if (totalElement) {
    totalElement.textContent = `${tPrice.toLocaleString()} ${Shop.config.config.default_currency.unit}`;
  }
}
const openAddItemTitle = () => {
  cartTitleBase.style.display = 'none';
  cartTitleAddItem.style.display = 'flex';
}
const closeAddItemTitlte = () => {
  cartTitleBase.style.display = 'flex';
  cartTitleAddItem.style.display = 'none';
}
const getHtmlLine = (arr) => {
  return arr.map(item => {
    const option_names = item.product.option_names || [];
    var variantId = item.variant_id != null ? item.variant_id : item.id;
    var variant = item.product.variants && item.product.variants.find(function (v) { return v.id === variantId; });
    if (!variant && item.product.variants && item.product.variants.length) {
      variant = item.product.variants[0];
    }
    const option_values = (variant && variant.option_values) ? variant.option_values : [];

    const options = option_values.map(value => {
      const nameId = value.option_name_id;
      const nameData = option_names.find(v => v.id === nameId);
      if (!nameData) return '';

      return `
        <div class="cart__item-option">
        ${nameData.title}:
        ${value.title}
        </div>
      `;
    }).join('')

    return `
      <div data-product-id="${item.product.id}" data-item-id="${item.id}" class="cart__item">
        <a class="cart__item-link" href="${item.product.url}">
          <img src="${item.images[0] ? item.images[0].medium_url : ''}" class="cart__item-img" />
        </a>
        <div class="cart__item-data">
          <div class="cart__item-data-top">
            <div class="cart__item-title">${ item.product.title }</div>
            
            <div class="cart__item-info">
              ${options}
             

              <div data-quantity class="c-lineitem__qty">
                  <div class="c-form__row c-inputqty">
                      <label class="c-form__label c-inputqty__label">
                          Количество:
                      </label>
                      <span data-quantity-change="-1" type="button" class="c-inputqty__button c-inputqty__button--less"> - </span>
                      <span aria-live="polite">
                      <input class="c-inputqty__input" type="text" name="cart[quantity][${item.id}]" value="${item.quantity}">
                      </span>
                      <span type="button" data-quantity-change="1" class="c-inputqty__button c-inputqty__button--more"> + </span>
                  </div>
              
                </div>

            </div>
            <div class="cart__item-price">
            ${ Number(item.sale_price).toLocaleString()} ${Shop.config.config.default_currency.unit}
            </div>
          </div>  
          <div class="cart__item-data-bottom">  
                  <span data-item-delete="${item.id}" class="c-lineitem__removebtn">
                      <span class="c-lineitem__removelabel">
                          Удалить
                      </span>
                  </span>
                </div>  
        </div>
      </div>
    `;
  }).join('')
}
const closeCartModal = () => {
  const modal = document.querySelector('.cart__modal');

  modal ? modal.classList.add('hide') : null;

  // document.querySelector('body').style.overflow = 'auto';

}
const openCartModal = () => {
  const modal = document.querySelector('.cart__modal');

  modal ? modal.classList.remove('hide') : null;

  if (typeof Cart !== 'undefined' && Cart.order && Cart.order.get) {
    var order = Cart.order.get();
    var lines = order && (order.order_lines || order.items);
    if (lines && Array.isArray(lines)) applyOrderLinesToCartList(lines);
  }
  if (typeof Cart !== 'undefined' && Cart.forceUpdate) {
    setTimeout(function () {
      Cart.forceUpdate();
    }, 350);
  }

  // document.querySelector('body').style.overflow = 'hidden';
}

cartOverlay.addEventListener('click', () => {
  closeCartModal();
  closeAddItemTitlte();
})
cartModalCloseButton.addEventListener('click', () => {
  closeCartModal();
  closeAddItemTitlte();
})

window.openCartModal = openCartModal;



const coupon = () => {
  const c = document.querySelector('.cart__coupon');
  const ch = c.querySelector('.cart__coupon-header');
  const cc = c.querySelector('.cart__coupon-body-header')

  ch.addEventListener('click', () => {
    c.classList.add('active');
  })
  cc.addEventListener('click', () => {
    c.classList.remove('active');
  })


  const input = document.querySelector('[name="cart[coupon]"]')
  const button = document.querySelector('[data-coupon-submit2]')

  button.addEventListener('click', e => {
    e.preventDefault();

    Cart.setCoupon({coupon: input.value })
  })

}
coupon();










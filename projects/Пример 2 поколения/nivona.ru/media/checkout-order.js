$(function () {
  var $pass = $('#contacts #client_password, #contacts #client_password_confirmation, #contacts #client_old_password');
  $('[name="client[change_password]"]').on('change', function () {
    if (this.checked) {
      $('#change_password_fields').show();
      $pass.prop('disabled', '');
    } else {
      $('#change_password_fields').hide();
      $pass.prop('disabled', true);
    }
  });

  $('#delivery_address .field, #checkout_buyer_fields .field').each(function () {
    var $field = $(this);

    if ($field.find('input[type="checkbox"]').length) {
      $field.addClass('is-checkbox');
    }
  });

  $('.field.is-checkbox').each(function () {
    var $field = $(this);
    $field
      .find('.small')
        .appendTo($field);
  });

  $('.field-content.small').removeClass('small');
});

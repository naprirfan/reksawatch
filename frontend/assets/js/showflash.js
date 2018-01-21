$(document).ready(function() {

  // Dictionary to map message from backend to classes on frontend
  const FLASH_DICTIONARY = {
    'error': 'danger'
  }

  // Fire!
  if ($('.js-flash-type').val()) {
    UIkit.notification({
      message: $('.js-flash-message').val(),
      status: FLASH_DICTIONARY[$('.js-flash-type').val()],
      pos: 'top-center',
      timeout: 5000
    });
  }
});

csrfToken = '{% csrf_token %}';
axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';

var chart_new_old_app;
var chart_iphone_version;
var chart_ios_version;
var chart_android_version;
var chart_other;
var chart_device_order_percent;
var chart_device_order_month;
var chart_new_old_app_percent;
var chart_new_old_app_month;
var chart_means_percent;
var chart_menas_order_ymd;

var _options_ = null;
var _latest_ = {}
var _views_ = null;
var _charts_ = {}

function init_dashboard(options) {

    _options_ = Object.assign({},  options)

    init_events()
}

function init_summary() {


}

function init_events() {


}


function clear_datatables(ref_id) {
  if ( !ref_id.startsWith('#') ) {
    ref_id = '#' + ref_id
  }
  if ( $.fn.DataTable.isDataTable(ref_id) ) {
    $(ref_id).DataTable().destroy()
  }
  $(ref_id).empty()
}



function copy_to_clipboard(text) {
  text = text.replace('\ufeff', '')
  var textArea = document.createElement("textarea");
  textArea.textContent = text;
  textArea.style.position="fixed";  //avoid scrolling to bottom
  document.body.appendChild(textArea);
  textArea.focus();
  textArea.select();
  try {
    document.execCommand('copy');
  } catch (err) {
  }
  document.body.removeChild(textArea);

  //$('#message_success_copy2clipboard').css("top", Math.max(0, (($(window).height() - $('#message_success_copy2clipboard').outerHeight()) / 2) + $(window).scrollTop()) + "px");
  //$('#message_success_copy2clipboard').css("left", Math.max(0, (($(window).width() - $('#message_success_copy2clipboard').outerWidth()) / 2) + $(window).scrollLeft()) + "px");
  $('#message_success_copy2clipboard').show()
  $('#message_success_copy2clipboard').delay(500).fadeIn('normal', function() {
    $(this).delay(1000).fadeOut();
  });
}

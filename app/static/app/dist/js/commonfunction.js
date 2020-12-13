$(function () {
	$('.has-clear input[type="text"], textarea, input[type="password"], input[type="email"]').on('input propertychange', function() {
	  var $this = $(this)
	  var visible = Boolean($this.val())
	  $this.siblings('.form-control-clear').toggleClass('hidden', !visible)
	}).trigger('propertychange')

	$('.form-control-clear').click(function() {
	  $(this).siblings('input[type="text"], textarea, input[type="password"], input[type="email"]').val('')
	    .trigger('propertychange').focus()
	})
})

function open_sub_window(url, windowname)
{
  if(!windowname) {
    windowname = '_blank'
  }
  popup = window.open(url, windowname)
  popup.moveTo(0, 0);
  popup.resizeTo(screen.width, screen.height);
}

function fmoney(amt, n) {

  amt = Math.round(amt, n)

  if(n == undefined || n < 0 || n > 20) {
    n = 8;
  } else {
    n = n + 1;
  }
  if (amt.length <= 3) {
    return amt;
  }

  if(!/^(\+|-)?(\d+)(\.\d+)?$/.test(amt)) {
    return amt;
  }

  var a = RegExp.$1, b = RegExp.$2, c = RegExp.$3;
  var re = new RegExp();
  re.compile("(\\d)(\\d{3})(,|$)");
  while(re.test(b)) {
    b = b.replace(re, "$1,$2$3");
  }
  if(c.length > 2) {
    c = c.substr(0, n);
  }
  return a +""+ b +""+ c;
  // return s.toFixed(n).toString().replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1,')
}

// ローディング表示
function showLoading(imgPath) {
    $('body').append('<div id="loading_box"><img src="' + imgPath + '"></div>');
}

// 表示したローディングを消す
function hideLoading() {
    $('#loading_box').remove();
}

function create_date_range_picker(ref_id, default_range, full_date_range) {
    ref_id = ref_id || 'daterange-btn'

    if (default_range !== void 0){
      $('#' + ref_id).val( default_range[0] + '-' + default_range[1])
    } else {
      $('#' + ref_id).val( moment().format('YYYY/MM/DD') + '-' + moment().format('YYYY/MM/DD'))
    }

    var options =
    {
      autoClose: true,
      format: 'YYYY/MM/DD',
      separator: '-',
      language: 'auto',
      startOfWeek: 'sunday',// or monday
      getValue: function()
      {
        return $(this).val();
      },
      setValue: function(s)
      {
        if(!$(this).is(':disabled') && s != $(this).val())
        {
          $(this).val(s);
        }
      },
      //startDate: new Date(2019, 0, 1),
      endDate: new Date(),
      time: {
        enabled: false
      },
      minDays: 0,
      maxDays: 0,
      showShortcuts: true,
      shortcuts:
      {
        'prev-days': [1,5,7,30],
        'prev' : ['week','month'],
      },
      customShortcuts : [],
      inline:false,
      container:'body',
      alwaysOpen:false,
      singleDate:false,
      lookBehind: false,
      batchMode: false,
      duration: 200,
      stickyMonths: false,
      dayDivAttrs: [],
      dayTdAttrs: [],
      applyBtnClass: '',
      singleMonth: 'auto',
      hoveringTooltip: function(days, startTime, hoveringTime)
      {
        return days > 1 ? days + ' ' + 'days' : '';
      },
      showTopbar: true,
      swapTime: false,
      selectForward: false,
      selectBackward: false,
      showWeekNumbers: false,
      getWeekNumber: function(date) //date will be the first day of a week
      {
        return moment(date).format('w');
      },
      monthSelect: true,
      yearSelect: true,
      extraClass: 'date-range-picker19'
    }

    if ( full_date_range === void 0 ){
      if ( sessionStorage['dashboard.full_date_range'] ) {
        var ls_date_range =  JSON.parse(sessionStorage['dashboard.full_date_range'])
        full_date_range = [ls_date_range['start'], ls_date_range['end']]
      }
    }

    if ( full_date_range ) {
        options.customShortcuts.push({
            name: '全期間',
            dates : function()
            {
                var start = full_date_range[0].replace(/\//g, '').replace(/\-/g, '')
                var end = full_date_range[1].replace(/\//g, '').replace(/\-/g, '')
                var start = moment(start,'YYYYMMDD').toDate();
                var end =  moment(end,'YYYYMMDD').toDate();
                return [start,end];
            }
          }
        )
    }

    $('#' + ref_id).dateRangePicker(options)
}


function get_axios() {
  var domain = get_domain();
  var url =  window.location.protocol + "//" + window.location.host + "/" + domain + "/"
  return axios.create({ baseURL:  url });
}

function get_domain() {
  return window.location.href.replace('http://','').replace('https://','').split(/[/?#]/)[1];
}


window.chartColors = {
	red: 'rgb(255, 99, 132)',
	orange: 'rgb(255, 159, 64)',
	yellow: 'rgb(255, 205, 86)',
	green: 'rgb(75, 192, 192)',
	blue: 'rgb(54, 162, 235)',
	purple: 'rgb(153, 102, 255)',
  grey: 'rgb(201, 203, 207)',
  color1: "#008b8b",
  color2: "#ff7f50",
  color3: "#696969",
  color4: "#b0c4de",
  color5: "#2f4f4f",
  color6: "#006400",
  color7: "#deb887",
  color8: '#dc143c',
  color9: "#4682b4",
  color10: "#c71585",
  color11: "#ff4500",
  color12: "#6495ed",
  color13: "#1e90ff",
  color14: "#9acd32",
  color15: "#b22222",
  color16: "#483d8b",
  color17: "#eee8aa",
  color18: "#20b2aa",
  color19: "#808000",
  color20: "#bc8f8f",
  color21: "#191970",
  color22: "#ffff00",
  color23: "#db7093",
  color24: "#7fffd4",
  color25: "#f4a460",
  color26: "#00ff7f",
  color27: "#8b4513",
  color28: "#8b0000",
  color29: "#4b0082",
  color30: "#7b68ee",
  color31: "#eea768",
  color32: "#eee368",
  color33: "#68eed1",
  color34: "#a268ee",
  randomColor:function(opacity){
    var seed1 = Math.round(Math.random() * 255)
    var seed2 = Math.round(Math.random() * 255)
    var seed3 = Math.round(Math.random() * 255)
    return (
      "rgba(" +
      seed1+
      "," +
      seed2 +
      "," +
      seed3 +
      "," +
      (opacity || ".3") +
      ")"
    );
  }
};

function gethostwebname() {
  var curPath=window.document.location.href;
  var pathName=window.document.location.pathname;
  var pos=curPath.indexOf(pathName);
  var localhostPaht=curPath.substring(0, pos);
  var projectName=pathName.substring(0, pathName.substr(1).indexOf('/')+1);
  return localhostPaht + projectName;
}


function getBeforeMonth(d){
  d = new Date(d);
  d = +d - 1000*60*60*24*29;
  d = new Date(d);
  var year = d.getFullYear();
  var mon = d.getMonth()+1;
  s = year+"-"+(mon<10?('0'+mon):mon);
  return s;
}

function getPreDay(s, n){
  var y = parseInt(s.substr(0,4), 10);
  var m = parseInt(s.substr(4,2), 10)-1;
  var d = parseInt(s.substr(6,2), 10);
  var dt = new Date(y, m, d-n);
  y = dt.getFullYear();
  m = dt.getMonth()+1;
  d = dt.getDate();
  m = m<10?"0"+m:m;
  d = d<10?"0"+d:d;
  return y + "" + m + "" + d;
}

Date.prototype.format_as_yyyymmdd_with_slash = function(){
  var a = this;
  var y = a.getFullYear();
  var m = a.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  var d = a.getDate();
  d = d < 10 ? ('0' + d) : d;
  return y + "/" + m + "/" + d;
}
Date.prototype.format_as_yyyymmdd = function(){
  var a = this;
  var y = a.getFullYear() + '';
  var m = a.getMonth() + 1;
  m = m < 10 ? ('0' + m) : m;
  m = m + ''
  var d = a.getDate();
  d = d < 10 ? ('0' + d) : d;
  d  = d + ''
  return y  +  m + d;
}
Date.prototype.get_past_date = function(days){
  var a = this;
  var d = new Date(a.getFullYear(), a.getMonth(), a.getDate(), 0, 0, 0);
  d.setDate(d.getDate()-days);
  return d;
}

String.prototype.format = function () {
  var a = this;
  for (var k in arguments) {
      a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
  }
  return a
}
String.prototype.format_as_yyyymm_with_slash = function () {
  var a = this;
  return a.replace(/(\d{4})(\d{2})/, '$1/$2')
}
String.prototype.format_as_yyyymmdd_with_slash = function () {
  var a = this;
  return a.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3')
}
String.prototype.format_as_yyyymmdd_with_hyphen = function () {
  var a = this;
  return a.replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3')
}
String.prototype.format_as_mmdd_with_slash = function () {
  var a = this;
  return a.replace(/(\d{4})(\d{2})(\d{2})/, '$2/$3')
}
String.prototype.parse_date = function () {
  var a = this;
  if ( a.indexOf('/') > 0 ) {
    var slices = a.split('/')
    return new Date(parseInt(slices[0], 0), parseInt(slices[1], 0)-1, parseInt(slices[2], 0), 0, 0, 0);
  } else {
    var y = a.substring(0,4)
    var m = a.substring(4,6)
    var d = a.substring(6)
    return new Date(parseInt(y, 0), parseInt(m, 0)-1, parseInt(d, 0), 0, 0, 0);
  }
}

String.prototype.trim = function () {
  var a = this;
  return a.replace(/(^\s*)|(\s*$)/g, "");
}

function comm_dynamic_colors() {
  var letters = '0123456789ABCDEF'.split('');
  var color = '#';
  for (var i = 0; i < 6; i++ ) {
      color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function comm_format_date(date, format) {
  format = format.replace(/YYYY/, date.getFullYear());
  var mm = date.getMonth() + 1
  if (mm < 10) {
    mm = '0' + mm;
  }
  format = format.replace(/MM/, mm);
  var dd = date.getDate();
  if (dd < 10) {
    dd = '0' + dd;
  }
  format = format.replace(/DD/, dd);
  return format;
}

function comm_clear_canvas(canvas_id){
  var canv = document.getElementById(canvas_id);
  pa = canv.parentElement;
  if(pa){
      pa.removeChild(canv)
      canv = document.createElement('canvas');
      canv.id = canvas_id;
      pa.appendChild(canv);
  }
}

function getPercent(num, total, scare=2) {
  return (Math.round(num / total * 100 * Math.pow(10,scare)) / Math.pow(10,scare) + "%");
}

function getPercent2(num, total, scare=2) {
  return (Math.floor(num / total * 100 * Math.pow(10,scare)) / Math.pow(10,scare));
}

function delete_duplicate_items(origin_arr) {
  var arr = new Array();
    for(var i = 0; i <origin_arr.length; i++){
      if(arr.indexOf(origin_arr[i]) == -1){
        arr.push(origin_arr[i]);
      }
    }
  return arr;
}

function createDayCalender(id, maxDate) {
  if(maxDate == undefined) {
    maxDate = 0;
  } else {
    maxDate = new Date(maxDate);
  }
  $('#' + id).datepicker({
    beforeShow: function() {
      setTimeout(function(){
        $('.ui-datepicker').css('z-index', 999999);
      }, 0);
    },
    changeMonth: true,
    changeYear: true,
    showAnim: 'show',
    dateFormat: 'yy-mm-dd',
    maxDate: maxDate,
    monthNames: ["1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"]
  });
}

function createMonthCalender(id, maxDate) {
  var disabledMonths = [];
  var ym = maxDate.split("-");
  var maxMonth = parseInt(ym[1]);
  for(var i = 1; i <= 12; i++) {
    if(maxMonth < i) {
      disabledMonths.push(i);
    }
  }
  var op = {
          pattern: 'yyyy-mm',
          finalYear: parseInt(ym[0]),
          disabledMonths: disabledMonths,
          monthNames: ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月']
      };
  $('#' + id).monthpicker(op);
}

function download_canvas(canvas_id, file_name) {
    var canvas = document.getElementById(canvas_id);
    var a = document.createElement('a');
    a.href = canvas.toDataURL();
    if ( !file_name ) {
      file_name = 'download.png'
    } else {
      file_name = file_name + '.png'
    }
    a.download = file_name;
    a.click();
}

function get_diamondclub_icon_html(client_id, members) {
  if ( !members || !client_id) {
    return ''
  }
  return members[client_id] ? '<i class="fa fa-diamond text-orange" title="ダイアモンドクラブ会員"></i>' : ''
}

function get_diamondclub_kigo(client_id, members) {
  if ( !members || !client_id) {
    return ''
  }
  return members[client_id] ? '◇' : ''
}

function pad(str, max) {
  if( str === '' ) {
    return str;
  }
  str = str.toString();
  return str.length < max ? pad("0" + str, max) : str;
}

function lpad_client_ids(client_ids) {
  if(client_ids) {
    for(var i=0; i<client_ids.length; ++i) {
      client_ids[i] = pad(client_ids[i], 10)
    }
  }
}

// ----------------------------------------------------------------------
// <summary>
// 数字のみ
// </summary>
// ----------------------------------------------------------------------
$.fn.onlyNum = function () {
  $(".onlyNum").on("keypress keyup blur",function (event) {
    $(this).val($(this).val().replace(/[^\d].+/, ""));
     if ((event.which < 48 || event.which > 57)) {
         event.preventDefault();
     }
 });
};

function getLastDay(year,month) {
  var new_year = year;
  var new_month = month++;
  if(month>12)
  {
    new_month -=12;
    new_year++;
  }
  var new_date = new Date(new_year,new_month,1);
  var date_count =   (new Date(new_date.getTime()-1000*60*60*24)).getDate();
  var last_date =   new Date(new_date.getTime()-1000*60*60*24);
  return date_count;
}

function getPrevNextMonth(d){
  d = new Date(d);
  var year = d.getFullYear();
  var mon = d.getMonth() + 1;

  var prevNenn = 0;
  var prevTuki = 0;
  var nextNenn = 0;
  var nextTuki = 0;
  if(mon === 1) {
    prevNenn = year - 1;
    prevTuki = 12;
  } else {
    prevNenn = year;
    prevTuki = mon - 1;
  }
  if(mon === 12){
    nextNenn = year + 1;
    nextTuki = 1;
  }else{
    nextNenn = year;
    nextTuki = mon + 1;
  }

  prevTuki = prevTuki<10 ? ('0'+prevTuki) : prevTuki;
  nextTuki = nextTuki<10 ? ('0'+nextTuki) : nextTuki;

  return [prevNenn + "/" + prevTuki, nextNenn + "/" + nextTuki];
}

function getLastWeekStartDate(ymd) {
  var now = new Date(ymd);
  var nowDayOfWeek = now.getDay()-1;
  var nowDay = now.getDate();
  var nowMonth = now.getMonth();
  var nowYear = now.getYear();
  nowYear += (nowYear < 2000) ? 1900 : 0;
  var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 7);
  return formatDate(weekStartDate);
}
function getLastWeekEndDate(ymd) {
  var now = new Date(ymd);
  var nowDayOfWeek = now.getDay()-1;
  var nowDay = now.getDate();
  var nowMonth = now.getMonth();
  var nowYear = now.getYear();
  nowYear += (nowYear < 2000) ? 1900 : 0;
  var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek - 1);
  return formatDate(weekEndDate);
}

function getNextWeekStartDate(ymd) {
  var now = new Date(ymd);
  var nowDayOfWeek = now.getDay()-1;
  var nowDay = now.getDate();
  var nowMonth = now.getMonth();
  var nowYear = now.getYear();
  nowYear += (nowYear < 2000) ? 1900 : 0;
  var weekStartDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 7);
  return formatDate(weekStartDate);
}
function getNextWeekEndDate(ymd) {
  var now = new Date(ymd);
  var nowDayOfWeek = now.getDay()-1;
  var nowDay = now.getDate();
  var nowMonth = now.getMonth();
  var nowYear = now.getYear();
  nowYear += (nowYear < 2000) ? 1900 : 0;
  var weekEndDate = new Date(nowYear, nowMonth, nowDay - nowDayOfWeek + 13);
  return formatDate(weekEndDate);
}

function formatDate(date) {
  var myyear = date.getFullYear();
  var mymonth = date.getMonth() + 1;
  var myweekday = date.getDate();
  if (mymonth < 10) {
      mymonth = "0" + mymonth;
  }
  if (myweekday < 10) {
      myweekday = "0" + myweekday;
  }
  return (myyear + "/" + mymonth + "/" + myweekday);
}

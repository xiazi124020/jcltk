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

    fetch_system_status(true, function(data_dates){

      _latest_ = data_dates
      _charts_ = {}

      init_summary()

      init_open_client()

      _views_ = init_views()
      _views_.create_views(get_view_settings())

    })
}

function init_summary() {

    // 売買データ取得
    if ( _options_.perms.view_done ) {
        get_api("api/done/bs/{0}/3".format(_latest_['done'])).get(datas => {
            total = parseFloat(_.sumBy(datas, 'total'));
            _.forEach(datas, data => {
              sub_total = parseFloat(data.total)
              sub_quantity = fmoney(parseInt(data.quantity, 10)/1000000, 0)
              percent = Math.round(sub_total /total * 100).toFixed(0) + "%"
              if ( data.bs === 'B' ) {
                $('#done_bs_total_b').html("買<small>({0})</small> :{1}<small><sup>百万円</sup></small> {2}<small><sup>百万通貨</sup></small>".format(percent, fmoney(sub_total / 1000000, 0), sub_quantity))
              } else if ( data.bs === 'S' ) {
                $('#done_bs_total_s').html("売<small>({0})</small> :{1}<small><sup>百万円</sup></small> {2}<small><sup>百万通貨</sup></small>".format(percent, fmoney(sub_total / 1000000, 0), sub_quantity))
              }
              $('#done_bs_total_ymd').html(data.ymd.format_as_yyyymmdd_with_slash())
            });
        }, error=>{
          show_message_in("#done_bs_total_b", error)
        });

        // 約定データ取得
        get_api("api/done/exec/{0}/3".format(_latest_['done'])).get(datas => {
            total = parseFloat(_.sumBy(datas, 'total'));
            _.forEach(datas, data => {
              sub_quantity = fmoney(parseInt(data.quantity, 10)/1000000, 0)
              sub_total = parseFloat(data.total)
              percent = Math.round(sub_total /total * 100).toFixed(0) + "%"
              if ( data.exec_type === 'N' ) {
                title = "新規<small>({0})</small> :{1}<small><sup>百万円</sup></small> {2}<small><sup>百万通貨</sup></small>".format(percent, fmoney(sub_total / 1000000, 0), sub_quantity)
                $('#done_exec_total_n').html(title)
              } else if ( data.exec_type === 'K' ) {
                title = "決済<small>({0})</small> :{1}<small><sup>百万円</sup></small> {2}<small><sup>百万通貨</sup></small>".format(percent, fmoney(sub_total / 1000000, 0), sub_quantity)
                $('#done_exec_total_k').html(title)
              }
              $('#done_exec_total_ymd').html(data.ymd.format_as_yyyymmdd_with_slash())
            });
        }, error=>{
          show_message_in("#done_exec_total_n", error)
        });
    }

    // 入出金データ取得
    if ( _options_.perms.view_payment ) {
        get_api("api/payment/{0}/3".format(_latest_['payment'])).get(datas => {
          if ( datas && datas.length > 0) {
                n_amount = parseFloat(datas[0].n_amount)
                s_amount = parseFloat(datas[0].s_amount)
                total = n_amount - s_amount
                $('#payment_total_n').html("入金<small>({0})</small> :{1}<small><sup>百万円</sup></small>".format(Math.round(n_amount /total * 100).toFixed(0) + "%", fmoney(n_amount / 1000000, 0)))
                $('#payment_total_s').html("出金<small>({0})</small> :{1}<small><sup>百万円</sup></small>".format(Math.round(-s_amount /total * 100).toFixed(0) + "%", fmoney(s_amount / 1000000, 0)))
                $('#payment_total_ymd').html(datas[0].ymd.format_as_yyyymmdd_with_slash())
            }
        }, error=>{
          show_message_in("#payment_total_n", error)
        });
    }

    //保有ポジションデータ取得
    if ( _options_.perms.view_position ) {
        get_api("api/position/latest/3").get(datas => {
            if ( datas && datas.length > 1 ) {
                b_amount = parseFloat(datas[0].b_amount)
                s_amount = parseFloat(datas[0].s_amount)
                b_quantity = fmoney(parseInt(datas[0].b_quantity, 10)/1000000, 0)
                s_quantity = fmoney(parseInt(datas[0].s_quantity, 10)/1000000, 0)
                total = b_amount + s_amount
                $('#position_total_b').html("買<small>({0})</small> :{1}<small><sup>百万円</sup></small> {2}<small><sup>百万通貨</sup></small>".format(Math.round(b_amount /total * 100).toFixed(0) + "%", fmoney(b_amount / 1000000, 0), b_quantity))
                $('#position_total_s').html("売<small>({0})</small> :{1}<small><sup>百万円</sup></small> {2}<small><sup>百万通貨</sup></small>".format(Math.round(s_amount /total * 100).toFixed(0) + "%", fmoney(s_amount / 1000000, 0), s_quantity))
                $('#position_total_ymd').html(datas[0].ymd.format_as_yyyymmdd_with_slash())
            }
        }, error=>{
          show_message_in("#position_total_b", error)
        });
    }
}

function init_open_client() {
  var kbn = $("input[name='chk_client_open']:checked").val();
  var month_end = ''
  var month_start = ''
  if( kbn === 'm') {
    month_end =  moment().format('YYYYMM')
    month_start = moment().subtract(120,'months').format('YYYYMM');
  } else {
    month_end =  moment().format('YYYYMMDD')
    month_start = moment().subtract(6,'months').format('YYYYMMDD');
  }
  get_api('api/deposit/count/open/{0}/{1}'.format(month_start, month_end)).get(datas => {
      var labels = _.map(datas, d => {
        if(kbn === 'm') {
          return d.ym.format_as_yyyymm_with_slash()
        } else {
          return d.ymd.format_as_yyyymmdd_with_slash()
        }
      })
      var data_str = _.map(datas, d => (d.client_id_count-d.first_trade_count) + ':' + d.first_trade_count).join(',')
    　$('#canvas_open_client').html(data_str)
      $('#canvas_open_client').sparkline('html', {
          type: 'bar',
          width:'100%',
          barWidth:8,
          barSpacing:4,
          height:'80px',
          chartRangeMin: 0,
          chartRangeMax: 0,
          stackedBarColor:['#dc3912','#3366cc'],
          tooltipFormat: '\{\{offset:offset\}\} <span style="color: {{color}}">&#9632;</span> \{\{value\}\}口座',
          tooltipValueLookups: {
              'offset': labels
          },
      })
  })
}

function init_views() {

    var views = {}

    var sort_views = function(settings) {
        if ( !settings ) return

        var view_container = $('#v_container')
        var menu_container = $('#view_setting_menu')
        var ordered = []
        Object.keys(settings).forEach(function (key) {
          ordered.push(settings[key])
        });
        _.orderBy(ordered, function(item) {
            return item.order
        }, ['asc'])
        for(var i=0; i<ordered.length; ++i ) {
            var item_id = ordered[i].id
            var v_item = $('#' + item_id)
            v_item.appendTo(view_container)
            var v_menu = $('#' + item_id + "_menu")
            v_menu.appendTo(menu_container)
        }
    }

    views.create_views = function(settings) {
        var self = this
        sort_views(settings)
        Object.keys(settings).forEach(function (item_id) {
            if ($('#' + item_id).length ) {
                if( is_viewitem_visable(settings, item_id) ) {
                    $('#'+ item_id).show()
                    $('#'+ item_id + "_shortcut").show()
                    $('#{0}_chk'.format(item_id)).attr( 'checked', 'checked' )
                    var o = self[item_id]
                    if ( o.create ) {
                      o.create({
                        'event': 'load'
                      })
                      o.loaded = true
                    }
                } else {
                    $('#'+ item_id).hide()
                    $('#{0}_chk'.format(item_id)).removeAttr('checked')
                    $('#'+ item_id + "_shortcut").hide()
                }
            }
        })
    }

    views.load_view = function(item_id) {
        var o = this[item_id]
        if ( !o.loaded &&  o.create ) {
            o.create({
              'event': 'load'
            })
            o.loaded = true
        }
    }

    views['v_order'] = {
        loaded:false,
        create:function(context) {
          create_order_ticket_timezone(context || {'event':'load'})
        }
    }
    views['v_pl'] = {
        loaded:false,
        create:function(context) {
          create_kesai_ranking(context || {'event':'load'})
        }
    }
    views['v_deposit'] = {
        loaded:false,
        create:function(context) {
          create_client_bs_monthly(context || {'event':'load'})
          create_max_deposit_client(context || {'event':'load'})
        }
    }
    views['v_position'] = {
        loaded:false,
        create:function(context) {
          create_max_position(context || {'event':'load'})
        }
    }
    views['v_payment'] = {
        loaded:false,
        create:function(context) {
          create_payment_threshold(context || {'event':'load'})
          create_payment_ranking(context || {'event':'load'})
        }
    }
    views['v_channel'] = {
        loaded:false,
        create:function(context) {
          create_channel(context || {'event':'load'})
        }
    }
    views['v_bs'] = {
        loaded:false,
        create:function(context) {
          create_ccypair_table(context || {'event':'load'})
        }
    }

    return views
}

function on_view_dblclick(v_item_id) {
  /*
  src_element_classname = event.srcElement.className;
  if( src_element_classname
    && (src_element_classname.indexOf('fa') >= 0 || src_element_classname.indexOf('btn') >= 0)
    ) {
    return;
  }
  $(function() { $('#' + v_item_id).find('button[data-widget=collapse]').click(); });
  */
}

function on_view_order_change(v_item_id, dirtect) {
    var view_settings = get_view_settings()
    var container = $('#v_container')
    var menu_container = $('#view_setting_menu')
    var v_item = $('#' + v_item_id)
    var v_menu_item = $('#' + v_item_id + '_menu')
    if( dirtect === 'prev' ) {
        var prev = v_item.prev()
        var prev_menu = v_menu_item.prev()
        while( prev && !is_viewitem_visable(view_settings, prev.attr('id')) ) {
            prev = prev.prev()
            prev_menu = prev_menu.prev()
        }
        if ( prev ) {
          prev.before(v_item)
        }
        if ( prev_menu ) {
          prev_menu.before(v_menu_item)
        }
    } else if( dirtect === 'next' ) {
        var next = v_item.next();
        var next_menu = v_menu_item.next()
        while( next && !is_viewitem_visable(view_settings, next.attr('id')) ) {
            next = next.next()
            next_menu = next_menu.next()
        }
        if ( next ) {
          next.after(v_item)
        }
        if ( next_menu ) {
            next_menu.after(v_menu_item)
        }
    } else if( dirtect === 'first' ) {
        v_item.prependTo(container)
        v_menu_item.prependTo(menu_container)
    } else if( dirtect === 'last' ) {
        v_item.appendTo(container)
        v_menu_item.appendTo(menu_container)
    }
    save_view_settings()
    scroll_to_view(v_item_id)
}

function on_view_closed(v_item_id) {
  $('#{0}_chk'.format(v_item_id)).removeAttr('checked')
  $('#' + v_item_id).hide()
  save_view_settings()
}

function on_view_disp_changed(chk) {
  var container = $('#v_container')
  var view_item_id = chk.id.replace('_chk', '')
  if ( chk.checked ) {
    $('#' + view_item_id).show()
    _views_.load_view(view_item_id)
    $('#' + view_item_id + '_shortcut').show()
  } else {
    $('#' + view_item_id).hide()
    $('#' + view_item_id + '_shortcut').hide()
  }
  save_view_settings()
}

function get_view_settings() {
    var ls = localStorage.getItem("dashboard_view_settings")
    if ( ls && ls !== '') {
        var settings = JSON.parse(ls)
        for(var i=0; i<_options_.views.length; ++i) {
          id = _options_.views[i]
          if ( !settings[id] ) {
              var setting = {}
              setting.id = id
              setting.visable = false
              setting.order = settings.length
              settings[id] = setting
          }
        }
        return settings
    } else {
        var v_settings = {}
        var items = $("#v_container .view-item")
        for ( var i=0; i<items.length; ++i ) {
            var item = items[i]
            var id = item.id
            var setting = {}
            setting.id = id
            $(item).show()
            setting.visable = $(item).is(":visible")
            setting.order = i
            v_settings[id] = setting
        }
        localStorage.setItem("dashboard_view_settings", JSON.stringify(v_settings))
        return v_settings
    }
}

function save_view_settings() {
    var v_settings = {}
    var items = $("#v_container .view-item")
    for ( var i=0; i<items.length; ++i ) {
        var item = items[i]
        var id = item.id
        var setting = {}
        setting.id = id
        setting.visable = $(item).is(":visible")
        setting.order = i
        v_settings[id] = setting
    }
    localStorage.setItem("dashboard_view_settings", JSON.stringify(v_settings))
}

function is_viewitem_visable(v_settings, item_id) {
    if ( v_settings[item_id] ) {
      if ( v_settings[item_id].visable === void 0 ) {
          return true
      }
      return v_settings[item_id].visable === true
    }
    return true
}

/**
 * 売買高・預かり高
 */
function create_client_bs_monthly(context) {
  var kbn = context.kbn
  if ( context.event === 'redraw' ) {
    if( $('#bs_monthly').closest('.view-item').hasClass("panel-fullscreen") ) {
        $('#bs_monthly').DataTable().page.len(-1).draw()
    } else {
        $('#bs_monthly').DataTable().page.len(15).draw()
    }
    return
  }

  var preDate
  var prepreDate
  show_message_in('#bs_monthly', 'Loading...')
  if(kbn === void 0) {
      var d = _latest_['done'].parse_date()
      preDate = moment(d).subtract(1,'months').format('YYYY-MM');
      $("#search_month").val(preDate)
      createMonthCalender("search_month", preDate);
  } else {
      preDate = $("#search_month").val()
  }
  d = (preDate.replace('-', '') +  "01").parse_date()
  prepreDate = moment(d).subtract(1,'months').format('YYYY-MM');

  var url = 'api/done/koza/{0}/{1}/{2}'.format(preDate.replace("-", ""), prepreDate.replace("-", ""), 100);
  get_api(url).get(datas => {
    if( !datas || datas.length === 0 ) {
      show_message_in('#bs_monthly', 'データなし')
    } else {
        clear_datatables('#bs_monthly')
        create_client_bs_ranking_table(datas)
      }
  }, err => {
      show_message_in('#bs_monthly', err)
  })
}

function create_client_bs_ranking_table(datas) {
  if ( !datas ) {
    return
  }

  var ym_export = ""
  _.forEach(datas, data => {
      data.total_formated = fmoney(parseFloat(data.total) / 10000, 0);
      if(data.MoM == undefined) {
        data.MoM_formated = data.total_formated;
      } else {
        data.MoM_formated = fmoney(parseFloat(data.MoM) / 10000, 0);
      }
      data.ym_formated = data.ym.format_as_yyyymm_with_slash();
      ym_export = data.ym_formated
  })

  table_id = '#bs_monthly'

  var disp_columns = [{
      "title":"口座番号",
      "data": "client_id",
      "render": function(data, type, row, meta){
            if(type === 'display'){
              data = '<a href="javascript:void(0);" onclick="dispProfile(\'' + data + '\', null); return false;">' + data +  get_diamondclub_icon_html(data, window.context.diamonders) + '</a>';
            }
            return data;
      }
  }];
  disp_columns.push( {
            "title":"年月",
            "data": "ym_formated"
  } );

  disp_columns.push({
            "title":"売買数量合計(単位：万)",
            "data": "total_formated"
  });

  disp_columns.push({
            "title":"前月比",
            "data": "MoM_formated",
            "render": function(data, type, row, meta){
                  if(data == 'NaN'){
                    data = 0;
                  }
                  if ( parseFloat(data) < 0 ) {
                      return '<div class="text-red">' + data.replace(/\-/g, '') + ' <i class="fa fa-long-arrow-down"></i></div>'
                  } else {
                      return '<div>' + data + ' <i class="fa fa-long-arrow-up"></i></div>'
                  }
                  return data;
            }
  });

  var export_data_format = function ( data, row, column, node ) {
        var row_data = $('#bs_monthly').DataTable().row(row).data()
        if (column === 0 ) {
            if ( window.context.diamonders[row_data['client_id']] ) {
              return row_data['client_id'] + '◇'
            } else {
              return row_data['client_id']
            }
        } else if(column === 1 ) {
            return row_data['ym_formated']
        } else if(column === 2 ) {
            return row_data['total_formated']
        } else if(column === 3 ) {
            return row_data['MoM_formated']
        }
        return data
  }

  var table_options = {
      data: datas,
      columns: disp_columns,
      buttons:get_export_buttons('売買高Top顧客({0})'.format(ym_export), export_data_format),
      destory: true,
      columnDefs:[
        {"targets":2, "className": "numcol text-right"},
        {"targets":3, "className": "numcol text-right"},
      ],
      initComplete: function() {
        init_export_buttons_event(table_id)
      },
  }

  if( $(table_id).closest('.view-item').hasClass("panel-fullscreen") ) {
      table_options.paging = false
      //table_options.pageLength = 50
  } else {
      table_options.paging = true
      table_options.pageLength = 15
  }

  return RpaDataTable.create_simple_table(table_id, table_options);
}

function create_max_deposit_client(context) {

  if ( context.event === 'redraw' ) {
      if( $('#max_deposit_client').closest('.view-item').hasClass("panel-fullscreen") ) {
          $('#max_deposit_client').DataTable().page.len(-1).draw()
      } else {
          $('#max_deposit_client').DataTable().page.len(15).draw()
      }
      return
  }

  var url = 'api/job/{0}/latest_date'.format('deposit')
  var ymd = $("#search_day").val()
  show_message_in('#max_deposit_client', 'Loading...')
  get_api(url).get(datas => {
    if(ymd == '') {
      ymd = datas[0]['data_date'].format_as_yyyymmdd_with_hyphen()
      $("#search_day").val(ymd);
      createDayCalender("search_day", ymd);
    }

    var deposit_url = "api/deposit/total/{0}/100".format(ymd.replace(/\-/g, ''))
    get_api(deposit_url).get(datas => {
        if( !datas || datas.length === 0 ) {
          show_message_in('#max_deposit_client', 'データなし')
        } else {
          clear_datatables('#max_deposit_client')
          create_max_deposit_client_table(datas)
        }
    }, err => {
        show_message_in('#max_deposit_client', err)
    });
  }, err => {
      show_message_in('#max_deposit_client', err)
  });
}

function create_max_deposit_client_table(datas) {
  if ( !datas ) return;

  ymd_export = ''
  _.forEach(datas, data => {
    data.yotei_margin_formated = fmoney(parseFloat(data.yotei_margin) / 10000, 0);
    data.ymd_formated = data.ymd.format_as_yyyymmdd_with_slash();
    ymd_export=  data.ymd_formated
  })

  table_id = '#max_deposit_client'

  var disp_columns = [{
      "title":"口座番号",
      "data": "client_id",
      "render": function(data, type, row, meta){
            if(type === 'display'){
              data = '<a href="javascript:void(0);" onclick="dispProfile(\'' + data + '\', null); return false;">' + data + get_diamondclub_icon_html(data, window.context.diamonders) + '</a>';
            }
            return data;
      }
  }];
  disp_columns.push( {
            "title":"年月日",
            "data": "ymd_formated"
  } );

  disp_columns.push({
            "title":"預託証拠金(単位：万)",
            "data": "yotei_margin_formated"
  });

  var export_data_format = function ( data, row, column, node ) {
      var row_data = $('#max_deposit_client').DataTable().row(row).data()
      if (column === 0 ) {
          if ( window.context.diamonders[row_data['client_id']] ) {
            return row_data['client_id'] + '◇'
          } else {
            return row_data['client_id']
          }
      } else if(column === 1 ) {
          return row_data['ymd_formated']
      } else if(column === 2 ) {
          return row_data['yotei_margin_formated']
      }
      return data
  }

  var table_options = {
      data: datas,
      columns: disp_columns,
      buttons:get_export_buttons('預かり高Top顧客({0})'.format(ymd_export), export_data_format),
      destory: true,
      columnDefs:[
        {"targets":2, "className": "numcol text-right"},
      ],
      initComplete: function() {
        init_export_buttons_event(table_id)
      },
  }

  if( $(table_id).closest('.view-item').hasClass("panel-fullscreen") ) {
      table_options.paging = false
      //table_options.pageLength = 50
  } else {
      table_options.paging = true
      table_options.pageLength = 15
  }
  return RpaDataTable.create_simple_table(table_id, table_options);
}

function createOtherPieChart(chartId, kbn, callback) {
  // チャンネルURL
  var url = document.getElementById('device_kbn_client').checked ? "api/unknow_client/{0}" : "api/unknow_order/{0}";
  url = url.format(_latest_['device'])

  // グラフデータ取得
  get_api(url, {}).post(data => {
      var ctx = $("#" + chartId);
      var labels=createOtherOrderLabels(data, kbn);
      var datas=createOtherOrderDatas(data, kbn);
      legend = '';
      if (data && data.length > 0 && data[0].ymd !== ''){
        ymd_with_slash = data[0].ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');
        if(callback){
          callback(data[0].ymd);
        }
      } else {
        show_message_in('#other_month', 'データなし')
      }

      var chartDatas;
      var color = new Array();
      for(var i = 0; i < datas.length; i++) {
        color.push(window.chartColors.randomColor(0.5));
      }
      if(kbn == '1') {
        chartDatas = createOtherOrderChartData(labels, datas, legend, color);
      } else {
        $("#new_old_app").css("display", "block");
        $("#iphone_version").css("display", "none");
        chartDatas = createOtherOrderChartData(labels, datas, legend, color);
      }
      var theHelp = Chart.helpers;
      var option = {};
  }, err => {
      show_message_in('#device_view_body', err);
  });
}

function create_max_position (context) {

  if(_charts_['max_position_ccy']) {
    _charts_['max_position_ccy'].destroy();
  }

  var period = null;
  if ( $("#max_position_ccy_search").val() ) {
    period = $("#max_position_ccy_search").val();
  }
  $('#max_position_ccy_message').css("display", "block");
  $('#max_position_ccy_message').html("<h1>Loading...</h1>")

  var create_chart = function( datas ) {
    if ( !datas || datas.length == 0 ) {
      $('#max_position_ccy_message').html("<h1>データなし</h1>")
      return;
    }
    var data = new Array();
    var labels = new Array();
    var colors = new Array();
    var ccys = [];
    for(var i = 0; i < datas.length; i++) {
      colors.push('rgba(54,164,235,0.4)');
      labels.push(datas[i].client_id);
      ccys.push(datas[i].ccy_pair_id);
      data.push(datas[i].total);
    }

    var dataset = [{
      fontColor: 'black',
      responsive: true,
      data: data,
      backgroundColor: colors,
      borderColor: ccys,
    }];
    var barChartData = {
      labels: labels,
      datasets: dataset
    }

    var options ={
        legend: {
          display: false
        },
        hover: {animationDuration: 0, mode: false},
        responsive: true,
        animation: {
          duration: 1,
          onComplete () {
            var chartInstance = this.chart;
            var ctx = chartInstance.ctx;
            var height = chartInstance.controller.boxes[0].bottom;
            ctx.textBaseline = 'middle';
            ctx.textAlign = "left";
            ctx.fillStyle = '#333';
            var maxlength = 0;
            var img = new Image();
            img.src = _options_.context['diamond_image_src'];
            Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
              var meta = chartInstance.controller.getDatasetMeta(i);
              Chart.helpers.each(meta.data.forEach(function (bar, index) {
                if(index == 0) {
                  maxlength = 100;
                }
                var client_id = meta.data[index]._model.label
                if(window.context.diamonders[client_id]) {
                    ctx.drawImage(img, 0, 0, 16, 16, 2, bar._model.y - 10, 16, 16);
                }
                ctx.fillText(bar._model.borderColor, maxlength, bar._model.y);
                ctx.fillText(fmoney(dataset.data[index], 1), 500, bar._model.y);
              }),this)
            }),this);
          }
        },
        tooltips: {
          mode: 'index',
          intersect: true,
          callbacks: {
              label: function (tooltipItem, data){
                  var vl = tooltipItem.xLabel;
                  vl = parseFloat(vl);
                  return fmoney(vl, 0);
              }
          }
        },
        scales: {
          yAxes: [{
              ticks: {
                  callback: function(value, index, values) {
                      return get_diamondclub_kigo(value, window.context.diamonders) + value;
                  }
              }
          }]
        }
    };
    var loChart = new Chart($("#max_position_ccy"), {
      type: 'horizontalBar',
      data: barChartData,
      options: options
    });
    _charts_['max_position_ccy'] = loChart
    $('#max_position_ccy_message').css("display", "none");
  }

  if ( period ) {
      get_api("api/position/max/ccy/{0}".format(period.replace(/-/g,''))).get(
        datas => {
          create_chart(datas)
        },
        err => {
          $('#max_position_ccy_message').css("display", "block");
          show_message_in('#max_position_ccy_message', err)
        }
      );
  } else {
      get_api("api/position/max/ccy/{0}".format(_latest_['position'])).get(
        datas => {
          if ( datas && datas.length > 0) {
            $("#max_position_ccy_search").val(datas[0].ymd.format_as_yyyymmdd_with_hyphen())
            createDayCalender("max_position_ccy_search", datas[0].ymd.format_as_yyyymmdd_with_hyphen());
            create_chart(datas)
          }
        },
        err => {
          $('#max_position_ccy_message').css("display", "block");
          show_message_in('#max_position_ccy_message', err)
        }
      );
  }
}

/**
 * 時間帯別注文口座数csv出力
 */
function exportCanvas2csv(target, kbn) {
  var csv;
  var fileName;
  if(target == 'max_position_ccy') {
    csv = ""
    fileName = "最大ポジション保有顧客";
  } else {
    csv = "-,"
    fileName = "時間帯別注文口座数";
  }
  if(_charts_[target]) {
    var headers = _charts_[target].data.labels;
    var datas = _charts_[target].data.datasets;
    headers.forEach(function(row){
      csv += row + ",";
    });
    csv = csv.substring(0, csv.length-1);
    csv += "\n";
    datas.forEach(function(row){
      var label = row.label
      if(label == undefined) {
        label = "-"
      }

      if(target == 'max_position_ccy') {
        csv += row.data.join(",");
      } else {
        csv += (row.label + ",") + row.data.join(",");
      }
      csv += "\n";
    });
    csv = "\ufeff" + csv;
  } else {
    csv = "データなし"
  }

  if( kbn === 'copy') {
    copy_to_clipboard(csv)
  } else {
    var search_date = $("#" + target + "_search").val().replace(/\//g,'');
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName + "(" + search_date + ').csv';
    hiddenElement.click()
  }
}

function exportCanvas2csv2(target, kbn) {
  var csv = "";
  var fileName = "最大ポジション保有顧客";

  if(_charts_[target]) {
    var headers = _charts_[target].data.labels;
    var datas = _charts_[target].data.datasets;

    for(var i = 0; i < headers.length; i++) {
      var diamond_mark = window.context.diamonders[headers[i]] ? '◇' : ''
      csv = csv + headers[i] + diamond_mark + "," + datas[0].borderColor[i] + "," + datas[0].data[i];
      csv += "\n";
    }
    csv = "\ufeff" + csv;
  } else {
    csv = "データなし"
  }

  if( kbn === 'copy') {
    copy_to_clipboard(csv)
  } else {
    var search_date = $("#" + target + "_search").val().replace(/\//g,'');
    var hiddenElement = document.createElement('a');
    hiddenElement.href = 'data:text/csv;charset=utf-8,' + encodeURI(csv);
    hiddenElement.target = '_blank';
    hiddenElement.download = fileName + "(" + search_date + ').csv';
    hiddenElement.click()
  }
}

/**
 * 時間帯別注文口座数
 */
function create_order_ticket_timezone (context) {

  if(_charts_['order_ticket_timezone']) {
    _charts_['order_ticket_timezone'].destroy()
  }

  var period = null;
  if ( $("#order_ticket_timezone_search").val() ) {
    period = $("#order_ticket_timezone_search").val().replace(/\//g, '').replace(/\s/g, '').split("-");
  }
  $('#order_ticket_timezone_message').css("display", "block");
  $('#order_ticket_timezone_message').html("<h1>Loading...</h1>")

  var create_chart = function( datas ) {
    if ( !datas || datas.length == 0 ) {
      $('#order_ticket_timezone_message').html("<h1>データなし</h1>")
      return;
    }
    var target_ccy = $('#order_ticket_timezone_ccy').val()
    var datasets = []
    var labels = ["6時","7時","8時","9時","10時","11時","12時","13時","14時","15時","16時","17時","18時","19時","20時","21時","22時","23時","0時","1時","2時","3時","4時","5時","6時"];

    var color_nos = 34
    if ( target_ccy.startsWith('Top') ) {
        var limit = parseInt(target_ccy.replace('Top', ''), 10)
        if( datas.length > limit) {
          datas = datas.slice(-limit)
          color_nos = limit
        }
    }

    for(var i = 0; i < datas.length; i++) {
      var dataset = {}
      if (target_ccy !== "" && !target_ccy.startsWith('Top') ) {
          if ( target_ccy !== datas[i].ccy_pair_id ) continue
      }
      dataset.label = datas[i].ccy_pair_id;
      dataset.backgroundColor = window.chartColors['color' + (color_nos-i)]
      dataset.data = [datas[i].t6, datas[i].t7, datas[i].t8, datas[i].t9, datas[i].t10, datas[i].t11, datas[i].t12, datas[i].t13, datas[i].t14, datas[i].t15,
                      datas[i].t16, datas[i].t17, datas[i].t18, datas[i].t19, datas[i].t20, datas[i].t21, datas[i].t22, datas[i].t23, datas[i].tx0, datas[i].tx1, datas[i].tx2,
                      datas[i].tx3, datas[i].tx4, datas[i].tx5, datas[i].tx6];
      //dataset.fill = true
      //dataset.pointRadius=0,
      //dataset.pointHoverRadius=5

      datasets.push(dataset);
    }
    var barChartData = {
      labels: labels,
      datasets: datasets
    }

    var options ={
        legend: {
          position: 'right',
          reverse: true
                  },
                  tooltips: {
                      mode: 'index',
          intersect: true,
          itemSort: function(a, b) { return b.datasetIndex - a.datasetIndex }
                  },
                  responsive: true,
                  scales: {
                      xAxes: [{
                          stacked: true,
                      }],
                      yAxes: [{
            stacked: true
                      }]
                  }
    };
    var loChart = new Chart($("#order_ticket_timezone"), {
      type: 'bar',
      data: barChartData,
      options: options
    });
    _charts_['order_ticket_timezone'] = loChart
    $('#order_ticket_timezone_message').css("display", "none");
  }

  if ( period ) {
      get_api("api/order_ticket/ccy/{0}-{1}".format(period[0], period[1])).get(
        datas => {
          create_chart(datas)
        },
        err => {
          $('#order_ticket_timezone_message').css("display", "block");
          show_message_in('#order_ticket_timezone_message', err)
        }
      );
  } else {
      get_api("api/order_ticket/ccy/{0}-{1}".format(_latest_['orderticket'], _latest_['orderticket'])).get(
        datas => {
          if ( datas && datas.length > 0) {
            create_date_range_picker('order_ticket_timezone_search', [datas[0].start.format_as_yyyymmdd_with_slash(), datas[0].end.format_as_yyyymmdd_with_slash()]);
            create_chart(datas)
          }
        },
        err => {
          $('#order_ticket_timezone_message').css("display", "block");
          show_message_in('#order_ticket_timezone_message', err)
        }
      );
  }
}

function create_kesai_ranking (context) {
  //change layout for full screen mode or not
  var kbn = context.kbn
  if( $('#v_pl').hasClass("panel-fullscreen") ) {
      $('#v_pl').find('.view-subitem').removeClass('col-md-6').addClass('col-md-12')
  } else {
      $('#v_pl').find('.view-subitem').removeClass('col-md-12').addClass('col-md-6')
  }

  var get_past_data = function(datas, start, end, ns, callback) {
      payload = {
        client_id: _.map(datas, 'client_id')
      }
      url = "api/kessai/koza/{0}/{1}/{2}".format(ns, start, end)
      get_api(url, payload).post(past_datas => {

            var ymds = _.sortBy(_.uniq(_.map(past_datas, 'ymd')))
            labels = {}
            for( var i=0; i<ymds.length; ++i){
              labels[i] = ymds[i].substring(4).replace(/(\d{2})(\d{2})/, '$1/$2')
            }
            var grouped = _.mapValues(_.groupBy(past_datas, 'client_id'),
                              clist => clist.map( item => {
                                return {ymd:item.ymd, total: Math.round(parseFloat(item.total)/10000) }
                              })
                          );

            var new_grouped = {}
            _.forEach(grouped, (items, client_id) => {
                var new_items = []
                _.forEach(ymds, ymd => {
                  var finded = _.find(items, (o) => { return o.ymd === ymd } );
                  new_items.push( finded ? finded.total : 0.0)
                })
                new_grouped[client_id] = new_items
            });
            _.forEach(datas, data => {
              data.past_datas = new_grouped[data.client_id]
            });

            callback(datas, labels, ymds);
      });
  }

  var get_data_period = function (pl, start, end ) {
      var url = "api/kessai/koza/{0}/total/{1}/{2}/10".format(pl, start, end)
      clear_datatables('#kesai_ranking_' + pl)

      show_message_in('#kesai_ranking_' + pl, 'Loading...')
      get_api(url).get(datas => {
          if(datas && datas.length > 0) {
              get_past_data(datas, start, end, pl, function(ds, labels, ymds){
                  create_kessai_ranking_table(ds, labels, ymds[0], ymds[ymds.length-1], pl)
              });
          } else {
            show_message_in('#kesai_ranking_' + pl, 'データなし')
          }
      }, err => {
        show_message_in('#kesai_ranking_' + pl, err)
      })
  }

  if( kbn === void 0 ) {
      if ( context.event === 'load' ) {
        get_api("api/kessai/koza/latestDate").get(response => {
            if ( response && response.length > 0 ) {
              var period = get_start_end_day( response[0]['data_date'], 90)
              period_withslash = [period[0].format_as_yyyymmdd_with_slash(), period[1].format_as_yyyymmdd_with_slash()]
              create_date_range_picker('kesai_ranking_search_p', period_withslash)
              create_date_range_picker('kesai_ranking_search_l', period_withslash)
              get_data_period('p', period[0], period[1])
              setTimeout(function(){
                get_data_period('l', period[0], period[1])
              }, 300);
            } else {
              show_message_in('#kesai_ranking_p', 'データなし')
              show_message_in('#kesai_ranking_l', 'データなし')
            }
        },error=>{
            show_message_in("#kesai_ranking_p", error)
            show_message_in("#kesai_ranking_l", error)
        });
    } else if(context.event === 'redraw' ) {
        if ( $.fn.DataTable.isDataTable('#kesai_ranking_l') ) {
          $('#kesai_ranking_l').DataTable().columns.adjust().draw();
        }
        if ( $.fn.DataTable.isDataTable('#kesai_ranking_p') ) {
          $('#kesai_ranking_p').DataTable().columns.adjust().draw();
        }
    }
  } else {
      //検索ボタンを押下された場合
      var period = $("#kesai_ranking_search_" + kbn).val().replace(/\//g, '').replace(/\s/g, '').split("-")
      _views_['v_pl']['search_period_' + kbn] = period
      get_data_period(kbn, period[0], period[1])
  }
}

function create_kessai_ranking_table(datas, labels, start, end, pl) {

  table_id = '#kesai_ranking_' + pl;
  $('#kesai_ranking_' + pl).html('');
  if ( !datas || datas.length == 0 ) {
    show_message_in(table_id, 'データなし');
    return;
  }

  _.forEach(datas, data => {
    data.total = fmoney(parseFloat(data.total) / 10000, 0);
  })

  var disp_columns = [{
      "title":"口座番号",
      "data": "client_id",
      "render": function(data, type, row, meta){
            if(type === 'display'){
              data = '<a href="javascript:void(0);" onclick="dispProfile(\'{0}\', null); return false;">{1}{2}</a>'.format(data, data, get_diamondclub_icon_html(data, window.context.diamonders))
            }
            return data;
      }
  }];
  if ( pl === 'p' ) {
      disp_columns.push({
                "title":"合計利益(万円)",
                "data": "total",
                "render": function(data, type, row, meta){
                    data = '<div title="' + row.total + '" class="mt-0;p-0">' + data + '</div>'
                    return data;
                }
      });
  } else {
      disp_columns.push( {
                "title":"合計損失(万円)",
                "data": "total",
                "render": function(data, type, row, meta){
                    data = '<div title="' + row.total + '" class="text-red">' + data + '</div>'
                    return data;
                }
      } );
  }

  if( start && end ) {
    disp_columns.push({
        "title":"{0}-{1}日別損益(万円)".format(start.format_as_mmdd_with_slash(), end.format_as_mmdd_with_slash()),
        "data": "past_datas",
        "render": function(data, type, row, meta){
                  data = '<div style="height:36px"><span class="deposit_sparkline">' + data + '</span></div>';
                  return data;
        }
    });
  } else {
    _.forEach(datas, data => {
        data.past_datas = []
    });
    disp_columns.push({
        "title":"過去データなし",
        "data": "past_datas",
    });
  }

  var export_data_format = function ( data, row, column, node ) {
      var row_data = $('#' + $(node).closest('table').attr('id')).DataTable().row(row).data()
      if (column === 0 ) {
          if ( window.context.diamonders[row_data['client_id']] ) {
            return row_data['client_id'] + '◇'
          } else {
            return row_data['client_id']
          }
      } else if(column === 1 ) {
          return row_data['total']
      } else if(column === 2 ) {
          return row_data['past_datas']
      }
      return data
  }

  $('#loading_' + pl).remove();
  var dataTable = RpaDataTable.create_simple_table(table_id, {
        data: datas,
        columns: disp_columns,
        buttons:get_export_buttons("{0}Top顧客({1}-{2})".format(pl === 'p' ? '合計利益' : '合計損失', start || '', end || ''), export_data_format),
        scrollX:true,
        scrollCollapse: true,
        paging:false,
        columnDefs:[
          {"targets":0, "width": "70px"},
          {"targets":1, "className": "numcol text-right", "width": "100px"},
          {"targets":2, "className": "text-right"},
        ],
        fixedColumns: {
          leftColumns: 2
        },
        "fnDrawCallback": function (oSettings) {
            $('.deposit_sparkline:not(:has(canvas))').sparkline('html', {
                    type: 'bar',
                    width:'100%',
                    height:'100%',
                    chartRangeMin: 0,
                    chartRangeMax: 0,
                    tooltipFormat: '\{\{offset:offset\}\} \{\{value\}\}万円',
                    tooltipValueLookups: {
                        'offset': labels
                    },
            });
        },
        initComplete: function() {
          init_export_buttons_event(table_id);
        }
  });

  if( pl === 'p') {
      if ( $.fn.DataTable.isDataTable('#kesai_ranking_l') ) {
        $('#kesai_ranking_l').DataTable().columns.adjust().draw();
      }
  } else {
      if ( $.fn.DataTable.isDataTable('#kesai_ranking_p') ) {
        $('#kesai_ranking_p').DataTable().columns.adjust().draw();
      }
  }
  return dataTable;
}

function create_deposit_ranking() {

  var get_past_data = function(datas, start, end, ns, callback) {
      payload = {
        client_id: _.map(datas, 'client_id')
      }
      url = "api/deposit/koza/many/{0}/{1}".format(start, end)
      get_api(url, payload).post(past_datas => {
            var ymds = _.sortBy(_.uniq(_.map(past_datas, 'ymd')))
            labels = {}
            for( var i=0; i<ymds.length; ++i){
              labels[i] = ymds[i].substring(4).replace(/(\d{2})(\d{2})/, '$1/$2')
            }
            var grouped = _.mapValues(_.groupBy(past_datas, 'client_id'),
                              clist => clist.map( item => {
                                return {ymd:item.ymd, pl_amount: Math.round(parseFloat(item.pl_amount)/10000) }
                              })
                          );

            var new_grouped = {}
            _.forEach(grouped, (items, client_id) => {
                var new_items = []
                _.forEach(ymds, ymd => {
                  var finded = _.find(items, (o) => { return o.ymd === ymd } );
                  new_items.push( finded ? finded.pl_amount : 0.0)
                })
                new_grouped[client_id] = new_items
            });
            _.forEach(datas, data => {
              data.past_datas = new_grouped[data.client_id]
            });

            callback(datas, labels, ymds)
      });
  };

  get_api("api/deposit/koza/p/ranking/{0}/10".format(_latest_['deposit'])).get(datas => {
      var period = get_start_end_day( datas[0].ymd, 90 )
      get_past_data(datas, period[0], period[1], 'n', function(ds, labels, ymds){
        create_deposit_ranking_table(ds, labels, ymds[0], ymds[ymds.length-1], 'p')
      });
  });
  get_api("api/deposit/koza/l/ranking/{0}/10".format(_latest_['deposit'])).get(datas => {
      var period = get_start_end_day( datas[0].ymd, 90 )
      get_past_data(datas, period[0], period[1], 's', function(ds, labels, ymds) {
        create_deposit_ranking_table(ds, labels, ymds[0], ymds[ymds.length-1], 'l')
      });
  });
}

function create_deposit_ranking_table(datas, labels, start, end, pl) {

  if ( !datas ) return;

  _.forEach(datas, data => {
    data.pl_amount_formated = fmoney(parseFloat(data.pl_amount) / 10000, 0);
    data.vl_amount_formated = fmoney(parseFloat(data.vl_amount) / 10000, 0);
    data.koza = data.koza_type === 'P' ? '個人' : '法人';
  })

  table_id = '#deposit_ranking_' + pl

  var disp_columns = [{
      "title":"口座番号",
      "data": "client_id",
      "render": function(data, type, row, meta){
            if(type === 'display'){
              data = '<a href="javascript:void(0);" onclick="dispProfile(\'' + data + '\', null); return false;">' + data + get_diamondclub_icon_html(data, window.context.diamonders) + '</a>';
            }
            return data;
      }
  },{
    "title":"口座区分",
    "data": "koza"
  }];
  if ( pl === 'p' ) {
      $("#deposit_ranking_title_p").html("累積利益Top10顧客")
      disp_columns.push({
                "title":"{0}まで合計利益(万円)".format(datas[0].ymd.format_as_yyyymmdd_with_slash()),
                "data": "pl_amount_formated",
                "render": function(data, type, row, meta){
                    data = '<div title="' + row.pl_amount + '" class="mt-0;p-0">' + data + '</div>'
                    return data;
                }
      });
  } else {
      $("#deposit_ranking_title_l").html("累積損失Top10顧客")
      disp_columns.push( {
                "title":"{0}まで合計損失(万円)".format(datas[0].ymd.format_as_yyyymmdd_with_slash()),
                "data": "pl_amount_formated",
                "render": function(data, type, row, meta){
                    data = '<div title="' + row.pl_amount + '" class="text-red">' + data + '</div>'
                    return data;
                }
      } );
  }
  disp_columns.push({
      "title":"{0}-{1}変動損益推移(万円)".format(start.format_as_mmdd_with_slash(), end.format_as_mmdd_with_slash()),
      "data": "past_datas",
      "render": function(data, type, row, meta){
                data = '<div style="height:36px"><span class="deposit_sparkline">' + data + '</span></div>';
                return data;
      }
  });

  var dataTable = RpaDataTable.create_simple_table(table_id, {
        data: datas,
        columns: disp_columns,
        columnDefs:[
          {"targets":2, "className": "numcol text-right"},
          {"targets":3, "className": "text-right"},
        ],
        "fnDrawCallback": function (oSettings) {
            $('.deposit_sparkline:not(:has(canvas))').sparkline('html', {
                    type: 'bar',
                    width:'100%',
                    height:'100%',
                    chartRangeMin: 0,
                    chartRangeMax: 0,
                    tooltipFormat: '\{\{offset:offset\}\} \{\{value\}\}万円',
                    tooltipValueLookups: {
                        'offset': labels
                    },
            });
        }
  });
}

function create_payment_threshold(context) {

  if( $('#v_payment').hasClass("panel-fullscreen") ) {
      $('#v_payment').find('.view-subitem').removeClass('col-md-4').addClass('col-md-12')
  } else {
      $('#v_payment').find('.view-subitem').removeClass('col-md-12').addClass('col-md-4')
  }

  if ( context.event === 'redraw' ) {
      if( $('#payment_threshold').closest('.view-item').hasClass("panel-fullscreen") ) {
          $('#payment_threshold').DataTable().page.len(-1).draw()
      } else {
          $('#payment_threshold').DataTable().page.len(12).draw()
      }
      return
  }

  if ( isNaN($("#payment_search_threshold").val()) ) {
      alert('数字を入力してください')
      return;
  }
  var daterange = $("#payment_search_daterange").val().replace(/\//g, '').replace(/\s/g, '');
  var threshold = parseInt($("#payment_search_threshold").val(), 10) * 10000;
  var url = 'api/payment/koza/-/threshold/{0}/{1}/50'.format(threshold, _latest_['payment']);
  if( daterange && daterange.indexOf('-') > 0 ) {
     url = 'api/payment/koza/-/threshold/{0}/{1}/50'.format(threshold, daterange);
  }

  show_message_in('#payment_threshold', 'Loading...');

  get_api(url).get(datas => {

    show_message_in('#payment_threshold', '');
    if( !datas || datas.length === 0) {
      if ($("#payment_search_daterange").val() == '' ) {
        var ymd = (new Date()).format_as_yyyymmdd_with_slash();
        create_date_range_picker('payment_search_daterange', [ymd, ymd]);
      }
      show_message_in('#payment_threshold', 'データなし');
      return;
    }

    _.forEach(datas, data => {
      data.n_amount_formated = fmoney(parseFloat(data.n_amount) / 10000, 0);
      data.s_amount_formated = fmoney(parseFloat(data.s_amount) / 10000, 0);
    });
    var disp_columns = [
      {
        "title":"口座番号",
        "data": "client_id",
        "render": function(data, type, row, meta){
              if(type === 'display'){
                data = '<a href="javascript:void(0);" onclick="dispProfile(\'' + data + '\', null); return false;">' + data + get_diamondclub_icon_html(data, window.context.diamonders) + '</a>';
              }
              return data;
        }
      },
      // {
      //   "title":"入出金日付",
      //   "data": "ymd"
      // },
      {
        "title":"入金合計(万円)",
        "data": "n_amount_formated",
        "render": function(data, type, row, meta){
                  return '<div title="' + row.n_amount + '">' + data + '</div>'
                }
      },
      {
        "title":"出金合計(万円)",
        "data": "s_amount_formated",
        "render": function(data, type, row, meta){
                    if ( parseFloat(row.s_amount) < 0 ) {
                      return '<div title="' + row.s_amount + '" class="text-red">' + data + '</div>'
                    }
                    return '<div title="' + row.s_amount + '">' + data + '</div>'
                }
      }
    ];

    ymd_export = ""
    if( datas && datas.length > 0 && datas[0].ymd ) {
        ymd_export = datas[0].ymd
        ymd = datas[0].ymd.format_as_yyyymmdd_with_slash();
        create_date_range_picker('payment_search_daterange', [ymd, ymd]);
    }

    var export_data_format = function ( data, row, column, node ) {
        var row_data = $('#payment_threshold').DataTable().row(row).data()
        if (column === 0 ) {
            if ( window.context.diamonders[row_data['client_id']] ) {
              return row_data['client_id'] + '◇'
            } else {
              return row_data['client_id']
            }
        } else if(column === 1 ) {
            return row_data['n_amount_formated']
        } else if(column === 2 ) {
            return row_data['s_amount_formated']
        }
        return data
    }

    var page_length = 12
    if( $('#payment_threshold').closest('.view-item').hasClass("panel-fullscreen") ) {
      page_length = -1
    }
    clear_datatables('#payment_threshold')
    RpaDataTable.create_simple_paging_table('#payment_threshold', {
          data: datas,
          columns: disp_columns,
          buttons:get_export_buttons('入出金{0}万円以上顧客({1})'.format(threshold/10000, ymd_export), export_data_format),
          scrollX:true,
          sScrollX:400,
          columnDefs:[
            {"targets":1, "className": "numcol text-right"},
            {"targets":2, "className": "numcol text-right"},
          ],
          pageLength:page_length,
          initComplete: function() {
            init_export_buttons_event('#payment_threshold')
          },
    });
  }, err => {
    show_message_in('#payment_threshold', err);
    show_message_in('#payment_ranking_n', err);
    show_message_in('#payment_ranking_s', err);
  })
}

function create_payment_ranking(context) {

  if( $('#v_payment').hasClass("panel-fullscreen") ) {
      $('#v_payment').find('.view-subitem').removeClass('col-md-4').addClass('col-md-12')
  } else {
      $('#v_payment').find('.view-subitem').removeClass('col-md-12').addClass('col-md-4')
  }
  if(context.event === 'redraw' ) {
      if ( $.fn.DataTable.isDataTable('#payment_ranking_n') ) {
        $('#payment_ranking_n').DataTable().columns.adjust().draw()
      }
      if ( $.fn.DataTable.isDataTable('#payment_ranking_s') ) {
        $('#payment_ranking_s').DataTable().columns.adjust().draw()
      }
      return
  }

  var kbn = context.kbn
  if ( kbn && isNaN($("#payment_search_threshold_" + kbn).val()) ) {
      alert('数字を入力してください')
      return
  }

  var get_past_data = function(datas, start, end, ns, callback) {
        payload = {
          client_id: _.map(datas, 'client_id')
        }
        url = "api/payment/koza/many/{0}/{1}/{2}".format(ns, start, end)
        get_api(url, payload).post(past_datas => {

              var ymds = _.sortBy(_.uniq(_.map(past_datas, 'ymd')))
              labels = {}
              for( var i=0; i<ymds.length; ++i){
                labels[i] = ymds[i].substring(4).replace(/(\d{2})(\d{2})/, '$1/$2')
              }
              var grouped_n = _.mapValues(_.groupBy(past_datas, 'client_id'),
                                clist => clist.map( item => {
                                  return {ymd:item.ymd, n_amount: Math.round(parseFloat(item.n_amount)/10000) }
                                })
                            );
              var grouped_s = _.mapValues(_.groupBy(past_datas, 'client_id'),
                                clist => clist.map( item => {
                                  return {ymd:item.ymd, s_amount: Math.round(parseFloat(item.s_amount)/10000) }
                                })
                            );
              var new_grouped_n = {}
              var new_grouped_s = {}

              //_.mapKeys(
              _.forEach(grouped_n, (items, client_id) => {
                  var new_items = []
                  _.forEach(ymds, ymd => {
                    var finded = _.find(items, (o) => { return o.ymd === ymd } )
                    new_items.push( finded ? finded.n_amount : 0.0)
                  })
                  new_grouped_n[client_id] = new_items
              });
              _.forEach(grouped_s, (items, client_id) => {
                  var new_items = []
                  _.forEach(ymds, ymd => {
                    var finded = _.find(items, (o) => { return o.ymd === ymd } )
                    new_items.push( finded ? finded.s_amount : 0.0)
                  })
                  new_grouped_s[client_id] = new_items
              });
              _.forEach(datas, data => {
                data.past_datas = [new_grouped_n[data.client_id],  new_grouped_s[data.client_id]]
              });

              callback(datas, labels)
        }, error=>{
          show_message_in('#payment_ranking_' + ns, err)
        })
  }

  var get_data_period = function(ns, start, end, threshold) {
      var url = "api/payment/koza/{0}/ranking/{1}/{2}-{3}/10".format(ns, threshold, start, end)
      clear_datatables('#payment_ranking_' + ns)
      show_message_in('#payment_ranking_' + ns, 'Loading...')
      get_api(url).get(datas => {
          show_message_in('#payment_ranking_' + ns, '')
          if ( !datas || datas.length === 0 ) {
            show_message_in('#payment_ranking_' + ns, 'データなし')
            return
          }
          get_past_data(datas, start, end, ns, function(ds, labels){
              create_payment_ranking_table(ds, labels, start, end, ns, threshold)
          })
      }, err => {
         show_message_in('#payment_ranking_' + ns, err)
      })
  }

  if (kbn === void 0) {
      get_api("api/payment/range").get(datas => {
        var start = get_start_end_day(datas['end'], 90)[0]
        var end = datas['end']
        var threshold = 10000000
        create_date_range_picker('payment_search_daterange_n', [start.format_as_yyyymmdd_with_slash(), end.format_as_yyyymmdd_with_slash()])
        create_date_range_picker('payment_search_daterange_s', [start.format_as_yyyymmdd_with_slash(), end.format_as_yyyymmdd_with_slash()])
        get_data_period('n', start, end, threshold)
        setTimeout(function(){
          get_data_period('s', start, end, threshold)
        }, 300)
      })
  } else {
      var period = $("#payment_search_daterange_" + kbn).val().replace(/\//g, '').replace(/\s/g, '').split('-')
      var start = period[0]
      var end   = period[1]
      threshold = parseInt($("#payment_search_threshold_" + kbn).val(), 10) * 10000
      get_data_period(kbn, start, end, threshold)
  }
}

function create_payment_ranking_table(datas, labels, start, end, ns, threshold) {

      if ( !datas ) return;

      _.forEach(datas, data => {
        data.n_amount_formated = fmoney(parseFloat(data.n_amount) / 10000, 0);
        data.s_amount_formated = fmoney(parseFloat(data.s_amount) / 10000, 0);
      })

      table_id = '#payment_ranking_' + ns
      var disp_columns = [{
          "title":"口座番号",
          "data": "client_id",
          "render": function(data, type, row, meta){
                if(type === 'display'){
                  data = '<a href="javascript:void(0);" onclick="dispProfile(\'' + data + '\', null); return false;">' + data + get_diamondclub_icon_html(data, window.context.diamonders) + '</a>';
                }
                return data;
          }
      }];
      if ( ns === 'n' ) {
          //$("#payment_ranking_title_n").html("入金多い顧客Top10(" + datas[0].ymd.format_as_yyyymmdd_with_slash() + ")")
          export_filename =
          disp_columns.push({
                    "title":"入金合計(万円)",
                    "data": "n_amount_formated",
                    "render": function(data, type, row, meta){
                        data = '<div title="' + row.n_amount + '" class="mt-0;p-0">' + data + '</div>'
                        return data;
                    }
          });
      } else {
          //$("#payment_ranking_title_s").html("出金多い顧客Top10(" + datas[0].ymd.format_as_yyyymmdd_with_slash() + ")")
          disp_columns.push( {
                    "title":"出金合計(万円)",
                    "data": "s_amount_formated",
                    "render": function(data, type, row, meta){
                        data = '<div title="' + row.s_amount + '" class="text-red">' + data + '</div>'
                        return data;
                    }
          } );
      }
      disp_columns.push({
          "title":"{0}-{1}入出金履歴(万円)".format(start.format_as_mmdd_with_slash(), end.format_as_mmdd_with_slash()),
          "data": "past_datas",
          "render": function(data, type, row, meta){
                      n_data =  _.sum(data[0]) > 0
                      s_data =  _.sum(data[1] ) < 0
                      if ( n_data && s_data){
                        data = '<div><span class="sparkline_n">' + data[0] + '</span></div>' + '<div class="sparkline_ns_space"><span class="sparkline_s">' + data[1] + '</span></div>';
                      } else if( n_data ) {
                        data = '<div><span class="sparkline_n">' + data[0] + '</span></div><div style="height:18px"></div>';
                      } else {
                        data = '<div><span class="sparkline_s">' + data[1] + '</span></div><div style="height:18px"></div>';
                      }
                      return data;
          }
      });

      var export_data_format = function ( data, row, column, node ) {
        var row_data = $('#' + $(node).closest('table').attr('id')).DataTable().row(row).data()
        if (column === 0 ) {
            if ( window.context.diamonders[row_data['client_id']] ) {
              return row_data['client_id'] + '◇'
            } else {
              return row_data['client_id']
            }
        } else if(column === 1 ) {
          if ( $(node).closest('table').attr('id') === 'payment_ranking_n') {
              return row_data['n_amount_formated']
          } else {
              return row_data['s_amount_formated']
          }
        } else if(column === 2 ) {
            return row_data['past_datas']
        }
        return data
      }

      RpaDataTable.create_simple_table(table_id, {
            data: datas,
            paging:false,
            scrollX:true,
            sScrollX:400,
            columns: disp_columns,
            buttons:get_export_buttons("{0}{1}万円以上顧客({2})".format(ns === 'n' ? '入金' : '出金', threshold /10000, end), export_data_format),
            columnDefs:[
              {"targets":0, "width": "70px"},
              {"targets":1, "className": "numcol text-right", "width": "60px"},
              {"targets":2, "className": "text-right"},
            ],
            fixedColumns: {
              leftColumns: 2
            },
            "fnDrawCallback": function (oSettings) {
                $('.sparkline_n:not(:has(canvas))').sparkline('html', {
                    type: 'bar',
                    spotColor: false,
                    tooltipFormat: '\{\{offset:offset\}\} \{\{value\}\}万円',
                    tooltipValueLookups: {
                        'offset': labels
                    },
                });
                $('.sparkline_s:not(:has(canvas))').sparkline('html', {
                    type: 'bar',
                    spotColor: false,
                    tooltipFormat: '\{\{offset:offset\}\} \{\{value\}\}万円',
                    tooltipValueLookups: {
                        'offset': labels
                    },
                });
          },
          initComplete: function() {
            init_export_buttons_event(table_id)
          },
      });

      if( ns === 'n') {
          if ( $.fn.DataTable.isDataTable('#payment_ranking_n') ) {
            $('#payment_ranking_n').DataTable().columns.adjust().draw();
          }
      } else {
          if ( $.fn.DataTable.isDataTable('#payment_ranking_s') ) {
            $('#payment_ranking_s').DataTable().columns.adjust().draw();
          }
      }
}
var _ccypair_base_ymd_ = null;
function create_ccypair_table(context) {

    if( $('#v_bs').hasClass("panel-fullscreen") ) {
        $('#v_bs').find('.view-subitem-4').removeClass('col-md-4')
        $('#v_bs').find('.view-subitem-8').removeClass('col-md-8')
    } else {
      $('#v_bs').find('.view-subitem-4').addClass('col-md-4')
      $('#v_bs').find('.view-subitem-8').addClass('col-md-8')
    }

    var create_ccy_chart_current_page = function(dataTable, ymd) {
        var current_ccy_pair_ids = []
        var currents = dataTable.column(0, { page:'current' }).data();
        for(var i=0; i<currents.length; ++i){
          current_ccy_pair_ids[i] = currents[i];
        }
        if(current_ccy_pair_ids ){
          create_ccy_chart(current_ccy_pair_ids, ymd);
        }
    }

    if( context.event === 'redraw') {
        if( $('#ccypair').closest('.view-item').hasClass("panel-fullscreen") ) {
          $('#ccypair').DataTable().page.len(-1).draw()
        } else {
          $('#ccypair').DataTable().page.len(10).draw()
        }
        create_ccy_chart_current_page($('#ccypair').DataTable(), _ccypair_base_ymd_)
        return
    }

    get_api("api/done/ccy/{0}/50".format(_latest_['done'])).get(datas => {
        if( !datas || datas.length == 0) {
          show_message_in("#ccypair", 'データ取り込み中、又はデータなし')
          return;
        }
        total = _.sumBy(datas, function(o) { return parseFloat(o.total); });
        total_quantity = _.sumBy(datas, function(o) { return parseInt(o.quantity, 10); });
        for( var i=0; i< datas.length; ++i){
            amount = parseFloat(datas[i].total);
            quantity = parseInt(datas[i].quantity);
            datas[i].total_formated = fmoney(amount / 1000000, 1);
            datas[i].quantity_formated = fmoney(quantity);

            var percent = amount / parseFloat(total) * 10000
            if( percent < 1){
              datas[i].percent = '0.01%未満'
            }else{
              datas[i].percent = (Math.round(percent) / 100).toFixed(2) + "%"
            }
            var percent_quantity = quantity / parseFloat(total_quantity) * 10000
            if( percent_quantity < 1){
              datas[i].percent_quantity = '0.01%未満'
            }else{
              datas[i].percent_quantity = (Math.round(percent_quantity) / 100).toFixed(2) + "%"
            }
        }
        total_data = {};
        total_data.ccy_pair_id = "全通貨";
        total_data.percent = "-";
        total_data.percent_quantity = "-";
        total_data.total = total;
        total_data.total_formated = fmoney(total / 1000000, 1);
        total_data.quantity = total_quantity;
        total_data.quantity_formated = fmoney(total_quantity);
        total_data.ymd = datas[0].ymd;
        datas.splice(0, 0, total_data);
        ymd_with_slash = datas[0].ymd.format_as_yyyymmdd_with_slash()
        $("#done_ccypair_title").html("通貨ペア別合計(" + ymd_with_slash + "、単位 :百万円)")

        var export_data_format = function ( data, row, column, node ) {
          var row_data = $('#ccypair').DataTable().row(row).data()
          if (column === 0 ) {
            return row_data['ccy_pair_id']
          } else if(column === 1 ) {
            return row_data['total']
          } else if(column === 2 ) {
            return row_data['quantity']
          } else if(column === 3 ) {
            return row_data['percent']
          } else if(column === 4 ) {
            return row_data['percent_quantity']
          }
          return data
        }

        var table_options = {
          data: datas,
          scrollX:true,
          sScrollX:400,
          columns: [
            {
              "title":"通貨ペア",
              "data": "ccy_pair_id",
              "render": function(data, type, row, meta){
                if(meta.row == 0) {
                  return '<a href="javascript:void(0)" onclick="dispDetailchart(\'done/detail\', \'bs\', \'{0}\')" title="売買別データを見る">{1}</a>'.format('ALL', data)
                }
                return '<a href="javascript:void(0)" onclick="dispDetailchart(\'done/detail\', \'bs\', \'{0}\')" title="売買別データを見る">{1}</a>'.format(data, data)
              }
            },
            {
              "title":"代金",
              "data": "total_formated",
              "render": function(data, type, row, meta){
                  data = '<div title="' + row.total + '" class="mt-0;p-0">' + data + '</div>'
                  return data;
              }
            },
            {
              "title":"通貨数量",
              "data": "quantity_formated"
            },
            {
              "title":"割合(代金)",
              "data": "percent"
            },
            {
              "title":"割合(通貨数量)",
              "data": "percent_quantity"
            }
          ],
          columnDefs:[
            {"targets":1, "className": "numcol text-right"},
            {"targets":2, "className": "numcol text-right"},
            {"targets":3, "className": "numcol text-right"},
            {"targets":4, "className": "numcol text-right"}
          ],
          buttons:get_export_buttons("通貨ペア別合計({0})".format(datas[0].ymd), export_data_format),
          initComplete: function() {
            init_export_buttons_event('#ccypair')
          },
        }
        var current_height;
        var chart = document.getElementById("ccy_canvas_past_div")
        if( $('#ccypair').closest('.view-item').hasClass("panel-fullscreen") ) {
          table_options.paging = false;
        } else {
          table_options.paging = true;
          table_options.pageLength = 10;
        }

        clear_datatables('#ccypair');

        var dataTable = RpaDataTable.create_simple_table('#ccypair', table_options);

        _ccypair_base_ymd_ = datas[0].ymd.format_as_yyyymmdd_with_slash()
        $('#ccypair').off('page.dt').on( 'page.dt', function () {
            create_ccy_chart_current_page(dataTable, _ccypair_base_ymd_)
        } );
        create_ccy_chart_current_page(dataTable, _ccypair_base_ymd_)
    },
    error=>{
      show_message_in("#ccypair", error)
    });
}

_ccy_total_nows_ = {}
function create_ccy_chart(ccy_pair_ids, base_date) {
    var d = base_date.parse_date()
    end   = d.format_as_yyyymmdd()
    start = d.get_past_date(31).format_as_yyyymmdd()
    url = "api/done/ccy/timeline/-/-/{0}/{1}".format(start, end)
    get_api(url, {ccy: ccy_pair_ids}).post(datas => {
        _ccy_total_nows_ = {}
        comm_clear_canvas('ccy_canvas_past');
        labels = [];
        totals_1 = [];
        totals_2 = [];
        var start_time = 6
        var timeline = 0
        var f_datas = {}
        for(var i=0; i<ccy_pair_ids.length; ++i){
          f_datas[ccy_pair_ids[i]] = []
          _ccy_total_nows_[ccy_pair_ids[i]] = []
        }
        for(var i=0; i<datas.length; ++i){
          start_time = datas[i].start_time
          ccyid = datas[i].ccy_pair_id
          if ( !ccyid ) {
            if( parseInt(datas[i].hh, 10) > 0 ) {
                label = datas[i].ymd.substring(4);
                label = label.substring(0,2) + '/' + label.substring(2)
                labels.push(label);
                totals_2.push(datas[i].total/1000000)
              } else {
                timeline = Math.abs(parseInt(datas[i].hh, 10))
                totals_1.push(datas[i].total/1000000)
              }
          } else {
            if(!f_datas[ccyid]) f_datas[ccyid] = []
            f_datas[ccyid].push(datas[i].total/1000000)
            if(!_ccy_total_nows_[ccyid]) _ccy_total_nows_[ccyid] = []
            _ccy_total_nows_[ccyid].push(datas[i].total_now/1000000)
          }
        }

        datasets = [];
        datasets.push({
          label: '合計(一日)',
          data:totals_2,
          backgroundColor: "rgba(54,164,235,0.3)",
        });
        datasets.push({
            label: '合計({0}時～{1}時)'.format(start_time, timeline > 23 ? '翌{0}'.format(timeline-24) : timeline),
            data:totals_1,
            backgroundColor: "rgba(255,0,0,0.3)",
        });

        var index = 1;
        for(var ccyid in f_datas){
          if(ccyid != '全通貨') {
            datasets.push({
              type: 'line',
              fill: false,
              label: ccyid,
              data:f_datas[ccyid],
              borderColor : window.chartColors['color'+ index],
              backgroundColor: window.chartColors['color'+ index],
            });
            index++;
          }
        }

        var ctx = document.getElementById("ccy_canvas_past");
        if( $('#ccy_canvas_past').closest('.view-item').hasClass("panel-fullscreen") ) {
          ctx.height = 900;
        } else {
          ctx.height = 500;
        }

        var myLineChart = new Chart( $("#ccy_canvas_past"), {
            type: "bar",
            data: {
              labels:labels,
              datasets:datasets
            },
            options:{
              title: {
                display: true,
                text: '日別売買代金(単位 :百万円)',
                fontSize:18,
                fontStyle:'normal'
              },
              legend: {
                position: 'right',
                reverse: false
              },
              responsive: true,
              maintainAspectRatio: false,
              tooltips:{
                mode:'index',
                intersect:true,
                callbacks: {
                    label: function (tooltipItem, data){
                        var label = datasets[tooltipItem.datasetIndex].label;
                        var vl = parseFloat(tooltipItem.yLabel);
                        if (_ccy_total_nows_[label] !== void 0) {
                          var vl_now = _ccy_total_nows_[label][tooltipItem.index]
                          return label + ' : ' + fmoney(vl_now,0) + ' / ' + fmoney(vl, 0);
                        } else {
                          return label + ' : ' + fmoney(vl, 0);
                        }

                    }
                }
              },
              scales: {
                    xAxes: [{
                      stacked: true,
                      gridLines: {
                          color: "rgba(0, 0, 0, 0)",
                          drawBorder: false
                      }
                    }],
                    yAxes: [{
                      ticks: {
                          beginAtZero: true,
                          callback: function(value, index, values) {
                            return fmoney(value, 0 );
                          }
                      },
                      gridLines: {
                        color: "rgba(0, 0, 0, 0.1)",
                        drawBorder: false
                      }
                    }],
              },
              horizontalLine: [{
                    y: totals_1[totals_1.length-1],
                    style: "rgba(255, 0, 0, 0.8)",
                    text: '{0}時'.format(timeline > 23 ? '翌{0}'.format(timeline-24) : timeline)
              }]
            }
        });
    });
}

var dataLabelPlugin = {
      afterDatasetsDraw: function (chart, easing) {
        // To only draw at the end of animation, check for easing === 1
        var ctx = chart.ctx;
        var total = 0;
        chart.data.datasets.forEach(function (dataset, i) {
          var meta = chart.getDatasetMeta(i);
          if (!meta.hidden) {
            meta.data.forEach(function (element, index) {
              total = total + parseInt(dataset.data[index]);
            });
          }
        });

  var offside1 = 0;
  var offside2 = 0;
  chart.data.datasets.forEach(function (dataset, i) {
    var meta = chart.getDatasetMeta(i);
    if (!meta.hidden) {
        meta.data.forEach(function (element, index) {
          // Draw the text in black, with the specified font
          ctx.fillStyle = 'rgb(0, 0, 0)';

          var fontSize = 12;
          var fontStyle = 'normal';
          var fontFamily = 'Helvetica Neue';
          ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);

          // Just naively convert to string for now
          // var dataString = dataset.data[index].toString();
          var dataString;
          var xpadding = 0;
          if(chart.config.type  == 'horizontalBar') {
            dataString = dataset.data[index] + "(" + getPercent(dataset.data[index], total, 1) + ")";
            xpadding = 120;
            ctx.textAlign = 'left';
          } else {
            dataString = getPercent(dataset.data[index], total, 1);
            ctx.textAlign = 'center';
          }
          // Make sure alignment settings are correct
          ctx.textBaseline = 'middle';
          // var padding = 0;
          var position = element.tooltipPosition();

          if(xpadding > 0) {
            ctx.fillText(dataString, xpadding, position.y);
          } else {
              if(dataset.backgroundColor.length == 6 && dataset.backgroundColor[index] == "#d81b60") {
                ctx.fillText(dataString, position.x, position.y + 25);
              }
              else if( dataset.backgroundColor.length == 6 && dataset.backgroundColor[index] == "#01579b") {
                ctx.fillText(dataString, position.x, position.y - 15);
              } else {
                ctx.fillText(dataString, position.x, position.y);
              }
          }
      });
    }
  });
}
};

/**
 * チャンネル
 **/
function create_channel(context) {

    if( $('#v_channel').hasClass("panel-fullscreen") ) {
        $('#v_channel').find('.view-subitem').removeClass('col-md-3').addClass('col-md-12')
    } else {
        $('#v_channel').find('.view-subitem').removeClass('col-md-12').addClass('col-md-3')
    }
    if ( context.event === 'redraw' ) {
      return
    }

    $('#device_order_month_select').val('')
    $('#new_old_app_month_select').val('')
    $('#means_month_select').val('')

    // 経路別(order)
    createPieChart('device_order', '1', null, function(trade_date){
      createLineChart('device_order_month', '1', trade_date);
    });
    // 新旧アプリ別Android/iPhone別(order)
    createPieChart('new_old_app', '2', null, function(trade_date){
      createLineChart('new_old_app_month', '2', trade_date);
    });
    // デバイス別(order)
    createPieChart('means', '3', null, function(trade_date){
      createLineChart('means_month', '3', trade_date);
    });
    // 不明デバイス(order)
    createOtherPieChart('other', '1', function(trade_date){
      createOtherTableChart(trade_date);
    });
}

function createPieChart(chartId, kbn, label, callback) {

  var yyyymmdd = _latest_['device']

  // チャンネルURL
  is_req_client = document.getElementById('device_kbn_client').checked;
  var order_url= is_req_client ? "api/device_client/{0}" : "api/device_order/{0}";
  if(kbn.substring(0,1) == '4') {
    order_url = is_req_client ? "api/iphone_client/{0}" : "api/iphone_order/{0}";
  }
  var postdata;
  if(kbn.substring(0,1) == '5') {
    order_url = is_req_client ? "api/ios_client/{0}" : "api/ios_order/{0}";
    postdata = { model: label };
  }
  if(kbn.substring(0,1) == '6') {
    order_url =is_req_client ? "api/android_client/{0}" : "api/android_order/{0}";
    postdata = { os: label };
  }
  // グラフデータ取得
  get_api(order_url.format(yyyymmdd), postdata).post(data => {
      if( kbn === '4' && data && data.length > 15) {
        data = data.slice(0, 15);
      }
      var ctx = $("#" + chartId);
      var labels=createDeviceOrderLabels(data, kbn, false);
      var datas=createDeviceOrderDatas(data, kbn, false);
      legend = '';
      if (data && data.length > 0){
          ymd_with_slash = data[0].ymd.replace(/(\d{4})(\d{2})(\d{2})/, '$1/$2/$3');
          if($("#channel_search_range").val() == '') {
            var d = ymd_with_slash.parse_date()
            datefrom = d.get_past_date(31).format_as_yyyymmdd()
            dateto   = d.format_as_yyyymmdd()
            create_date_range_picker("channel_search_range", [datefrom.format_as_yyyymmdd_with_slash(), dateto.format_as_yyyymmdd_with_slash()]);
          }
          if(callback){
            callback(data[0].ymd);
          }
      } else {
        return;
      }

      //$("#device_title").html("チャンネル別注文件数(" + ymd_with_slash + ")");
      var chartDatas;
      if(kbn == '1') {
        var color = new Array();
        color.push("#b3e5fc");
        color.push("#29b6f6");
        color.push("#01579b");
        color.push("#f06292");
        chartDatas = createDeviceOrderChartData(labels, datas, legend, color);
      } else if(kbn == '2') {
        var color = new Array();
        color.push("#f8bbd0");
        color.push("#f06292");
        color.push("#d81b60");
        color.push("#b3e5fc");
        color.push("#29b6f6");
        color.push("#01579b");
        $("#new_old_app").css("display", "block");
        $("#iphone_version").css("display", "none");

        chartDatas = createDeviceOrderChartData(labels, datas, legend, color);
      } else if(kbn == '3') {
        var color = new Array();
        color.push("#d81b60");
        color.push("#29b6f6");
        color.push("#f06292");
        chartDatas = createDeviceOrderChartData(labels, datas, legend, color);
      } else {
        var color = new Array();
        for(var i = 0; i < datas.length; i++) {
          color.push(window.chartColors.randomColor(0.5));
        }
        chartDatas = createDeviceOrderChartData(labels, datas, legend, color);
      }
      var theHelp = Chart.helpers;
      var option = {};
      if ( _charts_[chartId] ) {
        _charts_[chartId].destroy();
      }

      if(chartId === 'device_order') {
          chart_device_order = new Chart(ctx, {
            type: 'pie',
            data: chartDatas,
            options: {
              title: {
                display: true,
                text: '経路別',
                position: 'top'
              },
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                  display: false
              },
              plugins: {
                labels: {
                  render: 'label',
                  arc: false,
                  fontColor: '#000',
                  position: 'outside',
                  showZero: true
                }
              }
            },
            plugins: dataLabelPlugin
          });
          _charts_[chartId] = chart_device_order
      }
      if(chartId == 'new_old_app' ) {
          chart_new_old_app = new Chart(ctx, {
            type: 'pie',
            data: chartDatas,
            options: {
              title: {
                display: true,
                text: '新旧アプリ別Android/iPhone別',
                position: 'top'
              },
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                  display: false
              },
              plugins: {
                labels: {
                  render: 'label',
                  arc: false,
                  fontColor: '#000',
                  position: 'outside',
                  showZero: true
                }
              }
            },
            plugins: dataLabelPlugin
          });
          _charts_[chartId] = chart_new_old_app
      }
      if(chartId == 'means') {
          chart_means = new Chart(ctx, {
            type: 'pie',
            data: chartDatas,
            options: {
              title: {
                display: true,
                text: 'デバイス別',
                position: 'top'
              },
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                  display: false
              },
              plugins: {
                labels: {
                  render: 'label',
                  arc: false,
                  fontColor: '#000',
                  position: 'outside',
                  showZero: true
                }
              }
            },
            plugins: dataLabelPlugin
          });
          _charts_[chartId] = chart_means
      }
      if(chartId == 'iphone_version') {
          chart_iphone_version = new Chart(ctx, {
            type: 'horizontalBar',
            data: chartDatas,
            options: {
              scales: {
                yAxes: [{
                  display: true,
                  ticks: {
                    fontColor: 'black'
                  },
                  maxBarThickness: 30
                }]
              },
              title: {
                display: true,
                text: 'iPhone機種別',
                position: 'top'
              },
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                  display: false
              },
              labels: {
                render: 'label',
                arc: false,
                fontColor: '#000',
                position: 'outside',
                showZero: true
              },
              plugins: {
                labels: {
                  render: 'label',
                  arc: false,
                  fontColor: '#000',
                  position: 'border',
                  showZero: true
                }
              }
            },
            plugins: dataLabelPlugin
          });
          _charts_[chartId] = chart_iphone_version
      }
      if(chartId == 'ios_version') {
          chart_ios_version = new Chart(ctx, {
            type: 'horizontalBar',
            data: chartDatas,
            options: {
              scales: {
                yAxes: [{
                  display: true,
                  ticks: {
                    fontColor: 'black'
                  },
                  maxBarThickness: 30
                }],
                xAxes: [{
                  display: true,
                  ticks: {
                    fontColor: 'black',
                    beginAtZero: true
                  }
                }]
              },
              title: {
                display: true,
                text: label + ':ios別',
                position: 'top'
              },
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                  display: false
              },
              labels: {
                render: 'label',
                arc: false,
                fontColor: '#000',
                position: 'outside'
              },
              plugins: {
                labels: {
                  render: 'label',
                  arc: false,
                  fontColor: '#000',
                  position: 'outside',
                  showZero: true
                }
              }
            },
            plugins: dataLabelPlugin
          });
          _charts_[chartId] = chart_ios_version
      }

      if(chartId == 'android_version') {
          chart_android_version = new Chart(ctx, {
            type: 'horizontalBar',
            data: chartDatas,
            options: {
              scales: {
                yAxes: [{
                  display: true,
                  ticks: {
                    fontColor: 'black'
                  },
                  maxBarThickness: 30
                }],
                xAxes: [{
                  display: true,
                  ticks: {
                    fontColor: 'black',
                    beginAtZero: true
                  }
                }]
              },
              title: {
                display: true,
                text: label + ':バージョン別',
                position: 'top'
              },
              responsive: true,
              maintainAspectRatio: false,
              legend: {
                  display: false
              },
              labels: {
                render: 'label',
                arc: false,
                fontColor: '#000',
                position: 'outside',
                showZero: true
              },
              plugins: {
                labels: {
                  render: 'label',
                  arc: false,
                  fontColor: '#000',
                  position: 'outside',
                  showZero: true
                }
              }
            },
            plugins: dataLabelPlugin
          });
          _charts_[chartId] = chart_android_version
      }
  }, err => {
      show_message_in("#device_view_body", err)
  });
}

function createDeviceOrderLineChartData(labels, data, color, kbn, kbn2, select_option="") {
  var retWeb = new Array();
  var retRich = new Array();
  var retRich2 = new Array();
  var retApp = new Array();
  var retDeviceTotal = new Array();
  var retNewIphone = new Array();
  var retNewAndroid = new Array();
  var retOldIphone = new Array();
  var retOldAndroid = new Array();
  var retAppTotal = new Array();
  var retGarake = new Array();
  var retPc = new Array();
  var retSp = new Array();
  var retSnIphone = new Array();
  var retSnAndroid = new Array();
  var retMeansTotal = new Array();

  var retWebPercent = new Array();
  var retRichPercent = new Array();
  var retRich2Percent = new Array();
  var retAppPercent = new Array();

  var retNewIphonePercent = new Array();
  var retNewAndroidPercent = new Array();
  var retOldIphonePercent = new Array();
  var retOldAndroidPercent = new Array();
  var retSnIphonePercent = new Array();
  var retSnAndroidPercent = new Array();

  var retGarakePercent = new Array();
  var retPcPercent = new Array();
  var retSpPercent = new Array();

  for(var i = 0; i < data.length; i++) {
    if(kbn == '1') {
      var sum = 0;
      if(data[i].web_count != undefined) {
        retWeb.push(data[i].web_count);
        sum = sum + parseInt(data[i].web_count);
      }
      if(data[i].rich_count != undefined) {
        retRich.push(data[i].rich_count);
        sum = sum + parseInt(data[i].rich_count);
      }
      if(data[i].rich2_count != undefined) {
        retRich2.push(data[i].rich2_count);
        sum = sum + parseInt(data[i].rich2_count);
      }
      if(data[i].app_count != undefined) {
        retApp.push(data[i].app_count);
        sum = sum + parseInt(data[i].app_count);
      }
      retDeviceTotal.push(sum);
      retWebPercent.push(getPercent2(parseInt(data[i].web_count), sum));
      retRichPercent.push(getPercent2(parseInt(data[i].rich_count), sum));
      retRich2Percent.push(getPercent2(parseInt(data[i].rich2_count), sum));
      retAppPercent.push(getPercent2(parseInt(data[i].app_count), sum));
    } else if(kbn == '2') {
      var sum = 0;
      if(data[i].old_iphone_count != undefined) {
        retOldIphone.push(data[i].old_iphone_count);
        sum = sum + parseInt(data[i].old_iphone_count);
      }
      if(data[i].new_iphone_count != undefined) {
        retNewIphone.push(data[i].new_iphone_count);
        sum = sum + parseInt(data[i].new_iphone_count);
      }
      if(data[i].sn_iphone_count != undefined) {
        retSnIphone.push(data[i].sn_iphone_count);
        sum = sum + parseInt(data[i].sn_iphone_count);
      }
      if(data[i].old_android_count != undefined) {
        retOldAndroid.push(data[i].old_android_count);
        sum = sum + parseInt(data[i].old_android_count);
      }
      if(data[i].new_android_count != undefined) {
        retNewAndroid.push(data[i].new_android_count);
        sum = sum + parseInt(data[i].new_android_count);
      }
      if(data[i].sn_android_count != undefined) {
        retSnAndroid.push(data[i].sn_android_count);
        sum = sum + parseInt(data[i].sn_android_count);
      }
      retAppTotal.push(sum);

      retOldIphonePercent.push(getPercent2(parseInt(data[i].old_iphone_count), sum));
      retNewIphonePercent.push(getPercent2(parseInt(data[i].new_iphone_count), sum));
      retSnIphonePercent.push(getPercent2(parseInt(data[i].sn_iphone_count), sum, 3));
      retOldAndroidPercent.push(getPercent2(parseInt(data[i].old_android_count), sum));
      retNewAndroidPercent.push(getPercent2(parseInt(data[i].new_android_count), sum));
      retSnAndroidPercent.push(getPercent2(parseInt(data[i].sn_android_count), sum, 3));

    } else {
      var sum = 0;
      if(data[i].garake_count != undefined) {
        retGarake.push(data[i].garake_count);
        sum = sum + parseInt(data[i].garake_count);
      }
      if(data[i].pc_count != undefined) {
        retPc.push(data[i].pc_count);
        sum = sum + parseInt(data[i].pc_count);
      }
      if(data[i].sp_count != undefined) {
        retSp.push(data[i].sp_count);
        sum = sum + parseInt(data[i].sp_count);
      }
      retMeansTotal.push(sum);

      retGarakePercent.push(getPercent2(parseInt(data[i].garake_count), sum, 3));
      retPcPercent.push(getPercent2(parseInt(data[i].pc_count), sum));
      retSpPercent.push(getPercent2(parseInt(data[i].sp_count), sum));
    }
  }
  var dataset = [];
  if(kbn == '1') {
    var dataset1 = {
      label: 'WEB',
      type: 'line',
      fontColor: 'black',
      data: retWebPercent,
      borderColor: color[0],
      backgroundColor : color[0],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset2 = {
      label: 'PCリッチ',
      type: 'line',
      fontColor: 'black',
      data: retRichPercent,
      borderColor: color[1],
      backgroundColor : color[1],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset3 = {
      label: 'PCリッチ２',
      type: 'line',
      fontColor: 'black',
      data: retRich2Percent,
      borderColor: color[2],
      backgroundColor : color[2],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset4 = {
      label: 'スマートフォン',
      type: 'line',
      fontColor: 'black',
      data: retAppPercent,
      borderColor: color[3],
      backgroundColor : color[3],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset5 = {
      label: '合計',
      type: 'bar',
      fontColor: 'black',
      data: retDeviceTotal,
      borderColor: "#b0bec5",
      backgroundColor : "#b0bec5",
      fill: false,
    };
    var otherDataset = {
      type: 'line',
      label: 'その他合計',
      fontColor: 'black',
      borderColor: "#b0bec5",
      backgroundColor : "#b0bec5",
      fill: false,
    };
    if(kbn2 == 1) {
      if(select_option == "" || select_option == "web") {
        dataset1.fill = true;
        dataset.push(dataset1);
      }
      if(select_option == "" || select_option == "rich") {
        dataset2.fill = true;
        dataset.push(dataset2);
      }
      if(select_option == "" || select_option == "rich2") {
        dataset3.fill = true;
        dataset.push(dataset3);
      }
      if(select_option == "" || select_option == "app") {
        dataset4.fill = true;
        dataset.push(dataset4);
      }
      // var otherTotal = new Array();
      // if(select_option != "") {
      //   for(var i = 0; i < retDeviceTotal.length; i++) {
      //     var otherSum = 100.0 - dataset[0].data[i];
      //     otherTotal.push(otherSum);
      //   }
      //   otherDataset.fill = true;
      //   otherDataset.data = otherTotal;
      //   dataset.push(otherDataset);
      // }
    } else {
      if(select_option == "" || select_option == "web") {
        dataset1.data = retWeb;
        dataset1.type = "line";
        dataset.push(dataset1)
      }
      if(select_option == "" || select_option == "rich") {
        dataset2.data = retRich;
        dataset2.type = "line";
        dataset.push(dataset2)
      }
      if(select_option == "" || select_option == "rich2") {
        dataset3.data = retRich2;
        dataset3.type = "line";
        dataset.push(dataset3)
      }
      if(select_option == "" || select_option == "app") {
        dataset4.data = retApp;
        dataset4.type = "line";
        dataset.push(dataset4)
      }
      dataset.push(dataset5)
    }
  } else if(kbn == '2') {
    var dataset1 = {
      label: '旧iPhone',
      type: 'line',
      fontColor: 'black',
      data: retOldIphonePercent,
      borderColor: color[0],
      backgroundColor : color[0],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset2 = {
      label: '新iPhone',
      type: 'line',
      fontColor: 'black',
      data: retNewIphonePercent,
      borderColor: color[1],
      backgroundColor : color[1],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset3 = {
      label: 'SN-iPhone',
      type: 'line',
      fontColor: 'black',
      data: retSnIphonePercent,
      borderColor: color[2],
      backgroundColor : color[2],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset4 = {
      label: '旧Android',
      type: 'line',
      fontColor: 'black',
      data: retOldAndroidPercent,
      borderColor: color[3],
      backgroundColor : color[3],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset5 = {
      label: '新Android',
      type: 'line',
      fontColor: 'black',
      data: retNewAndroidPercent,
      borderColor: color[4],
      backgroundColor : color[4],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset6 = {
      label: 'SN-Android',
      type: 'line',
      fontColor: 'black',
      data: retSnAndroidPercent,
      borderColor: color[5],
      backgroundColor : color[5],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset7 = {
      label: '合計',
      type: 'bar',
      fontColor: 'black',
      data: retAppTotal,
      borderColor: "#b0bec5",
      backgroundColor : "#b0bec5",
      fill: false,
    };
    var otherDataset = {
      type: 'line',
      label: 'その他合計',
      fontColor: 'black',
      borderColor: "#b0bec5",
      backgroundColor : "#b0bec5",
      fill: false,
    };
    if(kbn2 == 1) {
      if(select_option == "" || select_option == "old_iphone") {
        dataset1.fill = true;
        dataset.push(dataset1);
      }
      if(select_option == "" || select_option == "new_iphone") {
        dataset2.fill = true;
        dataset.push(dataset2);
      }
      if(select_option == "" || select_option == "sn_iphone") {
        dataset3.fill = true;
        dataset.push(dataset3);
      }
      if(select_option == "" || select_option == "old_android") {
        dataset4.fill = true;
        dataset.push(dataset4);
      }
      if(select_option == "" || select_option == "new_android") {
        dataset5.fill = true;
        dataset.push(dataset5);
      }
      if(select_option == "" || select_option == "sn_android") {
        dataset6.fill = true;
        dataset.push(dataset6);
      }
      // var otherTotal = new Array();
      // if(select_option != "") {
      //   for(var i = 0; i < retAppTotal.length; i++) {
      //     var otherSum = 100.0 - dataset[0].data[i];
      //     otherTotal.push(otherSum);
      //   }
      //   otherDataset.fill = true;
      //   otherDataset.data = otherTotal;
      //   dataset.push(otherDataset);
      // }
    } else {
      if(select_option == "" || select_option == "old_iphone") {
        dataset1.data = retOldIphone;
        dataset1.type = 'line';
        dataset.push(dataset1);
      }
      if(select_option == "" || select_option == "new_iphone") {
        dataset2.data = retNewIphone;
        dataset2.type = 'line';
        dataset.push(dataset2);
      }
      if(select_option == "" || select_option == "sn_iphone") {
        dataset3.data = retSnIphone;
        dataset3.type = 'line';
        dataset.push(dataset3);
      }
      if(select_option == "" || select_option == "old_android") {
        dataset4.data = retOldAndroid;
        dataset4.type = 'line';
        dataset.push(dataset4);
      }
      if(select_option == "" || select_option == "new_android") {
        dataset5.data = retNewAndroid;
        dataset5.type = 'line';
        dataset.push(dataset5);
      }
      if(select_option == "" || select_option == "sn_android") {
        dataset6.data = retSnAndroid;
        dataset6.type = 'line';
        dataset.push(dataset6);
      }
      dataset.push(dataset7);
    }
  } else {
    var dataset1 = {
      label: '携帯',
      fontColor: 'black',
      type: 'line',
      data: retGarakePercent,
      borderColor: color[0],
      backgroundColor : color[0],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset2 = {
      label: 'PC',
      type: 'line',
      fontColor: 'black',
      data: retPcPercent,
      borderColor: color[1],
      backgroundColor : color[1],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset3 = {
      label: 'モバイル',
      type: 'line',
      fontColor: 'black',
      data: retSpPercent,
      borderColor: color[2],
      backgroundColor : color[2],
      fill: false,
      pointRadius:2,
      pointHoverRadius:5
    };
    var dataset4 = {
      label: '合計',
      type: 'bar',
      fontColor: 'black',
      data: retMeansTotal,
      borderColor: "#b0bec5",
      backgroundColor : "#b0bec5",
      fill: false,
    };
    var otherDataset = {
      type: 'line',
      label: 'その他合計',
      fontColor: 'black',
      borderColor: "#b0bec5",
      backgroundColor : "#b0bec5",
      fill: false,
    };
    if(kbn2 == 1) {
      if(select_option == "" || select_option == "garake") {
        dataset1.fill = true;
        dataset.push(dataset1);
      }
      if(select_option == "" || select_option == "pc") {
        dataset2.fill = true;
        dataset.push(dataset2);
      }
      if(select_option == "" || select_option == "sp") {
        dataset3.fill = true;
        dataset.push(dataset3);
      }
      // var otherTotal = new Array();
      // if(select_option != "") {
      //   for(var i = 0; i < retMeansTotal.length; i++) {
      //     var otherSum = 100.0 - dataset[0].data[i];
      //     otherTotal.push(otherSum);
      //   }
      //   otherDataset.fill = true;
      //   otherDataset.data = otherTotal;
      //   dataset.push(otherDataset);
      // }
    } else {
      if(select_option == "" || select_option == "garake") {
        dataset1.data = retGarake;
        dataset1.type = 'line';
        dataset.push(dataset1);
      }
      if(select_option == "" || select_option == "pc") {
        dataset2.data = retPc;
        dataset2.type = 'line';
        dataset.push(dataset2);
      }
      if(select_option == "" || select_option == "sp") {
        dataset3.data = retSp;
        dataset3.type = 'line';
        dataset.push(dataset3);
      }
      dataset.push(dataset4);
    }
  }
  var ret = {
    labels: labels,
    datasets: dataset
  }
  return ret;
}

function createOtherOrderChartData(labels, datas, label, color) {
    var dataset = [{
      fill: true,
      label: label,
      fontColor: 'black',
      data: datas,
      borderWidth: 1,
      borderColor: color,
      backgroundColor: color,
    }];
    var ret = {
      labels: labels,
      datasets: dataset
    }
    return ret;
}

function createDeviceOrderChartData(labels, datas, label, color) {
    var dataset = [{
      fill: true,
      label: label,
      fontColor: 'black',
      data: datas,
      borderWidth: 1,
      borderColor: color,
      backgroundColor: color,
    }];
    var ret = {
      labels: labels,
      datasets: dataset
    }
    return ret;
}

function createChartData(labels, datas, label, color) {
    //label + '(単位 :百万円)'
    var dataset = [{
        label: label,
        fontColor: 'black',
        data: datas,
        borderWidth: 1,
        borderColor: color,
        backgroundColor: Chart.helpers.color(color).alpha(0.5).rgbString(),
    }];
    var ret = {
      labels: labels,
      datasets: dataset
    }
    return ret;
}

function createDeviceOrderLabels(data, kbn, totalFlag, select_option) {
    if (select_option === void 0) {
      select_option = ""
    }
    var ret = new Array();
    for(var i = 0; i < data.length; i++) {
    if(totalFlag == false) {
        if(kbn.substring(0,1) == '1') {
          if(select_option == "" || select_option == "web") {
            if(data[i].web_count != undefined) {
              ret.push('WEB');
            }
          }
          if(select_option == "" || select_option == "rich") {
            if(data[i].rich_count != undefined) {
                ret.push('PCリッチ');
            }
          }
          if(select_option == "" || select_option == "rich2") {
            if(data[i].rich2_count != undefined) {
                ret.push('PCリッチ２');
            }
          }
          if(select_option == "" || select_option == "app") {
            if(data[i].app_count != undefined) {
                ret.push('スマートフォン');
            }
          }
          break;
        } else if(kbn.substring(0,1) == '2') {
          if(select_option == "" || select_option == "old_iphone") {
            if(data[i].old_iphone_count != undefined) {
                ret.push('旧iPhone');
            }
          }
          if(select_option == "" || select_option == "new_iphone") {
            if(data[i].new_iphone_count != undefined) {
                ret.push('新iPhone');
            }
          }
          if(select_option == "" || select_option == "sn_iphone") {
            if(data[i].sn_iphone_count != undefined) {
                ret.push('SN-iPhone');
            }
          }
          if(select_option == "" || select_option == "old_android") {
            if(data[i].old_android_count != undefined) {
                ret.push('旧Android');
            }
          }
          if(select_option == "" || select_option == "new_android") {
            if(data[i].new_android_count != undefined) {
                ret.push('新Android');
            }
          }
          if(select_option == "" || select_option == "sn_android") {
            if(data[i].sn_android_count != undefined) {
                ret.push('SN-Android');
            }
          }
          break;
        } else if(kbn.substring(0,1) == '3') {
          if(select_option == "" || select_option == "garake") {
            if(data[i].garake_count != undefined) {
                ret.push('携帯');
            }
          }
          if(select_option == "" || select_option == "pc") {
            if(data[i].pc_count != undefined) {
                ret.push('PC');
            }
          }
          if(select_option == "" || select_option == "sp") {
            if(data[i].sp_count != undefined) {
                ret.push('モバイル');
            }
          }
          break;
        } else if(kbn.substring(0,1) == '4') {
          if(data[i].model != undefined) {
            ret.push(data[i].model);
          }
        } else {
          if(data[i].os != undefined) {
            ret.push(data[i].os);
          }
        }
    } else {
        if(data[i].ymd != undefined) {
        ret.push(data[i].ymd.substr(4, 2) + "/" + data[i].ymd.substr(6, 2));
        }
    }
    }
    return ret;
}

function createOtherOrderLabels(data, kbn) {
    var ret = new Array();
    for(var i = 0; i < data.length; i++) {
      if(kbn.substring(0,1) == '1') {
          if(data[i]['device'] == '0') {
          ret.push("metatrader");
          } else if(data[i]['device'] == '1') {
          ret.push("curl");
          } else if(data[i]['device'] == '2') {
          ret.push("dalvik");
          } else if(data[i]['device'] == '3') {
          ret.push("java");
          } else {
          ret.push("python");
          }
      } else {
          ret.push(data[i]['ymd'].format_as_mmdd_with_slash());
      }
    }
    return ret;
}

function createOtherOrderDatas(data, kbn) {
    var ret = new Array();
    for(var i = 0; i < data.length; i++) {
      if(kbn == '1') {
          ret.push(data[i].total_order_count);
      } else {
          ret.push(data[i].total_order_device_count);
      }
    }
    return ret;
}

function createDeviceOrderDatas(data, kbn, totalFlag) {
    var ret = new Array();
    for(var i = 0; i < data.length; i++) {
      var sum = 0;
      if(kbn == '1') {
          if(data[i].web_count != undefined) {
          ret.push(data[i].web_count);
          sum = sum + parseInt(data[i].web_count);
          }
          if(data[i].rich_count != undefined) {
          ret.push(data[i].rich_count);
          sum = sum + parseInt(data[i].rich_count);
          }
          if(data[i].rich2_count != undefined) {
          ret.push(data[i].rich2_count);
          sum = sum + parseInt(data[i].rich2_count);
          }
          if(data[i].app_count != undefined) {
          ret.push(data[i].app_count);
          sum = sum + parseInt(data[i].app_count);
          }
      } else if(kbn == '2') {
          if(data[i].old_iphone_count != undefined) {
            ret.push(data[i].old_iphone_count);
            sum = sum + parseInt(data[i].old_iphone_count);
          }
          if(data[i].new_iphone_count != undefined) {
            ret.push(data[i].new_iphone_count);
            sum = sum + parseInt(data[i].new_iphone_count);
          }
          if(data[i].sn_iphone_count != undefined) {
            ret.push(data[i].sn_iphone_count);
            sum = sum + parseInt(data[i].sn_iphone_count);
          }
          if(data[i].old_android_count != undefined) {
            ret.push(data[i].old_android_count);
            sum = sum + parseInt(data[i].old_android_count);
          }
          if(data[i].new_android_count != undefined) {
            ret.push(data[i].new_android_count);
            sum = sum + parseInt(data[i].new_android_count);
          }
          if(data[i].sn_android_count != undefined) {
            ret.push(data[i].sn_android_count);
            sum = sum + parseInt(data[i].sn_android_count);
          }
      } else if(kbn == '3') {
          if(data[i].garake_count != undefined) {
          ret.push(data[i].garake_count);
          sum = sum + parseInt(data[i].garake_count);
          }
          if(data[i].pc_count != undefined) {
          ret.push(data[i].pc_count);
          sum = sum + parseInt(data[i].pc_count);
          }
          if(data[i].sp_count != undefined) {
          ret.push(data[i].sp_count);
          sum = sum + parseInt(data[i].sp_count);
          }
      } else {
          if(data[i].order_count != undefined) {
          ret.push(data[i].order_count);
          sum = sum + parseInt(data[i].order_count);
          }
      }
      if(totalFlag == true) {
          ret.push(sum);
      }
    }
    return ret;
}

var golbal_labels = new Array();
var golbal_chartDatas = new Array();
var golbal_chartDatas2 = new Array();
function createLineChart(chartId, kbn, trade_date, change='') {

    $("#ios_version").css("display", "none");
    $("#iphone_version").css("display", "none");
    $("#android_version").css("display", "none");

    var device_order_url= document.getElementById('device_kbn_client').checked ? "api/device_client/" : "api/device_order/";
    var search_range = $("#channel_search_range").val().replace(/\//g, '').replace(/\s/g, '').split("-");
    var datefrom = search_range[0];
    var dateto = search_range[1];

    device_order_url = device_order_url + datefrom + "/" + dateto;
    var chartIdArr = ['device_order_month', 'new_old_app_month', 'means_month'];

    if(change == '') {
      golbal_labels = new Array();
      golbal_chartDatas = new Array();
      golbal_chartDatas2 = new Array();
      createChart(device_order_url, chartId, kbn);
    } else {
      setDisp(chartId)
      createChart('', chartId, kbn);
    }
}

function createChart(device_order_url, chartId, kbn) {
  var chartIdArr = ['device_order_month', 'new_old_app_month', 'means_month'];
  if(device_order_url != '' && chartId != '') {
    axios.post(device_order_url, {
      headers: {"X-CSRFToken": csrfToken},
      data: {}
    }).then(response => {
      var chartData = createLineCommonData(kbn, response.data);
      completeChart(chartId, chartData[0], chartData[1]);
    })
    .catch(err => {
      show_message_in('#device_view_body', err);
    });
  } else if(device_order_url != '' && chartId == '') {
    axios.post(device_order_url, {
      headers: {"X-CSRFToken": csrfToken},
      data: {}
    }).then(response => {
      var chartData = createLineCommonData('1', response.data);
      completeChart(chartIdArr[0], chartData[0], chartData[1]);
    })
    .catch(err => {
      show_message_in('#device_view_body', err);
    });
    axios.post(device_order_url, {
      headers: {"X-CSRFToken": csrfToken},
      data: {}
    }).then(response => {
      var chartData = createLineCommonData('2', response.data);
      completeChart(chartIdArr[1], chartData[0], chartData[1]);
    })
    .catch(err => {
      show_message_in('#device_view_body', err);
    });
    axios.post(device_order_url, {
      headers: {"X-CSRFToken": csrfToken},
      data: {}
    }).then(response => {
      var chartData = createLineCommonData('3', response.data);
      completeChart(chartIdArr[2], chartData[0], chartData[1]);
    })
    .catch(err => {
      show_message_in('#device_view_body', err);
    });
  } else {
    var select_option = $("#" + chartId + "_select").val();
    var golbal_chartDatas_clone = obj2array($.extend(true, {}, golbal_chartDatas));
    var golbal_chartDatas2_clone = obj2array($.extend(true, {}, golbal_chartDatas2));
    var updateed_data1;
    var updateed_data2;
    if(chartId === 'device_order_month') {

      for(var j = 0; j < golbal_chartDatas_clone.length; j++) {
        var temp_golbal_chartDatas = golbal_chartDatas_clone[j];
        if(temp_golbal_chartDatas.datasets.length == 5) {
          for(var k = 0; k < temp_golbal_chartDatas.datasets.length; k++) {
            if(select_option != "" && temp_golbal_chartDatas.datasets[k].label != select_option && temp_golbal_chartDatas.datasets[k].label != "合計") {
              temp_golbal_chartDatas.datasets.splice(k, 1);
              k--;
            }
          }
          updateed_data1 = golbal_chartDatas_clone[j];
          break;
        }
      }

      for(var j = 0; j < golbal_chartDatas2_clone.length; j++) {
        var temp_golbal_chartDatas = golbal_chartDatas2_clone[j];
        if(temp_golbal_chartDatas.datasets.length == 4) {
          for(var k = 0; k < temp_golbal_chartDatas.datasets.length; k++) {
            if(select_option != "" && temp_golbal_chartDatas.datasets[k].label != select_option && temp_golbal_chartDatas.datasets[k].label != "合計") {
              temp_golbal_chartDatas.datasets.splice(k, 1);
              k--;
            }
          }
          updateed_data2 = golbal_chartDatas2_clone[j];
          break;
        }
      }

      completeChart(chartId, updateed_data1, updateed_data2);
    } else if(chartId === 'new_old_app_month') {

      for(var j = 0; j < golbal_chartDatas_clone.length; j++) {
        var temp_golbal_chartDatas = golbal_chartDatas_clone[j];
        if(temp_golbal_chartDatas.datasets.length == 7) {
          for(var k = 0; k < temp_golbal_chartDatas.datasets.length; k++) {
            if(select_option != "" && temp_golbal_chartDatas.datasets[k].label != select_option && temp_golbal_chartDatas.datasets[k].label != "合計") {
              temp_golbal_chartDatas.datasets.splice(k, 1);
              k--;
            }
          }
          updateed_data1 = golbal_chartDatas_clone[j];
          break;
        }
      }

      for(var j = 0; j < golbal_chartDatas2_clone.length; j++) {
        var temp_golbal_chartDatas = golbal_chartDatas2_clone[j];
        if(temp_golbal_chartDatas.datasets.length == 6) {
          for(var k = 0; k < temp_golbal_chartDatas.datasets.length; k++) {
            if(select_option != "" && temp_golbal_chartDatas.datasets[k].label != select_option && temp_golbal_chartDatas.datasets[k].label != "合計") {
              temp_golbal_chartDatas.datasets.splice(k, 1);
              k--;
            }
          }
          updateed_data2 = golbal_chartDatas2_clone[j];
          break;
        }
      }
      completeChart(chartId, updateed_data1, updateed_data2);
    } else {

      for(var j = 0; j < golbal_chartDatas_clone.length; j++) {
        var temp_golbal_chartDatas = golbal_chartDatas_clone[j];
        if(temp_golbal_chartDatas.datasets.length == 4) {
          for(var k = 0; k < temp_golbal_chartDatas.datasets.length; k++) {
            if(select_option != "" && temp_golbal_chartDatas.datasets[k].label != select_option && temp_golbal_chartDatas.datasets[k].label != "合計") {
              temp_golbal_chartDatas.datasets.splice(k, 1);
              k--;
            }
          }
          updateed_data1 = golbal_chartDatas_clone[j];
          break;
        }
      }

      for(var j = 0; j < golbal_chartDatas2_clone.length; j++) {
        var temp_golbal_chartDatas = golbal_chartDatas2_clone[j];
        if(temp_golbal_chartDatas.datasets.length == 3) {
          for(var k = 0; k < temp_golbal_chartDatas.datasets.length; k++) {
            if(select_option != "" && temp_golbal_chartDatas.datasets[k].label != select_option && temp_golbal_chartDatas.datasets[k].label != "合計") {
              temp_golbal_chartDatas.datasets.splice(k, 1);
              k--;
            }
          }
          updateed_data2 = golbal_chartDatas2_clone[j];
          break;
        }
      }

      completeChart(chartId, updateed_data1, updateed_data2);
    }
  }
}
function obj2array(obj) {
  var arr = [];
  for(i in obj){
    arr.push(obj[i]);
  }
  return arr;
}

function createLineCommonData(kbn, data, select_option="") {
  $("#device_month_title").html("過去一ヶ月間の注文件数");
  var color = new Array();
  if(kbn == '1') {
      color.push("#b3e5fc");
      color.push("#29b6f6");
      color.push("#01579b");
      color.push("#f06292");
  } else if(kbn == '2') {
      color.push("#f8bbd0");
      color.push("#f06292");
      color.push("#d81b60");
      color.push("#b3e5fc");
      color.push("#29b6f6");
      color.push("#01579b");
  } else {
      color.push("#d81b60");
      color.push("#29b6f6");
      color.push("#f06292");
      color.push("#945bea");
  }
  golbal_labels = createDeviceOrderLabels(data, kbn, true, select_option);
  var chartDatas = createDeviceOrderLineChartData(golbal_labels, data, color, kbn, select_option);
  golbal_chartDatas.push(chartDatas);
  var chartDatas2 = createDeviceOrderLineChartData(golbal_labels, data, color, kbn, 1, select_option);
  golbal_chartDatas2.push(chartDatas2);

  return [chartDatas, chartDatas2]
}

function completeChart(chartId, chartDatas, chartDatas2) {

  var ctx = $("#" + chartId);
  var ctx_percent = $("#" + chartId + "_percent");
  var option = {
      responsive: true,
      maintainAspectRatio: false,
      tooltips:{
        mode:'index',
        intersect:true
      },
      plugins: {
        labels: {
            render: 'value'
        }
      },
      legend: {
        labels: {
          boxWidth: 15
        }
      }
  };

  var options2 ={
    responsive: true,
    maintainAspectRatio: false,
    legend: {
      labels: {
        boxWidth: 15
      }
    },
    tooltips: {
      mode: 'index',
      intersect: true,
      itemSort: function(a, b) { return b.datasetIndex - a.datasetIndex }
    },
    scales: {
      xAxes: [{
        stacked: true,
        maxBarThickness: 60
      }],
      yAxes: [{
        ticks: {
          // Include a percentage sign in the ticks
          callback: function(value, index, values) {
            return value + "%";
          }
        },
        stacked: true
      }]
    }
  };

  if ( _charts_[chartId] ) {
    _charts_[chartId].destroy();
  }

  if(chartId == 'device_order_month') {
    if(chartDatas.datasets.length == 1) {
      $('#' + chartId + '_message').html("<h1>データなし</h1>");
    } else {
      $('#' + chartId + '_container').css("display", "block");
      $('#' + chartId + '_message').css("display", "none");
      if(chart_device_order_month) {
        chart_device_order_month.destroy();
      }
      chart_device_order_month = new Chart(ctx, {
        type: 'bar',
        data: chartDatas,
        options: option
      });
      _charts_[chartId] = chart_device_order_month
    }

    if(chartDatas2.datasets.length == 0) {
      $('#' + chartId + '_percent_message').html("<h1>データなし</h1>");
    } else {
      $('#' + chartId + '_percent_container').css("display", "block");
      $('#' + chartId + '_percent_message').css("display", "none");
      if(chart_device_order_percent) {
        chart_device_order_percent.destroy();
      }
      chart_device_order_percent = new Chart(ctx_percent, {
        type: 'bar',
        data: chartDatas2,
        options: options2
      });
      _charts_[chartId] = chart_device_order_percent
    }

  } else if(chartId == 'new_old_app_month') {
    if(chartDatas.datasets.length == 1) {
      $('#' + chartId + '_message').html("<h1>データなし</h1>");
    } else {
      $('#' + chartId + '_container').css("display", "block");
      $('#' + chartId + '_message').css("display", "none");
      if(chart_new_old_app_month) {
        chart_new_old_app_month.destroy();
      }
      chart_new_old_app_month = new Chart(ctx, {
        type: 'bar',
        data: chartDatas,
        options: option
      });
      _charts_[chartId] = chart_new_old_app_month
    }

    if(chartDatas2.datasets.length == 0) {
      $('#' + chartId + '_percent_message').html("<h1>データなし</h1>");
    } else {
      $('#' + chartId + '_percent_container').css("display", "block");
      $('#' + chartId + '_percent_message').css("display", "none");
      if(chart_new_old_app_percent) {
        chart_new_old_app_percent.destroy();
      }
      chart_new_old_app_percent = new Chart(ctx_percent, {
        type: 'bar',
        data: chartDatas2,
        options: options2
      });
      _charts_[chartId] = chart_new_old_app_percent
    }
  } else {
    if(chartDatas.datasets.length == 1) {
      $('#' + chartId + '_message').html("<h1>データなし</h1>");
    } else {
      $('#' + chartId + '_container').css("display", "block");
      $('#' + chartId + '_message').css("display", "none");
      if(chart_menas_order_ymd) {
        chart_menas_order_ymd.destroy();
      }
      chart_menas_order_ymd = new Chart(ctx, {
        type: 'bar',
        data: chartDatas,
        options: option
      });
      _charts_[chartId] = chart_menas_order_ymd
    }

    if(chartDatas2.datasets.length <= 0) {
      $('#' + chartId + '_percent_message').html("<h1>データなし</h1>");
    } else {
      $('#' + chartId + '_percent_container').css("display", "block");
      $('#' + chartId + '_percent_message').css("display", "none");
      if(chart_means_percent) {
        chart_means_percent.destroy();
      }
      chart_means_percent = new Chart(ctx_percent, {
        type: 'bar',
        data: chartDatas2,
        options: options2
      });
      _charts_[chartId] = chart_means_percent
    }
  }
}
function setDisp(chartId) {
  $('#' + chartId + '_message').css("display", "block");
  $('#' + chartId + '_message').html("<h1>Loading...</h1>");
  $('#' + chartId + '_container').css("display", "none");
  $('#' + chartId + '_percent_message').css("display", "block");
  $('#' + chartId + '_percent_message').html("<h1>Loading...</h1>");
  $('#' + chartId + '_percent_container').css("display", "none");
}

function show_message_in(ref_id, message) {
  if (typeof(message) === 'object') {
    message = message.toString()
  }
  if( message && message !== '') {
    if( message.indexOf('Loading') == 0) {
        $(ref_id).html("<h1 class='text-info'>{0}</h1>".format(message))
    } else {
        $(ref_id).html("<p class='error-message'>{0}</p>".format(message))
    }
  } else {
    $(ref_id).html('');
  }
}

function diff_months ( start, end ) {
  var y_start = parseInt(start.substring(0,4), 10);
  var m_start = parseInt(start.substring(4,6), 10);
  var y_end = parseInt(end.substring(0,4), 10);
  var m_end = parseInt(end.substring(4,6), 10);
  return (y_end -y_start) * 12 + m_end - m_start + 1;
}

function get_start_end_day(end_date, past_days) {
    var d = end_date.parse_date();
    end   = d.format_as_yyyymmdd();
    start = d.get_past_date(past_days-1).format_as_yyyymmdd();
    return [start, end];
}

function csv_export_channel(kbn) {
  var device_kbn = $("input[name='device_kbn']:checked").val();
  var zip = new JSZip();

  var copy_text = []
  for(var m = 0; m < golbal_chartDatas.length; m++) {
      var temp_global_data = golbal_chartDatas[m];
      var fileName = "";
      if(temp_global_data.datasets.length == 5) {
        fileName = "経路別";
      }
      if(temp_global_data.datasets.length == 7) {
        fileName = "新旧アプリ別Android・iPhone別";
      }
      if(temp_global_data.datasets.length == 4) {
        fileName = "ディバイス別";
      }

      copy_text.push(fileName)
      copy_text.push("\r\n")

      var csv = "-";
      for(var k = 0; k < temp_global_data.labels.length; k++) {
        csv = csv + "," + temp_global_data.labels[k];
      }
      csv += "\n";

      for(var l = 0; l < temp_global_data.datasets.length; l++) {
        var temp_data = temp_global_data.datasets[l];
        csv += (temp_data.label + ",") + temp_data.data.join(",");
        csv += "\n";
      }

      copy_text.push(csv)
      csv = "\ufeff" + csv;

      copy_text.push("\r\n")

      if( kbn === 'csv') {
         zip.file(fileName + ".csv", csv);
      }
  }

  copy_text.push('不明デバイス')
  copy_text.push("\r\n")

  var uk_csv = []
  var uk_table = $('#other_month').DataTable()
  var columns = uk_table.settings().init().columns;
  uk_table.columns().every(function(index) {
    if ( index !== 0 ) {
      copy_text.push(",")
      uk_csv.push(",")
    }
    var title = columns[index].title.replace("\r", '').replace("\n", '')
    copy_text.push(title)
    uk_csv.push(title)
  })
  copy_text.push("\r\n")
  uk_csv.push("\n")

  var uk_datas = uk_table.rows().data()
  for( var i=0; i<uk_datas.length; ++i ) {
      var data = uk_datas[i]
      uk_table.columns().every(function(index) {
        if ( index !== 0 ) {
          copy_text.push(",")
          uk_csv.push(",")
        }
        copy_text.push(data[columns[index].data])
        uk_csv.push(data[columns[index].data])
      })
      copy_text.push("\r\n")
      uk_csv.push("\n")
  }

  if( kbn === 'csv') {
    zip.file("不明デバイス.csv", uk_csv.join(''));
  }

  if ( kbn === 'copy' ) {
     copy_to_clipboard(copy_text.join(''))
  } else {
      var search_date = $("#channel_search_range").val().replace(/\//g,'');
      var fileName = "";
      if(device_kbn == 'order') {
        fileName = "チャンネル別_注文件数";
      } else {
        fileName = "チャンネル別_口座数";
      }
      zip.generateAsync({
        type: "blob"
      }).then(function(content) {
        saveAs(content, fileName + "(" + search_date + ").zip");
      });
  }
}

function createOtherTableChart(trade_date) {
    // チャンネルURL
    var url = document.getElementById('device_kbn_client').checked ? "api/unknow_client/" : "api/unknow_order/";
    var d = trade_date.parse_date()
    datefrom = d.get_past_date(31).format_as_yyyymmdd()
    dateto   = d.format_as_yyyymmdd()
    url = url + datefrom + "/" + dateto;
    // グラフデータ取得
    axios.post(url, {
    headers: {"X-CSRFToken": csrfToken},
    data: {}
    }).then(response => {
    legend = '';
    var datas = response.data;

    clear_datatables('#other_month')
    if( !datas || datas.length === 0 ) {
      show_message_in('#other_month', 'データなし')
      return
    }

    RpaDataTable.create_simple_paging_table('#other_month', {
                data: datas,
                pageLength: 20,
                scrollX:true,
                sScrollX:400,
                columns: [
                    {
                        "title":"日\r\n付",
                        "data": "ymd",
                        "render": function(data, type, row, meta){
                            return row.ymd.format_as_mmdd_with_slash();
                        }
                    },
                    {
                        "title":"meta\r\ntrader",
                        "data": "device0",
                        "render": function(data, type, row, meta){
                          if(row.device0 == undefined) {
                              return "-";
                          } else {
                              data = '<a href="javascript:void(0);" onclick="dispOrderList(\'' + row.ymd + '\', 0); return false;">' + row.device0 + '</a>';
                              return data;
                          }
                        }
                    },
                    {
                        "title":"curl",
                        "data": "device1",
                        "render": function(data, type, row, meta){
                          if(row.device1 == undefined) {
                              return "-";
                          } else {
                              data = '<a href="javascript:void(0);" onclick="dispOrderList(\'' + row.ymd + '\', 1); return false;">' + row.device1 + '</a>';
                              return data;
                          }
                        }
                    },
                    {
                        "title":"dalvik",
                        "data": "device2",
                        "render": function(data, type, row, meta){
                          if(row.device2 == undefined) {
                              return "-";
                          } else {
                              data = '<a href="javascript:void(0);" onclick="dispOrderList(\'' + row.ymd + '\', 2); return false;">' + row.device2 + '</a>';
                              return data;
                          }
                        }
                    },
                    {
                        "title":"java",
                        "data": "device3",
                        "render": function(data, type, row, meta){
                          if(row.device3 == undefined) {
                              return "-";
                          } else {
                              data = '<a href="javascript:void(0);" onclick="dispOrderList(\'' + row.ymd + '\', 3); return false;">' + row.device3 + '</a>';
                              return data;
                          }
                        }
                    },
                    {
                        "title":"python",
                        "data": "device4",
                        "render": function(data, type, row, meta){
                          if(row.device4 == undefined) {
                              return "-";
                          } else {
                              data = '<a href="javascript:void(0);" onclick="dispOrderList(\'' + row.ymd + '\', 4); return false;">' + row.device4 + '</a>';
                              return data;
                          }
                        }
                    }
                ],
                columnDefs:[
                    {"targets":1, "className": "numcol text-right"},
                    {"targets":2, "className": "numcol text-right"},
                    {"targets":3, "className": "numcol text-right"},
                    {"targets":4, "className": "numcol text-right"},
                    {"targets":5, "className": "numcol text-right"}
                ]
            });
    })
    .catch(err => {
      show_message_in('#device_view_body', err);
    });
}

function show_ccy_detail(ccy_pair_id) {
  var newWin = window.open_sub_window("calc/detail?kbn=ccy&ccy_pair_id=" + ccy_pair_id + "&client_id=", "_blank");
}

function dispProfile(client_id) {
  client_id = client_id.replace('◇', '')
  var newWin = window.open_sub_window("user/{0}".format(client_id), "_blank");
}

function init_events() {

      var horizonalLinePlugin = {
        afterDraw: function (chartInstance) {
            var yScale = chartInstance.scales["y-axis-0"];
            var canvas = chartInstance.chart;
            var ctx = canvas.ctx;
            var chartArea = chartInstance.chartArea
            var index;
            var line;
            var style;

            if (chartInstance.options.horizontalLine) {
                ctx.save();
                for (index = 0; index < chartInstance.options.horizontalLine.length; index++) {
                    line = chartInstance.options.horizontalLine[index];

                    if (!line.style) {
                        style = "rgba(169,169,169, .6)";
                    } else {
                        style = line.style;
                    }

                    if (line.y) {
                        yValue = yScale.getPixelForValue(line.y);
                    } else {
                        yValue = 0;
                    }

                    ctx.lineWidth = 1;

                    if (yValue) {
                        ctx.beginPath();
                        ctx.moveTo(chartArea.left, yValue);
                        ctx.lineTo(chartArea.right, yValue);
                        ctx.setLineDash([5, 3]);
                        ctx.strokeStyle = style;
                        ctx.stroke();
                    }

                    if (line.text) {
                        ctx.fillStyle = style;
                        ctx.textAlign = "left";
                        ctx.textBaseline = "middle";
                        ctx.font = "18px 'ＭＳ ゴシック'";
                        ctx.fillText(line.text, chartArea.right + 5, yValue + ctx.lineWidth);
                    }
                }
                ctx.restore();
                return;
            };
        }
    };
    Chart.pluginService.register(horizonalLinePlugin);

    //------------------------------------
    // full-screen
    //------------------------------------
    $(document).keyup(function(e) {
        if (e.key === "Escape") {
          view = $('#v_container').find('.panel-fullscreen')
          if( view.length ) {
            view.find('.toggle-expand-btn').click()
          }
        }
    });
    $(".toggle-expand-btn").click(function (e) {
        var view = $(this).closest('.view-item')
        var fullscreen =  view.hasClass('panel-fullscreen')

        var collapsed = view.hasClass('collapsed-box')
        if ( collapsed ) {
          view.find('*[data-widget="collapse"]')[0].click()
        }

        if (!fullscreen) {
            // enter fullscreen
            $('html, body').css({
                overflow: 'hidden',
                height: '100%'
            });
            $(view).find('.btn-box-tool').each(function(index, button){
              if( !$(button).hasClass('toggle-expand-btn') ) {
                $(button).hide()
              } else {
                $(button).attr('title', '全画面表示終了')
              }
            })
            $(view).find('.box-tip').html('全画面表示の解除は<B>「Esc」</B>キーを押下してください。')
            $(view).find('.box-tip').show()
        } else {
            // exit fullscreen
            $('html, body').css({
                overflow: 'auto',
                height: 'auto'
            });
            $(view).find('.btn-box-tool').each(function(index, button){
              if( !$(button).hasClass('toggle-expand-btn') ) {
                $(button).show()
              }else {
                $(button).attr('title', '全画面表示')
              }
            })
            $(view).find('.box-tip').hide()
        }

        view.toggleClass('panel-fullscreen')

        _views_[view.attr('id')].create({
          'event' : 'redraw'
        })

        scroll_to_view(view.attr('id'))
    })

    if( document.getElementById("new_old_app") ) {
        document.getElementById("new_old_app").onclick = function(evt) {
            var activePoints = chart_new_old_app.getElementsAtEvent(evt);
            var firstPoint = activePoints[0];
            if ( !firstPoint ) return;
            var label = chart_new_old_app.data.labels[firstPoint._index];
            var value = chart_new_old_app.data.datasets[firstPoint._datasetIndex].data[firstPoint._index];
            if (firstPoint !== undefined) {
                chart_new_old_app.destroy();
                $("#new_old_app").css("display", "none");
                if(label == '新iPhone' || label == '旧iPhone' || label == 'SN-iPhone') {
                    $("#iphone_version").css("display", "block");
                    $("#ios_version").css("display", "none");
                    createPieChart('iphone_version', '4');
                } else {
                    $("#android_version").css("display", "block");
                    createPieChart('android_version', '6', 'android');
                }
            }
        };
    }

    if( document.getElementById("iphone_version") ) {
        document.getElementById("iphone_version").onclick = function(evt) {
            var helpers = Chart.helpers;
            var eventPosition = helpers.getRelativePosition(evt, chart_iphone_version.chart);
            var mouseX = eventPosition.x;
            var mouseY = eventPosition.y;
            var activePoints = [];

            var  events_points =  chart_iphone_version.getElementsAtEvent(evt);
            if( events_points && events_points.length > 0 ) {
              var label = chart_iphone_version.data.labels[events_points[0]._index];
              chart_iphone_version.destroy();
              $("#new_old_app").css("display", "none");
              $("#iphone_version").css("display", "none");
              $("#ios_version").css("display", "block");
              createPieChart('ios_version', '5', label);
              return;
            }
            // loop through all the labels
            helpers.each(chart_iphone_version.scales['y-axis-0'].ticks, function (label, idx) {
              var top = chart_iphone_version.scales['y-axis-0'].top;
              var right = chart_iphone_version.scales['y-axis-0'].right;
              var height = chart_iphone_version.scales['y-axis-0'].height;
              var labelHeight = height / chart_iphone_version.scales['y-axis-0'].ticks.length;
              var x = 3;
              var y = top;
              var offsetheightstart = y + idx * labelHeight;
              var offsetheightend = y + (idx + 1) * labelHeight;
              // check if the click was within the bounding box
              if ((mouseY >= offsetheightstart && mouseY <= offsetheightend) && (mouseX >= x && mouseX <= right)) {
                activePoints.push({ index: idx, label: chart_iphone_version.scales['y-axis-0'].ticks[idx] });
                return;
              }
            }, chart_iphone_version.scale);

            //ラベルをクリックすると、IOSバージョン情報を表示する。
            var firstPoint = activePoints[0];
            if (firstPoint !== undefined ) {
                chart_iphone_version.destroy();
                $("#new_old_app").css("display", "none");
                $("#iphone_version").css("display", "none");
                $("#ios_version").css("display", "block");
                if( firstPoint.label ) {
                  createPieChart('ios_version', '5', firstPoint.label);
                }
                return;
            }

            // 空白をクリックすると、新旧システム別に戻る。
            var activePoints_iphone = chart_iphone_version.getElementsAtEvent(evt);
            if(activePoints_iphone.length == 0) {
              chart_iphone_version.destroy();
              $("#new_old_app").css("display", "block");
              $("#iphone_version").css("display", "none");
              createPieChart('new_old_app', '2');
            }
        };
    }

    if( document.getElementById("android_version") ) {
        document.getElementById("android_version").onclick = function(evt) {
          // 空白をクリックすると、新旧システム別に戻る。
          // var activePoints_android = chart_android_version.getElementsAtEvent(evt);
          // if(activePoints_android.length == 0) {
            chart_android_version.destroy();
            $("#new_old_app").css("display", "block");
            $("#android_version").css("display", "none");
            createPieChart('new_old_app', '2');
          // }
        };
    }

    if( document.getElementById("ios_version") ) {
        document.getElementById("ios_version").onclick = function(evt) {
          var activePoints = chart_ios_version.getElementsAtEvent(evt);
          if(activePoints.length == 0) {
            chart_ios_version.destroy();
            $("#ios_version").css("display", "none");
            $("#iphone_version").css("display", "block");
            createPieChart('iphone_version', '4');
            return;
          }
        };
    }

    if ( document.getElementById("max_position_ccy") ) {
          document.getElementById("max_position_ccy").onclick = function(evt) {
              var helpers = Chart.helpers;
              var eventPosition = helpers.getRelativePosition(evt, _charts_['max_position_ccy'].chart);
              var mouseX = eventPosition.x;
              var mouseY = eventPosition.y;
              var activePoints = [];

              var  events_points =  _charts_['max_position_ccy'].getElementsAtEvent(evt);
              if( events_points && events_points.length > 0 ) {
                var client_id = _charts_['max_position_ccy'].data.labels[events_points[0]._index];
                dispProfile(client_id, null);
                return;
              }

              // loop through all the labels
              helpers.each(_charts_['max_position_ccy'].scales['y-axis-0'].ticks, function (label, idx) {
              var top = _charts_['max_position_ccy'].scales['y-axis-0'].top;
              var height = _charts_['max_position_ccy'].scales['y-axis-0'].height;
              var labelHeight = height / _charts_['max_position_ccy'].scales['y-axis-0'].ticks.length;
              var y = top;
              var offsetheightstart = y + idx * labelHeight;
              var offsetheightend = y + (idx + 1) * labelHeight;
              // check if the click was within the bounding box
              if ((mouseY >= offsetheightstart && mouseY <= offsetheightend) && (mouseX >= 8 && mouseX <= 71)) {
                  activePoints.push({ index: idx, label: _charts_['max_position_ccy'].scales['y-axis-0'].ticks[idx] });
                  return;
              }
              }, _charts_['max_position_ccy'].scale);

              var firstPoint = activePoints[0];
              if(firstPoint) {
                var client_id = firstPoint.label;
                dispProfile(client_id, null);
              }
        };
    }

}

function fetch_system_status(onload, callback) {
  // システム稼働状況取得
  get_api("api/job/status/calc").get(datas => {
      if(datas && datas.length > 0) {
          data_dates = createSystemStatusInfo(datas, onload);

          var max_search_month = getBeforeMonth($("#done_date").val());
          var max_search_day = $("#deposit_date").val();
          var max_position_search = $("#position_date").val();
          document.getElementById("search_month").setAttribute("max", max_search_month);
          document.getElementById("search_day").setAttribute("max", max_search_day);
          document.getElementById("max_position_ccy_search").setAttribute("max", max_position_search);

          if( callback ) callback(data_dates)

          return;
      }
  });
}

function createSystemStatusInfo(datas, onload) {

  var latest = {}

  var menu_color = 'green';
  var status = 0;
  var statuslistHtml = '';
  var newData = new Array();
  for(var i = 0; i < datas.length; i++) {
    var flag = false;
    for(var j = i+1; j < datas.length; j++) {
      if(datas[i]['func'] == datas[j]['func'] && datas[i]['data_date'] == datas[j]['data_date']) {
        if(datas[i]['update_dt'] > datas[j]['update_dt']) {
          // if(datas[j]['status'] > datas[i]['status']) {
          //   status = datas[j]['status'] ;
          // } else {
          //   status = datas[i]['status'] ;
          // }
          status = datas[i]['status'];
        } else {
          status = datas[j]['status'];
        }
        flag = true;
        break;
      }
    }
    if(flag == true) {
      datas[i]['status'] = status;
    }

    var addFlag = true;
    for(var k = 0; k < newData.length; k++) {
      if(newData[k]['func'] == datas[i]['func']) {
        addFlag = false;
        break;
      }
    }
    if(addFlag == true) {
      newData.push(datas[i]);
    }
  }
  var statusMsg = '';
  var classstatus = 'text-green';
  var processMessageFlag = false;
  var errorMessageFlag = false;
  for(var i = 0; i < newData.length; i++) {
    var textColor = '';
    var icon = '';
    var func = '';
    if(newData[i]['func'] == 'device') {
      func = 'チャンネル';
    } else if(newData[i]['func'] == 'deposit') {
      func = '預かり';
    } else if(newData[i]['func'] == 'done') {
      func = '代金';
    } else if(newData[i]['func'] == 'payment') {
      func = '入出金';
    } else if(newData[i]['func'] == 'position') {
      func = 'ポジション';
    } else if(newData[i]['func'] == 'kessai') {
      func = '決済';
    } else if(newData[i]['func'] == 'orderticket') {
      func = '注文口座数';
    } else if(newData[i]['func'] == 'depositstatus') {
      func = '口座開設日';
    } else if(newData[i]['func'] == 'donebb') {
      func = '売買状況カウント';
    } else {
      func = newData[i]['func'];
    }
    if(newData[i]['status'] == '0') {
      textColor = 'green';
      icon = 'check';
      //$("#heardermsg").removeClass('text-yellow');
      //$("#heardermsg").removeClass('text-red');
    } else if(newData[i]['status'] == '1') {
      if ( menu_color !== 'red' ) {
        menu_color = '#f39c12';
      }
      textColor = 'yellow';
      icon = 'hourglass';
      classstatus = 'text-yellow';
      //$("#heardermsg").removeClass('text-green');
      //$("#heardermsg").removeClass('text-red');
      processMessageFlag = true;
    } else {
      menu_color = 'red';
      textColor = 'red';
      icon = 'warning';
      classstatus = 'text-red';
      //$("#heardermsg").removeClass('text-green');
      //$("#heardermsg").removeClass('text- ');
      errorMessageFlag = true;
    }
    statuslistHtml = statuslistHtml + '<li><a href="#"><i class="fa fa-' + icon + ' text-' + textColor + '"></i>&nbsp;&nbsp;' + newData[i]['data_date'].format_as_yyyymmdd_with_slash() + "、" + func + '</a></li>';
    $("#" + newData[i]['func'] + "_date").val(newData[i]['data_date'].format_as_yyyymmdd_with_hyphen());

    latest[newData[i]['func']] = newData[i]['data_date'].format_as_yyyymm_with_slash().replace('/', '')

    if(errorMessageFlag == true) {
      statusMsg = 'データ取り込み失敗';
    } else if(processMessageFlag == true) {
      statusMsg = 'データ取り込み中';

    } else {
      statusMsg = '正常稼働中';
    }
  }

  $('#system_status_menu').html(statusMsg);
  $('#system_status_menu').css('background-color', menu_color);

  $("#statuslist").html(statuslistHtml);
  //$("#heardermsg").addClass(classstatus);
  //$("#heardermsg").html(statusMsg);

  if ( onload === true ) {
      if ( statusMsg === 'データ取り込み失敗' ) {
        $('#modal-danger-body').html("<p style='color:black'>{0}<p>{1}".format(statusMsg,statuslistHtml));
        $('#modal-danger').modal();
      } else if ( statusMsg === 'データ取り込み中' ) {
        $('#modal-warning-body').html("<p style='color:black'>{0}<p>{1}".format(statusMsg,statuslistHtml));
        $('#modal-warning').modal();
      }
  }

  return latest
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


function get_export_buttons(export_filename, format_data) {
  buttons_templates =  [
      {
          extend: 'copyHtml5',
          title:'',
          header:true,
          exportOptions: { orthogonal: 'export' }
      },
      {
        extend: 'csvHtml5',
        charset: 'UTF-8',
        bom:true,
        fieldBoundary: '"',
        title: export_filename || 'dashboard',
        extension: '.csv',
        exportOptions: { orthogonal: 'export' }
      }
  ]

  if (!format_data) {
    return buttons_templates
  } else {
      var buttons = []
      buttons_templates.forEach( template => {
          buttons[buttons.length] =
              $.extend( true, {}, template, {
                    exportOptions: {
                      format: {
                          body: function ( data, row, column, node ) {
                              return format_data(data, row, column, node)
                          }
                      }
                    }
              })
          }
      )
      return buttons
  }
}

function init_export_buttons_event(table_id) {
  var $buttons = $(table_id + '_wrapper .dt-buttons').hide();
  $(table_id + '_export_csv').off('click').on('click', function() {
    $(table_id + '_wrapper .buttons-csv').click();
  });
  $(table_id + '_export_copy').off('click').on('click', function() {
    $(table_id + '_wrapper .buttons-copy').click();
  });
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

function dispOrderList(ymd, device) {
  window.open_sub_window('order/list?ymd=' + ymd + "&device=" + device, '注文一覧')
}
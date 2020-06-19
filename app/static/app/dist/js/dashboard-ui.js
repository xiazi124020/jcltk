var DashboardUI = (function() {

    function clientid_wrap_autocomplete(id, options) {

        ui_options = {
            clear_button:true,
            save_on_search:true,
            show_top_rows:50,
            save_max_rows:1000
        }
        ui_options = Object.assign(ui_options, options);

        ref_id = "#" + ( id || "client_id")
        $(ref_id).autocomplete({
            source: function(request, response) {
                var terms = request.term.split(/[\s\n,]/g)
                terms = terms.filter(function (el) {
                    return el != null && el != '';
                });
                if ( terms.length == 0 ) {
                    return null
                }
                var last_term = terms[terms.length - 1]
                var histories = localStorage.getItem("client_id_history")
                if(histories == null) {
                    histories = new Array();
                } else {
                    histories = histories.split(/[\s\n,]/g)
                }
                var filtered = $.map(histories, function(item) {
                    if ( item.indexOf(last_term) == 0 ) {
                        return item
                    } else {
                        return null
                    }
                })
                response(ui_options.show_top_rows > 0 ? filtered.slice(0, ui_options.show_top_rows) : filtered)
            },
            select: function( event, ui ) {
                var terms = this.value.split(/[\s\n,]/g)
                // remove the current input
                terms.pop();
                // add the selected item
                terms.push( ui.item.value );
                // add placeholder to get the comma-and-space at the end
                terms.push( "" );
                this.value = terms.join( "\n" )
                return false;
            },
            focus: function() {
                // prevent value inserted on focus
                return false;
            }
        }).autocomplete('option', 'minLength', 1)

        if ( ui_options.clear_button ) {
            $(ref_id).before('<button class="btn bg-maroon btn-sm btn-flat margin" type="button" onclick="DashboardUI. clientid_clear_history()" >履歴クリア <i class="fa fa-trash-o"></i></button>')
        }

        if ( ui_options.save_on_search ) {
            var search_button = $(ref_id).closest('.sidebar-form').find("button:contains('検索')") || $("button:contains('検索')")
            search_button.on('click', function(){
                var client_ids = $(ref_id).val().split(/[\s\n,]/g)
                client_ids = client_ids.filter(function (el) {
                    return el != null && el != '';
                });
                if (client_ids === void 0 || client_ids.length == 0) {
                    return
                }
                DashboardUI. clientid_save_history(client_ids)
            })
        }
    }

    function  clientid_save_history(client_ids) {
        lpad_client_ids(client_ids)
        var client_id_history = localStorage.getItem("client_id_history")
        var ls_client_ids = []
        if (client_id_history != null) {
           ls_client_ids = $.merge(client_ids.reverse(), client_id_history.split(/[\s\n,]/g))
        } else {
            ls_client_ids = client_ids.reverse().slice()
        }
        var arr = new Array();
        for(var i=0; i<ls_client_ids.length; i++){
          if (ui_options.save_max_rows > 0 && arr.length >= ui_options.save_max_rows) break
          if(arr.indexOf(ls_client_ids[i]) == -1){
            arr.push(ls_client_ids[i]);
          }
        }
        localStorage.setItem("client_id_history", arr)
    }

    function  clientid_clear_history() {
        if( confirm('口座番号の入力履歴をクリアしてよろしいですか？') ) {
            localStorage.removeItem("client_id_history")
        }
    }

    function ccypairid_load(ccy_pairs, ids) {
        var options = '<option value="">ALL</option>';
        for (var i = 0; i < ccy_pairs.length; i++) {
            options += '<option value="' + ccy_pairs[i].ccy_pair_id + '">' + ccy_pairs[i].ccy_pair_id + '</option>';
        }

        if( !ids ){
            ids = ["#ccy_pair_id", "#cypair"]
        }

        for( var i=0; i<ids.length; ++i) {
            $(ids[i]).html(options);
            $(ids[i] + " option:first").attr('selected', 'selected');
        }
    }

    function datatable_destroy(table_id) {
        var ref_id = table_id.indexOf('#') === 0 ? table_id : '#' + table_id
        if ( $.fn.DataTable.isDataTable(ref_id) ) {
            $(ref_id).DataTable().destroy()
        }
        $(ref_id).empty()
    }

    function datatable_buttons(has_name_column, options) {

      button_options = {
        'pdf':{
          orientation: 'landscape', /*portrait */
          pageSize: 'A4'/*A4*/,
          exportOptions: {
            columns: ':not(.not-export)'
          },
        }
      }
      if ( options ) {
        button_options = Object.assign(button_options, options)
      }

      if (!window.context.perms.can_print)
        return []

      var buttons =  [
          {
            extend: 'copyHtml5',
            title:'',
            header:true,
            exportOptions: {
                columns: ':not(.not-export)'
            }
          },
          {
            extend: 'csvHtml5',
            charset: 'UTF-8',
            bom:true,
            exportOptions: {
                columns: ':not(.not-export)'
            }
          },
          {
            extend: 'pdfHtml5',
            text: 'PDF',
            orientation: button_options['pdf']['orientation'],
            pageSize: button_options['pdf']['pageSize'],
            customize: function ( doc ) {
              doc.defaultStyle.font= 'GenShin';
            },
            exportOptions:button_options['pdf']['exportOptions'],
          },
          {
            extend: 'print',
            exportOptions: {
                columns: ':not(.not-export)'
            }
          }
      ]
      if ( has_name_column ) {
          buttons.push(
            {
                text: '名前～住所出力',
                className: 'toggle-export',
                action: function ( e, dt, node, config ) {
                    var txt =  $(node).text()
                    if( txt === '名前～住所出力' ) {
                      $(node).text('名前～住所出力なし')
                      $('.toggle-export-column').addClass("not-export");
                    }else {
                      $(node).text('名前～住所出力')
                      $('.toggle-export-column').removeClass("not-export");
                    }
                }
            }
          )
      }
      return buttons
    }

    var _instance = {}
    _instance.clientid_wrap_autocomplete = clientid_wrap_autocomplete
    _instance.clientid_save_history =  clientid_save_history
    _instance.clientid_clear_history =  clientid_clear_history
    _instance.ccypairid_load =  ccypairid_load
    _instance.datatable_destroy = datatable_destroy
    _instance.datatable_buttons =  datatable_buttons

    return _instance
})()

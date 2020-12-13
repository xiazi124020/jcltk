var DashboardUI = (function() {

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
      return buttons
    }

    var _instance = {}
    _instance.datatable_destroy = datatable_destroy
    _instance.datatable_buttons =  datatable_buttons

    return _instance
})()

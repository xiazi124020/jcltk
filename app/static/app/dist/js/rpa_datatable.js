var RpaDataTable =
(function () {
    'use strict';

    return {
        create_simple_paging_table : function(ref_id, options ) {
            options.paging = true;
            if ( options.pageLength === void 0 ) {
                options.pageLength = 10;
            }
            return this.create_simple_table(ref_id, options)
        },
        create_simple_table : function( ref_id, options ) {
            var table_options = {
                language: {
                    emptyTable: "<li class='text-danger' align='center'>データなし</li>",
                    paginate: {
                        previous: "<",
                        next: ">",
                        first: "|<",
                        last: ">|"
                    }
                },
                ordering: false,
                dom:'Bfrtip',
                bInfo: false,
                bLengthChange: false,
                processing:true,
                orderClasses:false,
                paging: true,
                pageLength:10,
                searching:false,
                autoWidth : true,
                stripeClasses: ['stripe1','stripe2'],
                info:false,
                buttons:[]
            }
            table_options = Object.assign(table_options, options);
            //console.log(table_options)
            var dataTable= $(ref_id).DataTable(
                table_options
            );
            /*
            if (options.row_selected && typeof(options.row_selected) === 'function') {
                $('#' + ref_id +' tbody').on('click', 'tr', function() {
                    $('#ccypair tbody > tr').removeClass('selected');
                    $(this).addClass('selected');
                    options.row_selected()
                });
            }*/
            return dataTable;
        }
    };
})();

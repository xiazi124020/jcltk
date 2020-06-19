function createSettingList(setting, id, options) {
    var url="/{0}/api/system/{1}_list".format(get_domain(), setting);
    var ret = $(id).DataTable({
        // data: datas,
        ajax: {url: url, dataSrc : ''},
        destory: true,
        pageLength: 20,
        columns: options.columns,
        dom: 'Bfrtip',        // Needs button container
        select: 'single',
        responsive: true,
        altEditor: true,     // Enable altEditor
        buttons: options.buttons,
        onAddRow: function(datatable, rowdata, success, error) {
            for(key in rowdata) {
                if(rowdata[key].trim() == "") {
                    alert("未入力項目があります。")
                    return;
                }
            }
            $.ajax({
                // a tipycal url would be / with type='PUT'
                url: '/{0}/api/system/{1}_create'.format(get_domain(), setting),
                type: 'POST',
                data: rowdata,
                success: success,
                error: error
            });
        },
        onDeleteRow: function(datatable, rowdata, success, error) {
            $.ajax({
                // a tipycal url would be /{id} with type='DELETE'
                url: '/{0}/api/system/{1}_delete'.format(get_domain(), setting),
                type: 'POST',
                data: rowdata,
                success: success,
                error: error
            });
        },
        onEditRow: function(datatable, rowdata, success, error) {
            for(key in rowdata) {
                if(rowdata[key].trim() == "") {
                    alert("未入力項目があります。")
                    return;
                }
            }
            $.ajax({
                // a tipycal url would be /{id} with type='POST'
                url: '/{0}/api/system/{1}_update'.format(get_domain(), setting),
                type: 'POST',
                data: rowdata,
                success: success,
                error: error
            });
        },
        onImport: function(datatable, rowdata, success, error) {
            var client_id_all = $("#client_id_all").val().split(/[\s\n,]/g);
            if(client_id_all.length == 1 && client_id_all[0].trim() == "") {
                alert("口座番号を入力してください。");
                return;
            }
            var post_data = {};
            post_data.client_id_all = "";
            _.forEach(client_id_all, client_id => {
                if(client_id.trim() != "") {
                    if(post_data.client_id_all == "") {
                        post_data.client_id_all = pad(client_id, 10);
                    } else {
                        post_data.client_id_all = post_data.client_id_all + "," + pad(client_id, 10);
                    }
                }
            })
            $.ajax({
                // a tipycal url would be /{id} with type='POST'
                url: '/{0}/api/system/{1}_import'.format(get_domain(), setting),
                type: 'POST',
                data: post_data,
                success: success,
                error: error
            });
        },
        "initComplete": function() {
            var table = $(id).DataTable();
            table.ajax.reload();
        }
    });
    return ret;
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
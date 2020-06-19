/**
 * @summary altEditor
 * @description Lightweight editor for DataTables
 * @version 2.0
 * @file dataTables.editor.free.js
 * @author kingkode (www.kingkode.com)
 *  Modified by: Kasper Olesen (https://github.com/KasperOlesen), Luca Vercelli (https://github.com/luca-vercelli), Zack Hable (www.cobaltdevteam.com)
 * @contact www.kingkode.com/contact
 * @contact zack@cobaltdevteam.com
 * @copyright Copyright 2016 Kingkode
 *
 * This source file is free software, available under the following license: MIT
 * license
 *
 * This source file is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.
 *
 *
 */
(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery', 'datatables.net'], function ($) {
            return factory($, window, document);
        });
    }
    else if (typeof exports === 'object') {
        // CommonJS
        module.exports = function (root, $) {
            if (!root) {
                root = window;
            }

            if (!$ || !$.fn.dataTable) {
                $ = require('datatables.net')(root, $).$;
            }

            return factory($, root, root.document);
        };
    }
    else {
        // Browser
        factory(jQuery, window, document);
    }
})
(function ($, window, document, undefined) {
    'use strict';
    var DataTable = $.fn.dataTable;

    var _instance = 0;

    /**
     * altEditor provides modal editing of records for Datatables
     *
     * @class altEditor
     * @constructor
     * @param {object}
     *            oTD DataTables settings object
     * @param {object}
     *            oConfig Configuration object for altEditor
     */
    var altEditor = function (dt, opts) {
        if (!DataTable.versionCheck || !DataTable.versionCheck('1.10.8')) {
            throw ("Warning: altEditor requires DataTables 1.10.8 or greater");
        }

        // User and defaults configuration object
        this.c = $.extend(true, {}, DataTable.defaults.altEditor,
            altEditor.defaults, opts);

        /**
         * @namespace Settings object which contains customisable information
         *            for altEditor instance
         */
        this.s = {
            /** @type {DataTable.Api} DataTables' API instance */
            dt: new DataTable.Api(dt),

            /** @type {String} Unique namespace for events attached to the document */
            namespace: '.altEditor' + (_instance++)
        };

        /**
         * @namespace Common and useful DOM elements for the class instance
         */
        this.dom = {
            /** @type {jQuery} altEditor handle */
            modal: $('<div class="dt-altEditor-handle"/>'),
        };

        /* Constructor logic */
        this._constructor();
    }

    $.extend(
        altEditor.prototype,
        {
            /***************************************************************
             * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             * Constructor * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             */

            /**
             * Initialise the RowReorder instance
             *
             * @private
             */
            _constructor: function () {
                var that = this;
                var dt = this.s.dt;

                if (dt.settings()[0].oInit.onAddRow)
                    that.onAddRow = dt.settings()[0].oInit.onAddRow;
                if (dt.settings()[0].oInit.onDeleteRow)
                    that.onDeleteRow = dt.settings()[0].oInit.onDeleteRow;
                if (dt.settings()[0].oInit.onEditRow)
                    that.onEditRow = dt.settings()[0].oInit.onEditRow;
                if (dt.settings()[0].oInit.onImport)
                    that.onImport = dt.settings()[0].oInit.onImport;

                this._setup();

                dt.on('destroy.altEditor', function () {
                    dt.off('.altEditor');
                    $(dt.table().body()).off(that.s.namespace);
                    $(document.body).off(that.s.namespace);
                });
            },

            /***************************************************************
             * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             * Private methods * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * *
             */

            /**
             * Setup dom and bind button actions
             *
             * @private
             */
            _setup: function () {
                var that = this;
                var dt = this.s.dt;
                var modal_id = 'altEditor-modal-' + ("" + Math.random()).replace(".", "");
                this.modal_selector = '#' + modal_id;
                var modal = '<div class="modal fade" id="' + modal_id + '" tabindex="-1" role="dialog">' +
                    '<div class="modal-dialog">' +
                    '<div class="modal-content">' +
                    '<div class="modal-header">' +
                    '<h4 style="padding-top: 1rem;padding-left: 1rem;" class="modal-title"></h4>' +
                    '<button style="margin: initial;" type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>' +
                    '</div>' +
                    '<div class="modal-body">' +
                    '<p></p>' +
                    '</div>' +
                    '<div class="modal-footer">' +
                    '<button type="button" class="btn btn-default" data-dismiss="modal">Close</button>' + //FIXME need i18n
                    '<input type="submit" form="altEditor-form" class="btn btn-primary"></input>' +
                    '</div>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
                // add modal
                $('body').append(modal);

                // add Edit Button
                if (dt.button('edit:name')) {
                    dt.button('edit:name').action(function (e, dt, node, config) {
                        that._openEditModal();
                    });

                    $(this.modal_selector).on('click', '#editRowBtn', function (e) {
                        if (that._inputValidation()) {
                            e.preventDefault();
                            e.stopPropagation();
                            that._editRowData();
                        }
                    });
                }

                // add Delete Button
                if (dt.button('delete:name')) {
                    dt.button('delete:name').action(function (e, dt, node, config) {
                        that._openDeleteModal();
                    });

                    $(this.modal_selector).on('click', '#deleteRowBtn', function (e) {
                        e.preventDefault();
                        e.stopPropagation();
                        that._deleteRow();
                        $(this).prop('disabled', true);
                    });
                }

                // add Add Button
                if (dt.button('add:name')) {
                    dt.button('add:name').action(function (e, dt, node, config) {
                        that._openAddModal();
                    });

                    $(this.modal_selector).on('click', '#addRowBtn', function (e) {
                        if (that._inputValidation()) {
                            e.preventDefault();
                            e.stopPropagation();
                            that._addRowData();
                        }
                    });
                }

                // add import Button
                if (dt.button('import:name')) {
                    dt.button('import:name').action(function (e, dt, node, config) {
                        that._openImportModal();
                    });

                    $(this.modal_selector).on('click', '#importBtn', function (e) {
                        if (that._inputValidation()) {
                            e.preventDefault();
                            e.stopPropagation();
                            that._import();
                        }
                    });
                }

                // add Refresh button
                if (this.s.dt.button('refresh:name')) {
                    this.s.dt.button('refresh:name').action(function (e, dt, node, config) {
                        if (dt.ajax && dt.ajax.url()) {
                            dt.ajax.reload();
                        }
                    });
                }
            },

            /**
             * Emit an event on the DataTable for listeners
             *
             * @param {string}
             *            name Event name
             * @param {array}
             *            args Event arguments
             * @private
             */
            _emitEvent: function (name, args) {
                this.s.dt.iterator('table', function (ctx, i) {
                    $(ctx.nTable).triggerHandler(name + '.dt', args);
                });
            },

            /**
             * Open Edit Modal for selected row
             *
             * @private
             */
            _openEditModal: function () {

                var dt = this.s.dt;
                var adata = dt.rows({
                    selected: true
                });

                var columnDefs = this.completeColumnDefs();
                var data = this.createDialog(columnDefs, 'Edit Record', 'Edit', 'Close', 'editRowBtn');

                var selector = this.modal_selector;

                for (var j in columnDefs) {
                    var arrIndex = "['" + columnDefs[j].name.toString().split(".").join("']['") + "']";
                    var selectedValue = eval("adata.data()[0]" + arrIndex);
                    var jquerySelector = "#" + columnDefs[j].name.toString().replace(/\./g, "\\.");
                    $(selector).find(jquerySelector).val(this._quoteattr(selectedValue));
                    $(selector).find(jquerySelector).trigger("change"); // required by select2
                }

                $(selector + ' input[0]').focus();
            },

            /**
             * Callback for "Edit" button
             */
            _editRowData: function () {
                var that = this;
                var dt = this.s.dt;

                // Complete new row data
                var rowDataArray = {};

                var adata = dt.rows({
                    selected: true
                });

                // Getting the inputs from the edit-modal
                $('form[name="altEditor-form"] *').filter(':input').each(function (i) {
                    rowDataArray[$(this).attr('id')] = $(this).val();
                });

                // console.log(rowDataArray); //DEBUG

                that.onEditRow(that,
                    rowDataArray,
                    function(data,b,c,d,e){ that._editRowCallback(data,b,c,d,e); },
                    function(data){ that._errorCallback(data);
                });
            },

            /**
             * Open Delete Modal for selected row
             *
             * @private
             */
            _openDeleteModal: function () {

                var that = this;
                var dt = this.s.dt;
                var adata = dt.rows({
                    selected: true
                });
                var columnDefs = this.completeColumnDefs();

                // TODO
                // we should use createDialog()
                // var data = this.createDialog(columnDefs, 'Delete Record', 'Delete', 'Close', 'deleteRowBtn');

                // Building delete-modal
                var data = "";

                data += "<form name='altEditor-form' role='form'>";
                for (var j in columnDefs) {
                    if (columnDefs[j].type.indexOf("hidden") >= 0) {
                        data += "<input type='hidden' id='" + columnDefs[j].title + "' value='" + adata.data()[0][columnDefs[j].name] + "'></input>";
                    }
                    else {
                        data += "<div style='margin-left: initial;margin-right: initial;' class='form-group row'><label for='"
                            + that._quoteattr(columnDefs[j].name)
                            + "'>"
                            + columnDefs[j].title
                            + ":&nbsp</label> <input  type='hidden'  id='"
                            + that._quoteattr(columnDefs[j].title)
                            + "' name='"
                            + that._quoteattr(columnDefs[j].title)
                            + "' placeholder='"
                            + that._quoteattr(columnDefs[j].title)
                            + "' style='overflow:hidden'  class='form-control' value='"
                            + that._quoteattr(adata.data()[0][columnDefs[j].name]) + "' >"
                            + adata.data()[0][columnDefs[j].name]
                            + "</input></div>";
                    }
                }
                data += "</form>";

                var selector = this.modal_selector;
                $(selector).on('show.bs.modal', function () {
                    var btns = '<button type="button" data-content="remove" class="btn btn-default" data-dismiss="modal">Close</button>' +
                        '<button type="button"  data-content="remove" class="btn btn-danger" id="deleteRowBtn">Delete</button>';
                    $(selector).find('.modal-title').html('Delete Record');
                    $(selector).find('.modal-body').html(data);
                    $(selector).find('.modal-footer').html(btns);
                });

                $(selector).modal('show');
                $(selector + ' input[0]').focus();
            },

            /**
             * Callback for "Delete" button
             */
            _deleteRow: function () {
                var that = this;
                var dt = this.s.dt;

                var jsonDataArray = {};

                var adata = dt.rows({
                    selected: true
                });

                // Getting the IDs and Values of the tablerow
                for (var i = 0; i < dt.context[0].aoColumns.length; i++) {
                    // .data is the attribute name, if any; .idx is the column index, so it should always exists
                    var name = dt.context[0].aoColumns[i].data ? dt.context[0].aoColumns[i].data :
                            dt.context[0].aoColumns[i].mData ? dt.context[0].aoColumns[i].mData :
                            dt.context[0].aoColumns[i].idx;
                    jsonDataArray[name] = adata.data()[0][name];
                }
                that.onDeleteRow(that,
                    jsonDataArray,
                    function(data){ that._deleteRowCallback(data); },
                    function(data){ that._errorCallback(data);
                });
            },

            /**
             * Open Add Modal for selected row
             *
             * @private
             */
            _openAddModal: function () {
                var dt = this.s.dt;
                var columnDefs = this.completeColumnDefs();
                var data = this.createDialog(columnDefs, 'Add Record', 'Add', 'Close', 'addRowBtn');

                var selector = this.modal_selector;
                $(selector + ' input[0]').focus();
            },

            /**
             * Open Add Modal for selected row
             *
             * @private
             */
            _openImportModal: function () {
                var dt = this.s.dt;
                // var columnDefs = this.completeColumnDefs('i');
                var columnDefs = [];
                var columnOptions = {};
                columnOptions.type = "textarea";
                columnDefs.push(columnOptions);
                var data = this.createDialog(columnDefs, '口座番号', 'Import', 'Close', 'importBtn');

                var selector = this.modal_selector;
                $(selector + ' input[0]').focus();
            },

            /**
            * Complete DataTable.context[0].aoColumns with default values
            */
            completeColumnDefs(method) {
                var columnDefs = [];
                var dt = this.s.dt;
                for (var i in dt.context[0].aoColumns) {
                    var obj = dt.context[0].aoColumns[i];
                    if(!method) {
                        if(obj.editDisplayFlag == false) {
                            continue;
                        }
                        columnDefs[i] = {
                            title: obj.sTitle,
                            name: (obj.data ? obj.data : obj.mData),
                            type: (obj.type ? obj.type : 'text'),
                            options: (obj.options ? obj.options : []),
                            readonly: (obj.readonly ? obj.readonly : false),
                            disabled: (obj.disabled ? obj.disabled : false),
                            msg: (obj.errorMsg ? obj.errorMsg : ''),
                            hoverMsg: (obj.hoverMsg ? obj.hoverMsg : ''),
                            pattern: (obj.pattern ? obj.pattern : '.*'),
                            special: (obj.special ? obj.special : ''),
                            unique: (obj.unique ? obj.unique : false),
                            uniqueMsg: (obj.uniqueMsg ? obj.uniqueMsg : ''),
                            maxLength: (obj.maxLength ? obj.maxLength : false),
                            multiple: (obj.multiple ? obj.multiple : false),
                            select2: (obj.select2 ? obj.select2 : false),
                            datepicker: (obj.datepicker ? obj.datepicker : false),
                            datetimepicker: (obj.datetimepicker ? obj.datetimepicker : false)
                        }
                    }
                }
                return columnDefs;
            },

            /**
            * Create both Edit and Add dialogs
            * @param columnDefs as returned by completeColumnDefs()
            */
            createDialog: function(columnDefs, title, buttonCaption, closeCaption, buttonClass) {

                var data = "";
                data += "<form name='altEditor-form' role='form' enctype='multipart/form-data'>";
                for (var j in columnDefs) {

                    //handle hidden fields
                    if (columnDefs[j].type.indexOf("hidden") >= 0) {
                        data += "<input type='hidden' id='" + columnDefs[j].name + "' ></input>";
                    }
                    else {
                        // handle fields that are visible to the user
                        data += "<div style='margin-left: initial;margin-right: initial;' class='form-group row'>";
                        data += "<div class='col-sm-3 col-md-3 col-lg-3 text-right' style='padding-top:4px;'>";
                        data += "<label for='" + columnDefs[j].name + "'>" + columnDefs[j].title + ":</label></div>";
                        data += "<div class='col-sm-8 col-md-8 col-lg-8'>";

                        // Adding readonly-fields
                        if (columnDefs[j].type.indexOf("readonly") >= 0) {
                            // type=readonly is deprecated, kept for backward compatibility
                            data += "<input type='text' readonly  id='"
                                + this._quoteattr(columnDefs[j].name)
                                + "' name='"
                                + this._quoteattr(columnDefs[j].title)
                                + "' placeholder='"
                                + this._quoteattr(columnDefs[j].title)
                                + "' style='overflow:hidden'  class='form-control  form-control-sm' value=''>";
                        }
                        // Adding select-fields
                        else if (columnDefs[j].type.indexOf("select") >= 0) {
                            var options = "";
                            if (columnDefs[j].options.length > 0) {
                                // array-style select or select2
                                for (var i = 0; i < columnDefs[j].options.length; i++) {
                                    options += "<option value='" + this._quoteattr(columnDefs[j].options[i])
                                        + "'>" + columnDefs[j].options[i] + "</option>";
                                }
                            } else {
                                // object-style select or select2
                                for (var x in columnDefs[j].options) {
                                    options += "<option value='" + this._quoteattr(x) + "' >"
                                        + columnDefs[j].options[x] + "</option>";
                                }
                            }
                            data += "<select class='form-control" + (columnDefs[j].select2 ? ' select2' : '')
                                + "' id='" + this._quoteattr(columnDefs[j].name)
                                + "' name='" + this._quoteattr(columnDefs[j].title) + "' "
                                + (columnDefs[j].multiple ? ' multiple ' : '')
                                + (columnDefs[j].readonly ? ' readonly ' : '')
                                + (columnDefs[j].disabled ? ' disabled ' : '')
                                + ">" + options
                                + "</select>";
                        }
                        // Adding textarea-fields
                        else if (columnDefs[j].type.indexOf("textarea") >= 0) {
                            data = '<textarea id="client_id_all" name="client_id_all" rows="20" class="form-control rpa-input" rows="4" placeholder="口座番号が複数入力の場合、「,」、「スペース」又は「改行」で区切って入力してください"></textarea>';
                        }
                        // Adding text-inputs and errorlabels, but also new HTML5 typees (email, color, ...)
                        else {
                            data += "<input type='" + this._quoteattr(columnDefs[j].type)
                                + "' id='" + this._quoteattr(columnDefs[j].name)
                                + "' pattern='" + this._quoteattr(columnDefs[j].pattern)
                                + "' title='" + this._quoteattr(columnDefs[j].title)
                                + "' name='" + this._quoteattr(columnDefs[j].name)
                                + "' placeholder='" + this._quoteattr(columnDefs[j].title)
                                + "' data-special='" + this._quoteattr(columnDefs[j].special)
                                + "' data-errorMsg='" + this._quoteattr(columnDefs[j].msg)
                                + "' data-uniqueMsg='" + this._quoteattr(columnDefs[j].uniqueMsg)
                                + "' data-unique='" + columnDefs[j].unique
                                + "' "
                                + (columnDefs[j].readonly ? ' readonly ' : '')
                                + (columnDefs[j].disabled ? ' disabled ' : '')
                                + (columnDefs[j].maxLength == false ? "" : " maxlength='" + columnDefs[j].maxLength + "'")
                                + " style='overflow:hidden'  class='form-control  form-control-sm' value=''>";
                            data += "<label id='" + this._quoteattr(columnDefs[j].name) + "label"
                                + "' class='errorLabel'></label>";
                        }

                        data += "</div><div style='clear:both;'></div></div>";
                    }
                }
                data += "</form>";

                var selector = this.modal_selector;
                $(selector).on('show.bs.modal', function () {
                    var btns = '<button type="button" data-content="remove" class="btn btn-default" data-dismiss="modal">'+closeCaption+'</button>' +
                        '<button type="button"  data-content="remove" class="btn btn-primary" id="'+buttonClass+'">'+buttonCaption+'</button>';
                    $(selector).find('.modal-title').html(title);
                    $(selector).find('.modal-body').html(data);
                    $(selector).find('.modal-footer').html(btns);
                });

                $(selector).modal('show');
                $(selector + ' input[0]').focus();

                // enable select 2 items, datepicker, datetimepickerm
                for (var j in columnDefs) {
                    if (columnDefs[j].select2) {
                        // Require select2 plugin
                        $(selector).find("select#" + columnDefs[j].name).select2(columnDefs[j].select2);
                    } else if (columnDefs[j].datepicker) {
                        // Require jquery-ui
                        $(selector).find("#" + columnDefs[j].name).datepicker(columnDefs[j].datepicker);
                    } else if (columnDefs[j].datetimepicker) {
                        // Require datetimepicker plugin
                        $(selector).find("#" + columnDefs[j].name).datetimepicker(columnDefs[j].datetimepicker);
                    }
                }
            },

            /**
             * Callback for "Add" button
             */
            _addRowData: function () {
                var that = this;
                var dt = this.s.dt;

                var rowDataArray = {};

                // Getting the inputs from the modal
                $('form[name="altEditor-form"] *').filter(':input').each(function (i) {
                    rowDataArray[$(this).attr('id')] = $(this).val();
                });

//console.log(rowDataArray); //DEBUG

                that.onAddRow(that,
                    rowDataArray,
                    function(data){ that._addRowCallback(data); },
                    function(data){ that._errorCallback(data);
                });

            },

            /**
             * Callback for "import" button
             */
            _import: function () {
                var that = this;
                var dt = this.s.dt;

                var rowDataArray = {};

                // Getting the inputs from the modal
                $('form[name="altEditor-form"] *').filter(':input').each(function (i) {
                    rowDataArray[$(this).attr('id')] = $(this).val();
                });

//console.log(rowDataArray); //DEBUG

                that.onImport(that,
                    rowDataArray,
                    function(data){ that._importCallback(data); },
                    function(data){ that._errorCallback(data);
                });

            },

            /**
             * Called after a row has been deleted on server
             */
            _deleteRowCallback: function (response, status, more) {
                    var selector = this.modal_selector;
                    $(selector + ' .modal-body .alert').remove();

                    var message = '<div class="alert alert-success" role="alert">' +
                        '<strong>Success!</strong>' +
                        '</div>';
                        $(selector).modal('hide');
                    $(selector + ' .modal-body').append(message);

                    this.s.dt.row({
                        selected : true
                    }).remove();
                    this.s.dt.draw();

                    // Disabling submit button
                    $("div"+selector).find("button#addRowBtn").prop('disabled', true);
                    $("div"+selector).find("button#editRowBtn").prop('disabled', true);
                    $("div"+selector).find("button#deleteRowBtn").prop('disabled', true);
            },

            /**
             * Called after a row has been inserted on server
             */
            _addRowCallback: function (response, status, more) {

                    //TODO should honor dt.ajax().dataSrc

                    var data = (typeof response === "string") ? JSON.parse(response) : response;
                    var selector = this.modal_selector;
                    $(selector + ' .modal-body .alert').remove();
                    var message = '<div class="alert alert-success" role="alert">' +
                        '<strong>Success!</strong>' +
                        '</div>';
                        $(selector).modal('hide');
                    $(selector + ' .modal-body').append(message);

                    // this.s.dt.row.add(data).draw(false);

                    // Disabling submit button
                    $("div" + selector).find("button#addRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#editRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#deleteRowBtn").prop('disabled', true);
                    if (this.s.dt.ajax && this.s.dt.ajax.url()) {
                        this.s.dt.ajax.reload();
                    }
            },

            /**
             * Called after a row has been inserted on server
             */
            _importCallback: function (response, status, more) {

                //TODO should honor dt.ajax().dataSrc

                var data = (typeof response === "string") ? JSON.parse(response) : response;
                var selector = this.modal_selector;
                $(selector + ' .modal-body .alert').remove();

                var message = '<div class="alert alert-success" role="alert">' +
                    '<strong>Success!</strong>' +
                    '</div>';
                    $(selector).modal('hide');
                $(selector + ' .modal-body').append(message);

                // this.s.dt.row.add(data).draw(false);

                // Disabling submit button
                $("div" + selector).find("button#addRowBtn").prop('disabled', true);
                $("div" + selector).find("button#editRowBtn").prop('disabled', true);
                $("div" + selector).find("button#deleteRowBtn").prop('disabled', true);
                if (this.s.dt.ajax && this.s.dt.ajax.url()) {
                    this.s.dt.ajax.reload();
                }
            },

            /**
             * Called after a row has been updated on server
             */
            _editRowCallback: function (response, status, more) {

                    //TODO should honor dt.ajax().dataSrc

                    var data = (typeof response === "string") ? JSON.parse(response) : response;
                    var selector = this.modal_selector;
                    $(selector + ' .modal-body .alert').remove();

                    var message = '<div class="alert alert-success" role="alert">' +
                        '<strong>Success!</strong>' +
                        '</div>';
                        $(selector).modal('hide');
                    $(selector + ' .modal-body').append(message);

                    // this.s.dt.row({
                    //     selected : true
                    // }).data(data);
                    this.s.dt.draw();

                    // Disabling submit button
                    $("div" + selector).find("button#addRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#editRowBtn").prop('disabled', true);
                    $("div" + selector).find("button#deleteRowBtn").prop('disabled', true);
                    if (this.s.dt.ajax && this.s.dt.ajax.url()) {
                        this.s.dt.ajax.reload();
                    }
            },

            /**
             * Called after AJAX server returned an error
             */
            _errorCallback: function (response, status, more) {
                    var error = response;
                    var selector = this.modal_selector;
                    $(selector + ' .modal-body .alert').remove();
                    var errstr = "There was an unknown error!";
                    if (error.responseJSON && error.responseJSON.errors) {
                        errstr = "";
                        for (var key in error.responseJSON.errors) {
                            errstr += error.responseJSON.errors[key][0];
                        }
                    }
                    var message = '<div class="alert alert-danger" role="alert">' +
                        '<strong>Error!</strong> ' + (error.status == null ? "" : 'Response code: ' + error.status) + " " + errstr +
                        '</div>';

                    $(selector).modal('hide');
                    alert('Error');
                    $(selector + ' .modal-body').append(message);
            },

            /**
             * Default callback for insertion: mock webservice, always success.
             */
            onAddRow: function(dt, rowdata, success, error) {
                console.log("Missing AJAX configuration for INSERT");
                success(rowdata);
            },

            /**
             * Default callback for editing: mock webservice, always success.
             */
            onEditRow: function(dt, rowdata, success, error) {
                console.log("Missing AJAX configuration for UPDATE");
                success(rowdata);
            },

            /**
             * Default callback for deletion: mock webservice, always success.
             */
            onDeleteRow: function(dt, rowdata, success, error) {
                console.log("Missing AJAX configuration for DELETE");
                success(rowdata);
            },

            /**
             * Validates input
             * @returns {boolean}
             * @private
             */
            _inputValidation: function () {
                var that = this;
                var dt = this.s.dt;
                var isValid = false;
                var errorcount = 0;

                // Looping through all text fields
                $('form[name="altEditor-form"] *').filter(':text').each(
                    function (i) {
                        var errorLabel = "#" + $(this).attr("id") + "label";
                        // reset error display
                        $(errorLabel).hide();
                        $(errorLabel).empty();
                        if (!$(this).val().match($(this).attr("pattern"))) {
                            $(errorLabel).html($(this).attr("data-errorMsg"));
                            $(errorLabel).show();
                            errorcount++;
                        }
                        // now check if its should be unique
                        else if ($(this).attr("data-unique") == "true") {
                            // go through each item in this column
                            var colData = dt.column("th:contains('" + $(this).attr("name") + "')").data();
                            var selectedCellData = null;
                            if (dt.row({selected: true}).index() != null)
                                selectedCellData = dt.cell(dt.row({selected: true}).index(), dt.column("th:contains('" + $(this).attr("name") + "')").index()).data();
                            for (var j in colData) {
                                // if the element is in the column and its not the selected one then its not unique
                                if ($(this).val() == colData[j] && colData[j] != selectedCellData) {
                                    $(errorLabel).html($(this).attr("data-uniqueMsg"));
                                    $(errorLabel).show();
                                    errorcount++;
                                }
                            }
                        }
                    });

                if (errorcount == 0) {
                    isValid = true;
                }

                return isValid;
            },

            /**
             * Sanitizes input for use in HTML
             * @param s
             * @param preserveCR
             * @returns {string}
             * @private
             */
            _quoteattr: function (s, preserveCR) {
                if (s == null)
                    return "";
                preserveCR = preserveCR ? '&#13;' : '\n';
                if (Array.isArray(s)) {
                    // for MULTIPLE SELECT
                    var newArray = [];
		    var x;
                    for (x in s) newArray.push(s[x]);
                    return newArray;
                }
                return ('' + s) /* Forces the conversion to string. */
                    .replace(/&/g, '&amp;') /* This MUST be the 1st replacement. */
                    .replace(/'/g, '&apos;') /* The 4 other predefined entities, required. */
                    .replace(/"/g, '&quot;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;')
                    .replace(/\r\n/g, preserveCR) /* Must be before the next replacement. */
                    .replace(/[\r\n]/g, preserveCR);
            },
        });

    /**
     * altEditor version
     *
     * @static
     * @type String
     */
    altEditor.version = '2.0';

    /**
     * altEditor defaults
     *
     * @namespace
     */
    altEditor.defaults = {
        /**
         * @type {Boolean} Ask user what they want to do, even for a single
         *       option
         */
        alwaysAsk: false,

        /** @type {string|null} What will trigger a focus */
        focus: null, // focus, click, hover

        /** @type {column-selector} Columns to provide auto fill for */
        columns: '', // all

        /** @type {boolean|null} Update the cells after a drag */
        update: null, // false is editor given, true otherwise

        /** @type {DataTable.Editor} Editor instance for automatic submission */
        editor: null
    };

    /**
     * Classes used by altEditor that are configurable
     *
     * @namespace
     */
    altEditor.classes = {
        /** @type {String} Class used by the selection button */
        btn: 'btn'
    };

    // Attach a listener to the document which listens for DataTables
    // initialisation
    // events so we can automatically initialise
    $(document).on('preInit.dt.altEditor', function (e, settings, json) {
        if (e.namespace !== 'dt') {
            return;
        }

        var init = settings.oInit.altEditor;
        var defaults = DataTable.defaults.altEditor;

        if (init || defaults) {
            var opts = $.extend({}, init, defaults);

            if (init !== false) {
                new altEditor(settings, opts);
            }
        }
    });

    // Alias for access
    DataTable.altEditor = altEditor;
    return altEditor;
});

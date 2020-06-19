var RpaChart = (function(){

        //private method
        function aa(arg){
        }

        // structure function
        return function (view_id, chart_id, data_api, options) {
            var _chart_id = chart_id
            var _view_id = view_id
            var _options = Object.assign({}, options)
            var _chart = null
            var _data_api = null

            this.get_view_id = function() {
                return _view_id
            }

            this.get_view = function() {
                return $(_view_id)
            }

            this.get_chart_id = function() {
                return _chart_id
            }

            this.get_chart_container = function() {
                return $(_chart_id)
            }

            this.get_options = function() {
                return _options
            }

            this.get_chart = function() {
                return _chart
            }

            this.set_chart = function(chart) {
                _chart = chart
            }

            this.set_data_api = function(data_api) {
                _data_api = data_api
            }

            this.get_data_api = function() {
                return _data_api
            }
        }
})();

// ----------------------------------------
//
// public method
//
//----------------------------------------
RpaChart.prototype = {
    destory:function(){
        console.log("showcall   name:"+this.getName()+" age:"+this.getAge());
    },

    draw = function() {
        var url = this.get_data_api()

        if ( !url ) {
            throw Error("data api is not initialized!")
        }

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
        )

        if ( !this.get_chart_container() ) {
            throw Error("chart container is not initialized!")
        }
        var c = new Chart( this.get_chart_container() , this.get_options() )
        this.set_chart(c)
    },

}

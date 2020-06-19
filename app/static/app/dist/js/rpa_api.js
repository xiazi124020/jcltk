(function () {
    'use strict';
    var instance = {
        url : null,
        parameters : null,
        get: function (succ, fail) {
            this.request('get', succ, fail)
        },
        post: function (succ, fail) {
            this.request('post', succ, fail)
        },
        request: function (method, succ, fail) {
            var req = method === 'get' ? get_axios().get : get_axios().post;
            req(this.url, {
                headers: {"X-CSRFToken": csrfToken},
                data:this.parameters || {}
            }).then(response => {
                var datas=response.data;
                if ( datas && typeof(datas) === 'string' && datas.indexOf('<!DOCTYPE html>') >= 0 ) {
                    var error = "セッションタイムアウト、再度ログインしてください。";
                    if ( fail ) {
                        fail(error);
                    } else {
                        alert(error)
                    }
                } else if ( succ ) {
                    succ( datas )
                }
            }).catch(error => {
                if (error.response) {
                    //console.log(error.response.data);
                    //console.log(error.response.status);
                    //console.log(error.response.headers);
                    if ( fail ) {
                        if( error.response.status === 403 ) {
                            fail("権限がありません");
                        } else {
                            fail(error.response.status);
                        }
                    }
                } else if (error.request) {
                    //console.log(error.request);
                    if ( fail ) fail(error.request);
                } else {
                    //console.log('Error', error.message);
                    if ( fail ) fail(error.message);
                }
            });
        }
    };
    window.get_api = function (url, parameters) {
        instance.url = url;
        instance.parameters = parameters;
        return instance;
    };
})();

/*
 * This file is part of the Hotels24.ua project.
 *
 * (c) Hotels24.ua 2006-2015
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 *
 * Widget api for affiliate sites
 */

var Config = {
    getEnv: function() {
        if(typeof env !== 'undefined') {
            return env;
        }

        return 'ua';
    }
};

var ScriptHelper = function(basePath) {
    this.basePath = basePath;
};

ScriptHelper.prototype.createScripts = function(scriptName, script, callback) {
    script = document.createElement("script");
    script.src = this.basePath + "bundles/api/js/" + scriptName;
    script.type = "text/javascript";
    script.async = true;
    script.onload = script.onreadystatechange = function() {
        callback();
    };
    document.getElementsByTagName('head')[0].appendChild(script);
};

ScriptHelper.prototype.LoadScriptsSync = function (_scripts, scripts) {

    var x = 0;
    var that = this;
    var loopArray = function(_scripts, scripts) {
        that.createScripts(_scripts[x], scripts[x], function(){
            x++;
            if(x < _scripts.length) {
                loopArray(_scripts, scripts);
            }
        });
    };
    loopArray(_scripts, scripts);
};

var Widget = {

    searchForm: function(elementId, options) {
        var xmlhttp = new XMLHttpRequest();
        var scriptHelper = new ScriptHelper('//affiliate.hotels24.' + Config.getEnv() + '/');
        xmlhttp.open('GET', '//affiliate.hotels24.' + Config.getEnv() + '/api/search/form?width=' + options.width +
            '&backgroundColor=' + options.backgroundColor + '&textColor=' + options.textColor +
            '&buttonColor=' + options.buttonColor + '&affiliateId=' + options.affiliateId, true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function()
        {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            {
                document.getElementById(elementId).innerHTML = xmlhttp.responseText;

                var _scripts = ['moment.min.js', 'pikaday.js', 'searchForm.js'];
                var scripts = [];
                scriptHelper.LoadScriptsSync(_scripts, scripts);
            }
        };
    },

    hotels: function(elementId, options) {
        var xmlhttp = new XMLHttpRequest();
        var uri = '';
        if(typeof options.city !== 'undefined') {
            uri ='city/' + options.city;
        }
        if(typeof options.region !== 'undefined') {
            uri ='region/' + options.region;
        }
        xmlhttp.open('GET', '//affiliate.hotels24.' + Config.getEnv() + '/api/hotel/' + uri + '?affiliateId=' + options.affiliateId , true);
        xmlhttp.send();
        xmlhttp.onreadystatechange = function()
        {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200)
            {
                document.getElementById(elementId).innerHTML = xmlhttp.responseText;
            }
        };
    }

};
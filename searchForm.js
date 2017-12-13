/*
 * This file is part of the Hotels24.ua project.
 *
 * (c) Hotels24.ua 2006-2014
 *
 * For the full copyright and license information, please view the LICENSE
 * file that was distributed with this source code.
 */

//оскільки маєм відправляти користувачам, то писати потрібно нетівним скриптом без використання всякого роду бібліотек

var Config = {
    getEnv: function () {
        if (typeof env !== 'undefined') {
            return env;
        }

        return 'ua';
    }
};

function ListNavigator(_data) {
    var data = _data || {};
    var containerID = data.containerID;
    var listClass = data.listClass;
    var selectedClass = data.selectedClass;
    var list = null;
    var selected = 0;
    var listModel = null;

    var container = document.getElementById(containerID);
    var body = document.body;

    var self = this;

    var on = {
        selected: [],
        show: [],
        hide: [],
        empty: []
    };

    function runHandlers(_handlers, params) {
        if (_handlers.length) {
            for (var i = 0; i < _handlers.length; i++) {
                _handlers[i].call(self, params);
            }
        }
    }

    function isListActive() {
        return container && container.style.display !== 'none';
    }

    body.addEventListener('keyup', function (_event) {
        _event.preventDefault();
        if (isListActive()) {
            switch (_event.keyCode) {
                case 38: //'ArrowUp'
                    selectElement(selected - 1);
                    break;
                case 40: //'ArrowDown'
                    if (document.getElementsByClassName(selectedClass).length) {
                        selectElement(selected + 1);
                    } else {
                        selectElement(selected);
                    }
                    break;
                case 27: //'Escape'
                    hideList();
                    break;
                default:

                    break;
            }
        }
    });

    body.addEventListener('click', function () {
        ln.hideList();
    });

    var element = document.getElementById('h24QueryString');
    element.addEventListener('click', function (_event) {
        _event.cancelBubble = true
        ln.showList();
    });

    function selectElement(_selected) {
        if (list && list.length) {
            list[selected].classList.remove(selectedClass);
            selected = (_selected < 0 ? (list.length + _selected) : _selected) % list.length;
            list[selected].classList.add(selectedClass);
        }
    }

    function updateList(_list) {
        selected = 0;
        list = [].slice.call(_list || document.getElementsByClassName(listClass));
        if (!list.length) {
            runHandlers(on.empty);
        } else {
            for (var index in list) {
                var item = list[index];
                item.hasOwnProperty('addEventListener') && item.addEventListener('click', function (_event) {
                    selected = list.indexOf(this);
                });
            }
        }
    }

    function showList() {
        if (container && container.innerHTML !== '') {
            container.style.display = 'block';
        }
        var params = listModel && {};
        runHandlers(on.show, params);
    }

    function hideList() {
        if (container) {
            container.style.display = 'none';
        }
        var params = listModel && {
                listIndex: selected
            };
        runHandlers(on.hide, params);
    }

    function onSelected(_handler) {
        on.selected.push(_handler);
        return this;
    }

    function onShow(_handler) {
        on.show.push(_handler);
        return this;
    }

    function onHide(_handler) {
        on.hide.push(_handler);
        return this;
    }

    function onEmpty(_handler) {
        on.empty.push(_handler);
        return this;
    }

    function isEnabled() {
        return list && list.length;
    }

    function getSelectedIndex() {
        return selected;
    }

    function getList() {
        return list;
    }

    this.isEnabled = isEnabled;
    this.updateList = updateList;
    this.showList = showList;
    this.hideList = hideList;

    this.onSelected = onSelected;
    this.onShow = onShow;
    this.onHide = onHide;
    this.onEmpty = onEmpty;
    this.getSelectedIndex = getSelectedIndex;
    this.getList = getList;
}
var param = {
    containerID: 'h24SearchResult',
    listClass: 'acResult',
    selectedClass: 'ac-selected'
};
var ln = new ListNavigator(param);

function FormValidator(_data) {
    var data = _data || {};
    var formID = data.formID;
    var requiredFields = data.requiredFields;
    var onSubmit = data.onSubmit;
    var params = data.params;
    var form = document.getElementById(formID);
    form && form.addEventListener('submit', function (_event) {
        _event && _event.preventDefault() && _event.preventDefault();
        for (var index in requiredFields) {
            var field = requiredFields[index];
            if (form.hasOwnProperty(index)) {
                if (form[index].value === '') {
                    field.onEmpty && field.onEmpty(form[index]);
                    return;
                } else {
                    field.onFill && field.onFill(form[index])
                }
            }
        }
        onSubmit && onSubmit(form, params) && this.submit();
    });
}


var params = {
    formID: 'h24SearchForm',
    onSubmit: function () {
        if (ln.isEnabled()) {
            var index = ln.getSelectedIndex();
            var list = ln.getList();
            list[index].dispatchEvent(new Event('click'));
            return true;
        }
    },
    requiredFields: {
        queryString: {
            onEmpty: function (_field) {
                var element = document.getElementById('h24SearchResult');
                element.innerHTML = 'Уточните направление!';
                element.style.display = 'block';
            }
        }
    }
};
FormValidator(params);
var cityOrRegionId = document.createElement('input');
cityOrRegionId.type = 'hidden';
var geocodeS = document.createElement('input');
geocodeS.type = 'hidden';
geocodeS.name = 'geocode_s';
var places = null;

//-----xml request-----//

var Hotels24XmlHttp = function () {
    this.xmlhttp = null;
    this.create();
};

Hotels24XmlHttp.prototype.create = function () {
    var xmlhttp;

    if (window.XMLHttpRequest) {
        xmlhttp = new XMLHttpRequest();
    } else {
        throw new XMLHttpRequestException();
    }

    this.xmlhttp = xmlhttp;
};

Hotels24XmlHttp.prototype.sendRequest = function (method, uri, callback) {
    var xmlhttp = this.xmlhttp;

    xmlhttp.open(method, uri, true);
    xmlhttp.send();

    return this.getResult(callback);
};

Hotels24XmlHttp.prototype.abortRequest = function () {
    var xmlhttp = this.xmlhttp;
    xmlhttp.abort()
};

Hotels24XmlHttp.prototype.getResult = function (callback) {
    var xmlhttp = this.xmlhttp;

    xmlhttp.onerror = function () {
    };

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState == 1) {
            //spinnerStart
        }

        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            //spinnerStop
            callback(xmlhttp.responseText);
        }
    };

    return null;
};

//---

//-----autocompleater-----//

function Autocomplete() {
    var response = null;

    function handle(_response, resultBlockId) {
        var citiesHtml = '';
        var regionsHtml = '';
        var hotelsHtml = '';
        var placesHtml = '';
        if (typeof _response.cities != 'undefined' && _response.cities.length > 0) {
            citiesHtml = '<div class="h24-cities"><span class="h24-item-type">Города:</span> <ul class="h24-autocomplite">';

            for (var i = 0; i < _response.cities.length; i++) {
                citiesHtml += '<li class="acResult" data-type="city" data-value="' + _response.cities[i].cityId + '">' + _response.cities[i].cityName + ' ' + '<span class="h24-auto-small-text">' + _response.cities[i].hotelsCount + ' гостиниц' + '</span>' + '</li>';
            }
            citiesHtml += '</ul></div>';
        }

        if (typeof _response.regions != 'undefined' && _response.regions.length > 0) {
            regionsHtml = '<div class="h24-regions"><span class="h24-item-type">Регионы:</span> <ul class="h24-autocomplite">';

            for (i = 0; i < _response.regions.length; i++) {
                regionsHtml += '<li class="acResult" data-type="region" data-value="' + _response.regions[i].regionId + '">' + _response.regions[i].regionName + ' ' + '<span class="h24-auto-small-text">' + _response.regions[i].hotelsCount + ' гостиниц' + '</span>' + '</li>';
            }

            regionsHtml += '</ul></div>';
        }

        if (typeof _response.hotels != 'undefined' && _response.hotels.length > 0) {
            hotelsHtml = '<div class="h24-regions"><span class="h24-item-type">Отлели:</span> <ul class="h24-autocomplite">';
            var length = _response.hotels.length < 4 ? _response.hotels.length : 3;
            for (i = 0; i < length; i++) {
                hotelsHtml += '<li class="acResult" data-type="hotel" data-value="' + _response.hotels[i].hotelId + '">' + _response.hotels[i].hotelType + ' ' + _response.hotels[i].hotelName + '</li>';
            }

            hotelsHtml += '</ul></div>';
        }

        if (typeof _response.places != 'undefined' && _response.places.length > 0) {
            places = _response.places;
            placesHtml = '<div class="h24-regions"><span class="h24-item-type">Места:</span> <ul class="h24-autocomplite">';

            for (i = 0; i < _response.places.length; i++) {
                placesHtml += '<li class="acResult" data-type="place" data-value="' + _response.places[i].placeId + '">'/* + response.places[i].placeType + ' '*/ + _response.places[i].cityName + '</li>';
            }

            placesHtml += '</ul></div>';
        }

        //var element = jQuery(resultBlockId);
        var element = document.getElementById(resultBlockId);

        var html = citiesHtml + placesHtml + regionsHtml + hotelsHtml;


        if (html === '') {
            html = 'Уточните направление!';
        }
        element.innerHTML = html;

        ln.updateList();
        element.style.display = 'block';

        //var searchItem = jQuery(resultBlockId + ' li');
        var searchItem = document.querySelectorAll('#' + resultBlockId + ' li');

        //var isWorld = (resultBlockId === '#h24SearchResultWorld');

        response = _response;

        for (i = 0; i < searchItem.length; i++) {
            searchItem[i].addEventListener('click', listClick);
        }

    }

    function setText(text) {
        document.getElementById('h24QueryString').value = text;
    }

    function setParams(type, id, routes) {
        var key = '';
        switch (type) {
            case 'city':
                key = 'cityRoute';
                break;
            case 'region':
                key = 'regionRoute';
                break;
            case 'hotel':
                key = 'hotelRoute';
                break;
            case 'place':
                key = 'placeRoute';
                break;
        }
        document.getElementById('h24TargetField').value = routes[key].target;
        document.getElementById('h24EventField').value = routes[key].event;

        var idElement = document.getElementById('h24IdField');
        idElement.setAttribute('name', routes[key].key);
        idElement.value = id;
        var form = idElement.form;
        if (type === 'place') {
            for (var index in places) {
                if (places[index].placeId === id) {
                    if (places[index].cityId) {
                        cityOrRegionId.name = 'city_id'
                        cityOrRegionId.value = places[index].cityId;
                        break;
                    }
                    if (places[index].regionId) {
                        cityOrRegionId.name = 'region_id'
                        cityOrRegionId.value = places[index].regionId;
                        break;
                    }
                }
            }
            geocodeS.value = document.getElementById('h24QueryString').value;
            form.appendChild(cityOrRegionId);
            form.appendChild(geocodeS);
        } else {
            cityOrRegionId.parentNode && form.removeChild(cityOrRegionId);
            geocodeS.parentNode && form.removeChild(geocodeS);
        }
    }

    function closeList() {
        var elements = [
            document.getElementById('h24SearchResult')
            //, document.getElementById('h24SearchResultWorld') //todo
        ];

        for (var i = 0; i < elements.length; i++) {
            var element = elements[i];
            element.style.display = 'none';
            element.innerHTML = '';
        }
    }

    function listClick(e) {
        var element = this;
        var dataSet = element.dataset;
        var dataType = dataSet.type;
        var dataId = dataSet.value;
        setText(stripTags(element.innerHTML));
        setParams(dataType, dataId, response.route);
        closeList();
    }

    function stripTags(str) {
        return str.replace(/<span[^>]*>.*<\/?span>/g, '').replace(/<\/?[^>]+>/gi, '');
    }

    this.handle = handle;
};

//-----autocompleaterend-----//

//-----handler-----//


function Handler(host, xmlHttp, _autocomplete, searchString) {
    var url = host + '/api/search/?q=' + encodeURIComponent(searchString);
    var autocomplete = _autocomplete;
    xmlHttp.sendRequest("GET", url, showCompleter);

    function showCompleter(responseText) {
        var response = JSON.parse(responseText);
        autocomplete.handle(response, 'h24SearchResult');
    }
};

var personCount = {

    'maxPersons': 20,
    'minPersons': 1,

    'inc': function () {
        var field = document.getElementById('search_count');
        var value = field.value;
        if (value < this.maxPersons) {
            field.value++;
        }
        return false;
    },

    'dec': function () {
        var field = document.getElementById('search_count');
        var value = field.value;
        if (value > this.minPersons) {
            field.value--;
        }
        return false;
    }

};
//----end handler----//

//----bootstrap----//
window.onload = (function (Pikaday) {
    var xmlHttp = new Hotels24XmlHttp();

    var autocomplete = new Autocomplete();

    var element = document.getElementById('h24QueryString');

    element.addEventListener('input', function (e) {
        xmlHttp.abortRequest();
        var acResults = document.getElementById('h24SearchResult');
        if (this.value !== '') {
            var handler = new Handler('//affiliate.hotels24.' + Config.getEnv(), xmlHttp, autocomplete, this.value);
        }
        acResults.style.display = 'none';
        acResults.innerHTML = '';
        ln.updateList();
    });

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    var arrivalDate = document.getElementById('h24ArrivalDate');

    var dateStart = new Pikaday(
        {
            field: arrivalDate,
            firstDay: 1,
            minDate: new Date(),
            maxDate: new Date('2020-12-31'),
            yearRange: [2000, 2020],
            format: 'DD.MM.YYYY'
        });
    var dateEnd = new Pikaday(
        {
            field: document.getElementById('h24DepartureDate'),
            firstDay: 1,
            minDate: tomorrow,
            maxDate: new Date('2020-12-31'),
            yearRange: [2000, 2020],
            format: 'DD.MM.YYYY'
        });

    arrivalDate.onblur = function () {
        var pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
        var minDateEnd = new Date(this.value.replace(pattern, '$3-$2-$1'));
        minDateEnd.setDate(minDateEnd.getDate() + 1);
        dateEnd.setMinDate(minDateEnd);
    };

})(Pikaday);
//----end bootstrap----//

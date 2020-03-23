$(document).ready(function() {
    google.charts.load('current', {packages: ['table', 'corechart']});
    google.charts.setOnLoadCallback(load);

    var location = 'FRA';
    var locations = [];
    var data = [];

    function load() {
        $.get('https://raw.githubusercontent.com/opencovid19-fr/data/master/dist/chiffres-cles.json', function (response) {
            var tmpLocations = [];
            JSON.parse(response).forEach(function (value) {
                if (!data[value.code]) {
                    data[value.code] = [];
                }
                if (!tmpLocations[value.code]) {
                    var locationNom = value.nom;
                    if ('WORLD' === value.code) {
                        locationNom = '-- Monde';
                    }
                    if ('FRA' === value.code) {
                        locationNom = '-- France';
                    }
                    tmpLocations[value.code] = locationNom;
                }
                data[value.code][value.date] = {
                    date: value.date,
                    casConfirmes: value.casConfirmes || null,
                    hospitalises: value.hospitalises || null,
                    reanimation: value.reanimation || null,
                    deces: value.deces || null,
                };
            });
            for (var tmpLocationCode in tmpLocations) {
                var tmpLocationNom = tmpLocations[tmpLocationCode];
                locations.push({
                    code: tmpLocationCode,
                    nom: tmpLocationNom
                });
            }
            locations.sort(keysrt('nom'));
            drawSelector();
            draw();
        });
    }

    function draw() {
        drawChart();
        drawTable();
    }

    function drawSelector() {
        var selector = document.querySelector('#location');
        selector.addEventListener('change', function (event, el) {
            location = event.target.value;
            draw();
        });
        for (var index in locations) {
            var option = document.createElement('option');
            option.value = locations[index].code;
            option.innerText = locations[index].nom + ' (' + locations[index].code + ')';
            selector.append(option);
        }
    }
    
    function drawTable() {
        var datatable = new google.visualization.DataTable();
        datatable.addColumn('string', 'Date');
        datatable.addColumn('number', 'Confirmés');
        datatable.addColumn('number', 'Hospitalisés');
        datatable.addColumn('number', 'En réanimation');
        datatable.addColumn('number', 'Décès');
        datatable.addRows(getRows());

        var table = new google.visualization.Table(document.getElementById('datatable'));
        table.draw(datatable, {showRowNumber: true, width: '100%', height: '100%'});
    }

    function drawChart() {
        var rows = [
            [ 'Date', 'Confirmés', 'Hospitalisés', 'En réanimation', 'Décès' ]
        ];
        rows = rows.concat(getRows(true));

        var chart = new google.visualization.LineChart(document.getElementById('chart'));
        chart.draw(google.visualization.arrayToDataTable(rows));
    }

    function getRows(last) {
        var rows = [];
        var lastCasConfirmes = 0;
        var lastHospitalises = 0;
        var lastReanimation = 0;
        var lastDeces = 0;
        for (var date in data[location]) {
            var item = data[location][date];
            var casConfirmes = item.casConfirmes;
            var hospitalises = item.hospitalises;
            var reanimation = item.reanimation;
            var deces = item.deces;
            if (last) {
                casConfirmes = item.casConfirmes || lastCasConfirmes;
                hospitalises = item.hospitalises || lastHospitalises;
                reanimation = item.reanimation || lastReanimation;
                deces = item.deces || lastDeces;
            }
            rows.push([
                item.date,
                casConfirmes,
                hospitalises,
                reanimation,
                deces
            ]);
            lastCasConfirmes = casConfirmes;
            lastHospitalises = hospitalises;
            lastReanimation = reanimation;
            lastDeces = deces;
        }

        return rows;
    }

    function keysrt(key) {
        return function(a,b){
            if (a[key] > b[key]) return 1;
            if (a[key] < b[key]) return -1;
            return 0;
        }
    }
});

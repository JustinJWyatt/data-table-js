Element.prototype.toDataTable = function (options)
{
    var element = this;

    var table = document.createElement('table');

    table.classList.add('table', 'table-bordered');

    var columns = [], rows = [];

    if (options.ajax)
    {
        var request = new XMLHttpRequest();

        request.onreadystatechange = function() {

            if (this.readyState == 4 && this.status == 404){
                throw 'Request failed.';
            }

            if (this.readyState == 4 && this.status == 200) {

                let response = JSON.parse(this.responseText);

                if (!Array.isArray(response))
                {
                    throw 'The response object must be an array.';
                }

                for (var i = 0; i < response.length; i++)
                {
                    var rowData = {
                        data: []
                    };

                    var keys = Object.keys(response[i]);

                    var tr = document.createElement('tr');

                    if (i === 0)
                    {
                        var thead = document.createElement('thead');

                        keys.forEach(function (value, position)
                        {
                            var th = document.createElement('th');

                            var text = document.createTextNode(value);

                            th.appendChild(text);

                            tr.appendChild(th);

                            columns.push({
                                id: position,
                                data: {
                                    name: value,
                                    element: th
                                }
                            });
                        });

                        thead.appendChild(tr);

                        table.appendChild(thead);

                        continue;
                    }

                    keys.forEach(function (value, position)
                    {
                        var td = document.createElement('td');

                        var text = document.createTextNode(response[i][value]);

                        rowData.data.push({ data: response[i][value], column: position, row: i });

                        td.appendChild(text);

                        tr.appendChild(td);
                    });

                    tbody.appendChild(tr);

                    rows.push(rowData);
                }

                table.appendChild(tbody);

                if (options.search)
                {
                    var input = document.createElement('input');

                    input.setAttribute('type', 'text');
                    input.setAttribute('placeholder', 'Search');

                    input.addEventListener('keyup', function (event)
                    {
                        var textValue = this.value;

                        for (i = 0; i < tbody.rows.length; i++)
                        {
                            var row = tbody.rows[i].getElementsByTagName('td');

                            var counter = 0;

                            for (var j = 0; j < row.length; j++)
                            {
                                var td = row[j];

                                if (td.innerHTML.toString().toLowerCase().indexOf(textValue.toLowerCase()) > -1)
                                {
                                    counter++;
                                }
                            }

                            if (counter > 0)
                            {
                                tbody.rows[i].style.display = '';
                            } else
                            {
                                tbody.rows[i].style.display = 'none';
                            }
                        }
                    });

                    element.appendChild(input);
                }

                for (var button in options.buttons)
                {
                    var span = document.createElement('span');

                    switch (options.buttons[button].type)
                    {
                        case 'copy':

                            span.innerHTML = options.buttons[button].icon || 'copy';

                            span.addEventListener('click', function ()
                            {
                                var textArea = document.createElement('textarea');

                                textArea.value = table.innerHTML;  //still have to figure out how to get data without html

                                textArea.setAttribute('readonly', '');

                                textArea.style = {
                                    display: 'none'
                                };

                                document.body.appendChild(textArea);

                                textArea.select();

                                document.execCommand('copy');

                                document.body.removeChild(textArea);
                            });
                            break;
                        case 'print':
                            span.innerHTML = options.buttons[button].icon || 'print';

                            span.addEventListener('click', function ()
                            {
                                var script = `<script>setTimeout('step2()', 1);function step2(){window.print();window.close();}<\/script>`;

                                //imports bootstrap stylesheet
                                print = `<body onload='step1()'><link rel="stylesheet" type="text/css" href="/content/css/bootstrap.min.css"/></body>`;

                                print += element.innerHTML; //still have to figure out how to remove input from print

                                print += script + `</body></html>`;

                                var page = window.open('about:blank', '_new');
                                page.document.open();
                                page.document.write(print);
                                page.document.close();
                            });
                            break;
                        case 'csv':
                            span.innerHTML = options.buttons[button].icon || 'csv';

                            //I'm going to refactor this function to make the variables readable
                            //and so I can make comments appropriately
                            var tableToExcel = (function ()
                            {
                                var uri = 'data:application/vnd.ms-excel;base64,',
                                    template = `<html xmlns:o="urn:schemas-microsoft-com:office:office"
                                                      xmlns:x="urn:schemas-microsoft-com:office:excel"
                                                      xmlns="http://www.w3.org/TR/REC-html40">
                                                <head>
                                                <!--[if gte mso 9]>
                                                    <xml>
                                                        <x:ExcelWorkbook>
                                                            <x:ExcelWorksheets>
                                                                <x:ExcelWorksheet>
                                                                    <x:Name>{worksheet}</x:Name>
                                                                    <x:WorksheetOptions>
                                                                        <x:DisplayGridlines/>
                                                                    </x:WorksheetOptions>
                                                                </x:ExcelWorksheet>
                                                            </x:ExcelWorksheets>
                                                        </x:ExcelWorkbook>
                                                        </xml>
                                                <![endif]-->
                                                </head>
                                                <body>
                                                    <table>{table}</table>
                                                </body>
                                                </html>`,
                                    base64 = function (s) { return window.btoa(unescape(encodeURIComponent(s))); },
                                    format = function (s, c) { return s.replace(/{(\w+)}/g, function (m, p) { return c[p]; }); };
                                return function (table)
                                {
                                    var obj = { worksheet: 'Worksheet', table: table.innerHTML };
                                    window.location.href = uri + base64(format(template, obj));
                                };
                            })();

                            span.addEventListener('click', function ()
                            {
                                tableToExcel(table);
                            });
                            break;
                        default:
                    }

                    element.appendChild(span);
                }
                
                element.appendChild(table);

            }
        };

        request.open(options.ajax.method, options.ajax.url, options.ajax.async || true);

        request.send();
    }
    else
    {
        throw 'Must have ajax options.';
    }

    return {
        get rows()
        {
            return rows;
        },
        get columns()
        {
            return columns;
        },
        get table()
        {
            return table;
        },
        refresh: function (ajax)
        {
            if (!ajax)
            {
                return;
            }

            options.ajax = ajax;

            this.destroy();

            return element.toDataTable(options); //gives you back new object
        },
        destroy: function ()
        {
            element.innerHTML = '';
        }
    };
};

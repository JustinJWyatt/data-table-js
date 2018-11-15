# Datatable.js
This is a simple datatable API written in pure JavaScript.

## Installing
```
  <script src="datatable.js"></script>
```

## Usage

Initialize your element

```
  var tableElement = document.getElementById('table');
```

Append data table.

```
  var dataTable = tableElement.toDataTable();
```

Complete example.

```
  var dataTable = tableElement.toDataTable({
  
    search: true,
    buttons: [
      type: 'print',
      icon: '<i class="fa fa-print"></i>'
    ],
    data: [
      { id: 1, name: 'Smith', occupation: 'Welder' }    
    ]
  })
```

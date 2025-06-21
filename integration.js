let switchsingle = document.getElementById('single');
switchsingle.addEventListener('click', function() {
  document.getElementById('css').innerHTML = 'input {width: 100px;}.small {color: #aaa;}.trbd {width: 250px;}.multi{display: none;}.singleswitch{display: none;}';
});

let switchmulti = document.getElementById('multi');
switchmulti.addEventListener('click', function() {
  document.getElementById('css').innerHTML = 'input{width: 50px;}.small {color: #ddd;}.single{display: none;}.multiswitch{display: none;}';
});

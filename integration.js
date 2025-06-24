//モード変更
let switchsingle = document.getElementById('single');
switchsingle.addEventListener('click', function () {
  document.getElementById('css').innerHTML = 'input {width: 100px;}.trbd {width: 250px;}.multi{display: none;}.singleswitch{display: none;}';
});

let switchmulti = document.getElementById('multi');
switchmulti.addEventListener('click', function () {
  document.getElementById('css').innerHTML = 'input{width: 50px;}.single{display: none;}.multiswitch{display: none;}';
});

//CSS変更
let switchradarsite = document.getElementById('radarsite');
switchradarsite.addEventListener('click', function () {
  document.getElementById('RM').setAttribute('href', 'radarsite.css');
});

let switchmoonlight = document.getElementById('moonlight');
switchmoonlight.addEventListener('click', function () {
  document.getElementById('RM').setAttribute('href', 'moonlight.css');
});

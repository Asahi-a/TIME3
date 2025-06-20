function loadPage(htmlPath, scriptPath) {
  fetch(htmlPath)
    .then(res => res.text())
    .then(html => {
      document.getElementById('container').innerHTML = html;

      // 古いスクリプトが残らないように一度削除
      const oldScript = document.getElementById('dynamicScript');
      if (oldScript) oldScript.remove();

      // 新しいスクリプトを追加
      const script = document.createElement('script');
      script.src = scriptPath;
      script.id = 'dynamicScript';
      document.body.appendChild(script);
    });
}

document.getElementById('loadV5multi').addEventListener('click', () => {
  loadPage('container.V5.multi.html', 'TIMEV5.multi.js');
});

document.getElementById('loadV5').addEventListener('click', () => {
  loadPage('container.V5.html', 'TIMEV5.js');
});

document.getElementById('loadV4').addEventListener('click', () => {
  loadPage('container.V4.html', 'TIMEV4.js');
});

window.addEventListener('DOMContentLoaded', () => {
  loadPage('container.V5.multi.html', 'TIMEV5.multi.js');
});

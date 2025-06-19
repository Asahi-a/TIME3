function loadPage(htmlPath, scriptPath) {
  fetch(htmlPath)
    .then(res => res.text())
    .then(html => {
      document.getElementById('content').innerHTML = html;

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

document.getElementById('loadA').addEventListener('click', () => {
  loadPage('A.html', 'A.js');
});

document.getElementById('loadB').addEventListener('click', () => {
  loadPage('B.html', 'B.js');
});

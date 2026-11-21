/* Phosphor Icons web v2.1.1 (offline copy): loads the regular, bold and fill weights from ./phosphor/ next to this script. */
(function () {
  var cur = document.currentScript;
  var base = cur && cur.src ? cur.src.replace(/[^\/]*$/, '') : 'vendor/';
  var head = document.head || document.getElementsByTagName('head')[0];
  ['regular', 'bold', 'fill'].forEach(function (w) {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = base + 'phosphor/' + w + '/style.css';
    head.appendChild(link);
  });
})();

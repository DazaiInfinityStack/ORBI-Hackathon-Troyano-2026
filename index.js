var picture = require('cat-picture')
var src = picture.src
picture.remove()
var image = require('lightning-image-poly')
var viz = new image('#visualization', null, [src], {hullAlgorithm: 'convex'})
var remote = require('@electron/remote')
var fs = require('fs')

function save () {
  var win = remote.getCurrentWindow()
  win.webContents.printToPDF({
    portrait: true
  }).then(function (data) {
    fs.writeFile('annotation.pdf', data, function (err) {
      if (err) alert('error generating pdf! ' + err.message)
      else alert('pdf saved!')
    })
  }).catch(function (err) {
    alert('error generating pdf! ' + err.message)
  })
}

window.addEventListener('keydown', function (e) {
  console.log('tecla presionada:', e.keyCode)
  if (e.keyCode == 80) save()
})
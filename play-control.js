const audio = document.getElementById('music')
const start = document.querySelector('.progress-start')
const end = document.querySelector('.progress-end')
const progressBar = document.querySelector('.progress-bar')
const now = document.querySelector('.progress-now')
const playButton = document.querySelector('.play-pause-button') // play button is img
const selectButton = document.querySelector('.select-button')
const titleAuthor = document.querySelector('.song-title-author')
const album = document.querySelector('.song-album')
const songImage = document.querySelector('.player-img')
const closeButton = document.getElementById('close')
const minimizeButton = document.getElementById('minimize')

const { dialog, getCurrentWindow } = require('@electron/remote')
const music = require('music-metadata')

/**
 * Convert seconds to mm:ss
 * @param {Int} value the current time of the song (in seconds)
 * @returns the time in minutes and seconds as a string
 */
function conversion (value) {
  let minute = Math.floor(value / 60)
  minute = minute.toString().length === 1 ? ('0' + minute) : minute
  let second = Math.round(value % 60)
  second = second.toString().length === 1 ? ('0' + second) : second
  return `${minute}:${second}`
}

audio.onloadedmetadata = function () {
  end.innerHTML = conversion(audio.duration)
  start.innerHTML = conversion(audio.currentTime)
}

function play () {
  audio.play()
  playButton.src = './assets/pause.png'
  playButton.classList.add('pause')
}

function pause() {
    audio.pause()
    playButton.src = './assets/play.png'
    playButton.classList.remove('pause')
}

function setSongInfo(title, author, alb) {

    titleAuthor.innerHTML = `${title ? title : 'Unknown'} - ${author ? author : 'Unknown'}`
    album.innerHTML = alb ? alb : 'Unknown'

}

progressBar.addEventListener('click', function (event) {
  let coordStart = this.getBoundingClientRect().left
  let coordEnd = event.pageX
  let p = (coordEnd - coordStart) / this.offsetWidth
  now.style.width = p.toFixed(3) * 100 + '%'

  audio.currentTime = p * audio.duration
  audio.play()
})

playButton.addEventListener('click', function(event) {

    if(audio.paused) {
        audio.play()
        // change image source
        playButton.src = './assets/pause.svg'
    }else {
        audio.pause()
        // change image source
        playButton.src = './assets/play.svg'
    }

})

function loadSong(file) {

    audio.src = file
    music.parseFile(file).then(metadata => {
        setSongInfo(metadata.common.title, metadata.common.artist, metadata.common.album)

        if(!metadata.common.picture) {
            songImage.src = './assets/no-image.png'
        }else {
            // convert the image data to base64
            let base64 = metadata.common.picture[0].data.toString('base64')
            let image = `data:${metadata.common.picture[0].format};base64,${base64}`

            // set the image source
            songImage.src = image
        }

    }).catch(err => {
        console.log(err)
    })

}

selectButton.addEventListener('click', function(event) {

    audio.pause(); // pause current audio
    playButton.src = './assets/play.svg' // change image source

    dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: 'Audio Files', extensions: ['mp3', 'wav'] }
        ]
    }).then(result => {
        if(result.canceled) return;
        loadSong(result.filePaths[0])
    })

})
setInterval(() => {
  start.innerHTML = conversion(audio.currentTime)
  now.style.width = audio.currentTime / audio.duration.toFixed(3) * 100 + '%'
}, 1000)

closeButton.addEventListener('click', function(event) {
    pause();

    // close the window
    getCurrentWindow().close();
})

minimizeButton.addEventListener('click', function(event) {
    pause();

    // minimize the window
    getCurrentWindow().minimize();
})

dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [
        { name: 'Audio Files', extensions: ['mp3', 'wav'] }
    ]
}).then(result => {
    if(result.canceled) return;
    loadSong(result.filePaths[0])
})
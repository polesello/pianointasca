const TOTAL_ANGLE = 360
const R_MAX = 146
const R_MIN = 30

const schema = document.getElementById('schema')
const calibration = document.getElementById('calibration')
const canvas = document.querySelector('#schema g')

let playing = false
let alpha0 = 0
let currentAlpha = 0
let lastPlayed = null
let totalNotes = 8

let NOTE_SOUNDS = ['c4', 'd4', 'e4', 'f4', 'g4', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'a6', 'b6', 'c6']
let NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']



function createSchema(totalNotes) {
    const sectorAngleDeg = TOTAL_ANGLE / totalNotes


    canvas.innerHTML = ''
    for (let i=0; i < totalNotes; i++) {
        const sectorAngle = TOTAL_ANGLE / totalNotes * Math.PI / 180
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path')
        const currAngle = (TOTAL_ANGLE / totalNotes * i - 90 - sectorAngleDeg / 2) * Math.PI / 180
        const sector = `M ${R_MIN * Math.cos(currAngle)} ${R_MIN * Math.sin(currAngle)} L ${R_MAX * Math.cos(currAngle)} ${R_MAX * Math.sin(currAngle)} A ${R_MAX} ${R_MAX} 0 0 1 ${R_MAX * Math.cos(currAngle + sectorAngle)} ${R_MAX * Math.sin(currAngle + sectorAngle)} L ${R_MIN * Math.cos(currAngle + sectorAngle)} ${R_MIN * Math.sin(currAngle + sectorAngle)} A ${R_MIN} ${R_MIN} 0 0 0 ${R_MIN * Math.cos(currAngle)} ${R_MIN * Math.sin(currAngle)}`
        path.setAttribute('d', sector)
        path.setAttribute('stroke', 'black')
        path.setAttribute('fill', 'hsl(' + (i * 360 / totalNotes) + ', 100%, 70%)')
        path.setAttribute('notesound', NOTE_SOUNDS[i])
        path.setAttribute('noteindex', i)
        canvas.appendChild(path)

        // add note name
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text')
        const x = (R_MAX - 30) * Math.cos(currAngle + sectorAngle / 2)
        const y = (R_MAX - 30) * Math.sin(currAngle + sectorAngle / 2)
        text.setAttribute('x', x)
        text.setAttribute('y', y)
        text.setAttribute('text-anchor', 'middle')
        text.setAttribute('dominant-baseline', 'middle')
        //text.setAttribute('fill', 'black')
        //text.setAttribute('font-size', '12')
        text.setAttribute('transform', 'rotate(' + (i * TOTAL_ANGLE / totalNotes ) + ',' + x + ',' + y + ')')
        text.innerHTML = NOTE_NAMES[i]
        canvas.appendChild(text)

        document.querySelectorAll('.player')[i].setAttribute('src', 'notes/' + NOTE_SOUNDS[i] + '.mp3')
    }

    document.querySelectorAll('#schema path').forEach((el) => el.addEventListener('click', (event) => {
        document.querySelectorAll('.player')[event.target.getAttribute('noteindex')].play()
        event.target.classList.add('active')
        setInterval(() => event.target.classList.remove('active'), 1000)
    }))

    document.querySelectorAll('#schema path').forEach((el) => el.addEventListener('mouseenter', (event) => {
        document.querySelectorAll('.player')[event.target.getAttribute('noteindex')].play()
        event.target.classList.add('active')
        setInterval(() => event.target.classList.remove('active'), 1000)
    }))
}

createSchema(totalNotes)


function updateNote(event) {
    const alpha = event.alpha

    currentAlpha = alpha
    const beta = event.beta

    let angle = alpha0 - event.alpha
    if (angle < 0) angle += 360

    canvas.setAttribute('transform', 'rotate(' + -angle + ', 180, 180) translate(180,180)')

    let angleWidth = TOTAL_ANGLE / totalNotes
    let index = Math.floor((angle + angleWidth / 2) / angleWidth)
    if (index == totalNotes) index = 0

    const currentNote = document.querySelectorAll('#schema path')[index]
    document.querySelectorAll('#schema path').forEach((el) => el.classList.remove('candidate'))
    if (!currentNote.classList.contains('active')) currentNote.classList.add('candidate')

    const note_name = NOTE_SOUNDS[index]

    if (beta > -30) {
        if (lastPlayed == note_name) return
        if (lastPlayed != note_name) {
            document.querySelectorAll('.player')[index].play()
            playing = true
            lastPlayed = note_name
            document.querySelectorAll('#schema path').forEach((el) => el.classList.remove('active', 'candidate'))
            currentNote.classList.add('active')
        } 
    } else {
        if (playing) {
            playing = false
            lastPlayed = null
            document.querySelectorAll('#schema path').forEach((el) => el.classList.remove('active', 'candidate'))
        } 
    }
}







// in iOS va richiesto il permesso
let permissionGranted = false

function getPermission () {
    if (!permissionGranted) {
        DeviceMotionEvent.requestPermission()
            .then(response => {
                if (response == "granted") {
                    permissionGranted = true
                    window.addEventListener('deviceorientation', updateNote)
                }
        })
    }
}

let needPermission = false
if (typeof(DeviceOrientationEvent) !== "undefined" && typeof(DeviceOrientationEvent.requestPermission) === "function") {
    // iPhone
    needPermission = true
} else {
    // Android
    document.querySelector('.only-ios').style.display = 'none'
    window.addEventListener('deviceorientation', updateNote)
}


calibration.addEventListener('click', () => {
    if (needPermission) {
        getPermission()
    }
    alpha0 = currentAlpha.toFixed(0)
})
 
document.getElementById('show-info').addEventListener('click', (event) => {
    event.preventDefault()
    document.getElementById('instructions').style.left = '0'
})

document.getElementById('close-instructions').addEventListener('click', (event) => {
    event.preventDefault()
    document.getElementById('instructions').style.left = '100vw'
})

document.getElementById('mode').addEventListener('change', (event) => {
    totalNotes = event.target.value
    if (totalNotes == '12') {
        NOTE_SOUNDS = ['c4', 'c-4', 'd4', 'd-4', 'e4', 'f4', 'f-4', 'g4', 'g-4', 'a5', 'a-5', 'b5', 'c5']
        NOTE_NAMES = ['C', 'C♯', 'D', 'D♯', 'E', 'F', 'F♯', 'G', 'G♯', 'A', 'A♯', 'B', 'C']
    } else if (totalNotes == '2') {
        NOTE_SOUNDS = ['c4', 'c5']
        NOTE_NAMES = ['C', 'C']
    } else if (totalNotes == '3') {
        NOTE_SOUNDS = ['fart1', 'fart2', 'fart3']
        NOTE_NAMES = ['Fart 1', 'Fart 2', 'Fart 3']
    } else if (totalNotes == '4') {
        NOTE_SOUNDS = ['amour1', 'amour2', 'amour3', 'amour4']
        NOTE_NAMES = ['Bar 1', 'Bar 2', 'Bar 3', 'Bar 4']
    } else if (totalNotes == '17') {
        NOTE_SOUNDS = ['e5', 'd-5', 'e5', 'd-5', 'e5', 'b5', 'd5', 'c5', 'a5', 'c4', 'e4', 'a5', 'b5', 'e4', 'g-4', 'b5', 'c5']
        NOTE_NAMES = ['E', 'D♯', 'E', 'D♯', 'E', 'B', 'D', 'C', 'A', 'C', 'E', 'A', 'B', 'E', 'G♯', 'B', 'C']
    }    
    else {
        NOTE_SOUNDS = ['c4', 'd4', 'e4', 'f4', 'g4', 'a5', 'b5', 'c5', 'd5', 'e5', 'f5', 'g5', 'a6', 'b6', 'c6']
        NOTE_NAMES = ['C', 'D', 'E', 'F', 'G', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'A', 'B', 'C']
    }
    createSchema(totalNotes)
})

// if ('serviceWorker' in navigator) {
//     navigator.serviceWorker.register('/sw.js').then(function(
//         registration) {
//         console.log('Registration successful, scope is:',
//             registration.scope)
//     }).catch(function(error) {
//         console.log(
//             'Service worker registration failed, error:',
//             error);
//     })
// }
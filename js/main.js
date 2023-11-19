const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_KEY = 'F8_PLAYER';

const player = $('.player');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const cd = $('.cd');
const playBtn = $('.btn-toggle-play');
const progress = $('#progress');
const nextBtn = $('.btn-next');
const prevBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');
const playlist = $('.playlist');

const app = {
    config : JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs: [
        {
            name: 'Animals',
            singer: 'Maroon 5',
            path: './assets/mp3/Animals.mp3',
            image: './assets/image/Animals.jpg'
        },
        {
            name: 'Blinding_Lights',
            singer: 'The Weeknd',
            path: './assets/mp3/Blinding_Lights.mp3',
            image: './assets/image/Blinding_Lights.png'
        },
        {
            name: 'Chieu_Thu_Hoa_Bong_Nang',
            singer: 'DatKaa',
            path: './assets/mp3/Chieu_Thu_Hoa_Bong_Nang.mp3',
            image: './assets/image/Chieu_Thu_Hoa_Bong_Nang.jpg'
        },
        {
            name: 'Counting_Stars',
            singer: 'OneRepublic',
            path: './assets/mp3/Counting_Stars.mp3',
            image: './assets/image/Counting_Stars.jpg'
        },
        {
            name: 'De_Vuong',
            singer: 'DinhDung',
            path: './assets/mp3/De_Vuong.mp3',
            image: './assets/image/De_Vuong.jpg'
        },
        {
            name: 'Dong_Phai_Mo_Dang_Ai ',
            singer: 'DatKaa',
            path: './assets/mp3/Dong_Phai_Mo_Dang_Ai.mp3',
            image: './assets/image/Dong_Phai_Mo_Dang_Ai.jpg'
        },
        {
            name: 'Maps',
            singer: 'Maroon 5',
            path: './assets/mp3/Maps.mp3',
            image: './assets/image/Maps.jpg'
        },
        {
            name: 'Qua_Phu_Tuong',
            singer: 'DungHoangPham',
            path: './assets/mp3/Qua_Phu_Tuong.mp3',
            image: './assets/image/Qua_Phu_Tuong.jpg'
        },
        {
            name: 'Roi_Remix',
            singer: 'TrungQuanIdol ft HangBingBoong',
            path: './assets/mp3/Roi_Remix.mp3',
            image: './assets/image/Roi_Remix.png'
        },
        {
            name: 'Save_Your_Tears',
            singer: 'The Weeknd',
            path: './assets/mp3/Save_Your_Tears.mp3',
            image: './assets/image/Save_Your_Tears.png'
        },
        {
            name: 'Thuyen_Quyen',
            singer: 'DieuKien',
            path: './assets/mp3/Thuyen_Quyen.mp3',
            image: './assets/image/Thuyen_Quyen.jpg'
        },
        {
            name: 'Tinh_Thu_Sao_Ha_Buon',
            singer: 'DatKaa',
            path: './assets/mp3/Tinh_Thu_Sao_Ha_Buon.mp3',
            image: './assets/image/Tinh_Thu_Sao_Ha_Buon.jpg'
        }
    ],
    setConfig: function(key, value) {                
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config));
    }
}
// Var for apps
var currentIndex = 0;
var isPlaying = false;
var isRandom = false;
var isRepeat = false;

function defineProperties() {
    Object.defineProperty(app, 'currentSong', {
        get: function() {
            return app.songs[currentIndex];
        }
    })
}
function handleEvents(){
    const cdWidth = cd.offsetWidth;
    // Zoom in/out CD
    document.onscroll = function() {
        const crollTop = window.scrollY || document.documentElement.scrollTop;
        const newCdWidth = cdWidth - crollTop;
        cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
        cd.style.opacity = newCdWidth / cdWidth;

    }

    //Cd rotate
    const cdThumdAnime = cdThumb.animate([
        {
            transform : 'rotate(360deg)'
        }
    ], {
        duration : 10000, //10 seconds
        iterations : Infinity
    })
    cdThumdAnime.pause();
    // Event play audio
    playBtn.onclick = function() {
        if(isPlaying) {
            audio.pause();
        } else {
            audio.play();
        }
    }
    // Song playing
    audio.onplay = function() {
        isPlaying = true;
        player.classList.add('playing');
        cdThumdAnime.play();
    }
    // Song pause
    audio.onpause = function() {
        isPlaying = false;
        player.classList.remove('playing');
        cdThumdAnime.pause();
    }
    // Progress song change
    audio.ontimeupdate = function() {
        if(audio.duration){
            const progressPercent = Math.floor(audio.currentTime / audio.duration * 100);
            progress.value = progressPercent;
        }
    }
    // Seek song
    progress.onchange = function(e) {
       const seekTime =  audio.duration * e.target.value / 100;
       audio.currentTime = seekTime;
    }
    //Next song
    nextBtn.onclick = function() {
        if(isRandom) {
            playRandomSong();
        } else {
            nextSong();
        }
        audio.play();
        render();
        scrollToActiveSong();
    }
    //Prev song
    prevBtn.onclick = function() {
        if(isRandom) {
            playRandomSong();
        } else {
            prevSong();
        }
        audio.play();
        render();
        scrollToActiveSong();
    }
    //Random on/off
    randomBtn.onclick = function() {
        isRandom = !isRandom;
        randomBtn.classList.toggle('active', isRandom);
    }
    //Audio ended
    audio.onended = function() {
        if(isRepeat) {
            audio.play();
        } else {
            nextBtn.click();
        }
    }
    // Repeat on/off
    repeatBtn.onclick = function() {
        isRepeat = !isRepeat;
        repeatBtn.classList.toggle('active', isRepeat);
    }
    // Choose song
    playlist.onclick = function(e) {
        const songNode = e.target.closest('.song:not(.active)');
        if(songNode || e.target.closest('.option')) {
            //Click song
            if(songNode) {
                currentIndex = Number(songNode.dataset.index);
                loadCurrentSong();
                render();
                audio.play();
            }

            //Click option
            if(e.target.closest('.option')){

            }
        }
    }
}
function render() {
    const htmls = app.songs.map( (song, index) => {
        return `
            <div class="song ${index === currentIndex ? 'active' : ''}" data-index=${index} >
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
            <div class="body">
                <h3 class="title">${song.name}</h3>
                <p class="author">${song.singer}</p>
            </div>
            <div class="option">
                <i class="fas fa-ellipsis-h"></i>
            </div>
            </div>
        `
    });
    playlist.innerHTML =  htmls.join('');
};
function scrollToActiveSong() {
    setTimeout(() => {
        $('.song.active').scrollIntoView({
            behavior: 'smooth',
            block: 'center'
        }, 300);
    })

}
function loadCurrentSong() {
    heading.textContent = app.currentSong.name;
    cdThumb.style.backgroundImage = `url('${app.currentSong.image}')`;
    audio.src = app.currentSong.path;
}

function nextSong() {
    currentIndex++;
    if(currentIndex >= app.songs.length){
        currentIndex = 0;
    }
    loadCurrentSong();
}
function prevSong() {
    currentIndex--;
    if(currentIndex < 0){
        currentIndex = app.songs.length - 1;
    }
    loadCurrentSong();
}
function playRandomSong() {
    let newIndex;
    do{
        newIndex = Math.floor(Math.random() * app.songs.length);
    } while(newIndex === currentIndex);
    currentIndex = newIndex;
    loadCurrentSong();
}
function start(){ 
    // 
    defineProperties();
    // DOM Events
    handleEvents();

    loadCurrentSong();
    //Render playlist
    render();
};

start();
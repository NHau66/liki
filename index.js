const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAG_KEY = 'HAU_PLAYER'

const player = $('.player')
const cd = $('.cd');
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const prevBtn = $('.btn-prev')
const nextBtn = $('.btn-next')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const playList = $('.playlist')


const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAG_KEY)) || {},
    songs: [
        {
            name: 'Cuộc Sống Em Ổn Không',
            singer: 'Anh Tú',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: 'Dont Waste My Time',
            singer: 'Lil Wuyn, 16 Typh',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: 'Tình Thu Sao Hạ Buồn',
            singer: 'DatKaa',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Buồn của anh',
            singer: 'Đạt G',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        }, 
        {
            name: 'Người Chơi Hệ Đẹp',
            singer: '16 Typh',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: 'Hãy trao cho anh',
            singer: 'Sơn Tùng M-TP',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
        },
        {
            name: 'Chiều Hôm Ấy',
            singer: 'JayKii',
            path: './assets/music/song7.mp3',
            image: './assets/img/song7.jpg'
        },
    ],
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAG_KEY, JSON.stringify(this.config));
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return`
            <div class="song ${index === this.currentIndex ? 'active' : ''}" data-index="${index}">
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
        })
        playList.innerHTML = htmls.join('')
    },
    defineProperties: function () {
        Object.defineProperty(this, "currentSong", {
          get: function () {
            return this.songs[this.currentIndex];
          }
        });
    },
    handleEvents: function() {
        const _this = this;
        const cdWidth = cd.offsetWidth

        // Xử lí CD quay / dừng
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ], {
            duration: 10000, // 10 seconds
            iterations: Infinity
        })
        cdThumbAnimate.pause()

        // Xử lí phóng to/ thu nhỏ
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCdWidth = cdWidth - scrollTop

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0
            cd.style.opacity = newCdWidth / cdWidth
        }

        // Xử lí khi click play
        playBtn.onclick = function () {
            if (_this.isPlaying) {
                audio.pause()
            } else {
                audio.play()
            }
        }

        // Khi song được play
        audio.onplay = function() {
            _this.isPlaying = true
            player.classList.add('playing')
            cdThumbAnimate.play()
        }

        // Khi song bị pause
        audio.onpause = function() {
            _this.isPlaying = false
            player.classList.remove('playing')
            cdThumbAnimate.pause()
        }

        // Khi tiến độ bài hát thay đổi
        audio.ontimeupdate = function() {
            if (audio.duration) {
                const progressPercent = Math.floor(audio.currentTime / audio.duration * 100)
                progress.value = progressPercent
            }
        }

        // Xử lí tua song
        progress.onchange = function(e) {
            const seekTime = audio.duration / 100 * e.target.value
            audio.currentTime = seekTime
        }

        //Khi next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.nextSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        //Khi prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong()
            } else {
                _this.prevSong()
            }
            audio.play()
            _this.render()
            _this.scrollToActiveSong()
        }

        // Xử lí bật / tắt random song
        randomBtn.onclick = function(e) {
            _this.isRandom = !_this.isRandom
            _this.setConfig('isRandom', _this.isRandom)
            randomBtn.classList.toggle('active', _this.isRandom)
        }

        // Xử lí lặp lại một song
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat
            _this.setConfig('isRepeat', _this.isRepeat)
            repeatBtn.classList.toggle('active', _this.isRepeat)

        }
        
        // Xử lí next song khi audio ended
        audio.onended = function() {
            if (_this.isRepeat) {
                audio.play()
            } else {
                nextBtn.click()
            }
        }

        // Lắng nghe hành vi click vào playlist
        playList.onclick = function(e) {
            const songNode = e.target.closest('.song:not(.active)')
            if (songNode || e.target.closest('.option')) {
                // Xử lí khi click vào song
                if (songNode) {
                    _this.currentIndex = Number(songNode.dataset.index)
                    _this.loadCurrentSong()
                    _this.render()
                    audio.play()
                }
            }
        }
    },
    scrollToActiveSong: function() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            })
        }, 300)
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
        audio.src = this.currentSong.path
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom
        this.isRepeat = this.config.isRepeat
    },
    nextSong: function() {
        this.currentIndex++
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0
        }
        this.loadCurrentSong()
    }, 
    prevSong: function() {
        this.currentIndex--
        if (this.currentIndex < 0 ) {
            this.currentIndex = this.songs.length - 1
        }
        this.loadCurrentSong()
    },
    playRandomSong: function() {
        let newIndex
        do {
            newIndex = Math.floor(Math.random() * this.songs.length)
        } while (newIndex === this.currentIndex)

        this.currentIndex = newIndex
        this.loadCurrentSong()
    },
    start: function() {
        //gán cấu hình từ confic vào ứng dụng
        this.loadConfig()
        // Định nghĩa các thuộc tính cho object
        this.defineProperties();

        // Lắng nghe/ xử lí các sự kiện (DOM event)
        this.handleEvents();

        // Tải thông tin bài hát đầu tiên vào UI khi chạy ứng dụng
        this.loadCurrentSong();

        // Render playlist
        this.render();

        // Hiển thị trạng thái ban dầu của button repeat và random
        randomBtn.classList.toggle('active', this.isRandom)
        repeatBtn.classList.toggle('active', this.isRepeat)
    }
}

app.start()
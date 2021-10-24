function rotatePoint(x, y, originX, originY, rotation) {
  const cosA = Math.cos(rotation)
  const sinA = Math.sin(rotation)
  const dx = x - originX
  const dy = y - originY
  return {
    x: originX + dx * cosA + dy * sinA,
    y: originY + dx * sinA - dy * cosA
  }
}

function getRandomArbitrary(min, max) {
  return Math.random() * (max - min) + min
}

class SkillCheck {
  constructor(canvasElement, options = {}) {
    this.isContinuously = options.isContinuously || false
    this.checkTime = options.checkTime || 2000
    this.checkpointDifficulty = options.checkpointDifficulty || 0.08
    this.notifyBefore = options.notifyBefore || 800

    this.canvas = canvasElement
    this.ctx = canvas.getContext('2d')

    this.offscreenCanvas = document.createElement('canvas');
    this.offscreenCanvas.width = '400';
    this.offscreenCanvas.height = '400';
    this.offscreenCtx = this.offscreenCanvas.getContext('2d')

    this.needlePosition = 0.0
    this.needleLastTime = 0

    this.beginningTimestamp = null
    this.currentTimestamp = null

    this.checkpointPosition = 0.0

    this.validStatus = 0
    this.successStatus = 0

    this.delayUntil = null
    this.isDelayed = false

    this.delaySuccessUntil = null
    this.isDelayedSuccess = false

    this.keydown = false
    this.notifyPlayed = false

    this.notifyAudio = new Audio('./notify.mp3')
    this.greatAudio = new Audio('./great.mp3')

    this.notifyAudioCanPlay = false
    this.greatAudioCanPlay = false

    this.notifyAudio.addEventListener('canplaythrough', () => {
      this.notifyAudioCanPlay = true
    })
    this.greatAudio.addEventListener('canplaythrough', () => {
      this.greatAudioCanPlay = true
    })
  }

  play() {
    this.beginningTimestamp = performance.now()
    this.currentTimestamp = performance.now()
    this.delayDraw()
    window.requestAnimationFrame(this.drawContinuously.bind(this))

    document.addEventListener('keydown', event => {
      if(event.key === 'Space') {
        this.keydown = true
      }
    })

    document.addEventListener('keyup', event => {
      if(event.key === 'Space') {
        this.keydown = false
      }
    })
  }

  validateSkillCheck() {
    if (this.isDelayed === true) {
      return
    }

    if (this.validStatus === 1) {
      this.greatAudio.pause()
      this.greatAudio.currentTime = 0.0
      this.greatAudio.play()
      this.successStatus = 1

      if (this.isContinuously) {
        this.generateNextCheckpoint()
        this.validStatus = 0
      } else {
        this.delaySuccess()
      }
    } else {
      this.delayDraw()
    }
  }

  generateNextCheckpoint() {
    this.checkpointPosition = this.checkpointPosition + getRandomArbitrary(0.5, 1.5)
    if (this.checkpointPosition > 2) {
      this.checkpointPosition = this.checkpointPosition - 2 * Math.floor(this.checkpointPosition / 2)
    }
  }

  delayDraw() {
    this.delayUntil = performance.now() + 2000
    this.isDelayed = true
    this.notifyPlayed = false
  }

  delaySuccess() {
    this.delaySuccessUntil = performance.now() + 400
    this.isDelayedSuccess = true
  }

  checkTimeout() {
    const x = 200 + 170 * Math.cos((-0.5 + this.needlePosition) * Math.PI)
    const y = 200 + 170 * Math.sin((-0.5 + this.needlePosition) * Math.PI)
    const pointData = this.offscreenCtx.getImageData(x, y, 1, 1).data
    const r = pointData[0]
    const g = pointData[1]
    const b = pointData[2]

    if (r === 255 && g === 255 && b === 255) {
      this.validStatus = 1
    } else {
      if (this.validStatus === 1) {
        this.validStatus = 2
      }
    }
  }

  isReadyToPlay() {
    if (this.greatAudioCanPlay && this.notifyAudioCanPlay) {
      return true
    }

    return false
  }

  drawContinuously(timestamp) {
    this.currentTimestamp = timestamp
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height)
    this.offscreenCtx.clearRect(0, 0, this.offscreenCanvas.width, this.offscreenCanvas.height)

    if ((!this.needleLastTime || this.needleLastTime + 200 < this.currentTimestamp) && !this.isDelayed && !this.isDelayedSuccess) {
      if (this.keydown) {
        this.needleLastTime = this.currentTimestamp
        this.validateSkillCheck()
      }
    }

    if (!this.isReadyToPlay()) {
      this.delayDraw()
    }

    if (this.validStatus === 2) {
      this.delayDraw()
      this.validStatus = 0
    }

    if (this.isDelayed && this.notifyPlayed === false && this.delayUntil <= this.currentTimestamp + this.notifyBefore) {
      this.notifyAudio.pause()
      this.notifyAudio.currentTime = 0
      this.notifyAudio.play()
      this.notifyPlayed = true
    }

    if (this.isDelayed && this.delayUntil <= this.currentTimestamp) {
      this.isDelayed = false
      this.checkpointPosition = 0.0
      this.generateNextCheckpoint()
      this.validStatus = 0
    }

    if (this.isDelayedSuccess && this.delaySuccessUntil <= this.currentTimestamp) {
      this.delayDraw()
      this.isDelayedSuccess = false
      this.validStatus = 0
    }

    if (this.isDelayed === false) {
      if (this.currentTimestamp - this.beginningTimestamp > this.checkTime) {
        this.beginningTimestamp = this.currentTimestamp
      }

      if (!this.isDelayedSuccess || this.successStatus !== 1) {
        this.needlePosition = ((this.currentTimestamp - this.beginningTimestamp) / this.checkTime) * 2
      }

      this.drawFrame()
      this.drawCheckpoint(this.checkpointPosition, this.checkpointDifficulty)
      this.drawOffscreenCheckpoint(this.checkpointPosition, this.checkpointDifficulty)
      this.drawNeedle(this.needlePosition)
      this.drawButton()

      this.checkTimeout()
    }

    window.requestAnimationFrame(this.drawContinuously.bind(this))
  }

  drawFrame() {
    this.ctx.lineWidth = 2
    this.ctx.strokeStyle = 'white'

    this.ctx.beginPath()
    this.ctx.arc(200, 200, 170, 0, Math.PI * 2)
    this.ctx.stroke()
  }

  drawButton() {
    this.ctx.beginPath()

    this.ctx.lineWidth = 2
    this.ctx.translate(-60, -20)
    this.ctx.strokeStyle = '#949494'
    this.ctx.fillStyle = 'black'
    this.ctx.rect(200, 200, 120, 40)
    this.ctx.stroke()
    this.ctx.fill()
    this.ctx.resetTransform()

    this.ctx.beginPath()
    this.ctx.fillStyle = 'white'
    this.ctx.textAlign = 'center'
    this.ctx.textBaseline = 'middle'
    this.ctx.font = "20px Arial";
    this.ctx.fillText("SPACE", 200, 200);
    this.ctx.resetTransform()
  }

  drawCheckpoint(position, difficulty = 0.15) {
    this.ctx.lineWidth = 14
    this.ctx.strokeStyle = 'white'

    this.ctx.beginPath()
    this.ctx.arc(200, 200, 170, Math.PI * (-0.5 + position), Math.PI * (-0.5 + position + difficulty))
    this.ctx.stroke()
  }

  drawOffscreenCheckpoint(position, difficulty = 0.15) {
    this.offscreenCtx.lineWidth = 14
    this.offscreenCtx.strokeStyle = 'white'

    this.offscreenCtx.beginPath()
    this.offscreenCtx.arc(200, 200, 170, Math.PI * (-0.5 + position), Math.PI * (-0.5 + position + difficulty))
    this.offscreenCtx.stroke()
  }

  drawNeedle(rad) {
    this.ctx.moveTo(0, 0)
    const rotation = Math.PI * (0.5 + rad)
    const rotatePointCalc = rotatePoint(-100, 0, 0, 0, rotation)
    this.ctx.fillStyle = 'red'
    this.ctx.beginPath()
    this.ctx.translate(rotatePointCalc.x, rotatePointCalc.y)
    this.ctx.ellipse(200, 200, 100, 3, rotation, Math.PI * 0, Math.PI * 4)
    this.ctx.resetTransform()
    this.ctx.fill()
  }
}

export default SkillCheck

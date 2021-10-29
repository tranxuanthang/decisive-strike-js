# decisive-strike-js

60 frame-per-second Dead By Daylight's Skill Check simulator on the Web.

Live demo:

- https://tranxuanthang.github.io/decisive-strike
- https://codepen.io/tranxuanthang/full/oNeebNO (click first to focus!!)

![](https://thumbs.gfycat.com/YoungSelfreliantAmericanquarterhorse-max-1mb.gif)

## Install

NPM:

```shell
npm install decisive-strike
```

## Simple usage

HTML:

```html
<canvas id="canvas" class="canvas" width="400" height="400"></canvas>
```

Javscript:

```javascript
import SkillCheck from 'decisive-strike'

const skillCheck = new SkillCheck(document.getElementById('canvas'), {
  isContinuously: false,
  checkTime: 2000,
  checkpointDifficulty: 0.08,
  notifyBefore: 800
})

skillCheck.play()
```

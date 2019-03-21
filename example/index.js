import $ from 'jquery';
import PatternLock from '../src/PatternLock.js';

import '../src/patternLock.css';

const PatternCreater = new PatternLock('#create-pattern', {
  onDraw(pattern) {
    [exBasic, exLineOnMove, exPatternVisible, exSize].forEach(function(lock) {
      lock.checkForPattern(pattern, function() {
        alert("Hoorey");
      });
    });
  },
});

const exBasic = new PatternLock('#ex-basic');
const exLineOnMove = new PatternLock('#ex-line-on-move', { lineOnMove: false });
const exPatternVisible = new PatternLock('#ex-pattern-visible', { patternVisible: false });
const exSize = (window.exSize = new PatternLock('#ex-size', {
  radius: 30,
  margin: 20,
  enableSetPattern: true,
}));
const exMatrix = new PatternLock('#ex-matrix', { matrix: [4, 4] });
const exMapper = new PatternLock('#ex-mapper', {
  mapper(idx) {
    return (idx % 9) + 1;
  },
  onDraw(pattern) {
    alert(pattern);
  },
});
const lock7 = new PatternLock('#patternHolder7', { enableSetPattern: true });
const exAllowRepeat = new PatternLock('#ex-allow-repeat', { allowRepeat: true });

const exDirection = new PatternLock('#ex-direction');

let patternId; let 
patternUI;

const captchaHolder = $('#pattern-captcha');

function reloadCaptcha() {
  $.ajax({
    url: 'http://patterncaptcha.herokuapp.com/api/getPattern',
    type: 'get',
    dataType: 'json',
    crossDomain: true,
    success(data) {
      patternId = data.id;
      const matrix = data.matrix,
        imgData = data.imageData;

      if (!patternUI) {
        patternUI = new PatternLock("#pattern-ui", {
          matrix: matrix,
          radius: 20,
          margin: 15,
          delimiter: ','
        });
      } else {
        patternUI.option("matrix", matrix);
      }

      captchaHolder.html('<img src="' + imgData + '" id="patternImage" />');
    },
  });
}

reloadCaptcha();

$('#refresh-captcha').click(() => {
  reloadCaptcha();
});

$('#submit-captcha').click(() => {
  $.ajax({
    url: "http://patterncaptcha.herokuapp.com/api/checkPattern",
    type: "get",
    dataType: "json",
    data: {
      patternId: patternId,
      pattern: patternUI.getPattern().split(',').join('')
    },
    crossDomain: true,
    success: function(data) {
      alert(data.message);
      reloadCaptcha();
    }
  });
});

import $ from 'jquery';
import PatternLock from '../src/PatternLock.js';

import '../src/patternLock.css';

const PatternCreater = new PatternLock('#createPattern', {
  onDraw(pattern) {
    [lock1, lock2, lock3, lock4].forEach(function(lock) {
      lock.checkForPattern(pattern, function() {
        alert("Hoorey");
      });
    });
  },
});

const lock1 = new PatternLock('#patternHolder1');
const lock2 = new PatternLock('#patternHolder2', { lineOnMove: false });
const lock3 = new PatternLock('#patternHolder3', { patternVisible: false });
const lock4 = (window.lock4 = new PatternLock('#patternHolder4', {
  radius: 30,
  margin: 20,
}));
const lock5 = new PatternLock('#patternHolder5', { matrix: [4, 4] });
const lock6 = new PatternLock('#patternHolder6', {
  mapper(idx) {
    return (idx % 9) + 1;
  },
  onDraw(pattern) {
    alert(pattern);
  },
});
const lock7 = new PatternLock('#patternHolder7', { enableSetPattern: true });
const lock8 = new PatternLock('#patternHolder8', { allowRepeat: true });

let patternId; let 
patternUI;

const captchaHolder = $('#patternCaptcha');

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
        patternUI = new PatternLock("#patternUI", {
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

$('#refreshCaptcha').click(() => {
  reloadCaptcha();
});

$('#submitCaptcha').click(() => {
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

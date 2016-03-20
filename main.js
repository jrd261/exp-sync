
var video;


function sync (time) {
  time = time / 1000;
  var target = time % 140;
  var delta = target - video.currentTime;
  var absDelta = Math.abs(delta);
  console.log('DELTA', absDelta);
  if (absDelta >= 1) {
    video.currentTime = target;
  } else {
    video.playbackRate = 1.0 + delta / 2.0;
  }
}


function send () {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', exp.app.config.syncUrl);
  xhr.onreadystatechange = function () {
    if (xhr.readyState === 4) sync(parseFloat(xhr.response));
  };
  xhr.send();
}

function load () {
  return new Promise(function (resolve) {
    return exp.getContent(exp.app.config.video.uuid).then(function (content) {
      video = document.getElementById('video');
      video.setAttribute('src', content.getUrl());
      video.addEventListener('canplay', resolve);
    });
  });
}

function play () {
  video.play();
  setInterval(send, 500);
}
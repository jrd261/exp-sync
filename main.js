var video;
var corrections = [];
var offset = 0;
var delta;
var isPlaying = false;

function sync () {
  if (!isPlaying) return;
  if (corrections.length < 5) { video.playbackRate = 1.0; return; }
  offset = Math.max.apply(null, corrections);
  target = ((Date.now() + offset) / 1000.0) % 140.0;
  delta =  target - video.currentTime;
  if (delta > 5 || delta < -5) {
    video.currentTime = target;
  } else {
    video.playbackRate = 1.0 + delta / 5.0;
  }
  corrections = [];
}


function send () {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', exp.app.config.syncUrl);
  xhr.onreadystatechange = function () { if (xhr.readyState === 4) { corrections.push(parseFloat(xhr.response) - Date.now()); } };
  xhr.send();
}

function load () {
  loading = document.getElementById('loading');
  loading.style.visibility = 'visible';
  video = document.getElementById('video');
  video.style.visibility = 'hidden';
  loading.innerHTML = 'Loading...';
  return new Promise(function (resolve) {
    return exp.getContent(exp.app.config.video.uuid).then(function (content) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', content.getUrl());
      xhr.responseType = 'blob';
      xhr.onprogress = function (event) { loading.innerHTML = (event.loaded / 1E6).toFixed(2) + 'MB'; };
      xhr.onload = function () { video.setAttribute('src', URL.createObjectURL(this.response)); };
      xhr.send();
      video.addEventListener('canplay', resolve);
    });
  });
}

function play () {
  loading.style.visibility = 'hidden';
  video.style.visibility = 'visible';
  video.play();
  isPlaying = true;
  setInterval(send, 500);
  setInterval(sync, 5000);
  video.addEventListener('ended', function () {
    video.currentTime = 0;
    isPlaying = false;
    setTimeout(function () { video.play(); isPlaying=true; }, (140.0 - ((Date.now() + offset) / 1000.0) % 140.0) * 1000.0);
  });
}
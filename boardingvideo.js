loadIframeAPI = function() {
  var tag = document.createElement('script');
  tag.src = "https://www.youtube.com/iframe_api";
  var firstScriptTag = document.getElementsByTagName('script')[0];
  firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
};

// YouTube API function
loadIframeAPI();

// create player instance including YouTube API and analytics integration
var createPlayer = function(initialVideoId, actions) {
  var inPause = false;
  var videoId = initialVideoId;
  var youtubePlayer = new YT.Player('yt-player', {
    playerVars: {
      modestbranding: true,
      showinfo: 0,
      rel: 0
    },
    height: '360',
    width: '640',
    videoId: videoId,
    events: {
      onReady: actions.onPlayerLoaded,
      onStateChange: onPlayerStateChange
    }
  });


  function onPlayerStateChange(event) {
    if (event.data == YT.PlayerState.PLAYING) {
      inPause = false;
      actions.onVideoPlay(videoId);
    }
    if (event.data == YT.PlayerState.PAUSED && !inPause) {
      inPause = true;
      actions.onVideoPause(videoId);
    }
    if (event.data == YT.PlayerState.ENDED) {
      actions.onVideoEnd(videoId);
    }
    if (event.data == YT.PlayerState.CUED) {
      actions.onVideoChange(videoId);
    }
    // onVideoShow, onVideoHide
  }

  function cueVideo(nextVideoId) {
    videoId = nextVideoId;
    youtubePlayer.cueVideoById(videoId);
  }

  function playVideo(videoId) {
    youtubePlayer.loadVideoById(videoId);
  }

  return {
    cueVideo: cueVideo,
    playVideo: playVideo
  };
};

// generate chapter selection ui
function createUi(playlist, onLinkClick) {
  let list = document.createElement('ul');

  playlist.forEach(function(elem, index, array) {
    let item = document.createElement('li');
    let link = document.createElement('a');
    link.innerHTML = "<strong>Kapitel:</strong> " + elem.title;
    link.href = "";
    link.addEventListener("click", function(event) {
      event.preventDefault();
      onLinkClick(elem.videoId);
    });
    item.appendChild(link);
    list.appendChild(item);
    console.log(elem);
  });

  var targetElement = document.getElementById("yt-chapters");
  targetElement.appendChild(list);
}

// invoked by the YoutTube API after loading
function onYouTubeIframeAPIReady() {
  var actions = createActions();
  var player = createPlayer(PLAYLIST[0].videoId, actions);
  createUi(PLAYLIST, player.playVideo);
}

// Analytics functions
function createActions(player) {
  function onVideoPlay(videoId) {
    console.log("PLAYING");
    ga('send', {
      hitType: 'event',
      eventCategory: 'Videos',
      eventAction: 'play',
      eventLabel: videoId
    });
  }

  function onVideoPause(videoId) {
    console.log("PAUSE");
    ga('send', {
      hitType: 'event',
      eventCategory: 'Videos',
      eventAction: 'pause',
      eventLabel: videoId
    });
  }

  function onVideoEnd(videoId) {
    console.log("END");
    ga('send', {
      hitType: 'event',
      eventCategory: 'Videos',
      eventAction: 'end',
      eventLabel: videoId
    });
  }

  function onVideoChange(videoId) {
    console.log("CHANGE");
    ga('send', {
      hitType: 'event',
      eventCategory: 'Videos',
      eventAction: 'change',
      eventLabel: videoId
    });
  }

  function onPlayerLoaded() {
    console.log('loaded');
  }

  return {
    onVideoPlay: onVideoPlay,
    onVideoPause: onVideoPause,
    onVideoEnd: onVideoEnd,
    onVideoChange: onVideoChange,
    onPlayerLoaded: onPlayerLoaded,
  };
}

function showOverlay() {
  
}

var PLAYLIST = [
  {
    title: "Crewmeister ist für alle da!11",
    videoId: "M7lc1UVf-VE",
    analyticsEventLabel: "intro"
  },
  {
    title: "Jede Zelle meines Datenblatts",
    videoId: "MZTjyRu88PRE",
    analyticsEventLabel: "zelle"
  },
  {
    title: "Zollstock und Datenrock",
    videoId: "vo5ztSsA_zk",
    analyticsEventLabel: "zoll"
  }
];

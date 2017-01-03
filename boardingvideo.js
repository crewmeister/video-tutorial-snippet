alert("test vts");

(function() {
  // load YouTube iFrame API
  var loadIframeAPI = function() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  };

  // create player instance including YouTube API and analytics integration
  var createPlayer = function(initialVideoId, actions) {
    var inPause = false;
    var videoId = initialVideoId;
    var youtubePlayer = new YT.Player('vts-player', {
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

    var targetElement = document.getElementById("vts-chapters");
    targetElement.appendChild(list);
  }

  // invoked by the YoutTube API after loading
  window.onYouTubeIframeAPIReady = function() {
    var actions = createActions();
    var player = createPlayer(PLAYLIST[0].videoId, actions);
    createUi(PLAYLIST, player.playVideo);
  };

  // Analytics functions
  function createActions(player) {
    function _ga(args) {
      if (ga) {
        console.log("Google Analytics is not readily loaded");
      }
      ga.apply(this, arguments);
    }

    function onVideoPlay(videoId) {
      console.log("PLAYING");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'play',
        eventLabel: videoId
      });
    }

    function onVideoPause(videoId) {
      console.log("PAUSE");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'pause',
        eventLabel: videoId
      });
    }

    function onVideoEnd(videoId) {
      console.log("END");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'end',
        eventLabel: videoId
      });
    }

    function onVideoChange(videoId) {
      console.log("CHANGE");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'change',
        eventLabel: videoId
      });
    }

    function onPlayerLoaded() {
      console.log('player loaded');
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
    let container = document.createElement('div');
    container.id = "vts-container";
    let underlay = document.createElement('div');
    underlay.id = "vts-underlay";
    let overlay = document.createElement('div');
    overlay.id = "vts-overlay";
    let playerframe = document.createElement('div');
    playerframe.id = "vts-player";
    let chapters = document.createElement('div');
    chapters.id = "vts-chapters";

    overlay.appendChild(playerframe);
    overlay.appendChild(chapters);
    container.appendChild(underlay);
    container.appendChild(overlay);

    console.log(container);
    console.log(document.body);
    window.document.body.appendChild(container);

    loadIframeAPI();
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

  showOverlay();
});

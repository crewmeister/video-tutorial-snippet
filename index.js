(function() {
  // load YouTube iFrame API
  var loadIframeAPI = function() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  };

  var player;

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
      height: '400',
      width: '640',
      videoId: videoId,
      events: {
        onReady: actions.onPlayerLoaded,
        onStateChange: onPlayerStateChange
      }
    });

    function onPlayerStateChange(event) {
      let label = getAnalyticsLabelOfVideoId(videoId);

      if (event.data == YT.PlayerState.PLAYING) {
        inPause = false;
        actions.onVideoPlay(label);
      }
      if (event.data == YT.PlayerState.PAUSED && !inPause) {
        inPause = true;
        actions.onVideoPause(label);
      }
      if (event.data == YT.PlayerState.ENDED) {
        actions.onVideoEnd(label);
      }
      if (event.data == YT.PlayerState.CUED) {
        actions.onVideoChange(label);
      }
      // onVideoShow, onVideoHide
    }

    function cueVideo(nextVideoId) {
      videoId = nextVideoId;
      youtubePlayer.cueVideoById(videoId);
    }

    function playVideo(nextVideoId) {
      videoId = nextVideoId;
      youtubePlayer.loadVideoById(nextVideoId);
      console.log(this);
      createChapterList(PLAYLIST, playVideo, nextVideoId);
    }

    function stopVideo() {
      youtubePlayer.stopVideo();
    }

    return {
      cueVideo: cueVideo,
      playVideo: playVideo,
      stopVideo: stopVideo
    };
  };

  // generate chapter selection ui
  function createChapterList(playlist, onLinkClick, activeVideoId) {
    let list = document.createElement('ul');

    playlist.forEach(function(elem, index, array) {
      let item = document.createElement('li');
      if (activeVideoId === elem.videoId) item.className = 'active';
      let link = document.createElement('a');
      link.innerHTML = "<strong>Schritt " + (index+1) + "</strong> <span>" + elem.title + "</span>";
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
    targetElement.innerHTML = '';
    targetElement.appendChild(list);
  }

  // invoked by the YoutTube API after loading
  window.onYouTubeIframeAPIReady = function() {
    var actions = createActions();
    player = createPlayer(PLAYLIST[0].videoId, actions);
    createChapterList(PLAYLIST, player.playVideo, PLAYLIST[0].videoId);

    actions.onOverlayShow();
  };

  // Analytics functions
  function createActions(player) {
    function _ga(args) {
      try {
        ga.apply(this, arguments);
      }
      catch(e) {
        console.log("Google Analytics is not readily loaded");
      }
    }

    function onVideoPlay(label) {
      console.log("PLAYING " + label);
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'play',
        eventLabel: label
      });
    }

    function onVideoPause(label) {
      console.log("PAUSE");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'pause',
        eventLabel: label
      });
    }

    function onVideoEnd(label) {
      console.log("END");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'end',
        eventLabel: label
      });
    }

    function onVideoChange(label) {
      console.log("CHANGE");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'change',
        eventLabel: label
      });
    }

    function onPlayerLoaded() {
      console.log('player loaded');
    }

    function onOverlayShow() {
      console.log("OVERLAY SHOWN");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'overlay open'
      });
    }

    function onOverlayHide() {
      console.log("OVERLAY HIDDEN");
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'overlay closed'
      });
    }

    return {
      onVideoPlay: onVideoPlay,
      onVideoPause: onVideoPause,
      onVideoEnd: onVideoEnd,
      onVideoChange: onVideoChange,
      onPlayerLoaded: onPlayerLoaded,
      onOverlayShow: onOverlayShow,
      onOverlayHide: onOverlayHide
    };
  }

  function getAnalyticsLabelOfVideoId(videoId) {
    let label;

    PLAYLIST.forEach(function(elem) {
      if (elem.videoId == videoId) {
        label = elem.analyticsEventLabel;
      }
    });

    return label;
  }

  function addCss() {
    let url = 'https://crewmeister.github.io/video-tutorial-snippet/style.css';
    let head = window.document.getElementsByTagName('body')[0];
    let link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = url;
    head.appendChild(link);
  }

  function addHtml() {
    let container = document.createElement('div');
    container.id = "vts-container";
    container.className = "invisible";
    let underlay = document.createElement('div');
    underlay.id = "vts-underlay";
    let overlay = document.createElement('div');
    overlay.id = "vts-overlay";
    let content = document.createElement('div');
    content.id = "vts-content";
    let section = document.createElement('section');
    let playerframe = document.createElement('div');
    playerframe.id = "vts-player";
    let chapters = document.createElement('div');
    chapters.id = "vts-chapters";
    let headline = document.createElement('h2');

    let closeButton = document.createElement('a');
    closeButton.href = '';
    closeButton.className = 'vts-close';
    closeButton.addEventListener("click", function(event) {
      event.preventDefault();
      hideOverlay();
    });

    headline.innerHTML = "Die wichtigsten Funktionen im Überblick";

    section.appendChild(playerframe);
    section.appendChild(chapters);
    content.appendChild(headline);
    content.appendChild(section);
    content.appendChild(closeButton);
    overlay.appendChild(content);
    container.appendChild(underlay);
    container.appendChild(overlay);

    console.log(container);
    console.log(document.body);
    window.document.body.appendChild(container);
  }

  function showOverlay() {
    let container = window.document.getElementById("vts-container");
    container.className = "";
  }

  function hideOverlay() {
    let container = window.document.getElementById("vts-container");
    container.className = "invisible";

    player.stopVideo();

    setTimeout(function() {
      window.document.body.removeChild(container);
    }, 300);

    let actions = createActions();
    actions.onOverlayHide();
  }

  var PLAYLIST = [
    {
      title: "Zeiten erfassen",
      videoId: "f-4BQVOglbo",
      analyticsEventLabel: "VidZeitenErfassen"
    },
    {
      title: "Mitarbeiter hinzufügen",
      videoId: "xdtgPCYUZtw",
      analyticsEventLabel: "VidMitarbeiterEinladen"
    },
    {
      title: "Projekte anlegen",
      videoId: "mdL0cJ8X1sE",
      analyticsEventLabel: "VidGruppen"
    },
    {
      title: "GPS-Erfassung",
      videoId: "vUPfgAA5Hbw",
      analyticsEventLabel: "VidGps"
    }
  ];

  addCss();
  addHtml();
  setTimeout(loadIframeAPI, 1000);
  setTimeout(showOverlay, 5000);
})();

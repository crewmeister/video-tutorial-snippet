(function() {
  function getScriptDataset() {
    if ("currentScript" in document) {
      return document.currentScript.dataset;
    } else {
      let documentScripts = document.getElementsByTagName('script');
      let lastScript = documentScripts[documentScripts.length-1];
      return lastScript.dataset;
    }
  }
  let dataset = getScriptDataset();

  // load YouTube iFrame API
  var loadIframeAPI = function() {
    var tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  };

  var player;
  var playerHtmlIsAdded = false;

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
    }

    function cueVideo(nextVideoId) {
      videoId = nextVideoId;
      youtubePlayer.cueVideoById(videoId);
    }

    function playVideo(nextVideoId) {
      videoId = nextVideoId;
      youtubePlayer.loadVideoById(nextVideoId);
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
  };

  // Analytics functions
  function createActions(player) {
    function _ga(args) {
      try {
        ga.apply(this, arguments);
      }
      catch(e) {
        console.log("Google Analytics is not readily loaded");
        console.log("GA", arguments[1]);
      }
    }

    function onVideoPlay(label) {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'play',
        eventLabel: label,
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onVideoPause(label) {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'pause',
        eventLabel: label,
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onVideoEnd(label) {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'end',
        eventLabel: label,
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onVideoChange(label) {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'change',
        eventLabel: label,
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onOverlayShow() {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'overlay open',
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onOverlayHide() {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Videos',
        eventAction: 'overlay closed',
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onSidebarShow() {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Help',
        eventAction: 'sidebar opened',
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onSidebarHide() {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Help',
        eventAction: 'sidebar hidden',
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onSidebarVideos() {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Help',
        eventAction: 'sidebar selection',
        eventLabel: 'videos',
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onSidebarManual() {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Help',
        eventAction: 'sidebar selection',
        eventLabel: 'manual',
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    function onSidebarChat() {
      _ga('send', {
        hitType: 'event',
        eventCategory: 'Help',
        eventAction: 'sidebar selection',
        eventLabel: 'chat',
        dimension1: dataset.userid,
        dimension2: dataset.crewid,
        userId: dataset.userid
      });
    }

    return {
      onVideoPlay: onVideoPlay,
      onVideoPause: onVideoPause,
      onVideoEnd: onVideoEnd,
      onVideoChange: onVideoChange,
      onOverlayShow: onOverlayShow,
      onOverlayHide: onOverlayHide,
      onSidebarShow: onSidebarShow,
      onSidebarHide: onSidebarHide,
      onSidebarVideos: onSidebarVideos,
      onSidebarManual: onSidebarManual,
      onSidebarChat: onSidebarChat
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

  function addPlayerHtml() {
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

    window.document.body.appendChild(container);
  }

  function showOverlay() {
    let container = window.document.getElementById("vts-container");
    container.className = "";

    let actions = createActions();
    actions.onOverlayShow();
  }

  function hideOverlay() {
    let container = window.document.getElementById("vts-container");
    container.className = "invisible";
    player.stopVideo();

    let actions = createActions();
    actions.onOverlayHide();
  }

  function addButtonHtml() {
    let actions = createActions();

    let outercontainer = document.createElement('div');
    outercontainer.id = "vts-outercontainer";

    outercontainer.addEventListener("click", function(event) {
      event.stopPropagation();
    });

    let buttoncontainer = document.createElement('div');
    buttoncontainer.id = "vts-button-container";

    let content = document.createElement('div');
    content.id = "vts-button-content";
    content.innerHTML = "<p>Hilfe</p>";
    content.addEventListener("click", function(event) {
      if(!playerHtmlIsAdded) {
        loadIframeAPI();
        addPlayerHtml();
        playerHtmlIsAdded = true;
      }

      toggleSidebar();
    });

    let helpcontent = document.createElement('div');
    helpcontent.innerHTML = '<a href="" class="vts-linkblock"><h2><span class="icon-youtube-play"></span> ' + TEXTS[0].title + '</h2><p>' + TEXTS[0].description + '</p></a><a href="' + TEXTS[1].link + '" target="_blank" class="vts-linkblock"><h2><span class="icon-book"></span> ' + TEXTS[1].title + '</h2><p>' + TEXTS[1].description + '</p></a><a href="#" class="vts-linkblock" id="vts-chatlink"><h2><span class="icon-comments-o"></span> ' + TEXTS[2].title + '</h2><p>' + TEXTS[2].description + '</p></a>';
    buttoncontainer.appendChild(content);
    outercontainer.appendChild(buttoncontainer);
    outercontainer.appendChild(helpcontent);
    window.document.body.appendChild(outercontainer);

    let links = helpcontent.getElementsByTagName('a');

    links[0].addEventListener("click", function(event) {
      actions.onSidebarVideos();

      event.preventDefault();
      hideSidebar();
      showOverlay();
    });

    links[1].addEventListener("click", function(event) {
      actions.onSidebarManual();
      hideSidebar();
    });

    links[2].addEventListener("click", function(event) {
      actions.onSidebarChat();

      event.preventDefault();
      hideSidebar();
      try {
        SnapEngage.startLink();
      }
      catch(e) {
        console.log("SnapEngage is not loaded");
      }
    });

    document.body.addEventListener("click", hideSidebar);

    refreshChatStatus();
  }

  function toggleSidebar() {
    if (!document.getElementById("vts-outercontainer").classList.contains('open')) {
      showSidebar();
    } else {
      hideSidebar();
    }
  }

  function showSidebar() {
    document.getElementById("vts-outercontainer").className = "animate open";
    refreshChatStatus();

    let actions = createActions();
    actions.onSidebarShow();
  }

  function hideSidebar() {
    document.getElementById("vts-outercontainer").className = "animate";

    let actions = createActions();
    actions.onSidebarHide();
  }

  function toggleChatOption(online) {
    document.getElementById("vts-chatlink").style.display = online ? "inherit" : "none";
  }

  function refreshChatStatus() {
    try {
      SnapEngage.getAgentStatusAsync(function(online) {
        toggleChatOption(online);
      });
    }
    catch(e) {
      console.log("SnapEngage is not loaded");
    }
  }

  function refreshChatStatusEveryMinutes(minutes) {
    setInterval(refreshChatStatus, minutes * 60 * 1000);
  }

  var TEXTS = [
    {
      id: "videos",
      title: "Einführungsvideos",
      description: "Die wichtigsten Crewmeister Funktionen als Video-Tutorial."
    },
    {
      id: "manual",
      title: "Anleitungen und häufig gestellte Fragen",
      description: "Detaillierte Leitfäden zur Funktionsweise von Crewmeister.",
      link: "https://crewmeister.uservoice.com/knowledgebase"
    }, {
      id: "chat",
      title: "Live-Chat",
      description: "Sie haben eine unbeantwortete Frage?<br>Kontaktieren Sie unseren Kundenservice im Live-Chat."
    }
  ];

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
      title: "Mobile Apps",
      videoId: "rGo7rdmlssE",
      analyticsEventLabel: "VidMobile"
    },
    {
      title: "GPS-Erfassung",
      videoId: "vUPfgAA5Hbw",
      analyticsEventLabel: "VidGps"
    },
      {
      title: "Nutzerrechte und Administratoren",
      videoId: "5y1RpXP07Gw",
      analyticsEventLabel: "VidNutzerrechte"
    },
      {
      title: "Excel Export",
      videoId: "ACbja62motg",
      analyticsEventLabel: "VidExcel"
    }
  ];

  addCss();
  addButtonHtml();
  refreshChatStatusEveryMinutes(5);
})();

/*
	html5up.net | @ajlkn
*/
const API_URL = window.location.href.toString().includes('anstagram') ? 'http://anstagram-app.herokuapp.com' : 'http://localhost:3000';

(function () {

  let $body = document.querySelector('body');

  // Methods/polyfills.

  // classList | (c) @remy | github.com/remy/polyfills | rem.mit-license.org
  !(function () {
    function t(t) {
      this.el = t;
      for (
        let n = t.className.replace(/^\s+|\s+$/g, '').split(/\s+/), i = 0; i < n.length; i++
      )
        e.call(this, n[i]);
    }

    function n(t, n, i) {
      Object.defineProperty ?
        Object.defineProperty(t, n, {
          get: i
        }) :
        t.__defineGetter__(n, i);
    }
    if (
      !(
        typeof window.Element == 'undefined' ||
        'classList' in document.documentElement
      )
    ) {
      var i = Array.prototype;
      var e = i.push;
      var s = i.splice;
      var o = i.join;
      (t.prototype = {
        add(t) {
          this.contains(t) ||
            (e.call(this, t), (this.el.className = this.toString()));
        },
        contains(t) {
          return -1 != this.el.className.indexOf(t);
        },
        item(t) {
          return this[t] || null;
        },
        remove(t) {
          if (this.contains(t)) {
            for (var n = 0; n < this.length && this[n] != t; n++);
            s.call(this, n, 1), (this.el.className = this.toString());
          }
        },
        toString() {
          return o.call(this, ' ');
        },
        toggle(t) {
          return (
            this.contains(t) ? this.remove(t) : this.add(t), this.contains(t)
          );
        },
      }),
      (window.DOMTokenList = t),
      n(Element.prototype, 'classList', function () {
        return new t(this);
      });
    }
  })();

  // canUse
  window.canUse = function (p) {
    if (!window._canUse) window._canUse = document.createElement('div');
    let e = window._canUse.style;
    var up = p.charAt(0).toUpperCase() + p.slice(1);
    return (
      p in e ||
      `Moz${  up}` in e ||
      `Webkit${  up}` in e ||
      `O${  up}` in e ||
      `ms${  up}` in e
    );
  };

  // window.addEventListener
  (function () {
    if ('addEventListener' in window) return;
    window.addEventListener = function (type, f) {
      window.attachEvent(`on${  type}`, f);
    };
  })();

  // Play initial animations on page load.
  window.addEventListener('load', function () {
    window.setTimeout(function () {
      $body.classList.remove('is-preload');
    }, 100);
  });

  // Slideshow Background.
  (function () {
    // Settings.
    const settings = {
      // Images (in the format of 'url': 'alignment').
      images: {
        'images/bg01.jpg': 'center',
        'images/bg02.jpg': 'center',
        'images/bg03.jpg': 'center',
      },

      // Delay.
      delay: 6000,
    };

    // Vars.
    let pos = 0;
    var lastPos = 0;
    var $wrapper;
    var $bgs = [];
    var $bg;
    var k;
    var v;

    // Create BG wrapper, BGs.
    $wrapper = document.createElement('div');
    $wrapper.id = 'bg';
    $body.appendChild($wrapper);

    for (k in settings.images) {
      // Create BG.
      $bg = document.createElement('div');
      $bg.style.backgroundImage = `url("${k}")`;
      $bg.style.backgroundPosition = settings.images[k];
      $wrapper.appendChild($bg);

      // Add it to array.
      $bgs.push($bg);
    }

    // Main loop.
    $bgs[pos].classList.add('visible');
    $bgs[pos].classList.add('top');

    // Bail if we only have a single BG or the client doesn't support transitions.
    if ($bgs.length == 1 || !canUse('transition')) return;

    window.setInterval(function () {
      lastPos = pos;
      pos++;

      // Wrap to beginning if necessary.
      if (pos >= $bgs.length) pos = 0;

      // Swap top images.
      $bgs[lastPos].classList.remove('top');
      $bgs[pos].classList.add('visible');
      $bgs[pos].classList.add('top');

      // Hide last image after a short delay.
      window.setTimeout(function () {
        $bgs[lastPos].classList.remove('visible');
      }, settings.delay / 2);
    }, settings.delay);
  })();

  // Anagram Form.
  (function () {
    // Vars.
    const $form = document.querySelectorAll('#signup-form')[0];
    var $submit = document.querySelectorAll(
      '#signup-form input[type="submit"]'
    )[0];
    let $message;

    // Bail if addEventListener isn't supported.
    if (!('addEventListener' in $form)) return;

    // Message.
    $message = document.createElement('span');
    $message.classList.add('message');
    $form.appendChild($message);
    $message._show = function (type, text) {
      $message.classList.remove('success');
      $message.classList.remove('failure');
      $message.innerHTML = text;
      $message.classList.add(type);
      $message.classList.add('visible');

      // window.setTimeout(function() {
      //   $message._hide();
      // }, 10000);
    };

    $message._hide = function () {
      $message.classList.remove('visible');
    };

    // Events.
    // Note: If you're *not* using AJAX, get rid of this event listener.
    $form.addEventListener('submit', function (event) {
      event.stopPropagation();
      event.preventDefault();
      let word = document.getElementById('word').value;

      console.log(word);
      fetch(`${API_URL}/anagrams/${word}.json`, {
        method: 'GET',
        headers: new Headers(),
      })
        .then((res) => res.json())
        .then((data) => {
          let words = '';
          data.anagrams.forEach(item => words += ` ${item} `);
          if (words) {
            words = 'Anagrams: ' + words;
            $message._show('success', words);
          } else {
            $message._show('failure', 'No Grams!');
          }
        })
        .catch((err) => {
          console.log(err);
          $message._show('failure', err);
        });
    });
  })();
})();

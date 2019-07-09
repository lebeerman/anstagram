ANSTAGRAM LANDING PAGE
=========

**API Call Form:**

GET request to the API - `/anagrams/${word}.json`

**Slideshow Background:**

  - [ ] TODO This is pretty straight forward, but there are two JS settings you'll want to be aware of (found under "Slideshow Background" in assets/js/main.js):

	images

		The list of images to cycle through, given in the following format:

			'url': 'alignment'

		Where 'url' is the image (eg. 'images/foo.jpg', 'http://somewhere.else/foo.jpg'), and
		'alignment' is how the image should be vertically aligned ('top', 'center', or 'bottom').

		Note: Browsers that don't support CSS transitions (like IE<=9) will only see the first image.

	delay

		How long to wait between transitions (in ms). Note that this must be at least twice as long as
		the transition speed itself (currently 3 seconds).


Credits:

	Demo Images:
		Unsplash (unsplash.com)

	Icons:
		Font Awesome (fontawesome.io)

	Other:
		Responsive Tools (github.com/ajlkn/responsive-tools)

  **Made with as few changes as possible using `Eventually` by HTML5 UP (html5up.net) | @ajlkn**
    Free for personal and commercial use under the CCA 3.0 license (html5up.net/license)
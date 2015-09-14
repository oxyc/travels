(function ($, _) {
  'use strict';

  var CROP_FACTOR = {
    'FUJIFILM X-E2': 1.5
  };

  var templateRssUrl = _.template(
    'https://picasaweb.google.com/data/feed/api/user/<%- userId %>/' +
    '<% if (albumId) { %>albumid/<%- albumId %>/<% } %>' +
    '?alt=json&kind=photo&imgmax=d&thumbsize=1024,72' +
    '&fields=entry(exif:tags,media:group(media:content,media:thumbnail,media:keywords))'
  );

  var templateSlide = _.template(
    '<div>' +
    '<img data-lazy="<%- large %>">' +
    '<div class="exif-data hidden">' +
    '<table>' +
    '<% if (exif$make && exif$model) { %>' +
    '<tr><th>Camera</th><td><%- exif$make  %> <%- exif$model %></td></tr>' +
    '<% } if (exif$fstop) { %>' +
    '<tr><th>Aperture</th><td>f/<%- exif$fstop %></td></tr>' +
    '<% } if (exif$exposure) { %>' +
    '<tr><th>Exposure</th><td><%- new Fraction(parseFloat(exif$exposure)).toFraction() %></td></tr>' +
    '<% } if (exif$focallength) { %>' +
    '<tr><th>Focal length</th><td><%- exif$focallength * CROP_FACTOR %> mm</td></tr>' +
    '<% } if (exif$iso) { %>' +
    '<tr><th>ISO</th><td><%- exif$iso %></td></tr>' +
    '<% } if (exif$flash) { %>' +
    '<tr><th>Flash</th><td><% if (exif$flash === "false") { %>No<% } else { %>Yes<% } %></td></tr>' +
    '<% } if (exif$time) { %>' +
    '<tr><th>Date</th><td><%- new Date(parseInt(exif$time)).toUTCString().slice(0, -7) %></td></tr>' +
    '<% } if (tags) { %>' +
    '<tr><th>Tags</th><td><%- tags.join(", ") %></td></tr>' +
    '<% } %>' +
    '</table>' +
    '</div>' +
    '<div class="additional">' +
    '<a href="#" class="view-exif" data-image="<%- original %>">View exif</a>' +
    '<a href="<%- original %>" class="download" download>Download original</a>' +
    '</div>' +
    '</div>'
  );

  function buildSlides(content, photo) {
    return content + templateSlide(photo);
  }
  function buildThumbnails(content, photo) {
    return content + '<div><img data-lazy="' + photo.thumbnail + '"></div>';
  }

  function showSlideshow($slideshow) {
    $slideshow.parent().removeClass('hidden');
  }
  function hideSlideshow($slideshow) {
    $slideshow.parent().addClass('hidden');
  }

  function toggleExifData(event) {
    event.preventDefault();
    var $parent = $(this).parent().parent();
    // Toggle the exif data on all sldies
    if ($parent.find('.exif-data').hasClass('hidden')) {
      $parent.parent().find('.exif-data').removeClass('hidden');
    } else {
      $parent.parent().find('.exif-data').addClass('hidden');
    }
  }

  function init($album, data, options) {
    var $slideshow = $album.find('.slideshow');
    var $nav = $album.find('.slideshow-nav');
    var $openLink = $album.find('.open');
    var $closeLink = $album.find('.close');
    var photos = data.feed.entry;

    // Filter out photos not belonging to any of the specifeid albums.
    // Picasa Data API has a bug preventing us to query for the tags directly.
    if (options.albumTags) {
      photos = _.filter(photos, function (entry) {
        if (_.isEmpty(entry.media$group.media$keywords)) {
          return false;
        }
        var tags = entry.media$group.media$keywords.$t.split(', ');
        return _.intersection(tags, options.albumTags).length > 0;
      });
    }

    if (!photos.length) {
      $openLink.hide().before('<p>No photos found</p>');
      return;
    }

    // Restructure the photo objects.
    photos = _.map(photos, function (entry) {
      var original = entry.media$group.media$content[0];
      var large = entry.media$group.media$thumbnail[0];
      var thumbnail = entry.media$group.media$thumbnail[1];
      var tags = !_.isEmpty(entry.media$group.media$keywords) ?
        entry.media$group.media$keywords.$t.split(', ') : [];
      var exif = _.mapValues(entry.exif$tags, function (tag) {
        return tag.$t ? tag.$t : false;
      });
      var camera = (exif.exif$make && exif.exif$model) ? exif.exif$make + ' ' + exif.exif$model : 'unknown';

      return _.assign({
        original: original.url,
        large: large.url,
        thumbnail: thumbnail.url,
        tags: tags,
        exif$make: false,
        exif$model: false,
        exif$fstop: false,
        exif$exposure: false,
        exif$focallength: false,
        exif$iso: false,
        exif$time: false,
        exif$flash: false,
        CROP_FACTOR: CROP_FACTOR.hasOwnProperty(camera) ? CROP_FACTOR[camera] : 1
      }, exif);
    });

    // Build slideshow HTML
    $slideshow.append(_.reduce(photos, buildSlides, ''));
    $nav.append(_.reduce(photos, buildThumbnails, ''));

    // Attach event listeners
    $openLink.on('click', showSlideshow.bind(null, $slideshow));
    $closeLink.on('click', hideSlideshow.bind(null, $slideshow));
    $openLink.trigger('click');
    $album.on('click', '.view-exif', toggleExifData);

    // Initialize slideshows
    $slideshow.slick({
      asNavFor: '.slideshow-nav',
      lazyLoad: 'ondemand',
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: true,
      arrows: true
    });
    $nav.slick({
      asNavFor: '.slideshow',
      lazyLoad: 'ondemand',
      slidesToShow: 18,
      slidesToScroll: 10,
      dots: true,
      arrows: false,
      focusOnSelect: true
    });
  }

  $('.picasa-album').one('click', '.open', function (event) {
    event.preventDefault();
    var $album = $(this).parents('.picasa-album');
    var $slideshow = $album.find('.slideshow');
    var options = {
      albumId: $slideshow.data('albumid'),
      userId: $slideshow.data('userid'),
      albumTags: $slideshow.data('albumtags').split(' ')
    };

    $.getJSON(templateRssUrl(options))
      .done(function (data) {
        // Build the slideshow
        init($album, data, options);
      });
  });
})(this.jQuery, this._);

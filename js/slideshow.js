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

  var templateFilters = _.template(
    '<h4>Filter by tag</h4>' +
    '<select multiple="multipe" class="filter">' +
    '<% _.forEach(tags, function (active, tag) { %>' +
    '<option><%- tag %></option>' +
    '<% }) %>' +
    '</select>'
  );

  var templateSlide = _.template(
    '<div data-tags="<%- tags.join(",") %>">' +
    '<img data-lazy="<%- large %>">' +
    '<div class="exif-data overlay hidden">' +
    '<table>' +
    '<% if (exif$make && exif$model) { %>' +
    '<tr><th>Camera</th><td><%- exif$make  %> <%- exif$model %></td></tr>' +
    '<% } if (exif$fstop) { %>' +
    '<tr><th>Aperture</th><td>f/<%- parseInt(exif$fstop, 10) %></td></tr>' +
    '<% } if (exif$exposure) { %>' +
    '<tr><th>Exposure</th><td><%- new Fraction(parseFloat(exif$exposure)).toFraction() %></td></tr>' +
    '<% } if (exif$focallength) { %>' +
    '<tr><th>Focal length</th><td><%- parseInt(exif$focallength * CROP_FACTOR, 10) %> mm</td></tr>' +
    '<% } if (exif$iso) { %>' +
    '<tr><th>ISO</th><td><%- exif$iso %></td></tr>' +
    '<% } if (exif$flash) { %>' +
    '<tr><th>Flash</th><td><% if (exif$flash === "false") { %>No<% } else { %>Yes<% } %></td></tr>' +
    '<% } if (exif$time) { %>' +
    '<tr><th>Date</th><td><%- new Date(parseInt(exif$time)).toUTCString().slice(0, -7) %></td></tr>' +
    '<% } if (tags) { %>' +
    '<tr><th>Tags</th><td class="tags">><%- tags.join(" ") %></td></tr>' +
    '<% } %>' +
    '</table>' +
    '</div>' +
    '<div class="additional">' +
    '<a href="#" class="view-exif" data-image="<%- original %>">View info</a>' +
    '<a href="#" class="filter-tags">Filter by tag</a>' +
    '<a href="<%- original %>" class="download" download>Download original</a>' +
    '</div>' +
    '</div>'
  );

  var params = {};
  _.forEach(window.location.hash.split('&'), function (param) {
    param = param.split('=') || [param, ''];
    params[_.trim(param[0], '#')] = param[1];
  });

  function updateHash(key, value) {
    if (!_.isNull(value)) {
      params[key] = value;
    } else {
      delete params[key];
    }
    var query = _.map(params, function (value, key) {
      return key + '=' + value;
    });
    window.location.hash = query.join('&');
  }

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
    // Remove the slide hash.
    updateHash('slide', null);
  }

  function filterSlideshow($slideshow, filters) {
    var navSelector = $slideshow.slick('slickGetOption', 'asNavFor');
    var $nav = $(navSelector);

    if (filters.tags && !_.isEmpty(filters.tags)) {
      $slideshow.slick('slickUnfilter');
      $nav.slick('slickUnfilter');
      var slidesFiltered = [];
      $slideshow.slick('slickFilter', function (idx, element) {
        var slickIndex = element.dataset && element.dataset.slickIndex;
        // Something's wrong
        if (!slickIndex) {
          return true;
        }
        var slideTags = element.dataset.tags.split(',');
        if (slideTags.length === 0) {
          return false;
        }
        var iterationList;
        var lookupList;
        if (slideTags.length > filters.tags.length) {
          iterationList = filters.tags;
          lookupList = slideTags;
        } else {
          iterationList = slideTags;
          lookupList = filters.tags;
        }
        for (var i = 0, l = iterationList.length; i < l; i++) {
          if (lookupList.indexOf(iterationList[i]) === -1) {
            return false;
          }
        }
        slidesFiltered.push(slickIndex);
        return true;
      });

      $nav.slick('slickFilter', function (idx, element) {
        var slickIndex = element.dataset && element.dataset.slickIndex;
        // Something's wrong
        if (!slickIndex) {
          return true;
        }
        return slidesFiltered.indexOf(slickIndex) !== -1;
      });
    } else {
      $slideshow.slick('slickUnfilter');
      $nav.slick('slickUnfilter');
    }
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

  function toggleFilterList($filters, tags, event) {
    event.preventDefault();

    if (!$filters.hasClass('filters-initialized')) {
      $filters.html(templateFilters({tags: tags}));
      $filters.addClass('filters-initialized');
      $filters.find('select').select2({
        placeholder: 'Select which tags to show'
      });
    } else if ($filters.hasClass('hidden')) {
      $filters.removeClass('hidden');
    } else if (!$filters.hasClass('hidden')) {
      $filters.addClass('hidden');
    }
  }

  function createSlideshow($album, data, options) {
    var $slideshow = $album.find('.slideshow');
    var $nav = $album.find('.slideshow-nav');
    var $openLink = $album.find('.open');
    var $closeLink = $album.find('.close');
    var $overlay = $album.find('.slideshow-overlay');
    var $filters = $overlay.find('.tag-filters');
    var photos = data.feed.entry;
    var tags = {};

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
      return null;
    }

    // Restructure the photo objects.
    photos = _.map(photos, function (entry) {
      var original = entry.media$group.media$content[0];
      var large = entry.media$group.media$thumbnail[0];
      var thumbnail = entry.media$group.media$thumbnail[1];
      var photoTags = !_.isEmpty(entry.media$group.media$keywords) ?
        entry.media$group.media$keywords.$t.split(', ') : [];
      var exif = _.mapValues(entry.exif$tags, function (tag) {
        return tag.$t ? tag.$t : false;
      });
      var camera = (exif.exif$make && exif.exif$model) ? exif.exif$make + ' ' + exif.exif$model : 'unknown';

      _.forEach(photoTags, function (tag) {
        tags[tag] = 0;
      });

      return _.assign({
        original: original.url,
        large: large.url,
        thumbnail: thumbnail.url,
        tags: photoTags,
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
    $album.on('click', '.filter-tags', toggleFilterList.bind(null, $filters, tags));
    $album.on('change', 'select.filter', function (event) {
      var selected = $(event.target).val();
      updateHash('tags', selected.join(','));
      filterSlideshow($slideshow, {tags: selected});
    });

    $slideshow.on('afterChange', function () {
      var currentSlide = $slideshow.slick('slickCurrentSlide');
      updateHash('slide', currentSlide);
    });

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
      slidesToScroll: 18,
      dots: true,
      arrows: true,
      focusOnSelect: true
    });

    return $slideshow;
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
        var $slideshow = createSlideshow($album, data, options);
        // Go to slide specified in URL.
        if (params.tags) {
          // Build the select
          $album.find('.filter-tags').trigger('click');
          // Select the tags from the URL.
          $album.find('select.filter').val(params.tags.split(','));
          $album.find('select.filter').trigger('change');
        }
        if (params.slide) {
          $slideshow.slick('slickGoTo', params.slide);
        } else {
          // Store the first slide in the URL
          $slideshow.trigger('afterChange');
        }
      });
  });

  if (params.slide || params.tags) {
    $('.picasa-album .open').trigger('click');
  }
})(this.jQuery, this._);

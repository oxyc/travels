(function ($, _, L, tMap) {
  'use strict';

  var isSmallScreen = window.matchMedia && window.matchMedia('(max-width: 50rem)').matches;

  var CROP_FACTOR = {
    'FUJIFILM X-E2': 1.5
  };

  var templateRssUrl = _.template(
    'https://picasaweb.google.com/data/feed/api/user/<%- userId %>/' +
    '<% if (albumId) { %>albumid/<%- albumId %>/<% } %>' +
    '?alt=json&kind=photo&imgmax=d&thumbsize=1024,72' +
    '&fields=entry(' +
    'exif:tags,georss:where,' +
    'gphoto:size,gphoto:width,gphoto:height,gphoto:id,' +
    'media:group(media:content,media:thumbnail,media:keywords,media:description)' +
    ')'
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
    '<div data-tags="<%- tags.join(",") %>" data-id="<%- id %>">' +
    '<img data-lazy="<%- large %>">' +
    '<% if (description) { %><div class="description"><%- description %></div><% } %>' +
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
    '<% } if (width && height) { %>' +
    '<tr><th>Dimensions</th><td><%- width %>x<%- height %></td></tr>' +
    '<% } if (size) { %>' +
    '<tr><th>Size</th><td><%- (size / 1024 / 1024).toFixed(2) %> MB</td></tr>' +
    '<% } if (tags) { %>' +
    '<tr><th>Tags</th><td class="tags"><%- tags.join(", ") %></td></tr>' +
    '<% } %>' +
    '</table>' +
    '</div>' +
    '<div class="additional overlay">' +
    '<a href="#" class="view-exif" data-image="<%- original %>">View info</a>' +
    '<% if (latlng) { %>' +
    '<a href="#" class="view-on-map" data-id="<%- id %>" data-lng="<% latlng[1] %>">View on map</a>' +
    '<% } %>' +
    '<a href="#" class="filter-tags">Filter by tag</a>' +
    '<a href="<%- original %>" class="download" download>Download original</a>' +
    '</div>' +
    '</div>'
  );

  var templatePhotoPopup = _.template(
    '<a href="#" class="photo-popup" data-id="<%- id %>"><img src="<%- thumbnail %>"></a>'
  );

  // Global list of all photo tags found
  var tags = {};
  // Global list of all photo locations found.
  var locations = {};

  // Parse the parameters set in the url hash.
  var params = (function () {
    var obj = {};
    _.forEach(window.location.hash.split('&'), function (param) {
      if (!param) {
        return;
      }
      param = param.split('=') || [param, ''];
      obj[_.trim(param[0], '#')] = param[1];
    });
    return obj;
  })();

  function updateHash(key, value) {
    if (!_.isNull(value)) {
      params[key] = value;
    } else {
      _.omit(params, key);
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
    // As the slideshow was constructed while hidden, all DOM size values need
    // to be recalculated.
    if (!$slideshow.resized) {
      $(window).trigger('resize');
      $slideshow.resized = true;
    }
    $slideshow.parent().removeClass('hidden');
  }

  function hideSlideshow($slideshow) {
    $slideshow.parent().addClass('hidden');
    // Remove the slide hash.
    updateHash('slide', null);
  }

  function gotoSlide($slideshow, id) {
    var $slide = $slideshow.find('.slick-slide').filter('[data-id="' + id + '"]');
    var slideIndex = $slide.data('slick-index');
    $slideshow.slick('slickGoTo', slideIndex);
  }

  function createPhotoMarker(properties) {
    var popup = L.popup({className: 'popup-photo'})
      .setContent(templatePhotoPopup(properties));

    return L.marker(
      properties.latlng,
      {icon: L.MakiMarkers.icon(tMap.markers.photo)}
    ).bindPopup(popup);
  }

  function createPhotoObject(entry) {
    var photoTags = !_.isEmpty(entry.media$group.media$keywords) ?
      entry.media$group.media$keywords.$t.split(', ') : [];
    // Fetch the exif data flattened so it can be merged without a wrapper
    // object.
    var exif = _.mapValues(entry.exif$tags, function (tag) {
      return tag.$t ? tag.$t : false;
    });
    // Figure out the camera so we can lookup the crop factor.
    var camera = (exif.exif$make && exif.exif$model) ? exif.exif$make + ' ' + exif.exif$model : 'unknown';
    // Fetch the LatLng value if it exists.
    var latlng = entry.georss$where &&
      entry.georss$where.gml$Point &&
      entry.georss$where.gml$Point.gml$pos &&
      entry.georss$where.gml$Point.gml$pos.$t &&
      entry.georss$where.gml$Point.gml$pos.$t.split(' ');

    return _.assign({
      id: entry.gphoto$id.$t,
      original: entry.media$group.media$content[0].url,
      large: entry.media$group.media$thumbnail[0].url,
      thumbnail: entry.media$group.media$thumbnail[1].url,
      tags: photoTags,
      size: entry.gphoto$size.$t,
      width: entry.gphoto$width.$t,
      height: entry.gphoto$height.$t,
      description: entry.media$group.media$description.$t,
      latlng: latlng,
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
  }

  // @see https://github.com/Leaflet/Leaflet.markercluster/issues/13
  function addMarkersToMap(locations) {
    // Real layer is attached to MarkerClusterGroup
    var layer = L.layerGroup(_.values(locations));
    // Dummy layer is attached to Map
    var dummyLayer = L.layerGroup();
    if (!tMap.controls.other) {
      tMap.controls.other = L.control.layers(null, null, {collapsed: false}).addTo(tMap.lMap);
    }
    // So that we can identify the layer later.
    layer.type = 'photo';
    dummyLayer.type = 'photo';
    // Add the checkbox to the leaflet control.
    tMap.controls.other.addOverlay(dummyLayer, 'Photos');
    // Don't display the photos by default
    // dummyLayer.addTo(tMap.lMap);
    // tMap.cluster.addLayer(layer);

    // When the dummy layer is toggled, add/remove the real layer from the
    // MarkerClusterGroup.
    tMap.lMap.on('overlayadd overlayremove', function (overlay) {
      if (overlay.layer.type !== 'photo') {
        return;
      }
      if (overlay.type === 'overlayadd') {
        tMap.cluster.addLayer(layer);
      } else {
        tMap.cluster.removeLayer(layer);
      }
    });
  }

  function attachSlideshowListeners($album) {
    var $slideshow = $album.find('.slideshow');
    var $overlay = $album.find('.slideshow-overlay');
    var $filters = $overlay.find('.tag-filters');
    var $closeLink = $album.find('.close');
    var $openLink = $album.find('.open');

    // Attach event listeners
    $openLink.on('click', showSlideshow.bind(null, $slideshow));
    $closeLink.on('click', hideSlideshow.bind(null, $slideshow));
    $album.on('click', '.view-exif', toggleExifData);
    $album.on('click', '.filter-tags', toggleFilterList.bind(null, $filters, tags));

    // Update the URL hash as tags are added.
    $album.on('change', 'select.filter', function (event) {
      var selected = $(event.target).val();
      updateHash('tags', _.isArray(selected) ? selected.join(',') : selected);
      filterSlideshow($slideshow, {tags: selected});
    });
    // Update the URL hash as slides are displayed.
    $slideshow.on('afterChange', function () {
      var currentSlide = $slideshow.slick('slickCurrentSlide');
      updateHash('slide', currentSlide);
    });
    // Display the photo on the map whe the link is clicked.
    $album.on('click', '.view-on-map', function (event) {
      event.preventDefault();
      hideSlideshow($slideshow);
      var id = $(this).data('id');
      var marker = locations[id];
      marker.openPopup();
      tMap.lMap.panTo(marker.getLatLng());
    });
    // Display the slide in when the leaflet popup is clicked.
    $(document).on('click', '.leaflet-popup a.photo-popup', function (event) {
      event.preventDefault();
      var id = $(this).data('id');
      showSlideshow($slideshow);
      gotoSlide($slideshow, id);
    });
  }

  function filterSlideshow($slideshow, filters) {
    var navSelector = $slideshow.slick('slickGetOption', 'asNavFor');
    var $nav = $(navSelector);

    // Reset the filters
    $slideshow.slick('slickUnfilter');
    $nav.slick('slickUnfilter');

    if (filters.tags && !_.isEmpty(filters.tags)) {
      var slidesFiltered = [];
      // Remove slides missing at least one of the specified tags from the main
      // slideshow.
      $slideshow.slick('slickFilter', function (idx, element) {
        var slickIndex = element.dataset && element.dataset.slickIndex;
        // Something's wrong
        if (!slickIndex) {
          return true;
        }
        // Remove slides entirely without tags.
        var slideTags = element.dataset.tags.split(',');
        if (slideTags.length === 0) {
          return false;
        }
        // If one of the tags are missing, remove the slide.
        for (var i = 0, l = filters.tags.length; i < l; i++) {
          if (slideTags.indexOf(filters.tags[i]) === -1) {
            return false;
          }
        }
        // Keep a reference to the slide that is displayed so we can reuse it
        // for the navigation as well.
        slidesFiltered.push(slickIndex);
        return true;
      });

      // Remove the slides from the navigation slideshow as well.
      $nav.slick('slickFilter', function (idx, element) {
        var slickIndex = element.dataset && element.dataset.slickIndex;
        // Something's wrong
        if (!slickIndex) {
          return true;
        }
        // Did we keep it during the filtering in the main slideshow?
        return slidesFiltered.indexOf(slickIndex) !== -1;
      });
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

    // Remove the slideshow display link if there aren't any photos to show.
    if (!photos.length) {
      $album.find('.open').hide();
      return null;
    }

    // Restructure the photo objects.
    photos = _.chain(photos)
      .map(createPhotoObject)
      .forEach(function (photo) {
        // Add the tags to the global tag filter so they become available.
        _.forEach(photo.tags, function (tag) {
          tags[tag] = 0;
        });
        // If there photo had a geo positioning, create its marker.
        if (photo.latlng) {
          locations[photo.id] = createPhotoMarker(photo);
        }
      })
      .value();

    // Build slideshow HTML
    $slideshow.append(_.reduce(photos, buildSlides, ''));
    $nav.append(_.reduce(photos, buildThumbnails, ''));

    attachSlideshowListeners($album, {tags: tags, locations: locations});

    // Add the locations to the map.
    if (!_.isEmpty(locations) && tMap.lMap) {
      addMarkersToMap(locations);
    }

    // Initialize slideshows
    $slideshow.slick({
      asNavFor: '.slideshow-nav',
      lazyLoad: 'ondemand',
      slidesToShow: 1,
      slidesToScroll: 1,
      fade: true,
      arrows: true,
      infinite: false
    });
    $nav.slick({
      asNavFor: '.slideshow',
      lazyLoad: 'ondemand',
      slidesToShow: isSmallScreen ? 9 : 18,
      arrows: false,
      focusOnSelect: true,
      infinite: false
    });

    return $slideshow;
  }

  // Initialize slideshows
  $('.picasa-album').each(function () {
    var $album = $(this);
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
        }
        if (params.tags || params.slide) {
          $('.picasa-album .open').trigger('click');
        }
      });
  });
})(this.jQuery, this._, this.L, this.tMap);

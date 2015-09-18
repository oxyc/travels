jQuery.cachedScript = function (url, options) {
  options = jQuery.extend(options || {}, {
    dataType: 'script',
    cache: true,
    url: url
  });
  return jQuery.ajax(options);
};

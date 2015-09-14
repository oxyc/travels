(function ($) {
  $.whenAll = function (deferreds) {
    if (deferreds && deferreds.length) {
      var deferred = $.Deferred(),
          toResolve = deferreds.length,
          someFailed = false,
          fail,
          always;
      always = function () {
        if (!--toResolve) {
          deferred[someFailed ? 'reject' : 'resolve']();
        }
      };
      fail = function () {
        someFailed = true;
      };
      deferreds.forEach(function (d) {
        d.fail(fail).always(always);
      });
      return deferred;
    } else {
      return $.Deferred().resolve();
    }
  };
}(jQuery));

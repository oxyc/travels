/* eslint new-cap:0 */
jQuery.whenAll = function (firstParam) {
  var args = arguments;
  var sliceDeferred = [].slice;
  var i = 0;
  var length = args.length;
  var count = length;
  var rejected;
  var deferred = length <= 1 && firstParam && jQuery.isFunction(firstParam.promise) ?
    firstParam : jQuery.Deferred();

  function resolveFunc(i, reject) {
    return function (value) {
      rejected |= reject;
      args[i] = arguments.length > 1 ? sliceDeferred.call(arguments, 0) : value;
      if (!(--count)) {
        // Strange bug in FF4:
        // Values changed onto the arguments object sometimes end up as
        // undefined values outside the $.when method. Cloning the object into
        // a fresh array solves the issue
        var fn = rejected ? deferred.rejectWith : deferred.resolveWith;
        fn.call(deferred, deferred, sliceDeferred.call(args, 0));
      }
    };
  }

  if (length > 1) {
    for (; i < length; i++) {
      if (args[i] && jQuery.isFunction(args[i].promise)) {
        args[i].promise().then(resolveFunc(i), resolveFunc(i, true));
      } else {
        --count;
      }
    }
    if (!count) {
      deferred.resolveWith(deferred, args);
    }
  } else if (deferred !== firstParam) {
    deferred.resolveWith(deferred, length ? [firstParam] : []);
  }
  return deferred.promise();
};

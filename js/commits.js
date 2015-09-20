(function ($, _) {
  var $el = $('#commit-history');
  if ($el.length) {
    var path = 'https://api.github.com/repos/oxyc/travels/commits';
    var template = _.template(
      '<li><a href="<%- html_url %>"><span class="date"><%- new Date(commit.author.date).toDateString() %></span> <%- commit.message %></li>'
    );

    $.getJSON(path)
      .done(function (data) {
        var content = _.reduce(data, function (content, commit) {
          return content + template(commit);
        }, '');
        console.log(content);
        $el.html(content);
      });
  }
})(this.jQuery, this._);

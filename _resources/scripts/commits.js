import $ from 'jquery';

const $el = $('#commit-history');
if ($el.length) {
  const path = 'https://api.github.com/repos/oxyc/travels/commits';
  const template = _.template(
    '<li><a href="<%- html_url %>"><span class="date"><%- new Date(commit.author.date).toDateString() %></span> <%- commit.message %></li>'
  );

  $.getJSON(path)
    .done((data) => {
      const content = _.reduce(data, function (content, commit) {
        return content + template(commit);
      }, '');
      $el.html(content);
    });
}
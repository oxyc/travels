const el = document.getElementById('commit-history');
if (el) {
  const path = 'https://api.github.com/repos/oxyc/travels/commits';
  const template = _.template(
    '<li><a href="<%- html_url %>"><span class="date"><%- new Date(commit.author.date).toDateString() %></span> <%- commit.message %></li>'
  );

  fetch(path)
    .then(data => data.json())
    .then((data) => {
      const content = _.reduce(data, function (content, commit) {
        return content + template(commit);
      }, '');
      el.innerHTML = content;
    });
}
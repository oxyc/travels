---
layout: page
title: Trips
---
{{ page.title }}
================

<ul class="categories">
{% assign categorylist = site.categories %}
{% include categorylist %}
</ul>

{% for category in site.categories %}
  <h2 id="{{ category | first }}">{{ category | first | capitalize }}</h2>
  <ul class="posts">
  {% assign pagelist = category[1] %}
  {% include pagelist %}
  </ul>
{% endfor %}

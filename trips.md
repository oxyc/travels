---
layout: page
title: Trips
---
{{ page.title }}
================

<ul class="trips">
{% assign triplist = site.categories %}
{% include triplist %}
</ul>

{% for trip in site.categories %}
  <h2 id="{{ trip | first }}">{{ trip | first | capitalize }}</h2>
  <ul class="posts">
  {% assign pagelist = trip[1] %}
  {% include pagelist %}
  </ul>
{% endfor %}

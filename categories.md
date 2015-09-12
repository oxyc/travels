---
layout: page
title: Categories
---
{{ page.title }}
================

<ul class="tags">
{% assign taglist = site.tags %}
{% include taglist %}
</ul>

{% for tag in site.tags %}
  <h2 id="{{ tag | first }}">{{ tag | first | capitalize }}</h2>
  <ul class="posts">
  {% assign pagelist = tag[1] %}
  {% include pagelist %}
  </ul>
{% endfor %}

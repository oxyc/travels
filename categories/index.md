---
layout: page
title: Categories
---
{{ page.title }}
================

{% include categorylist.html categories=site.tags %}

{% for category in site.tags %}
  <h2 id="{{ category | first }}">{{ category | first | split: '-' | join: ' ' | capitalize }}</h2>
  {% assign country_list = category[1] %}
  {% include countrylist.html countries=country_list %}
{% endfor %}

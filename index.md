---
layout: page
title: Front
---
{{ page.title }}
================

A personal travel log of Oskar Schöldström.

### Countries visited

<ul class="posts">
{% assign pagelist = site.posts %}
{% include pagelist %}
</ul>

### Trips

{% unless site.categories == empty %}
  <ul class="trips">
  {% assign triplist = site.categories %}
  {% include triplist %}
  </ul>
{% endunless %}

### Tags

{% unless site.tags == empty %}
  <ul class="tags">
  {% assign taglist = site.tags %}
  {% include taglist %}
  </ul>
{% endunless %}

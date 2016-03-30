---
layout: page
title: Blog
---
{{ page.title }}
================

{% for post in site.posts %}
{% if post.type == 'blog' %}

<h2><a href="{{ post.url }}">{{ post.title }}</a></h2>

{{ post.excerpt }}

<a href="{{ post.url }}">Read the full post</a>

{% endif %}
{% endfor %}

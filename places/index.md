---
layout: page
title: Places I have visited
---
{{ page.title }}
================

{% assign types = 'Trek|Sight|Nomadic Village|Pass|Peak|City|Border Crossing' | split: '|' %}

### Type of location

<ul>
{% for type in types %}
  <li><a href="/places/#{{ type | slugify }}">{{ type }}</a></li>
{% endfor %}
</ul>

<div class="locations">
{% for type in types %}
  <h3 id="{{ type | slugify }}">{{ type }}</h3>
  <ul>
  {% for trip in site.data.trips %}
    {% assign trip_hash = trip[1] %}
    {% for country in trip_hash.properties.countries %}
      {% assign country_id = country.name | slugify %}
      {% assign country_data = site.data.countries[country_id] %}
      {% for location in country_data.features %}
        {% if location.properties.visited and location.properties.type == type %}
        <li>{% include location.html location=location.properties country=country_data.properties %}</li>
        {% endif %}
      {% endfor %}
    {% endfor %}
  {% endfor %}
  </ul>
{% endfor %}
</div>

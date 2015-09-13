---
layout: page
title: Trips
---
{{ page.title }}
================

{% include triplist.html trips=site.categories %}

{% for trip in site.categories %}
  {% assign trip_id = trip | first %}
  {% assign trip_data = site.data.trips | where:'id',trip_id %}
  <h2 id="{{ trip_id }}">{{ trip_data | map: 'name' }}</h2>

  {{ trip_data | map: 'description' }}

  <ul class="countries">
  {% assign country_list = trip[1] %}
  {% include countrylist.html countries=country_list %}
  </ul>
{% endfor %}

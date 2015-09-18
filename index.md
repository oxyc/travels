---
layout: page
---

A personal travel log of Oskar Schöldström. I've built this site to keep a
record of my travels and collect as much as possible in one place.

- Travel routes are stored as [GeoJSON files](https://geojson.io), and
  displayed on the world map in different colors depending on the type of
  route.

- Location markers are as well stored as [GeoJSON files](https://geojson.io)
  and displayed on the map using different icons to indicate the location type.

- Expenditure data has been recorded using [Toshl Finance](https://toshl.com)
  but is only available from my latest trips. *Note* some of this data is still
  incorrect as flights and tour prices are missing for some locations.

- Photos are pulled in using the [Picasa API](https://photos.google.com) where
  I store all my photos. These photos are available both on the map and in a
  gallery on trip and country report pages. You are also able to filter them by
  tags. *Note* so far I've only tagged, and added a small portion of photos
  from my trips. More coming soon.

- Some country and trip report pages might have stories included. These are all
  available on my [instagram account](https://instagram.com/oskar.scholdstrom/)
  but unfortunately I haven't found a way to pull them in automatically. At
  some point I will probably start pulling in more of them manually.

### Cost per day per country

<div class="expenditure-chart front" data-title="" data-chart="perCountryCPD"></div>

### Countries visited

{% include countrylist.html countries=site.posts %}

### Trips

{% include triplist.html trips=site.categories %}

### Tags

{% include categorylist.html categories=site.tags %}

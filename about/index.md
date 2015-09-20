---
layout: page
title: Who are you and where am I?
---
Who are you and where am I?
===========================

### Who are you?

I'll add this section at some point...

### Where am I?

This is a travel log of all the trips I have done and all countries I have
visited. I've built it to keep a record of my travels and gather all the data
in one place instead of having it spread across the internet in places I will
forget exist.

Currently I collect:

- Travel routes (all added)
- Location markers (all added, but some, such as border crossings, needs to be
  removed now that I have routes)
- Expenditures per country/trip and overall (still missing some visa fees as
  well as flight expenses to cuba and around middle east). This data is only
  available from my trips through the middle east and south america.
- Photos (currently I've only added them for countries visited in the south
  america trip).

### Features, and technology

- Travel routes, stored as [GeoJSON files](https://geojson.io), but encoded to
  [TopoJSON](https://github.com/mbostock/topojson). These routes are
  color-coded and have a tooltip that displays the distance traveled. To get a
  better overview of a route, you can uncheck the _Markers_ checkbox on the map
  to only display routes.

- Location markers are also stored as [GeoJSON files](https://geojson.io). The
  icons change depending on the type of location (city, trek, nomadic village,
  pass etc) and become gray if I have not visited them yet. You can search
  these by name using the looking glass icon on the map.

- Expenditure data has been recorded using [Toshl Finance](https://toshl.com)
  while I've been traveling. From their service I've [exported a csv](https://github.com/oxyc/travels/blob/gh-pages/_data/expenditures/south-america-1.csv),
  normalized tags, and added the country where the expense was spent. This data
  is visualized using the [Highcharts library](highcharts.com) library. By
  default flights and boats are not included in the cost per day but you can
  add it by clicking the labels below the chart.

- Photos are pulled in using the [Picasa API](https://photos.google.com) where
  I currently store all my photos on a 100 GB ($1.99/month) plan.
  These photos are available both on the map, and in a separate gallery on trip and
  country reports. You are able to filter them by tags, open them on the map,
  and display their EXIF data.

- Some country and trip report pages might have stories included. These are all
  available on my [instagram account](https://instagram.com/oskar.scholdstrom/)
  but unfortunately I haven't found a way to pull them in automatically. At
  some point I will probably start pulling in more of them manually.

- Planned trips (and suggestions) are kept in the [issue
  queue](https://github.com/oxyc/travels/issues) of this repository.

- All routes, marker locations, expense data, and code is available on
  [GitHub](https://github.com/oxyc/travels) where you can have a look.

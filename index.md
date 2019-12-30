---
layout: page
---

<div class="profile-photo"><img src="/dist/images/custom/profile-small.jpg" alt="Profile picture" width="100" height="100"></div>

This is a travel log of all the trips I have done and all countries I have
visited. I've built it to keep a record of my travels and gather all the data
in one place instead of having it spread across the internet in places I will
forget exist.

If you want to find out more you can read about:

- [Who I am and how this site is built](/about/#main)
- [Recent changes done to the website](/changes/#main)
- [What I have in my backpack](/backpack/#main)
- [A list of all places grouped by type](/places/#main)

<div class="blog-posts">
  <h3>Blog posts</h3>
  {% include bloglist.html %}
</div>

### Trips

{% include triplist.html trips=site.categories %}

### Cost per day per country

<div class="expenditure-chart front" data-title="" data-chart="perCountryCPD"></div>

### Countries visited

{% include countrylist.html countries=site.posts %}

### Tags

{% include categorylist.html categories=site.tags %}

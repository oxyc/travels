(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{0:function(e,t,a){a("bYYy"),a("6uIU"),e.exports=a("4NqL")},1:function(e,t){},"4NqL":function(e,t){},"6uIU":function(e,t){},bYYy:function(e,t,a){"use strict";a.r(t);var r=a("LvDl"),n=a.n(r),o=a("4R65"),i=a.n(o),c=a("vyr2");a("JXP8"),a("qmF3"),a("k8be");i.a.Icon.Default.imagePath="/dist/images",i.a.mapbox=i.a.mapbox||{},i.a.mapbox.accessToken="pk.eyJ1Ijoib3h5IiwiYSI6InBMaXRxSDAifQ.w9NqRLivEBn6BoMRkKmg3A",i.a.MakiMarkers.accessToken=i.a.mapbox.accessToken;var u,l,s=(u="world-map",l=i.a.map(u,{center:[18,0],zoom:2,minZoom:2,maxZoom:10,scrollWheelZoom:!1}),i.a.tileLayer("https://api.mapbox.com/v4/{id}/{z}/{x}/{y}"+(i.a.Browser.retina?"@2x":"")+".png?access_token={accessToken}",{attribution:'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',maxZoom:18,id:"oxy.ndp8318l",accessToken:i.a.mapbox.accessToken}).addTo(l),l),p=i.a.markerClusterGroup({maxClusterRadius:20}).addTo(s),f={},y={trek:{icon:"campsite",color:"#159957"},city:{icon:"circle",color:"#659CD6"},park:{icon:"park",color:"#159957"},homebase:{icon:"building",color:"#D85E5E"},photo:{icon:"camera",color:"#659CD6",size:"s"},visited:{color:"#659CD6"}},d={trek:{color:"#159957",opacity:1,weight:5},route:{color:"#000",opacity:1,weight:2},tour:{color:"#000",opacity:1,weight:2},flight:{color:"#000",opacity:.3,weight:2},boat:{color:"#2057D0",opacity:.3,weight:2},mouseover:{color:"#ff0000",opacity:.7,weight:3}},m=document.getElementById("world-map"),v=n.a.reject(m.dataset.trips.split(" ")||[],n.a.isEmpty),h=n.a.reject(m.dataset.country.split(" ")||[],n.a.isEmpty),g={};fetch("/world.json").then((function(e){return e.json()})).then((function(e){var t=n.a.forEach(e.trips,(function(e){e.promise=fetch("/".concat(e.path))}));s.once("zoomstart",(function(){return m.style.backgroundImage="none"})),s.on("overlayadd overlayremove",n.a.debounce((function(e){if(e.layer.type&&"country"===e.layer.type){var t=p.getLayers();if(!t.length)return;for(var a=new i.a.LatLngBounds,r=0,n=t.length;r<n;r++)a.extend(t[r].getLatLng());s.fitBounds(a)}}),100)),function(e){var t=D("country",e=e.sort((function(e,t){return e.properties.id<t.properties.id?-1:e.properties.id>t.properties.id?1:0})),{onEachFeature:w,pointToLayer:x}),a={};n.a.forEach(t,(function(e,t){a[t]=i.a.layerGroup(),a[t].type="country",a[t].id=e.id,h.length&&-1===h.indexOf(e.id)||(a[t].addTo(s),p.addLayer(e))}));var r=f.country=L("country",a);for(var o in r._layers)r._layers.hasOwnProperty(o)&&(g[i.a.Util.stamp(r._layers[o].layer)]=r._layers[o].name);s.on("overlayadd overlayremove",(function(e){var a=g[i.a.Util.stamp(e.layer)];"country"===e.layer.type&&("overlayadd"===e.type?p.addLayer(t[a]):p.removeLayer(t[a]))}))}(e.countries),s.addControl((a=new i.a.Control.Search({layer:p,propertyName:"name",circleLocation:!1,initial:!1,autoCollapse:!0,zoom:10}),a.on("search_locationfound",(function(e){return function(e){if(!p.hasLayer(e)||!e._icon&&!e.__parent._icon)return!1;p.zoomToShowLayer(e,(function(){e._popup&&e.openPopup()}))}(e.layer)})),a)),Promise.allSettled(n.a.map(t,(function(e){return e.promise.then((function(e){return e.json()}))}))).then((function(e){(function(e){var t=D("trip",e,{onEachFeature:_});h.length||n.a.forEach(t,(function(e){return e.addTo(s)}));var a=f.trip=L("trip",t);for(var r in a._layers)a._layers.hasOwnProperty(r)&&(g[i.a.Util.stamp(a._layers[r].layer)]=a._layers[r].name);s.on("overlayadd overlayremove",(function(t){var a=g[i.a.Util.stamp(t.layer)];if("trip"===t.layer.type){var r=e[a],o=n.a.map(r.properties.countries,"name");!function(e,t,a){for(var r=n.a.chain(e._layers).pick((function(e){return-1!==t.indexOf(e.layer.id)})).keys().value(),o=e._form.getElementsByTagName("input"),i=0,c=o.length;i<c;i++){var u=o[i];-1!==r.indexOf(String(u.layerId))&&(a&&u.checked||(a||u.checked)&&$(u).trigger("click"))}}(f.country,o,"overlayadd"===t.type)}})),v.length&&(n.a.chain(t).pick((function(e){return-1===v.indexOf(e.id)})).forEach((function(e){return s.removeLayer(e)})).value(),n.a.chain(t).pick((function(e){return-1!==v.indexOf(e.id)})).forEach((function(e){s.removeLayer(e),s.addLayer(e)})).value())})(t=n.a.chain(t).filter((function(t,a){return"fulfilled"===e[a].status})).forEach((function(t,a){return t.features=e[a].value})).keyBy((function(e){return e.properties.name})).value()),f.other||(f.other=i.a.control.layers(null,null,{collapsed:!1}).addTo(s),f.other.addOverlay(p,"Markers"))}));var a}));var b=n.a.template('<strong><%- name %>, <%- _.startCase(country) %></strong> <small><%- type %></small><br><% if (!visited) { %><em>planning to visit</em><br><% } %><% if (typeof homebase !== "undefined" && homebase) { %><em>I used to live here</em><% } %><% if (typeof description !== "undefined") { %><span class="description"><%- description %></span><% } %>'),k=n.a.template("<strong><%- name %></strong> <small><%- type %></small><br>Distance: <%- Math.round(distance / 1000) %> km");function w(e,t){var a=b(e.properties);t.bindPopup(a)}function x(e,t){var a=e.properties.type.toLowerCase();e.properties.homebase?a="homebase":-1!==["national park","nature reserve"].indexOf(a)?a="park":y.hasOwnProperty(a)||(a="visited");var r=y[a];return e.properties.visited||((r=n.a.clone(r)).color="#999"),i.a.marker(t,{icon:i.a.MakiMarkers.icon(r)})}function D(e,t,a){var r=n.a.chain(t).filter((function(e){return"Topology"!==e.features.type||e.features.arcs.length})).forEach((function(t){if("Topology"===t.features.type){var r=i.a.geoJson(null,a);t.layer=c.topojson.parse(t.features,null,r)}else t.layer=i.a.geoJson(t.features,a);t.layer.type=e,t.layer.id=t.properties.id})).keyBy((function(e){return e.properties.name})).value();return n.a.mapValues(r,"layer")}function L(e,t){var a=i.a.control.layers(null,t,{collapsed:!0}).addTo(s),r=a.getContainer();return i.a.DomUtil.addClass(r,"control-custom"),i.a.DomUtil.addClass(r,"control-"+e),i.a.Browser.touch?i.a.DomEvent.disableClickPropagation(r):i.a.DomEvent.disableClickPropagation(r).disableScrollPropagation(r),a}function _(e,t){var a=function(e){return d[e.properties.type.toLowerCase()]}(e);!function(e,t){var a;e.properties.distance=n.a.reduce((a=e.geometry.coordinates).slice(1).map((function(e,t){return[a[t],e]})),(function(e,t){return e+i.a.latLng(t[0][1],t[0][0]).distanceTo(i.a.latLng(t[1][1],t[1][0]))}),0);var r=k(e.properties);t.bindPopup(r)}(e,t),t.setStyle(a),t.on("mouseover",(function(){return t.setStyle(d.mouseover)})),t.on("mouseout",(function(){return t.setStyle(a)}))}var C=a("2VIQ"),S=a("6n/F"),T=a.n(S);function E(e){return(E="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(e){return typeof e}:function(e){return e&&"function"==typeof Symbol&&e.constructor===Symbol&&e!==Symbol.prototype?"symbol":typeof e})(e)}var I=document.querySelectorAll(".expenditure-chart");I&&fetch("/expenditures.json").then((function(e){return e.json()})).then((function(e){for(var t=function(t){var a=I[t],r=a.dataset.chart,o={trip:a.dataset.trip,country:a.dataset.country,title:a.dataset.title,countryData:[]},i=n.a.chain(e.expenditures).filter("trip",o.trip).each((function(e){return o.countryData.push(e.countries)})).map("data").flatten().value();if(o.countryData=n.a.chain(o.countryData).flatten(o.countryData).filter((function(e){return e.dates.length>0})).value(),o.country&&(i=n.a.filter(i,"country",o.country),o.countryData=n.a.filter(o.countryData,"name",o.country)),!o.countryData.length)return a.innerHTML="<p><em>No data available yet</em></p>",{v:void 0};A[r](a,i,o)},a=0;a<I.length;a++){var r=t(a);if("object"===E(r))return r.v}document.addEventListener("click",(function(e){!P||e.target&&e.target.tooltipInitalizer||(Object(C.b)(),P=!1)}))}));var B,P=!1,O=["flight","boat","tour"],M=n.a.template('<table><tr><th>Date</th><th>Amount</th><th>Description</th></tr><% _.forEach(data, function (row) { %><tr><td><%- row.date %><td>$<%- row.amount %></td><td><%- row.description || "" %></td></tr><% }); %></table>'),j={},A={perTagCPD:function(e,t,a){var r=N(a.countryData);r=r[a.country];var o=n.a.chain(t).groupBy("tags").map((function(e,t){var a=n.a.sumBy(row,(function(e){return parseInt(e.amount)}));return{name:t,y:a=Math.round(a/r*100)/100}})).value();T.a.chart(e,{chart:{type:"pie"},plotOptions:{pie:{allowPointSelect:!0,dataLabels:{enabled:!1},showInLegend:!0,events:{click:function(e){var a=e.point.name,r=n.a.filter(t,(function(e){return e.tags===a}));z(e.target,r)}}}},tooltip:{valuePrefix:"$",valueSuffix:"/day",pointFormat:"<b>{point.y} ({point.percentage:.1f}%)</b><br/>"},title:{text:a.title||""},series:[{name:"Tags",data:o}]})},perCountryCPD:function(e,t,a){var r=n.a.map(a.countryData,"name"),o=N(a.countryData);B=function(e){var t=n.a.now(),a=0;return n.a.chain(e).map("dates").flatten().each((function(e){var r=new Date(e.start),n=new Date(e.end);r<t&&(t=r),n>a&&(a=n)})).value(),{start:t,end:a}}(a.countryData);var i=n.a.chain(t).groupBy("tags").map((function(e,t){var a=n.a.fill(Array(r.length),0),i=0;return n.a.chain(e).groupBy("country").each((function(e,t){var c=n.a.indexOf(r,t),u=o[t];if(u){var l=n.a.sumBy(e,(function(e){return parseInt(e.amount)}));i+=l,a[c]=l/u,a[c]=Math.round(100*a[c])/100}})).value(),j[t]=i,{name:t,visible:U(t),data:a}})).value();T.a.chart(e,{chart:{type:"bar",events:{redraw:function(){var e=(void 0).axes[1];e.removePlotLine("plot-average"),e.addPlotLine(J(e.series))}}},xAxis:{categories:r},yAxis:{min:0,title:{text:"Cost per day"},labels:{format:"${value}"},stackLabels:{enabled:!0,style:{color:"#999",fontWeight:"normal",textShadow:"none"}},plotLines:[J(i)]},legend:{reversed:!0},plotOptions:{series:{stacking:"normal"},bar:{events:{click:function(e){var a=e.point.category,r=this.name,o=n.a.filter(t,(function(e){return e.country===a&&e.tags===r}));z(e.target,o)}}}},tooltip:{valuePrefix:"$"},title:{text:a.title||""},series:i})}};function z(e,t){e.tooltipInitalizer=!0,Object(C.b)({exclude:e}),(e._tippy||Object(C.a)(e,{content:M({data:t}),trigger:"click"})).show(),P=!0}function U(e){return-1===O.indexOf(e)}function J(e){var t=(B.end-B.start)/1e3/3600/24+1;return{value:n.a.chain(e).filter("visible").reduce((function(e,t){return e+j[t.name]}),0).value()/t,color:"red",width:2,zIndex:20,id:"plot-average"}}function N(e){return n.a.chain(e).keyBy("name").mapValues((function(e){return n.a.reduce(e.dates,(function(e,t){var a=new Date(t.start);return e+(new Date(t.end)-a)/1e3/3600/24+1}),0)})).value()}a("cAGH")},cAGH:function(e,t){var a=document.getElementById("commit-history");if(a){var r=_.template('<li><a href="<%- html_url %>"><span class="date"><%- new Date(commit.author.date).toDateString() %></span> <%- commit.message %></li>');fetch("https://api.github.com/repos/oxyc/travels/commits").then((function(e){return e.json()})).then((function(e){var t=_.reduce(e,(function(e,t){return e+r(t)}),"");a.innerHTML=t}))}}},[[0,1,2]]]);
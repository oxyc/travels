(window.webpackJsonp=window.webpackJsonp||[]).push([[0],{0:function(t,e,a){a("bYYy"),a("6uIU"),t.exports=a("4NqL")},"4NqL":function(t,e){},"6uIU":function(t,e){},bYYy:function(t,e,a){"use strict";a.r(e);var r=a("LvDl"),n=a.n(r),o=a("4R65"),i=a.n(o),c=a("0hfp");a("JXP8"),a("qmF3"),a("k8be");i.a.Icon.Default.imagePath="/dist/images",i.a.mapbox=i.a.mapbox||{},i.a.mapbox.accessToken="pk.eyJ1Ijoib3h5IiwiYSI6InBMaXRxSDAifQ.w9NqRLivEBn6BoMRkKmg3A",i.a.MakiMarkers.accessToken=i.a.mapbox.accessToken,i.a.Control.LayersCloseAll=i.a.Control.Layers.extend({onAdd:function(t){this._initLayout(),this._addButton(),this._update(),this._map=t,t.on("zoomend",this._checkDisabledLayers,this);for(var e=0;e<this._layers.length;e++)this._layers[e].layer.on("add remove",this._onLayerChange,this);return this._container},_addButton:function(){var t=this._container.querySelectorAll(".leaflet-control-layers-list"),e=i.a.DomUtil.create("button","button--toggle-layers",t[0]);e.textContent="Hide all",i.a.DomEvent.on(e,"click",(function(t){i.a.DomEvent.stop(t),e.toggled?(_(this,null,!0),e.textContent="Hide all",e.toggled=!1):(_(this,null,!1),e.textContent="Show all",e.toggled=!0)}),this)}});var l,u,s=(l="world-map",u=i.a.map(l,{center:[18,0],zoom:2,minZoom:2,maxZoom:10,scrollWheelZoom:!0}),i.a.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}",{attribution:'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',maxZoom:18,id:"mapbox/outdoors-v11",accessToken:i.a.mapbox.accessToken}).addTo(u),u),p=i.a.markerClusterGroup({maxClusterRadius:20}).addTo(s),d={},y={trek:{icon:"campsite",color:"#159957"},city:{icon:"circle",color:"#659CD6"},park:{icon:"park",color:"#159957"},homebase:{icon:"building",color:"#D85E5E"},photo:{icon:"camera",color:"#659CD6",size:"s"},visited:{color:"#659CD6"}},f={trek:{color:"#159957",opacity:1,weight:5},route:{color:"#000",opacity:1,weight:2},tour:{color:"#000",opacity:1,weight:2},flight:{color:"#000",opacity:.3,weight:2},boat:{color:"#2057D0",opacity:.3,weight:2},mouseover:{color:"#ff0000",opacity:.7,weight:3}},m=document.querySelector("#world-map"),h=n.a.reject(m.dataset.trips.split(" ")||[],n.a.isEmpty),v=n.a.reject(m.dataset.country.split(" ")||[],n.a.isEmpty),g={};fetch("/world.json").then((function(t){return t.json()})).then((function(t){var e=n.a.forEach(t.trips,(function(t){t.promise=fetch("/".concat(t.path))}));s.once("zoomstart",(function(){m.style.backgroundImage="none"})),s.on("overlayadd overlayremove",n.a.debounce((function(t){if(t.layer.type&&"country"===t.layer.type){var e=p.getLayers();if(0===e.length)return;for(var a=new i.a.LatLngBounds,r=0,n=e.length;r<n;r++)a.extend(e[r].getLatLng());s.fitBounds(a)}}),100)),function(t){var e=L("country",t=t.sort((function(t,e){return t.properties.id<e.properties.id?-1:t.properties.id>e.properties.id?1:0})),{onEachFeature:k,pointToLayer:x}),a={};n.a.forEach(e,(function(t,e){a[e]=i.a.layerGroup(),a[e].type="country",a[e].id=t.id,v.length>0&&!v.includes(t.id)||(a[e].addTo(s),p.addLayer(t))}));var r=D("country",a);for(var o in d.country=r,r._layers)r._layers[o]&&(g[i.a.Util.stamp(r._layers[o].layer)]=r._layers[o].name);s.on("overlayadd overlayremove",(function(t){var a=g[i.a.Util.stamp(t.layer)];"country"===t.layer.type&&("overlayadd"===t.type?p.addLayer(e[a]):p.removeLayer(e[a]))}))}(t.countries),s.addControl((a=new i.a.Control.Search({layer:p,propertyName:"name",circleLocation:!1,initial:!1,autoCollapse:!0,zoom:10}),a.on("search_locationfound",(function(t){return function(t){if(!p.hasLayer(t)||!t._icon&&!t.__parent._icon)return!1;p.zoomToShowLayer(t,(function(){t._popup&&t.openPopup()}))}(t.layer)})),a)),Promise.all(n.a.map(e,(function(t){return t.promise.then((function(t){return t.json()})).catch((function(t){return t}))}))).then((function(t){(function(t){var e=L("trip",t,{onEachFeature:C});0===v.length&&n.a.forEach(e,(function(t){return t.addTo(s)}));var a=D("trip",e);for(var r in d.trip=a,a._layers)a._layers[r]&&(g[i.a.Util.stamp(a._layers[r].layer)]=a._layers[r].name);s.on("overlayadd overlayremove",(function(e){var a=g[i.a.Util.stamp(e.layer)];if("trip"===e.layer.type){var r=t[a],o=n.a.map(r.properties.countries,"name");_(d.country,o,"overlayadd"===e.type)}})),h.length>0&&(n.a.chain(e).filter((function(t){return!h.includes(t.id)})).forEach((function(t){s.removeLayer(t)})).value(),n.a.chain(e).filter((function(t){return h.includes(t.id)})).forEach((function(t){s.removeLayer(t),s.addLayer(t)})).value())})(e=n.a.chain(e).forEach((function(e,a){e.features=t[a]})).keyBy((function(t){return t.properties.name})).value()),d.other||(d.other=i.a.control.layers(null,null,{collapsed:!1}).addTo(s),d.other.addOverlay(p,"Markers"))}));var a}));var b=n.a.template('<strong><%- name %>, <%- _.startCase(country) %></strong> <small><%- type %></small><br><% if (!visited) { %><em>planning to visit</em><br><% } %><% if (typeof homebase !== "undefined" && homebase) { %><em>I used to live here</em><% } %><% if (typeof description !== "undefined") { %><span class="description"><%- description %></span><% } %>'),w=n.a.template("<strong><%- name %></strong> <small><%- type %></small><br>Distance: <%- Math.round(distance / 1000) %> km");function k(t,e){var a=b(t.properties);e.bindPopup(a)}function x(t,e){var a=t.properties.type.toLowerCase();t.properties.homebase?a="homebase":["national park","nature reserve"].includes(a)?a="park":y[a]||(a="visited");var r=y[a];return t.properties.visited||((r=n.a.clone(r)).color="#999"),i.a.marker(e,{icon:i.a.MakiMarkers.icon(r)})}function L(t,e,a){var r=n.a.chain(e).filter((function(t){return"Topology"!==t.features.type||t.features.arcs.length})).forEach((function(e){if("Topology"===e.features.type){var r=Object(c.a)(e.features,e.properties.id);e.layer=i.a.geoJson(r,a)}else e.layer=i.a.geoJson(e.features,a);e.layer.type=t,e.layer.id=e.properties.id})).keyBy((function(t){return t.properties.name})).value();return n.a.mapValues(r,"layer")}function D(t,e){var a=new i.a.Control.LayersCloseAll(null,e,{collapsed:!0}).addTo(s),r=a.getContainer();return i.a.DomUtil.addClass(r,"control-custom"),i.a.DomUtil.addClass(r,"control-"+t),i.a.DomEvent.disableClickPropagation(r),a}function _(t,e,a){var r;r=e&&e.length>0?n.a.chain(t._layers).pick((function(t){return e.includes(t.layer.id)})).map((function(t){return t.layer._leaflet_id})).value():n.a.chain(t._layers).map((function(t){return t.layer._leaflet_id})).value();for(var o=t._layerControlInputs,i=0,c=o.length;i<c;i++){var l=o[i];r.includes(l.layerId)&&(a&&l.checked||(a||l.checked)&&l.click())}}function C(t,e){var a=function(t){return f[t.properties.type.toLowerCase()]}(t);!function(t,e){var a;t.properties.distance=n.a.reduce((a=t.geometry.coordinates).slice(1).map((function(t,e){return[a[e],t]})),(function(t,e){return t+i.a.latLng(e[0][1],e[0][0]).distanceTo(i.a.latLng(e[1][1],e[1][0]))}),0);var r=w(t.properties);e.bindPopup(r)}(t,e),e.setStyle(a),e.on("mouseover",(function(){return e.setStyle(f.mouseover)})),e.on("mouseout",(function(){return e.setStyle(a)}))}var S=a("2VIQ"),E=a("6n/F"),T=a.n(E);function I(t){return(I="function"==typeof Symbol&&"symbol"==typeof Symbol.iterator?function(t){return typeof t}:function(t){return t&&"function"==typeof Symbol&&t.constructor===Symbol&&t!==Symbol.prototype?"symbol":typeof t})(t)}var B=document.querySelectorAll(".expenditure-chart");B&&fetch("/expenditures.json").then((function(t){return t.json()})).then((function(t){var e=!0,a=!1,r=void 0;try{for(var o,i=function(){var e=o.value,a=e.dataset.chart,r={trip:e.dataset.trip,country:e.dataset.country,title:e.dataset.title,countryData:[]},i=n.a.chain(t.expenditures).filter("trip",r.trip).each((function(t){return r.countryData.push(t.countries)})).map("data").flatten().value();if(r.countryData=n.a.chain(r.countryData).flatten(r.countryData).filter((function(t){return t.dates.length>0})).value(),r.country&&(i=n.a.filter(i,"country",r.country),r.countryData=n.a.filter(r.countryData,"name",r.country)),0===r.countryData.length)return e.innerHTML="<p><em>No data available yet</em></p>",{v:void 0};O[a](e,i,r)},c=B[Symbol.iterator]();!(e=(o=c.next()).done);e=!0){var l=i();if("object"===I(l))return l.v}}catch(t){a=!0,r=t}finally{try{e||null==c.return||c.return()}finally{if(a)throw r}}document.addEventListener("click",(function(t){!P||t.target&&t.target.tooltipInitalizer||(Object(S.b)(),P=!1)}))}));var M,P=!1,j=["flight","boat","tour"],A=n.a.template('<table><tr><th>Date</th><th>Amount</th><th>Description</th></tr><% _.forEach(data, function (row) { %><tr><td><%- row.date %><td>$<%- row.amount %></td><td><%- row.description || "" %></td></tr><% }); %></table>'),z={},O={perTagCPD:function(t,e,a){var r=Y(a.countryData);r=r[a.country];var o=n.a.chain(e).filter((function(t){return t.country===a.country})).groupBy("tags").map((function(t,e){var a=n.a.sumBy(t,(function(t){return parseInt(t.amount,10)}));return{name:e,y:a=Math.round(a/r*100)/100}})).value();T.a.chart(t,{chart:{type:"pie"},plotOptions:{pie:{allowPointSelect:!0,dataLabels:{enabled:!1},showInLegend:!0,events:{click:function(t){var a=t.point.name,r=n.a.filter(e,(function(t){return t.tags===a}));U(t.target,r)}}}},tooltip:{valuePrefix:"$",valueSuffix:"/day",pointFormat:"<b>{point.y} ({point.percentage:.1f}%)</b><br/>"},title:{text:a.title||""},series:[{name:"Tags",data:o}]})},perCountryCPD:function(t,e,a){var r=n.a.map(a.countryData,"name"),o=Y(a.countryData);M=function(t){var e=n.a.now(),a=0;return n.a.chain(t).map("dates").flatten().each((function(t){var r=new Date(t.start),n=new Date(t.end);r<e&&(e=r),n>a&&(a=n)})).value(),{start:e,end:a}}(a.countryData);var i=n.a.chain(e).groupBy("tags").map((function(t,e){var a=n.a.fill(new Array(r.length),0),i=0;return n.a.chain(t).groupBy("country").each((function(t,e){var c=n.a.indexOf(r,e),l=o[e];if(l){var u=n.a.sumBy(t,(function(t){return parseInt(t.amount,10)}));i+=u,a[c]=u/l,a[c]=Math.round(100*a[c])/100}})).value(),z[e]=i,{name:e,visible:q(e),data:a}})).value();T.a.chart(t,{chart:{type:"bar",events:{redraw:function(){var t=this.axes[1];t.removePlotLine("plot-average"),t.addPlotLine(J(t.series))}}},xAxis:{categories:r},yAxis:{min:0,title:{text:"Cost per day"},labels:{format:"${value}"},stackLabels:{enabled:!0,style:{color:"#999",fontWeight:"normal",textShadow:"none"}},plotLines:[J(i)]},legend:{reversed:!0},plotOptions:{series:{stacking:"normal"},bar:{events:{click:function(t){var a=t.point.category,r=this.name,o=n.a.filter(e,(function(t){return t.country===a&&t.tags===r}));U(t.target,o)}}}},tooltip:{valuePrefix:"$"},title:{text:a.title||""},series:i})}};function U(t,e){t.tooltipInitalizer=!0,Object(S.b)({exclude:t}),(t._tippy||Object(S.a)(t,{content:A({data:e}),trigger:"click"})).show(),P=!0}function q(t){return!j.includes(t)}function J(t){var e=(M.end-M.start)/1e3/3600/24+1;return{value:n.a.chain(t).filter("visible").reduce((function(t,e){return t+z[e.name]}),0).value()/e,color:"red",width:2,zIndex:20,id:"plot-average"}}function Y(t){return n.a.chain(t).keyBy("name").mapValues((function(t){return n.a.reduce(t.dates,(function(t,e){var a=new Date(e.start);return t+(new Date(e.end)-a)/1e3/3600/24+1}),0)})).value()}var F=document.querySelector("#commit-history");if(F){var H=n.a.template('<li><a href="<%- html_url %>"><span class="date"><%- new Date(commit.author.date).toDateString() %></span> <%- commit.message %></li>');fetch("https://api.github.com/repos/oxyc/travels/commits").then((function(t){return t.json()})).then((function(t){var e=n.a.reduce(t,(function(t,e){return t+H(e)}),"");F.innerHTML=e}))}var N=function(){var t=.01*window.innerHeight;document.documentElement.style.setProperty("--vh","".concat(t,"px"))};N(),window.addEventListener("resize",N)}},[[0,1,2]]]);
const mbxToken = process.env.mapid || 'pk.eyJ1IjoiZGhjb2xlIiwiYSI6ImNqdXA0bnNuMjM2djYzeW52ZTNnb2kzdHgifQ.S_r6BvUnxYUcLPGhrgi8cA';
const mapid = process.env.mapid || 'dhcole/cjus1g0n91i7h1fnvjyyof4x4';
const staticURL = `https://api.mapbox.com/styles/v1/${mapid}/static/geojson({geojson})/auto/340x180@2x?before_layer=poi-label&logo=false&access_token=${mbxToken}`;
const states = require('./jpn_pol.json');

const http = require('http');
const port = 3000;
const simplify = require('@turf/simplify');
const got = require('got');

const style = {
  "stroke-width": 0,
  "fill": "#FF5544",
  "fill-opacity": 0.2
};

const requestHandler = (req, res) => {
  let feature = req.url.split('/').pop();
  let state = states.features.filter(state => state.properties.adm_code == feature);
  if (state && state[0]) {
    let dataObject = simplify({
      type: 'Feature',
      geometry: state[0].geometry,
      properties: style
    }, {
      tolerance: 0.0005,
      highQuality: true,
      mutate: true
    });
    let dataString = JSON.stringify(dataObject);
    let geojson = encodeURIComponent(dataString);
    let url = staticURL.replace('{geojson}', geojson);
    console.log(url);
    got.stream(url).pipe(res);
  } else {
    res.statusCode = 404;
    res.end();
  }
};

const server = http.createServer(requestHandler);

server.listen(port, (err) => {
  if (err) {
    return console.log('Error', err);
  }
  console.log(`Server is listening on ${port}`);
});

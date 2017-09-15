'use strict';

// =================================================================================
// The below code is used to set up a server and a webhook at /webhook.
// Danger Zone: Editing might break your app.
// =================================================================================

const app = require('jovo-framework').Jovo;
const webhook = require('jovo-framework').Webhook;

// Listen for post requests
webhook.listen(3000, function() {
  console.log('Local development server listening on port 3000.');
});

webhook.post('/webhook', function(req, res) {
  app.handleRequest(req, res, handlers);
  app.execute();
});


var GoogleSearch = require('google-search');
var googleSearch = new GoogleSearch({
  key: 'AIzaSyDUiUfVFoJbsuldhvH1PeTkBCiecQycSzI',
  cx: '015082794420679756793:m1mbjbtad9o'
});

var JefNode = require('json-easy-filter').JefNode;

//// Log the JSON request/response to ngrok console
// app.enableRequestLogging();
// app.enableResponseLogging();

// =================================================================================
// Below is where the logic of your voice app should be happening
// Get started by adding some intents and Jovo functions
// =================================================================================

let handlers = {

  'LAUNCH': function() {
    app.toIntent('search-website');
  },

  'search-website': function(url, anyQuery) {

    googleSearch.build({
      q: anyQuery,
      start: 1,
      fileType: "",
      gl: "", //geolocation,
      lr: "lang_en",
      num: 10, // Number of search results to return between 1 and 10, inclusive
      siteSearch: "http://www.chefkoch.de" // Restricts results to URLs from a specified site
    }, function(error, response) {
      receive(response)
    });

    function receive(data) {
      var title = new JefNode(data).filter(function(node) {
        if (node.has('htmlTitle')) {
          return node.value.title;
        }
      });
      console.log(title);
      console.log(JSON.stringify(data, null, 2));
    }
    app.tell(url + anyQuery);
  }
};

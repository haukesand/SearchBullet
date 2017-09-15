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
  key: '',
  cx: ''
});

var JefNode = require('json-easy-filter').JefNode;

// =================================================================================
// Strings, variables & stuff
// =================================================================================

var askUrl = [
    "Where do you want to search?",
    "On which website do you want to search?",
    "On which domain do you want to search?",
    "Tell me on which website you want to search.",
    "On which website?"
];

//// Log the JSON request/response to ngrok console
// app.enableRequestLogging();
// app.enableResponseLogging();

// =================================================================================
// Below is where the logic of your voice app should be happening
// Get started by adding some intents and Jovo functions
// =================================================================================

let handlers = {

    'LAUNCH': function () {
        app.toIntent('search-website');
    },

    'search-website': function (url, domain, anyQuery) {
        if (url === "" && domain === "") {
            var randomNumber = Math.floor(Math.random() * askUrl.length);
            app.setSessionAttribute('anyQuery', anyQuery);
            app.ask(askUrl[randomNumber]);
        }
        googleSearch.build({
            q: anyQuery,
            start: 1,
            fileType: "",
            gl: "", //location,
            lr: "lang_en",
            num: 10, // Number of search results to return between 1 and 10, inclusive
            siteSearch: "http://www." + url // Restricts results to URLs from a specified site
        }, function (error, response) {
            filter(response)
        });

        function filter(data) {
            var title = new JefNode(data).filter(function (node) {
                if (node.has('htmlTitle')) {
                    //return an object instead here
                    var str = node.value.title;//+ ' ' + node.value.link;
                    str = str.replaceAll(url, ' ');
                    return str
                }
            });

            console.log(title);
            //app.tell(title[1].toString());
            app.tell("I searched");
            console.log(JSON.stringify(data, null, 2));
        }
    },// end of 'search-website'

    //complete search
    'url-domain': function (url, domain) {
        var search = "";
        if (url !== ""){
            search = url;
        }
        else {
            search = domain;
        }
        let query = app.getSessionAttribute('anyQuery');
        googleSearch.build({
            q: query,
            start: 1,
            fileType: "",
            gl: "", //location
            lr: "lang_en",
            num: 10, // Number of search results to return between 1 and 10, inclusive
            siteSearch: "http://www." + search // Restricts results to URLs from a specified site
        }, function (error, response) {
            filter(response)
        });

        function filter(data) {
            var title = new JefNode(data).filter(function (node) {
                if (node.has('htmlTitle')) {
                    //return an object instead here
                    var str = node.value.title;//+ ' ' + node.value.link;
                    str = str.replaceAll(url, ' ');
                    return str
                }
            });
            console.log(title);
            //app.tell(title[1].toString());
            app.tell("I searched");
            console.log(JSON.stringify(data, null, 2));
        }

    }
};


String.prototype.replaceAll = function(strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
};



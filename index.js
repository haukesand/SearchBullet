'use strict';

// =================================================================================
// The below code is used to set up a server and a webhook at /webhook.
// Danger Zone: Editing might break your app.
// =================================================================================

const app = require('jovo-framework').Jovo;
const webhook = require('jovo-framework').Webhook;
const BasicCard = require('jovo-framework').GoogleAction.BasicCard;
const PushBullet = require('pushbullet');
var GoogleSearch = require('google-search');

// Listen for post requests
webhook.listen(3000, function () {
    console.log('Local development server listening on port 3000.');
});

webhook.post('/webhook', function (req, res) {
    app.handleRequest(req, res, handlers);
    app.execute();
});

// API keys
var googleSearch = new GoogleSearch({
    key: '',
    cx: ''
});
const pusher = new PushBullet('');


//var JefNode = require('json-easy-filter').JefNode;

// =================================================================================
// Strings, variables & stuff
// =================================================================================

var askUrlText = [
    "Where do you want to search?",
    "On which website do you want to search?",
    "On which domain do you want to search?",
    "Tell me on which website you want to search.",
    "On which website?"
];

var searchResponse = null;

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
            var randomNumber = Math.floor(Math.random() * askUrlText.length);
            app.setSessionAttribute('anyQuery', anyQuery);
            app.ask(askUrlText[randomNumber]);
        }
        finalizeGoogleSearch(url, domain, anyQuery);
        //pushNotification("Searcher: " + anyQuery, url);


    },// end of 'search-website'

    //complete search
    'url-domain': function (url, domain) {
        let query = app.getSessionAttribute('anyQuery');
        finalizeGoogleSearch(url, domain, query);
        //pushNotification("Searcher: " + query, url);
    }// end of url-domain

}

function finalizeGoogleSearch(url, domain, query){
    var searchUrl = "";
    if (url !== "") {
        searchUrl = url;
    }
    else {
        searchUrl = domain;
    }
    googleSearch.build({
        q: query,
        start: 1,
        fileType: "",
        gl: "", //location
        lr: "lang_en",
        num: 10, // Number of search results to return between 1 and 10, inclusive
        siteSearch: "http://www." + searchUrl // Restricts results to URLs from a specified site
    }, function (error, response) {
        searchResponse = response.items;
        //searchResponse[0].title).toString()

        let speech = app.speechBuilder()
            .addText('Your search results on').addText(searchUrl).addText(' are: ')
            .addSayAsOrdinal(1).addText('Result: ').addText(filter(searchResponse[0].title, searchUrl)).addBreak('500ms')
            .addSayAsOrdinal(2).addText('Result: ').addText(filter(searchResponse[1].title, searchUrl)).addBreak('500ms')
            .addSayAsOrdinal(3).addText('Result: ').addText(filter(searchResponse[2].title, searchUrl)).addBreak('500ms')
            .addText('About which result would you want to know more?')
            .build();
        app.ask(speech);

        //console.log(JSON.stringify(response, null, 2));
    });
}
function sendCard (Title, url){
    let basicCard = new BasicCard()
        .setTitle('Title')
        // Image is required if there is no formatted text
        .setImage('https://via.placeholder.com/720x480',
            'accessibilityText')
        // Formatted text is required if there is no image
        .setFormattedText('Formatted Text')
        .addButton('Learn more', 'https://www.jovo.tech (https://www.jovo.tech/)');

    app.googleAction().showBasicCard(basicCard);

}

function pushNotification (title, url){
    pusher.link("", title, url, function(error, response) {});
}
function filter(data, replace) {
    var str = data;//+ ' ' + node.value.link;
    str = str.replaceAll(replace, ' ');
    return str
}
String.prototype.replaceAll = function (strReplace, strWith) {
    // See http://stackoverflow.com/a/3561711/556609
    var esc = strReplace.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    var reg = new RegExp(esc, 'ig');
    return this.replace(reg, strWith);
};



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

//// Log the JSON request/response to ngrok console
// app.enableRequestLogging();
// app.enableResponseLogging();

// =================================================================================
// Below is where the logic of your voice app should be happening
// Get started by adding some intents and Jovo functions
// =================================================================================

let handlers = {

    /* 'LAUNCH': function () {
         app.toIntent('search-website');
     },*/

    'search-website': function (url, domain, anyQuery) {
        if (url === "" && domain === "") {
            var randomNumber = Math.floor(Math.random() * askUrlText.length);
            app.ask(askUrlText[randomNumber]);
        }
        else {
            app.setSessionAttribute('nextResult', 4);
            let searchUrl = "";
            if (url !== "") {
                searchUrl = url;
            }
            else {
                searchUrl = domain;
            }
            app.setSessionAttribute('anyQuery', anyQuery);
            app.setSessionAttribute('searchUrl', searchUrl);
            finalizeGoogleSearch(searchUrl, anyQuery, 1);
        }


    },// end of 'search-website'


    'just-search': function (any) {
        console.log('just-search')
        app.setSessionAttribute('nextResult', 4);
        app.setSessionAttribute('anyQuery', any);

        let searchUrl = "google.com";
        app.setSessionAttribute('searchUrl', searchUrl);
        finalizeGoogleSearch(searchUrl, any, 1);

    },// end of 'just-search'


    //complete search
    'url-domain': function (url, domain) {
        let query = app.getSessionAttribute('anyQuery');
        let searchUrl = "";
        if (url !== "") {
            searchUrl = url;
        }
        else {
            searchUrl = domain;
        }

        app.setSessionAttribute('searchUrl', searchUrl);
        app.setSessionAttribute('nextResult', 4);

        finalizeGoogleSearch(searchUrl, query, 1);

    },// end of url-domain


    'go-on': function () {
        let nextResult = app.getSessionAttribute('nextResult');
        let searchUrl = app.getSessionAttribute('searchUrl');
        let anyQuery = app.getSessionAttribute('anyQuery');

        finalizeGoogleSearch(searchUrl, anyQuery, nextResult);

        app.setSessionAttribute('nextResult', nextResult + 3);

    },

    //This intent gets the link title and snippet of the requested search result
    'result-detail': function (ordinal) {
        console.log("Ordinal: " + ordinal);

        let searchUrl = app.getSessionAttribute('searchUrl');
        let anyQuery = app.getSessionAttribute('anyQuery');
        let searchResponse = null;
        let httpUrl = '';

        if (searchUrl.indexOf('.') !== -1) {
            httpUrl = "http://www." + searchUrl;
        }
        else {
            httpUrl = "http://www." + searchUrl + '.com';
        }

        //if user wants to search on google: search whole web
        if (httpUrl === 'http://www.google.com') {
            httpUrl = ''
        }

        googleSearch.build({
            q: anyQuery,
            start: ordinal,
            fileType: "",
            gl: "", //location
            lr: "lang_en",
            num: 1, // Number of search results to return between 1 and 10, inclusive
            siteSearch: httpUrl // Restricts results to URLs from a specified site
        }, function (error, response) {
            searchResponse = response.items;

            let speech = app.speechBuilder()
                .addText(searchResponse[0].snippet).addBreak('300ms')
                .addText('About which other result do you want more information?').addBreak('200ms')
                .addText('Or are you done?')
                .build();
            app.ask(speech);
            // console.log(JSON.stringify(searchResponse, null, 2));
            pushNotification(searchResponse[0].title, searchResponse[0].link)
        });

    }
};//end of intent handlers


function finalizeGoogleSearch(searchUrl, query, resultNr) {
    let searchResponse = null;
    let httpUrl = '';

    if (searchUrl.indexOf('.') !== -1) {
        httpUrl = "http://www." + searchUrl;
    }
    else {
        httpUrl = "http://www." + searchUrl + '.com';
    }

    //if user wants to search on google: search whole web
    if (httpUrl === 'http://www.google.com') {
        httpUrl = ''
    }
    googleSearch.build({
        q: query,
        start: resultNr,
        fileType: "",
        gl: "", //location
        lr: "lang_en",
        num: 3, // Number of search results to return between 1 and 10, inclusive
        siteSearch: httpUrl // Restricts results to URLs from a specified site
    }, function (error, response) {
        searchResponse = response.items;

        console.log(JSON.stringify(response, null, 2));

        //TODO: Add response if google does not reply
        let speech = app.speechBuilder();
        if (searchResponse != undefined) {
            if (resultNr < 3) {
                speech.addText('Your search results on').addText(searchUrl).addText(' are: ');
            }
            else {
                speech.addText('Your next results are:');
            }
            speech.addBreak('300ms').addSayAsOrdinal(resultNr).addText('Result: ').addText(filter(searchResponse[0].title, searchUrl)).addBreak('800ms')
                .addSayAsOrdinal(resultNr + 1).addText('Result: ').addText(filter(searchResponse[1].title, searchUrl)).addBreak('800ms')
                .addSayAsOrdinal(resultNr + 2).addText('Result: ').addText(filter(searchResponse[2].title, searchUrl)).addBreak('1000ms')
                .addText('About which result would you want to know more?').addText('Or do you want to search further?', 0.3)
                .build();
        }
        else {
            speech.addText('Sorry, ').addText(query).addBreak('500ms').addText('on').addText(searchUrl).addText('did not return any results')
                .build();
        }
        app.ask(speech);

    });
}

function pushNotification(title, url) {
    pusher.link("", title, url, function (error, response) {
    });
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



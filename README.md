# Searchbullet
Searchbullet lets you use your assistant to search and push the results to other devices.
It is built with [Jovo](https://www.jovo.tech "Jovo's website"), [Api.Ai](https://api.ai/) and [Pushbullet](https://docs.pushbullet.com).
Currently it supports Google Home and Google Assistant.

![Icon](assets/Icons/searchVoiceIconSmall.jpg)
## Getting Started
To use the action on your own device [a few steps](https://github.com/haukesand/SearchBullet/blob/master/README.md) are needed:

1. Clone the repository.
2. Start a new project on Api.ai and [import the configuration from](https://api.ai/docs/best-practices/import-export-for-versions)  assets/SearchOnPage.zip
3. Create [your google custom search keys](https://support.google.com/customsearch/answer/2631040?hl=en) (key & cx).
4. Create a [pushbullet access token](https://docs.pushbullet.com/#api-quick-start).
5. Install npm dependencies [pushbullet](https://www.npmjs.com/package/pushbullet) & [google-search](https://www.npmjs.com/package/google-search)
6. Use [ngrok to route the fulfillment](https://www.jovo.tech/get-started/run-local-server) onto your developer machine.
7. Enable [integration with Google Assistant](https://developers.google.com/actions/apiai/first-app).

[![Video](/assets/VideoPreview.JPG?raw=true)](https://youtu.be/nQaFcTQubHE)

## Roadmap
Before the action/skill can get pushed to the Alexa and Google Home markets it needs a few more refinements:
- Implement [account linking](https://developers.google.com/actions/identity/account-linking) with [pushbullet oAuth](https://docs.pushbullet.com/#oauth2).
- Export Intents [from Api.Ai to Alexa](https://api.ai/docs/integrations/alexa-importer)
- Add Repeat Intent


const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const AuthenticationContext = require('adal-node').AuthenticationContext;
require('dotenv').config();

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI;
const final_redirect_uri = process.env.FINAL_REDIRECT_URI;

/**
 * Generates a random string
 * @param  {number} length The length of the string
 * @return {string} The generated string
 */
const generateRandomString = function (length) {
    let text = '';
    const possible = 'tommarvoloriddle';

    for (let i = 0; i < length; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
};

const stateKey = 'spotify_auth_state';

const app = express();

app.use(express.static(__dirname + '/public'))
    .use(cookieParser());

app.get('/login', function (req, res) {

    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    
    res.redirect('https://login.windows.net/common/oauth2/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: "64fb057e-3c0b-4fb0-8ac9-f710e529178b",
            redirect_uri: "https://webresourcemanagerauth.azurewebsites.net/callback",
            resource: "https://vinedev.crm.dynamics.com",
            prompt: "consent",
            state: state
        })); 
});

app.get('/callback', function (req, res) {

    // your application requests refresh and access tokens
    // after checking the state parameter

    const code = req.query.code || null;
    
    var crmURL = "https://atrio.crm.dynamics.com";
    var clientId = "64fb057e-3c0b-4fb0-8ac9-f710e529178b";
    var authority = "https://login.windows.net/common";
    //var clientSecret = 'yourAADIssuedClientSecretHere'
    
    var authorityHostUrl = 'https://login.windows.net';
    var tenant = 'common';
    var authorityUrl = authorityHostUrl + '/' + tenant;
    var redirectUri = 'https://webresourcemanagerauth.azurewebsites.net/result';
    var resource = '00000002-0000-0000-c000-000000000000';
    
    var authenticationContext = new AuthenticationContext(authorityUrl);
    authenticationContext.authenticationContext.acquireTokenWithAuthorizationCode(
        req.query.code,
        redirectUri,
        resource,
        clientId, 
        null,
        function(err, response) {
          var errorMessage = '';
          if (err) {
            errorMessage = 'error: ' + err.message + '\n';
          }
          errorMessage += 'response: ' + JSON.stringify(response);
          res.send(errorMessage);
        }
    );
});

app.get('/result', function (req, res) {
    res.send("DONE");
});

app.get('/refresh_token', function (req, res) {

    // requesting access token from refresh token
    const refresh_token = req.query.refresh_token;
    const authOptions = {
        url: 'https://accounts.spotify.com/api/token',
        headers: { 'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64')) },
        form: {
            grant_type: 'refresh_token',
            refresh_token: refresh_token
        },
        json: true
    };

    request.post(authOptions, function (error, response, body) {
        if (!error && response.statusCode === 200) {
            const access_token = body.access_token;
            res.send({
                'access_token': access_token
            });
        }
    });
});

app.listen(process.env.PORT || 3000);

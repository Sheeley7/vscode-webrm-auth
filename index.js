const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const AuthenticationContext = require('adal-node').AuthenticationContext;
require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = "https://wrm-test1.azurewebsites.net/"//process.env.SPOTIFY_REDIRECT_URI;
const final_redirect_uri = process.env.FINAL_REDIRECT_URI;
var crm_url;

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

const stateKey = 'dynamics_auth_state';

const app = express();

app.use(express.static(__dirname + '/public'))
    .use(cookieParser());

app.get('/login', function (req, res) {

    //crm_url = req.query.crm_url;

    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    /*
    res.redirect('https://login.windows.net/common/oauth2/authorize?' +
        querystring.stringify({
            response_type: 'code',
            client_id: "64fb057e-3c0b-4fb0-8ac9-f710e529178b",
            redirect_uri: "https://webresourcemanagerauth.azurewebsites.net/callback",
            resource: "https://sheel7.api.crm.dynamics.com",
            prompt: "consent",
            state: state
        }));*/
    res.send(client_id + "\n");
    
});

app.get('/callback', function (req, res) {
    var crmURL = "https://sheel7.crm.dynamics.com";
    var clientId = "64fb057e-3c0b-4fb0-8ac9-f710e529178b";
    var authority = "https://login.windows.net/common";
    var clientSecret = 'eBSLWujg5gODpD8rkp+h554Av498Uy5gwkK9NouS2no='
    
    var authorityHostUrl = 'https://login.windows.net';
    var tenant = 'common';
    var authorityUrl = authorityHostUrl + '/' + tenant;
    var redirectUri = 'https://webresourcemanagerauth.azurewebsites.net/callback';
    var resource = 'https://sheel7.api.crm.dynamics.com';
    // your application requests refresh and access tokens
    // after checking the state parameter

    const code = req.query.code || null;
    const state = req.query.state || null;
    const storedState = req.cookies ? req.cookies[stateKey] : null;
    
    // requesting access token from refresh token
    const refresh_token = req.query.refresh_token;
    var authenticationContext = new AuthenticationContext(authorityUrl);
    authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirectUri, resource, clientId, clientSecret, function(err, response) {
        var message = '';
        if (err) {
          message = 'error: ' + err.message + '\n';
        }
        message += 'response: ' + JSON.stringify(response);

        var headers = {
            "Accept": "application/json",
            "OData-MaxVersion": "4.0",
            "OData-Version": "4.0",
            "Authorization": "Bearer " + response.accessToken
        };
        var options = {
            url: "https://sheel7.api.crm.dynamics.com/api/data/v9.1/accounts",
            method: "GET",
            headers: headers,
            qs: {"$select": "name"}
        };
        request(options, function (error, response, body) {
            if (!error && response.statusCode == 200) {
                // Print out the response body
                res.send(JSON.stringify(response));
            }
            else {
                res.send("BAD " + JSON.stringify(response) + JSON.stringify(error));
            }
        });
        
    });    
});

app.get('/result', function (req, res) {

    var headers = {
        "Accept": "application/json",
        "OData-MaxVersion": "4.0",
        "OData-Version": "4.0",
        "Authorization": "Bearer " + req.query.token
    };
    var options = {
        url: "https://sheel7.crm.dynamics.com/api/data/v9.1/accounts",
        method: "GET",
        headers: headers,
        qs: {"$select": "name"}
    };
    request(options, function (error, response, body) {
        if (!error && response.statusCode == 200) {
            // Print out the response body
            res.send("GOOD TO GO");
        }
        else {
            res.send("BAD " + response.statusCode);
        }
    });
});

app.listen(process.env.PORT || 3000);

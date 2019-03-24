const express = require('express');
const request = require('request');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');
const AuthenticationContext = require('adal-node').AuthenticationContext;
require('dotenv').config();

const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;
const redirect_uri = "https://wrm-test1.azurewebsites.net/";//process.env.SPOTIFY_REDIRECT_URI;
const final_redirect_uri = process.env.FINAL_REDIRECT_URI;
const authority_url = "https://login.windows.net";
const auth_url = authority_url + "/common/oauth2/authorize";
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

    crm_url = req.query.crm_url;
    
    const state = generateRandomString(16);
    res.cookie(stateKey, state);
    res.redirect(auth_url + '?' +
        querystring.stringify({
            response_type: 'code',
            client_id: client_id,
            redirect_uri: redirect_uri + "code",
            resource: crm_url,
            prompt: "consent",
            state: state
        }));
});

app.get('/code', function (req, res) {
  
    const code = req.query.code || null;
    req.send(code);
    /*var test = "code=" + req.query.code + "\n";
    test += "redirect_uri=" + redirect_uri + "code" + "\n";
    test +=  "crm_url=" + crm_url + "\n";
    test += "client_id=" + client_id + "\n";
    test += "cleint_secret=" + client_secret + "\n";
    req.send(JSON.stringify(test));

    //var authenticationContext = new AuthenticationContext(authority_url + "/common");
    /*authenticationContext.acquireTokenWithAuthorizationCode(req.query.code, redirect_uri + "code", crm_url, client_id, client_secret, function(err, response) {
        var message = '';
        if (err) {
          message = 'error: ' + err.message + '\n';
        }
        message += 'response: ' + JSON.stringify(response);
        req.send(message);
    });*/
});

app.listen(process.env.PORT || 3000);


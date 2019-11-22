const express = require('express');
const { query, validationResult } = require('express-validator');
const users = require('./users.json');

const webserver = express();

const port = 7180;
const method = 'method=get';
const action = `/login`;

const getViewPage = ({formView = '', errorMsg = '', resultsView = '' }) => {
    const view = `
    <!DOCTYPE html>
    <html style="box-sizing: border-box;">
    <head style="box-sizing: border-box;">
    <meta charset="UTF-8" style="box-sizing: border-box;">
    <meta name="viewport" content="width=device-width, initial-scale=1.0" style="box-sizing: border-box;">
    <meta http-equiv="X-UA-Compatible" content="ie=edge" style="box-sizing: border-box;">
    <title style="box-sizing: border-box;">Login form</title>
    </head>
    <body style="box-sizing:border-box;font-family:Arial;background-color:#3498DB;padding:50px;">
        <div class="login" style="box-sizing:border-box;margin:20px auto;width:300px;">
            <div class="login-screen" style="box-sizing:border-box;background-color:#FFF;padding:20px;border-radius:5px;">
                <div class="app-title" style="box-sizing:border-box;text-align:center;color:#777;">
                    <h1 style="box-sizing: border-box;">Login</h1>
                </div>
                ${formView}
                ${errorMsg}
                ${resultsView}
            </div>
        </div>
    </body>
    </html>`;

    return view;
}

const getResultsView = (username = '', password = '') => {
    const resultsView = `
        <h3 style="box-sizing: border-box;text-align:center;">Your input:</h3>
        <div class="control-group" style="box-sizing:border-box;margin-bottom:10px;">
        <input type="text" class="login-field" value="${username}" id="login-name" style="box-sizing:border-box;text-align:center;background-color:#ECF0F1;border:2px solid transparent;border-radius:3px;font-size:16px;font-weight:200;padding:10px 0;width:250px;transition:border .5s;"><label class="login-field-icon fui-user" for="login-name" style="box-sizing: border-box;"></label>
        </div>

        <div class="control-group" style="box-sizing:border-box;margin-bottom:10px;">
        <input type="text" class="login-field" value="${password}" id="login-pass" style="box-sizing:border-box;text-align:center;background-color:#ECF0F1;border:2px solid transparent;border-radius:3px;font-size:16px;font-weight:200;padding:10px 0;width:250px;transition:border .5s;"><label class="login-field-icon fui-lock" for="login-pass" style="box-sizing: border-box;"></label>
        </div>`;

    return getViewPage({ resultsView });
}

const getLoginForm = (withErrors = false) => {
    let errorMsg = '';

    if (withErrors) {
        errorMsg = '<span class="login-link" text-align="center" style="box-sizing:border-box;text-align:center;font-size:12px;color:#ea1515;display:block;margin-top:12px;">Please, validate your creds</span>';
    }

    const formView = `
        <form ${method} ${action} class="login-form" style="box-sizing:border-box;text-align:center;">
            <div class="control-group" style="box-sizing:border-box;margin-bottom:10px;">
            <input type="text" class="login-field" name="username" placeholder="username" id="login-name" style="box-sizing:border-box;text-align:center;background-color:#ECF0F1;border:2px solid transparent;border-radius:3px;font-size:16px;font-weight:200;padding:10px 0;width:250px;transition:border .5s;"><label class="login-field-icon fui-user" for="login-name" style="box-sizing: border-box;"></label>
            </div>

            <div class="control-group" style="box-sizing:border-box;margin-bottom:10px;">
            <input type="password" class="login-field" name="password" placeholder="password" id="login-pass" style="box-sizing:border-box;text-align:center;background-color:#ECF0F1;border:2px solid transparent;border-radius:3px;font-size:16px;font-weight:200;padding:10px 0;width:250px;transition:border .5s;"><label class="login-field-icon fui-lock" for="login-pass" style="box-sizing: border-box;"></label>
            </div>

            <input type="submit" class="btn btn-primary btn-large btn-block" href="#" style="box-sizing:border-box;border:2px solid transparent;background:#3498DB;color:#ffffff;font-size:16px;line-height:25px;padding:10px 0;text-decoration:none;text-shadow:none;border-radius:3px;box-shadow:none;transition:0.25s;display:block;width:250px;margin:0 auto;"/>
            <a class="login-link" href="#" style="box-sizing:border-box;font-size:12px;color:#444;display:block;margin-top:12px;">Lost your password?</a>
        </form>`;

    return getViewPage({ formView, errorMsg });
}

const validateCreds = ({ username, password }) => 
    !!users.validUsers.find(creds => creds.login === username && creds.password === password);


webserver.get('/login', [
    query('username').exists().isLength({ min: 3 }),
    query('password').exists().isLength({ min: 3 }),
], (req, res) => {
    const errors = validationResult(req);

    if (Object.keys(req.query).length > 0 && !errors.isEmpty()) {
        res.send(getLoginForm(true));
    } else if (Object.keys(req.query).length === 0) {
        res.send(getLoginForm());
    } else {
        if (validateCreds(req.query)) {
            res.send(getResultsView(req.query.username, req.query.password));
        } else {
            res.send(getLoginForm(true));
        }
    }
});

webserver.listen(port);

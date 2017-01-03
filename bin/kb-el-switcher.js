// karabiner elements profile switcher
const fs = require('fs');
const colors = require('colors');

let targetProfile= process.argv.slice(2)[0];
let HOME_DIR = process.env.HOME || process.env.USERPROFILE;

function _displaySuccess(text) {
    process.stdout.write(text.green + '\n');
}

function _displayError(text) {
    process.stdout.write(text.red + '\n');
}

// args for testing
let args = require('argly').createParser({
    '--file -f': 'string'
}).parse(process.argv.slice(3));

let karabinerConfigPath;

if (args.file) {
    karabinerConfigPath = args.file;
} else {
    karabinerConfigPath = `${HOME_DIR}/.config/karabiner/karabiner.json`;
}



if (!targetProfile) {
    throw new Error('Profile not specified');
    return;
}

let rawConfig;
try {
    rawConfig = fs.readFileSync(karabinerConfigPath, 'utf-8');
} catch(err) {
    _displayError(`Unable to read karabiner config file ${karabinerConfigPath}`);
    return;
}

let config;

try {
    config = JSON.parse(rawConfig);
} catch (err) {
    _displayError('Unable to parse karabiner config file');
    return;
}

let profiles = config.profiles;
let profileFound = false;

for (let i = 0; i < profiles.length; i++) {
    if (!profileFound && profiles[i].name === targetProfile) {
        profiles[i].selected = true;
        profileFound = true;
    } else {
        profiles[i].selected = false;
    }
}

if (!profileFound) {
    _displayError('Profile was not found');
    return;
}

fs.writeFileSync(karabinerConfigPath, JSON.stringify(config, null, 4));
_displaySuccess('Success!');

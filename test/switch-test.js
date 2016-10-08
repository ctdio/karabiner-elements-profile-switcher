const {expect} = require('chai');
const fs = require('fs');

const {fork} = require('child_process');
const path = require('path');
const originalConfigPath = `${__dirname}/original-config.json`;
const testConfigPath = `${__dirname}/test-config.json`;
const expectedConfigPath = `${__dirname}/expected-config.json`;

let processes = [];
function _loadConfig(configPath) {
    let config = fs.readFileSync(configPath, 'utf-8');
    return JSON.parse(config);
}

function _runSwitcher(profile) {
    return new Promise((resolve) => {
        let indexPath = path.normalize(`${__dirname}/../bin/kb-el-switcher.js`);
        let switcherProcess = fork(indexPath, [profile, '--file', testConfigPath]);
        processes.push(switcherProcess);
        switcherProcess.on('exit', function() {
            let config = _loadConfig(testConfigPath);
            resolve(config);
        });
    });
}

describe('Karabiner Elements Profile Switcher', () => {
    let originalConfig;
    let expectedConfig;

    before(() => {
        originalConfig = _loadConfig(originalConfigPath);
        expectedConfig = _loadConfig(expectedConfigPath);
        // make copy of original config, copy will be used for testing
        fs.writeFileSync(testConfigPath, JSON.stringify(originalConfig, null, 4));
    });

    after(() => {
        processes.forEach((leftoverProcess) => {
            leftoverProcess.kill();
        });
    });

    it('should be able to switch profiles', () => {
        return _runSwitcher('Mechanical Keyboard').then((newConfig) => {
            expect(JSON.stringify(newConfig)).to.equal(JSON.stringify(expectedConfig));
        });
    });
});

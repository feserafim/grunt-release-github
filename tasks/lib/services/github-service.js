'use strict';

//Global vars
const githubBaseUri = "https://api.github.com/";

//Dependencies modules
var logger = require('../logger/logger.js'),
    Promise = require('bluebird'),
    request = require('request');

//module interface
module.exports = {
    getMilestones: _getMilestones,
    getMilestoneByVersion: _getMilestoneByVersion,
    getIssuesByMilestone: _getIssuesByMilestone
};


function _getMilestoneByVersion(github, repository, version) {
    return new Promise(function (resolve, reject) {
        _getMilestones(github, repository).then(function (milestones) {
            var milestone = milestones.filter(function (element) {
                return element.title === 'v' + version;
            });
            milestone = milestone[0];
            if (milestone) {
                resolve(milestone);
            } else {
                reject('There is not milestone for this version');
            }
        }, function (error) {
            reject(error);
        });
    });
}

//module implementation
function _getMilestones(github, repository) {
    return new Promise(function (resolve, reject) {

        var milestonesUrl = githubBaseUri + "repos/" + repository + "/milestones";
        logger.debug('Getting milestones from url: \n' + milestonesUrl);

        request.get(milestonesUrl, requestOptionsHelper(github), function (err, res, body) {

            logger.debug('Receiving request.');
            if (!err && res.statusCode === 200) {
                logger.debug('Request has been done successfully. Body: \n' + JSON.stringify(body, null, 2));
                resolve(body);
            } else {
                rejectHelper(err, res, reject);
            }

        });

    });
}

function _getIssuesByMilestone(github, repository, milestoneNumbre) {
    return new Promise(function (resolve, reject) {
        var issuesUrl = githubBaseUri + "repos/" + repository + "/issues?state=all&milestone=" + milestoneNumbre;
        logger.debug('Getting issues from url: \n' + issuesUrl);

        request.get(issuesUrl, requestOptionsHelper(github), function (err, res, body) {

            logger.debug('Receiving request.');
            if (!err && res.statusCode === 200) {

                logger.debug('Request has been done successfully. Body: \n' + JSON.stringify(body, null, 2));
                resolve(body);

            } else {
                rejectHelper(err, res, reject);
            }
        });
    });
}

function requestOptionsHelper(github) {
    return {
        auth: {
            username: process.env[github.usernameVar],
            password: process.env[github.accessTokenVar]
        },
        headers: {
            'User-Agent': 'grunt-release-github'
        },
        json: true
    };
}

function rejectHelper(err, res, reject) {
    if (err) {
        logger.error("Error here: " + err.toString());
        reject(err.toString());
    } else {
        if (res.statusCode === 403) {
            logger.error('Your github rate_limit has been reached.');
            reject('Your github rate_limit has been reached.');
        } else if (res.statusCode === 404) {
            logger.error('Not found issues for this milestones.');
            reject('Not found issues for this milestones.');
        } else {
            logger.error('Unexpected error.');
            reject('Unexpected error.');
        }
    }
}

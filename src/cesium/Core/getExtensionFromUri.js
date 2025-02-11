var Uri=require('uri');
var defined=require('./defined');
var DeveloperError=require('./DeveloperError');

    'use strict';

    /**
     * Given a URI, returns the extension of the URI.
     * @exports getExtensionFromUri
     *
     * @param {String} uri The Uri.
     * @returns {String} The extension of the Uri.
     *
     * @example
     * //extension will be "czml";
     * var extension = Cesium.getExtensionFromUri('/Gallery/simple.czml?value=true&example=false');
     */
    function getExtensionFromUri(uri) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(uri)) {
            throw new DeveloperError('uri is required.');
        }
        //>>includeEnd('debug');

        var uriObject = new Uri(uri);
        uriObject.normalize();
        var path = uriObject.path;
        var index = path.lastIndexOf('/');
        if (index !== -1) {
            path = path.substr(index + 1);
        }
        index = path.lastIndexOf('.');
        if (index === -1) {
            path = '';
        } else {
            path = path.substr(index + 1);
        }
        return path;
    }

    module.exports= getExtensionFromUri;

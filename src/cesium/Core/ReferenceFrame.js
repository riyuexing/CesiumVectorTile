var freezeObject=require('./freezeObject');

    'use strict';

    /**
     * Constants for identifying well-known reference frames.
     *
     * @exports ReferenceFrame
     */
    var ReferenceFrame = {
        /**
         * The fixed frame.
         *
         * @type {Number}
         * @constant
         */
        FIXED : 0,

        /**
         * The inertial frame.
         *
         * @type {Number}
         * @constant
         */
        INERTIAL : 1
    };

    module.exports= freezeObject(ReferenceFrame);

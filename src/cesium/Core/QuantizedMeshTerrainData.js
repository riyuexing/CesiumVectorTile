var when=require('when');
var BoundingSphere=require('./BoundingSphere');
var Cartesian2=require('./Cartesian2');
var Cartesian3=require('./Cartesian3');
var defaultValue=require('./defaultValue');
var defined=require('./defined');
var defineProperties=require('./defineProperties');
var DeveloperError=require('./DeveloperError');
var IndexDatatype=require('./IndexDatatype');
var Intersections2D=require('./Intersections2D');
var CesiumMath=require('./Math');
var OrientedBoundingBox=require('./OrientedBoundingBox');
var TaskProcessor=require('./TaskProcessor');
var TerrainEncoding=require('./TerrainEncoding');
var TerrainMesh=require('./TerrainMesh');

    'use strict';

    /**
     * Terrain data for a single tile where the terrain data is represented as a quantized mesh.  A quantized
     * mesh consists of three vertex attributes, longitude, latitude, and height.  All attributes are expressed
     * as 16-bit values in the range 0 to 32767.  Longitude and latitude are zero at the southwest corner
     * of the tile and 32767 at the northeast corner.  Height is zero at the minimum height in the tile
     * and 32767 at the maximum height in the tile.
     *
     * @alias QuantizedMeshTerrainData
     * @constructor
     *
     * @param {Object} options Object with the following properties:
     * @param {Uint16Array} options.quantizedVertices The buffer containing the quantized mesh.
     * @param {Uint16Array|Uint32Array} options.indices The indices specifying how the quantized vertices are linked
     *                      together into triangles.  Each three indices specifies one triangle.
     * @param {Number} options.minimumHeight The minimum terrain height within the tile, in meters above the ellipsoid.
     * @param {Number} options.maximumHeight The maximum terrain height within the tile, in meters above the ellipsoid.
     * @param {BoundingSphere} options.boundingSphere A sphere bounding all of the vertices in the mesh.
     * @param {OrientedBoundingBox} [options.orientedBoundingBox] An OrientedBoundingBox bounding all of the vertices in the mesh.
     * @param {Cartesian3} options.horizonOcclusionPoint The horizon occlusion point of the mesh.  If this point
     *                      is below the horizon, the entire tile is assumed to be below the horizon as well.
     *                      The point is expressed in ellipsoid-scaled coordinates.
     * @param {Number[]} options.westIndices The indices of the vertices on the western edge of the tile.
     * @param {Number[]} options.southIndices The indices of the vertices on the southern edge of the tile.
     * @param {Number[]} options.eastIndices The indices of the vertices on the eastern edge of the tile.
     * @param {Number[]} options.northIndices The indices of the vertices on the northern edge of the tile.
     * @param {Number} options.westSkirtHeight The height of the skirt to add on the western edge of the tile.
     * @param {Number} options.southSkirtHeight The height of the skirt to add on the southern edge of the tile.
     * @param {Number} options.eastSkirtHeight The height of the skirt to add on the eastern edge of the tile.
     * @param {Number} options.northSkirtHeight The height of the skirt to add on the northern edge of the tile.
     * @param {Number} [options.childTileMask=15] A bit mask indicating which of this tile's four children exist.
     *                 If a child's bit is set, geometry will be requested for that tile as well when it
     *                 is needed.  If the bit is cleared, the child tile is not requested and geometry is
     *                 instead upsampled from the parent.  The bit values are as follows:
     *                 <table>
     *                  <tr><th>Bit Position</th><th>Bit Value</th><th>Child Tile</th></tr>
     *                  <tr><td>0</td><td>1</td><td>Southwest</td></tr>
     *                  <tr><td>1</td><td>2</td><td>Southeast</td></tr>
     *                  <tr><td>2</td><td>4</td><td>Northwest</td></tr>
     *                  <tr><td>3</td><td>8</td><td>Northeast</td></tr>
     *                 </table>
     * @param {Boolean} [options.createdByUpsampling=false] True if this instance was created by upsampling another instance;
     *                  otherwise, false.
     * @param {Uint8Array} [options.encodedNormals] The buffer containing per vertex normals, encoded using 'oct' encoding
     * @param {Uint8Array} [options.waterMask] The buffer containing the watermask.
     * @param {Credit[]} [options.credits] Array of credits for this tile.
     *
     *
     * @example
     * var data = new Cesium.QuantizedMeshTerrainData({
     *     minimumHeight : -100,
     *     maximumHeight : 2101,
     *     quantizedVertices : new Uint16Array([// order is SW NW SE NE
     *                                          // longitude
     *                                          0, 0, 32767, 32767,
     *                                          // latitude
     *                                          0, 32767, 0, 32767,
     *                                          // heights
     *                                          16384, 0, 32767, 16384]),
     *     indices : new Uint16Array([0, 3, 1,
     *                                0, 2, 3]),
     *     boundingSphere : new Cesium.BoundingSphere(new Cesium.Cartesian3(1.0, 2.0, 3.0), 10000),
     *     orientedBoundingBox : new Cesium.OrientedBoundingBox(new Cesium.Cartesian3(1.0, 2.0, 3.0), Cesium.Matrix3.fromRotationX(Cesium.Math.PI, new Cesium.Matrix3())),
     *     horizonOcclusionPoint : new Cesium.Cartesian3(3.0, 2.0, 1.0),
     *     westIndices : [0, 1],
     *     southIndices : [0, 1],
     *     eastIndices : [2, 3],
     *     northIndices : [1, 3],
     *     westSkirtHeight : 1.0,
     *     southSkirtHeight : 1.0,
     *     eastSkirtHeight : 1.0,
     *     northSkirtHeight : 1.0
     * });
     *
     * @see TerrainData
     * @see HeightmapTerrainData
     */
    function QuantizedMeshTerrainData(options) {
        //>>includeStart('debug', pragmas.debug)
        if (!defined(options) || !defined(options.quantizedVertices)) {
            throw new DeveloperError('options.quantizedVertices is required.');
        }
        if (!defined(options.indices)) {
            throw new DeveloperError('options.indices is required.');
        }
        if (!defined(options.minimumHeight)) {
            throw new DeveloperError('options.minimumHeight is required.');
        }
        if (!defined(options.maximumHeight)) {
            throw new DeveloperError('options.maximumHeight is required.');
        }
        if (!defined(options.maximumHeight)) {
            throw new DeveloperError('options.maximumHeight is required.');
        }
        if (!defined(options.boundingSphere)) {
            throw new DeveloperError('options.boundingSphere is required.');
        }
        if (!defined(options.horizonOcclusionPoint)) {
            throw new DeveloperError('options.horizonOcclusionPoint is required.');
        }
        if (!defined(options.westIndices)) {
            throw new DeveloperError('options.westIndices is required.');
        }
        if (!defined(options.southIndices)) {
            throw new DeveloperError('options.southIndices is required.');
        }
        if (!defined(options.eastIndices)) {
            throw new DeveloperError('options.eastIndices is required.');
        }
        if (!defined(options.northIndices)) {
            throw new DeveloperError('options.northIndices is required.');
        }
        if (!defined(options.westSkirtHeight)) {
            throw new DeveloperError('options.westSkirtHeight is required.');
        }
        if (!defined(options.southSkirtHeight)) {
            throw new DeveloperError('options.southSkirtHeight is required.');
        }
        if (!defined(options.eastSkirtHeight)) {
            throw new DeveloperError('options.eastSkirtHeight is required.');
        }
        if (!defined(options.northSkirtHeight)) {
            throw new DeveloperError('options.northSkirtHeight is required.');
        }
        //>>includeEnd('debug');

        this._quantizedVertices = options.quantizedVertices;
        this._encodedNormals = options.encodedNormals;
        this._indices = options.indices;
        this._minimumHeight = options.minimumHeight;
        this._maximumHeight = options.maximumHeight;
        this._boundingSphere = options.boundingSphere;
        this._orientedBoundingBox = options.orientedBoundingBox;
        this._horizonOcclusionPoint = options.horizonOcclusionPoint;
        this._credits = options.credits;

        var vertexCount = this._quantizedVertices.length / 3;
        var uValues = this._uValues = this._quantizedVertices.subarray(0, vertexCount);
        var vValues = this._vValues = this._quantizedVertices.subarray(vertexCount, 2 * vertexCount);
        this._heightValues = this._quantizedVertices.subarray(2 * vertexCount, 3 * vertexCount);

        // We don't assume that we can count on the edge vertices being sorted by u or v.
        function sortByV(a, b) {
            return vValues[a] - vValues[b];
        }

        function sortByU(a, b) {
            return uValues[a] - uValues[b];
        }

        this._westIndices = sortIndicesIfNecessary(options.westIndices, sortByV, vertexCount);
        this._southIndices = sortIndicesIfNecessary(options.southIndices, sortByU, vertexCount);
        this._eastIndices = sortIndicesIfNecessary(options.eastIndices, sortByV, vertexCount);
        this._northIndices = sortIndicesIfNecessary(options.northIndices, sortByU, vertexCount);

        this._westSkirtHeight = options.westSkirtHeight;
        this._southSkirtHeight = options.southSkirtHeight;
        this._eastSkirtHeight = options.eastSkirtHeight;
        this._northSkirtHeight = options.northSkirtHeight;

        this._childTileMask = defaultValue(options.childTileMask, 15);

        this._createdByUpsampling = defaultValue(options.createdByUpsampling, false);
        this._waterMask = options.waterMask;

        this._mesh = undefined;
    }

    defineProperties(QuantizedMeshTerrainData.prototype, {
        /**
         * An array of credits for this tile.
         * @memberof QuantizedMeshTerrainData.prototype
         * @type {Credit[]}
         */
        credits : {
            get : function() {
                return this._credits;
            }
        },
        /**
         * The water mask included in this terrain data, if any.  A water mask is a rectangular
         * Uint8Array or image where a value of 255 indicates water and a value of 0 indicates land.
         * Values in between 0 and 255 are allowed as well to smoothly blend between land and water.
         * @memberof QuantizedMeshTerrainData.prototype
         * @type {Uint8Array|Image|Canvas}
         */
        waterMask : {
            get : function() {
                return this._waterMask;
            }
        },

        childTileMask : {
            get : function() {
                return this._childTileMask;
            }
        },

        canUpsample : {
            get : function() {
                return defined(this._mesh);
            }
        }
    });

    var arrayScratch = [];

    function sortIndicesIfNecessary(indices, sortFunction, vertexCount) {
        arrayScratch.length = indices.length;

        var needsSort = false;
        for (var i = 0, len = indices.length; i < len; ++i) {
            arrayScratch[i] = indices[i];
            needsSort = needsSort || (i > 0 && sortFunction(indices[i - 1], indices[i]) > 0);
        }

        if (needsSort) {
            arrayScratch.sort(sortFunction);
            return IndexDatatype.createTypedArray(vertexCount, arrayScratch);
        }
        return indices;
    }

    var createMeshTaskProcessor = new TaskProcessor('createVerticesFromQuantizedTerrainMesh');

    /**
     * Creates a {@link TerrainMesh} from this terrain data.
     *
     * @private
     *
     * @param {TilingScheme} tilingScheme The tiling scheme to which this tile belongs.
     * @param {Number} x The X coordinate of the tile for which to create the terrain data.
     * @param {Number} y The Y coordinate of the tile for which to create the terrain data.
     * @param {Number} level The level of the tile for which to create the terrain data.
     * @param {Number} [exaggeration=1.0] The scale used to exaggerate the terrain.
     * @returns {Promise.<TerrainMesh>|undefined} A promise for the terrain mesh, or undefined if too many
     *          asynchronous mesh creations are already in progress and the operation should
     *          be retried later.
     */
    QuantizedMeshTerrainData.prototype.createMesh = function(tilingScheme, x, y, level, exaggeration) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(tilingScheme)) {
            throw new DeveloperError('tilingScheme is required.');
        }
        if (!defined(x)) {
            throw new DeveloperError('x is required.');
        }
        if (!defined(y)) {
            throw new DeveloperError('y is required.');
        }
        if (!defined(level)) {
            throw new DeveloperError('level is required.');
        }
        //>>includeEnd('debug');

        var ellipsoid = tilingScheme.ellipsoid;
        var rectangle = tilingScheme.tileXYToRectangle(x, y, level);
        exaggeration = defaultValue(exaggeration, 1.0);

        var verticesPromise = createMeshTaskProcessor.scheduleTask({
            minimumHeight : this._minimumHeight,
            maximumHeight : this._maximumHeight,
            quantizedVertices : this._quantizedVertices,
            octEncodedNormals : this._encodedNormals,
            includeWebMercatorT : true,
            indices : this._indices,
            westIndices : this._westIndices,
            southIndices : this._southIndices,
            eastIndices : this._eastIndices,
            northIndices : this._northIndices,
            westSkirtHeight : this._westSkirtHeight,
            southSkirtHeight : this._southSkirtHeight,
            eastSkirtHeight : this._eastSkirtHeight,
            northSkirtHeight : this._northSkirtHeight,
            rectangle : rectangle,
            relativeToCenter : this._boundingSphere.center,
            ellipsoid : ellipsoid,
            exaggeration : exaggeration
        });

        if (!defined(verticesPromise)) {
            // Postponed
            return undefined;
        }

        var that = this;
        return when(verticesPromise, function(result) {
            var vertexCount = that._quantizedVertices.length / 3;
            vertexCount += that._westIndices.length + that._southIndices.length + that._eastIndices.length + that._northIndices.length;
            var indicesTypedArray = IndexDatatype.createTypedArray(vertexCount, result.indices);

            var vertices = new Float32Array(result.vertices);
            var rtc = result.center;
            var minimumHeight = result.minimumHeight;
            var maximumHeight = result.maximumHeight;
            var boundingSphere = defaultValue(result.boundingSphere, that._boundingSphere);
            var obb = defaultValue(result.orientedBoundingBox, that._orientedBoundingBox);
            var occlusionPoint = that._horizonOcclusionPoint;
            var stride = result.vertexStride;
            var terrainEncoding = TerrainEncoding.clone(result.encoding);

            that._skirtIndex = result.skirtIndex;
            that._vertexCountWithoutSkirts = that._quantizedVertices.length / 3;

            that._mesh = new TerrainMesh(
                    rtc,
                    vertices,
                    indicesTypedArray,
                    minimumHeight,
                    maximumHeight,
                    boundingSphere,
                    occlusionPoint,
                    stride,
                    obb,
                    terrainEncoding,
                    exaggeration,
                    result.westIndicesSouthToNorth,
                    result.southIndicesEastToWest,
                    result.eastIndicesNorthToSouth,
                    result.northIndicesWestToEast);

            // Free memory received from server after mesh is created.
            that._quantizedVertices = undefined;
            that._encodedNormals = undefined;
            that._indices = undefined;

            that._uValues = undefined;
            that._vValues = undefined;
            that._heightValues = undefined;

            that._westIndices = undefined;
            that._southIndices = undefined;
            that._eastIndices = undefined;
            that._northIndices = undefined;

            return that._mesh;
        });
    };

    var upsampleTaskProcessor = new TaskProcessor('upsampleQuantizedTerrainMesh');

    /**
     * Upsamples this terrain data for use by a descendant tile.  The resulting instance will contain a subset of the
     * vertices in this instance, interpolated if necessary.
     *
     * @param {TilingScheme} tilingScheme The tiling scheme of this terrain data.
     * @param {Number} thisX The X coordinate of this tile in the tiling scheme.
     * @param {Number} thisY The Y coordinate of this tile in the tiling scheme.
     * @param {Number} thisLevel The level of this tile in the tiling scheme.
     * @param {Number} descendantX The X coordinate within the tiling scheme of the descendant tile for which we are upsampling.
     * @param {Number} descendantY The Y coordinate within the tiling scheme of the descendant tile for which we are upsampling.
     * @param {Number} descendantLevel The level within the tiling scheme of the descendant tile for which we are upsampling.
     * @returns {Promise.<QuantizedMeshTerrainData>|undefined} A promise for upsampled heightmap terrain data for the descendant tile,
     *          or undefined if too many asynchronous upsample operations are in progress and the request has been
     *          deferred.
     */
    QuantizedMeshTerrainData.prototype.upsample = function(tilingScheme, thisX, thisY, thisLevel, descendantX, descendantY, descendantLevel) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(tilingScheme)) {
            throw new DeveloperError('tilingScheme is required.');
        }
        if (!defined(thisX)) {
            throw new DeveloperError('thisX is required.');
        }
        if (!defined(thisY)) {
            throw new DeveloperError('thisY is required.');
        }
        if (!defined(thisLevel)) {
            throw new DeveloperError('thisLevel is required.');
        }
        if (!defined(descendantX)) {
            throw new DeveloperError('descendantX is required.');
        }
        if (!defined(descendantY)) {
            throw new DeveloperError('descendantY is required.');
        }
        if (!defined(descendantLevel)) {
            throw new DeveloperError('descendantLevel is required.');
        }
        var levelDifference = descendantLevel - thisLevel;
        if (levelDifference > 1) {
            throw new DeveloperError('Upsampling through more than one level at a time is not currently supported.');
        }
        //>>includeEnd('debug');

        var mesh = this._mesh;
        if (!defined(this._mesh)) {
            return undefined;
        }

        var isEastChild = thisX * 2 !== descendantX;
        var isNorthChild = thisY * 2 === descendantY;

        var ellipsoid = tilingScheme.ellipsoid;
        var childRectangle = tilingScheme.tileXYToRectangle(descendantX, descendantY, descendantLevel);

        var upsamplePromise = upsampleTaskProcessor.scheduleTask({
            vertices : mesh.vertices,
            vertexCountWithoutSkirts : this._vertexCountWithoutSkirts,
            indices : mesh.indices,
            skirtIndex : this._skirtIndex,
            encoding : mesh.encoding,
            minimumHeight : this._minimumHeight,
            maximumHeight : this._maximumHeight,
            isEastChild : isEastChild,
            isNorthChild : isNorthChild,
            childRectangle : childRectangle,
            ellipsoid : ellipsoid,
            exaggeration : mesh.exaggeration
        });

        if (!defined(upsamplePromise)) {
            // Postponed
            return undefined;
        }

        var shortestSkirt = Math.min(this._westSkirtHeight, this._eastSkirtHeight);
        shortestSkirt = Math.min(shortestSkirt, this._southSkirtHeight);
        shortestSkirt = Math.min(shortestSkirt, this._northSkirtHeight);

        var westSkirtHeight = isEastChild ? (shortestSkirt * 0.5) : this._westSkirtHeight;
        var southSkirtHeight = isNorthChild ? (shortestSkirt * 0.5) : this._southSkirtHeight;
        var eastSkirtHeight = isEastChild ? this._eastSkirtHeight : (shortestSkirt * 0.5);
        var northSkirtHeight = isNorthChild ? this._northSkirtHeight : (shortestSkirt * 0.5);
        var credits = this._credits;

        return when(upsamplePromise).then(function(result) {
            var quantizedVertices = new Uint16Array(result.vertices);
            var indicesTypedArray = IndexDatatype.createTypedArray(quantizedVertices.length / 3, result.indices);
            var encodedNormals;
            if (defined(result.encodedNormals)) {
                encodedNormals = new Uint8Array(result.encodedNormals);
            }

            return new QuantizedMeshTerrainData({
                quantizedVertices : quantizedVertices,
                indices : indicesTypedArray,
                encodedNormals : encodedNormals,
                minimumHeight : result.minimumHeight,
                maximumHeight : result.maximumHeight,
                boundingSphere : BoundingSphere.clone(result.boundingSphere),
                orientedBoundingBox : OrientedBoundingBox.clone(result.orientedBoundingBox),
                horizonOcclusionPoint : Cartesian3.clone(result.horizonOcclusionPoint),
                westIndices : result.westIndices,
                southIndices : result.southIndices,
                eastIndices : result.eastIndices,
                northIndices : result.northIndices,
                westSkirtHeight : westSkirtHeight,
                southSkirtHeight : southSkirtHeight,
                eastSkirtHeight : eastSkirtHeight,
                northSkirtHeight : northSkirtHeight,
                childTileMask : 0,
                credits: credits,
                createdByUpsampling : true
            });
        });
    };

    var maxShort = 32767;
    var barycentricCoordinateScratch = new Cartesian3();

    /**
     * Computes the terrain height at a specified longitude and latitude.
     *
     * @param {Rectangle} rectangle The rectangle covered by this terrain data.
     * @param {Number} longitude The longitude in radians.
     * @param {Number} latitude The latitude in radians.
     * @returns {Number} The terrain height at the specified position.  The position is clamped to
     *          the rectangle, so expect incorrect results for positions far outside the rectangle.
     */
    QuantizedMeshTerrainData.prototype.interpolateHeight = function(rectangle, longitude, latitude) {
        var u = CesiumMath.clamp((longitude - rectangle.west) / rectangle.width, 0.0, 1.0);
        u *= maxShort;
        var v = CesiumMath.clamp((latitude - rectangle.south) / rectangle.height, 0.0, 1.0);
        v *= maxShort;

        if (!defined(this._mesh)) {
            return interpolateHeight(this, u, v);
        }

        return interpolateMeshHeight(this, u, v);
    };

    function pointInBoundingBox(u, v, u0, v0, u1, v1, u2, v2) {
        var minU = Math.min(u0, u1, u2);
        var maxU = Math.max(u0, u1, u2);
        var minV = Math.min(v0, v1, v2);
        var maxV = Math.max(v0, v1, v2);
        return (u >= minU && u <= maxU && v >= minV && v <= maxV);
    }

    var texCoordScratch0 = new Cartesian2();
    var texCoordScratch1 = new Cartesian2();
    var texCoordScratch2 = new Cartesian2();

    function interpolateMeshHeight(terrainData, u, v) {
        var mesh = terrainData._mesh;
        var vertices = mesh.vertices;
        var encoding = mesh.encoding;
        var indices = mesh.indices;

        for (var i = 0, len = indices.length; i < len; i += 3) {
            var i0 = indices[i];
            var i1 = indices[i + 1];
            var i2 = indices[i + 2];

            var uv0 = encoding.decodeTextureCoordinates(vertices, i0, texCoordScratch0);
            var uv1 = encoding.decodeTextureCoordinates(vertices, i1, texCoordScratch1);
            var uv2 = encoding.decodeTextureCoordinates(vertices, i2, texCoordScratch2);

            if (pointInBoundingBox(u, v, uv0.x, uv0.y, uv1.x, uv1.y, uv2.x, uv2.y)) {
                var barycentric = Intersections2D.computeBarycentricCoordinates(u, v, uv0.x, uv0.y, uv1.x, uv1.y, uv2.x, uv2.y, barycentricCoordinateScratch);
                if (barycentric.x >= -1e-15 && barycentric.y >= -1e-15 && barycentric.z >= -1e-15) {
                    var h0 = encoding.decodeHeight(vertices, i0);
                    var h1 = encoding.decodeHeight(vertices, i1);
                    var h2 = encoding.decodeHeight(vertices, i2);
                    return barycentric.x * h0 + barycentric.y * h1 + barycentric.z * h2;
                }
            }
        }

        // Position does not lie in any triangle in this mesh.
        return undefined;
    }

    function interpolateHeight(terrainData, u, v) {
        var uBuffer = terrainData._uValues;
        var vBuffer = terrainData._vValues;
        var heightBuffer = terrainData._heightValues;

        var indices = terrainData._indices;
        for (var i = 0, len = indices.length; i < len; i += 3) {
            var i0 = indices[i];
            var i1 = indices[i + 1];
            var i2 = indices[i + 2];

            var u0 = uBuffer[i0];
            var u1 = uBuffer[i1];
            var u2 = uBuffer[i2];

            var v0 = vBuffer[i0];
            var v1 = vBuffer[i1];
            var v2 = vBuffer[i2];

            if (pointInBoundingBox(u, v, u0, v0, u1, v1, u2, v2)) {
                var barycentric = Intersections2D.computeBarycentricCoordinates(u, v, u0, v0, u1, v1, u2, v2, barycentricCoordinateScratch);
                if (barycentric.x >= -1e-15 && barycentric.y >= -1e-15 && barycentric.z >= -1e-15) {
                    var quantizedHeight = barycentric.x * heightBuffer[i0] +
                                          barycentric.y * heightBuffer[i1] +
                                          barycentric.z * heightBuffer[i2];
                    return CesiumMath.lerp(terrainData._minimumHeight, terrainData._maximumHeight, quantizedHeight / maxShort);
                }
            }
        }

        // Position does not lie in any triangle in this mesh.
        return undefined;
    }

    /**
     * Determines if a given child tile is available, based on the
     * {@link HeightmapTerrainData.childTileMask}.  The given child tile coordinates are assumed
     * to be one of the four children of this tile.  If non-child tile coordinates are
     * given, the availability of the southeast child tile is returned.
     *
     * @param {Number} thisX The tile X coordinate of this (the parent) tile.
     * @param {Number} thisY The tile Y coordinate of this (the parent) tile.
     * @param {Number} childX The tile X coordinate of the child tile to check for availability.
     * @param {Number} childY The tile Y coordinate of the child tile to check for availability.
     * @returns {Boolean} True if the child tile is available; otherwise, false.
     */
    QuantizedMeshTerrainData.prototype.isChildAvailable = function(thisX, thisY, childX, childY) {
        //>>includeStart('debug', pragmas.debug);
        if (!defined(thisX)) {
            throw new DeveloperError('thisX is required.');
        }
        if (!defined(thisY)) {
            throw new DeveloperError('thisY is required.');
        }
        if (!defined(childX)) {
            throw new DeveloperError('childX is required.');
        }
        if (!defined(childY)) {
            throw new DeveloperError('childY is required.');
        }
        //>>includeEnd('debug');

        var bitNumber = 2; // northwest child
        if (childX !== thisX * 2) {
            ++bitNumber; // east child
        }
        if (childY !== thisY * 2) {
            bitNumber -= 2; // south child
        }

        return (this._childTileMask & (1 << bitNumber)) !== 0;
    };

    /**
     * Gets a value indicating whether or not this terrain data was created by upsampling lower resolution
     * terrain data.  If this value is false, the data was obtained from some other source, such
     * as by downloading it from a remote server.  This method should return true for instances
     * returned from a call to {@link HeightmapTerrainData#upsample}.
     *
     * @returns {Boolean} True if this instance was created by upsampling; otherwise, false.
     */
    QuantizedMeshTerrainData.prototype.wasCreatedByUpsampling = function() {
        return this._createdByUpsampling;
    };

    module.exports= QuantizedMeshTerrainData;

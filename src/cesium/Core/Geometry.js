var Cartesian2=require('./Cartesian2');
var Cartesian3=require('./Cartesian3');
var Cartographic=require('./Cartographic');
var Check=require('./Check');
var defaultValue=require('./defaultValue');
var defined=require('./defined');
var DeveloperError=require('./DeveloperError');
var GeometryOffsetAttribute=require('./GeometryOffsetAttribute');
var GeometryType=require('./GeometryType');
var Matrix2=require('./Matrix2');
var Matrix3=require('./Matrix3');
var Matrix4=require('./Matrix4');
var PrimitiveType=require('./PrimitiveType');
var Quaternion=require('./Quaternion');
var Rectangle=require('./Rectangle');
var Transforms=require('./Transforms');

    'use strict';

    /**
     * A geometry representation with attributes forming vertices and optional index data
     * defining primitives.  Geometries and an {@link Appearance}, which describes the shading,
     * can be assigned to a {@link Primitive} for visualization.  A <code>Primitive</code> can
     * be created from many heterogeneous - in many cases - geometries for performance.
     * <p>
     * Geometries can be transformed and optimized using functions in {@link GeometryPipeline}.
     * </p>
     *
     * @alias Geometry
     * @constructor
     *
     * @param {Object} options Object with the following properties:
     * @param {GeometryAttributes} options.attributes Attributes, which make up the geometry's vertices.
     * @param {PrimitiveType} [options.primitiveType=PrimitiveType.TRIANGLES] The type of primitives in the geometry.
     * @param {Uint16Array|Uint32Array} [options.indices] Optional index data that determines the primitives in the geometry.
     * @param {BoundingSphere} [options.boundingSphere] An optional bounding sphere that fully enclosed the geometry.
     *
     * @see PolygonGeometry
     * @see RectangleGeometry
     * @see EllipseGeometry
     * @see CircleGeometry
     * @see WallGeometry
     * @see SimplePolylineGeometry
     * @see BoxGeometry
     * @see EllipsoidGeometry
     *
     * @demo {@link https://cesiumjs.org/Cesium/Apps/Sandcastle/index.html?src=Geometry%20and%20Appearances.html|Geometry and Appearances Demo}
     *
     * @example
     * // Create geometry with a position attribute and indexed lines.
     * var positions = new Float64Array([
     *   0.0, 0.0, 0.0,
     *   7500000.0, 0.0, 0.0,
     *   0.0, 7500000.0, 0.0
     * ]);
     *
     * var geometry = new Cesium.Geometry({
     *   attributes : {
     *     position : new Cesium.GeometryAttribute({
     *       componentDatatype : Cesium.ComponentDatatype.DOUBLE,
     *       componentsPerAttribute : 3,
     *       values : positions
     *     })
     *   },
     *   indices : new Uint16Array([0, 1, 1, 2, 2, 0]),
     *   primitiveType : Cesium.PrimitiveType.LINES,
     *   boundingSphere : Cesium.BoundingSphere.fromVertices(positions)
     * });
     */
    function Geometry(options) {
        options = defaultValue(options, defaultValue.EMPTY_OBJECT);

        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.object('options.attributes', options.attributes);
        //>>includeEnd('debug');

        /**
         * Attributes, which make up the geometry's vertices.  Each property in this object corresponds to a
         * {@link GeometryAttribute} containing the attribute's data.
         * <p>
         * Attributes are always stored non-interleaved in a Geometry.
         * </p>
         * <p>
         * There are reserved attribute names with well-known semantics.  The following attributes
         * are created by a Geometry (depending on the provided {@link VertexFormat}.
         * <ul>
         *    <li><code>position</code> - 3D vertex position.  64-bit floating-point (for precision).  3 components per attribute.  See {@link VertexFormat#position}.</li>
         *    <li><code>normal</code> - Normal (normalized), commonly used for lighting.  32-bit floating-point.  3 components per attribute.  See {@link VertexFormat#normal}.</li>
         *    <li><code>st</code> - 2D texture coordinate.  32-bit floating-point.  2 components per attribute.  See {@link VertexFormat#st}.</li>
         *    <li><code>bitangent</code> - Bitangent (normalized), used for tangent-space effects like bump mapping.  32-bit floating-point.  3 components per attribute.  See {@link VertexFormat#bitangent}.</li>
         *    <li><code>tangent</code> - Tangent (normalized), used for tangent-space effects like bump mapping.  32-bit floating-point.  3 components per attribute.  See {@link VertexFormat#tangent}.</li>
         * </ul>
         * </p>
         * <p>
         * The following attribute names are generally not created by a Geometry, but are added
         * to a Geometry by a {@link Primitive} or {@link GeometryPipeline} functions to prepare
         * the geometry for rendering.
         * <ul>
         *    <li><code>position3DHigh</code> - High 32 bits for encoded 64-bit position computed with {@link GeometryPipeline.encodeAttribute}.  32-bit floating-point.  4 components per attribute.</li>
         *    <li><code>position3DLow</code> - Low 32 bits for encoded 64-bit position computed with {@link GeometryPipeline.encodeAttribute}.  32-bit floating-point.  4 components per attribute.</li>
         *    <li><code>position3DHigh</code> - High 32 bits for encoded 64-bit 2D (Columbus view) position computed with {@link GeometryPipeline.encodeAttribute}.  32-bit floating-point.  4 components per attribute.</li>
         *    <li><code>position2DLow</code> - Low 32 bits for encoded 64-bit 2D (Columbus view) position computed with {@link GeometryPipeline.encodeAttribute}.  32-bit floating-point.  4 components per attribute.</li>
         *    <li><code>color</code> - RGBA color (normalized) usually from {@link GeometryInstance#color}.  32-bit floating-point.  4 components per attribute.</li>
         *    <li><code>pickColor</code> - RGBA color used for picking.  32-bit floating-point.  4 components per attribute.</li>
         * </ul>
         * </p>
         *
         * @type GeometryAttributes
         *
         * @default undefined
         *
         *
         * @example
         * geometry.attributes.position = new Cesium.GeometryAttribute({
         *   componentDatatype : Cesium.ComponentDatatype.FLOAT,
         *   componentsPerAttribute : 3,
         *   values : new Float32Array(0)
         * });
         *
         * @see GeometryAttribute
         * @see VertexFormat
         */
        this.attributes = options.attributes;

        /**
         * Optional index data that - along with {@link Geometry#primitiveType} -
         * determines the primitives in the geometry.
         *
         * @type Array
         *
         * @default undefined
         */
        this.indices = options.indices;

        /**
         * The type of primitives in the geometry.  This is most often {@link PrimitiveType.TRIANGLES},
         * but can varying based on the specific geometry.
         *
         * @type PrimitiveType
         *
         * @default undefined
         */
        this.primitiveType = defaultValue(options.primitiveType, PrimitiveType.TRIANGLES);

        /**
         * An optional bounding sphere that fully encloses the geometry.  This is
         * commonly used for culling.
         *
         * @type BoundingSphere
         *
         * @default undefined
         */
        this.boundingSphere = options.boundingSphere;

        /**
         * @private
         */
        this.geometryType = defaultValue(options.geometryType, GeometryType.NONE);

        /**
         * @private
         */
        this.boundingSphereCV = options.boundingSphereCV;

        /**
         * @private
         * Used for computing the bounding sphere for geometry using the applyOffset vertex attribute
         */
        this.offsetAttribute = options.offsetAttribute;
    }

    /**
     * Computes the number of vertices in a geometry.  The runtime is linear with
     * respect to the number of attributes in a vertex, not the number of vertices.
     *
     * @param {Geometry} geometry The geometry.
     * @returns {Number} The number of vertices in the geometry.
     *
     * @example
     * var numVertices = Cesium.Geometry.computeNumberOfVertices(geometry);
     */
    Geometry.computeNumberOfVertices = function(geometry) {
        //>>includeStart('debug', pragmas.debug);
        Check.typeOf.object('geometry', geometry);
        //>>includeEnd('debug');

        var numberOfVertices = -1;
        for ( var property in geometry.attributes) {
            if (geometry.attributes.hasOwnProperty(property) &&
                    defined(geometry.attributes[property]) &&
                    defined(geometry.attributes[property].values)) {

                var attribute = geometry.attributes[property];
                var num = attribute.values.length / attribute.componentsPerAttribute;
                //>>includeStart('debug', pragmas.debug);
                if ((numberOfVertices !== num) && (numberOfVertices !== -1)) {
                    throw new DeveloperError('All attribute lists must have the same number of attributes.');
                }
                //>>includeEnd('debug');
                numberOfVertices = num;
            }
        }

        return numberOfVertices;
    };

    var rectangleCenterScratch = new Cartographic();
    var enuCenterScratch = new Cartesian3();
    var fixedFrameToEnuScratch = new Matrix4();
    var boundingRectanglePointsCartographicScratch = [new Cartographic(), new Cartographic(), new Cartographic()];
    var boundingRectanglePointsEnuScratch = [new Cartesian2(), new Cartesian2(), new Cartesian2()];
    var points2DScratch = [new Cartesian2(), new Cartesian2(), new Cartesian2()];
    var pointEnuScratch = new Cartesian3();
    var enuRotationScratch = new Quaternion();
    var enuRotationMatrixScratch = new Matrix4();
    var rotation2DScratch = new Matrix2();

    /**
     * For remapping texture coordinates when rendering GroundPrimitives with materials.
     * GroundPrimitive texture coordinates are computed to align with the cartographic coordinate system on the globe.
     * However, EllipseGeometry, RectangleGeometry, and PolygonGeometry all bake rotations to per-vertex texture coordinates
     * using different strategies.
     *
     * This method is used by EllipseGeometry and PolygonGeometry to approximate the same visual effect.
     * We encapsulate rotation and scale by computing a "transformed" texture coordinate system and computing
     * a set of reference points from which "cartographic" texture coordinates can be remapped to the "transformed"
     * system using distances to lines in 2D.
     *
     * This approximation becomes less accurate as the covered area increases, especially for GroundPrimitives near the poles,
     * but is generally reasonable for polygons and ellipses around the size of USA states.
     *
     * RectangleGeometry has its own version of this method that computes remapping coordinates using cartographic space
     * as an intermediary instead of local ENU, which is more accurate for large-area rectangles.
     *
     * @param {Cartesian3[]} positions Array of positions outlining the geometry
     * @param {Number} stRotation Texture coordinate rotation.
     * @param {Ellipsoid} ellipsoid Ellipsoid for projecting and generating local vectors.
     * @param {Rectangle} boundingRectangle Bounding rectangle around the positions.
     * @returns {Number[]} An array of 6 numbers specifying [minimum point, u extent, v extent] as points in the "cartographic" system.
     * @private
     */
    Geometry._textureCoordinateRotationPoints = function(positions, stRotation, ellipsoid, boundingRectangle) {
        var i;

        // Create a local east-north-up coordinate system centered on the polygon's bounding rectangle.
        // Project the southwest, northwest, and southeast corners of the bounding rectangle into the plane of ENU as 2D points.
        // These are the equivalents of (0,0), (0,1), and (1,0) in the texture coordiante system computed in ShadowVolumeAppearanceFS,
        // aka "ENU texture space."
        var rectangleCenter = Rectangle.center(boundingRectangle, rectangleCenterScratch);
        var enuCenter = Cartographic.toCartesian(rectangleCenter, ellipsoid, enuCenterScratch);
        var enuToFixedFrame = Transforms.eastNorthUpToFixedFrame(enuCenter, ellipsoid, fixedFrameToEnuScratch);
        var fixedFrameToEnu = Matrix4.inverse(enuToFixedFrame, fixedFrameToEnuScratch);

        var boundingPointsEnu = boundingRectanglePointsEnuScratch;
        var boundingPointsCarto = boundingRectanglePointsCartographicScratch;

        boundingPointsCarto[0].longitude = boundingRectangle.west;
        boundingPointsCarto[0].latitude = boundingRectangle.south;

        boundingPointsCarto[1].longitude = boundingRectangle.west;
        boundingPointsCarto[1].latitude = boundingRectangle.north;

        boundingPointsCarto[2].longitude = boundingRectangle.east;
        boundingPointsCarto[2].latitude = boundingRectangle.south;

        var posEnu = pointEnuScratch;

        for (i = 0; i < 3; i++) {
            Cartographic.toCartesian(boundingPointsCarto[i], ellipsoid, posEnu);
            posEnu = Matrix4.multiplyByPointAsVector(fixedFrameToEnu, posEnu, posEnu);
            boundingPointsEnu[i].x = posEnu.x;
            boundingPointsEnu[i].y = posEnu.y;
        }

        // Rotate each point in the polygon around the up vector in the ENU by -stRotation and project into ENU as 2D.
        // Compute the bounding box of these rotated points in the 2D ENU plane.
        // Rotate the corners back by stRotation, then compute their equivalents in the ENU texture space using the corners computed earlier.
        var rotation = Quaternion.fromAxisAngle(Cartesian3.UNIT_Z, -stRotation, enuRotationScratch);
        var textureMatrix = Matrix3.fromQuaternion(rotation, enuRotationMatrixScratch);

        var positionsLength = positions.length;
        var enuMinX = Number.POSITIVE_INFINITY;
        var enuMinY = Number.POSITIVE_INFINITY;
        var enuMaxX = Number.NEGATIVE_INFINITY;
        var enuMaxY = Number.NEGATIVE_INFINITY;
        for (i = 0; i < positionsLength; i++) {
            posEnu = Matrix4.multiplyByPointAsVector(fixedFrameToEnu, positions[i], posEnu);
            posEnu = Matrix3.multiplyByVector(textureMatrix, posEnu, posEnu);

            enuMinX = Math.min(enuMinX, posEnu.x);
            enuMinY = Math.min(enuMinY, posEnu.y);
            enuMaxX = Math.max(enuMaxX, posEnu.x);
            enuMaxY = Math.max(enuMaxY, posEnu.y);
        }

        var toDesiredInComputed = Matrix2.fromRotation(stRotation, rotation2DScratch);

        var points2D = points2DScratch;
        points2D[0].x = enuMinX;
        points2D[0].y = enuMinY;

        points2D[1].x = enuMinX;
        points2D[1].y = enuMaxY;

        points2D[2].x = enuMaxX;
        points2D[2].y = enuMinY;

        var boundingEnuMin = boundingPointsEnu[0];
        var boundingPointsWidth = boundingPointsEnu[2].x - boundingEnuMin.x;
        var boundingPointsHeight = boundingPointsEnu[1].y - boundingEnuMin.y;

        for (i = 0; i < 3; i++) {
            var point2D = points2D[i];
            // rotate back
            Matrix2.multiplyByVector(toDesiredInComputed, point2D, point2D);

            // Convert point into east-north texture coordinate space
            point2D.x = (point2D.x - boundingEnuMin.x) / boundingPointsWidth;
            point2D.y = (point2D.y - boundingEnuMin.y) / boundingPointsHeight;
        }

        var minXYCorner = points2D[0];
        var maxYCorner = points2D[1];
        var maxXCorner = points2D[2];
        var result = new Array(6);
        Cartesian2.pack(minXYCorner, result);
        Cartesian2.pack(maxYCorner, result, 2);
        Cartesian2.pack(maxXCorner, result, 4);

        return result;
    };

    module.exports= Geometry;

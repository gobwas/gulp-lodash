var inherits  = require('inherits-js'),
    lodashsh  = require("lodashsh"),
    assert    = require("assert"),
    cp        = require("child_process"),
    _         = require('lodash'),
    listing   = require("lodash-cli/lib/listing"),
    gutil     = require("gulp-util"),
    MODIFIER, EXPORTS, FULLSIZE, validate,
    pkg, bin, builder;

pkg     = require('lodash-cli/package.json');
bin     = pkg.bin.lodash;
builder = require.resolve('lodash-cli/' + bin);

MODIFIER = {
    COMPAT:     "compat",
    MODERN:     "modern",
    STRICT:     "strict",
    MODULARIZE: "modularize"
};

EXPORTS = {
    AMD:    "adm",
    CJS:    "commonjs",
    ES:     "es",
    GLOBAL: "global",
    IOJS:   "iojs",
    NODE:   "node",
    NPM:    "npm",
    NONE:   "none",
    UMD:    "umd"
};

FULLSIZE = 415857;

/**
 * @class Builder
 * @constructor
 * @abstract
 *
 * @param {Object} [options]
 */
function Builder(options) {
    this.options = _.extend({}, this.constructor.DEFAULTS, options);
}

Builder.prototype = {
    constructor: Builder,

    build: function(code, cb) {
        var options, usage, build,
            callback, buffer, include, funcs;

        callback = _.once(cb);

        options = [];
        options.push(this.options.modifier);
        options.push("exports=" + this.options.exports);

        include = this.options.include;

        if (this.options.usage) {
            assert(_.isString(code), "Code is expected to be a String");

            usage = lodashsh(code);

            include = _.unique(include.concat(usage));

            console.log('lodashsh(code)', usage);
        }

        include = include.filter(function(f) {
            return _.includes(listing.funcs, f);
        });

        if (include.length > 0) {
            options.push("include=" + include.join(","));
        }

        if (this.options.moduleId) {
            options.push("moduleId=" + this.options.moduleId);
        }

        options.push("--stdout");
        options.push("--development");

        //console.log(builder, options.join(' '));

        build = cp.spawn(builder, options);

        build.on('error', callback);
        build.stderr.on("data", function (chunk) {
            console.log('Lodash Builder stderr', chunk.toString());
            callback(new Error(chunk.toString()));
        });

        buffer = [];
        build.stdout.on('data', function(chunk) {
            buffer.push(chunk);
        });

        build.on('close', function() {
            var result;

            result = Buffer.concat(buffer);

            gutil.log('Lodash saved %d% of size', (100 - (result.length / FULLSIZE) * 100).toFixed(2));

            callback(null, Buffer.concat(buffer));
        });
    }
};

Builder.DEFAULTS = {
    modifier: MODIFIER.COMPAT,
    exports:  EXPORTS.UMD,
    include:  [],
    minus:    null,
    category: null,
    settings: null,
    template: null,
    moduleId: null,

    usage:    true
};

Builder.extend = function(proto, statics) {
    return inherits(this, proto, statics);
};

module.exports = {
    Builder:  Builder,
    MODIFIER: MODIFIER,
    EXPORTS:  EXPORTS
};
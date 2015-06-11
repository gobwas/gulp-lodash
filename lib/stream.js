var lodashsh  = require("lodashsh"),
    Transform = require("stream").Transform,
    Writable  = require("stream").Writable,
    File      = require('vinyl'),
    path      = require("path"),
    Builder   = require("./builder").Builder,
    inherits  = require("inherits-js"),
    _         = require("lodash"),
    Stream, Proxy;

Proxy = inherits ( Writable,
    {
        constructor: function(flush) {
            Writable.call(this, { objectMode: true });
            this.flush = flush;
        },

        _write: function(chunk, enc, cb) {
            cb();
            this.flush(chunk);
        }
    }
);

Stream = inherits( Transform,
    /**
     * @lends Stream.prototype
     */
    {
        constructor: function(builder, options) {
            Transform.call(this, { objectMode: true });
            this.builder = builder;
            this.options = _.extend({}, this.constructor.DEFAULTS, options);
            this.buffer = [];
        },

        _transform: function(chunk, enc, done) {
            this.buffer.push(chunk);

            if (this.options.bypass) {
                done(null, chunk);
            } else {
                done();
            }
        },

        _flush: function(done) {
            var self = this,
                code;

            code = Buffer.concat(this.buffer);

            this.builder.build(code.contents.toString(), function(err, buff) {
                var opts;

                if (err) {
                    return done(err);
                }

                opts = {
                    contents: buff,
                    path: path.resolve(process.cwd(), self.options.filename)
                };

                self.push(new File(opts));

                done();
            });
        }
    },

    /**
     * @lends Stream
     */
    {
        extend: function(proto, statics) {
            return inherits(this, proto, statics);
        },

        DEFAULTS: {
            filename: "lodash_custom.js",
            bypass:   true
        }
    }
);

module.exports = Stream;
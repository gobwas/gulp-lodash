var Builder = require("./lib/builder").Builder,
    MODIFIER = require("./lib/builder").MODIFIER,
    EXPORTS = require("./lib/builder").EXPORTS,
    validator = require("is-my-json-valid"),
    Stream  = require("./lib/stream"),
    _ = require("lodash"),
    validate;

validate = validator({
    modifier: {
        type:     "string",
        required: true,
        "enum":   _.values(MODIFIER)
    },
    exports: {
        type:     "string",
        required: true,
        "enum":   _.values(EXPORTS)
    },
    moduleId: {
        type: "string",
        minLength: 1
    }
});



module.exports = function(options) {
    var error,
        builder, stream;

    if (!validate(options)) {
        error = validate.errors[0];
        throw new Error("Error: " + error.field + " " + error.message);
    }

    builder = new Builder(options);
    stream = new Stream(builder, options);

    return stream;
};
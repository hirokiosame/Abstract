'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _instanceMethods = require('./instanceMethods');

var _instanceMethods2 = _interopRequireDefault(_instanceMethods);

var Abstract = (function (_InstanceMethods) {
	_inherits(Abstract, _InstanceMethods);

	function Abstract(properties) {
		_classCallCheck(this, Abstract);

		_get(Object.getPrototypeOf(Abstract.prototype), 'constructor', this).call(this);

		if (!(properties instanceof Object)) {
			return;
		}

		var model = this.constructor,
		    schema = model.attributes;

		// Iterate schema attributes
		for (var att in schema) {

			// Validation of attribute
			if (!properties.hasOwnProperty(att)) {
				continue;
			}

			var attribute = schema[att];

			// If foreign reference
			if (attribute instanceof Function) {

				// Validate reference
				if (!(properties[att] instanceof Object && properties[att].hasOwnProperty(attribute.primaryKey))) {
					continue;
				}

				// Create the instance
				if (!(properties[att] instanceof attribute)) {
					properties[att] = new attribute(properties[att]);
				}
			}

			// Add
			setAttribute.call(this, att, properties[att]);
		}

		console.log(JSON.stringify(this));
	}

	_createClass(Abstract, null, [{
		key: 'connect',
		value: function connect(config) {

			this._connection = _mysql2['default'].createConnection(config);
			this._connection.connect();
		}
	}]);

	return Abstract;
})(_instanceMethods2['default']);

exports['default'] = Abstract;
;

function setAttribute(attrName, value) {

	var attrSymbol = Symbol(attrName);

	this[attrSymbol] = value;

	Object.defineProperty(this, attrName, {
		get: function get() {
			return this[attrSymbol];
		},
		set: function set(val) {
			this.unsyncd = true;
			return this[attrSymbol] = val;
		}
	});
}
module.exports = exports['default'];
//# sourceMappingURL=index.js.map
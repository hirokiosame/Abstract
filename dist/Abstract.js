'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _mysql = require('mysql');

var _mysql2 = _interopRequireDefault(_mysql);

var _AbstractInstanceMethods = require('./Abstract.instanceMethods');

var _AbstractInstanceMethods2 = _interopRequireDefault(_AbstractInstanceMethods);

var A = function A() {
	_classCallCheck(this, A);

	this.b = [];
};

var Abstract = (function (_InstanceMethods) {
	_inherits(Abstract, _InstanceMethods);

	function Abstract(properties) {
		_classCallCheck(this, Abstract);

		_get(Object.getPrototypeOf(Abstract.prototype), 'constructor', this).call(this);

		this.unsyncd = {};
		if (!(properties instanceof Object)) {
			return;
		}

		var model = this.constructor,
		    attributes = model.attributes;

		// Iterate schema attributes
		for (var attrName in attributes) {

			// Validate the schema
			console.assert(attributes[attrName] instanceof Object || attributes[attrName] instanceof Function, '\'' + attrName + '\' has an invalid schema');

			// If reference, make sure it has a primary key
			// TODO: Allow reference ket to be set (Model.referenceBy('phoneNumber'))
			if (attributes[attrName] instanceof Function) {
				console.assert(typeof attributes[attrName].primaryKey === 'string', 'Reference schema must have a primary key');

				var primaryKey = attributes[attrName].primaryKey;

				console.assert(attributes[attrName].attributes.hasOwnProperty(primaryKey), 'Reference primary key must exist');
			}

			setAttribute.call(this, attrName, attributes[attrName]);

			if (properties[attrName]) {
				this[attrName] = properties[attrName];
			}
		}

		model.createTable(function (err) {
			if (err) {
				throw err;
			}
		});
	}

	_createClass(Abstract, null, [{
		key: 'connect',
		value: function connect(config) {

			this._connection = _mysql2['default'].createConnection(config);
			this._connection.connect();
		}
	}]);

	return Abstract;
})(_AbstractInstanceMethods2['default']);

exports['default'] = Abstract;
;

function setAttribute(attrName, attrSchema) {

	var attrSymbol = Symbol(attrName);

	Object.defineProperty(this, attrName, {
		get: function get() {
			return this[attrSymbol];
		},
		set: function set(val) {

			if (attrSchema instanceof Function) {
				console.assert(val instanceof attrSchema, 'Value must be an instance of the reference');
				console.assert(val.hasOwnProperty(attrSchema.primaryKey), 'Reference must hold a primary key');
			}

			this[attrSymbol] = val;

			// Mark as unsyncd
			if (!this.unsyncd[attrName]) {
				this.unsyncd[attrName] = 1;
			}

			return val;
		}
	});
}
module.exports = exports['default'];
//# sourceMappingURL=Abstract.js.map

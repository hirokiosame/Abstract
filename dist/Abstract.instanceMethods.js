'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(_x, _x2, _x3) { var _again = true; _function: while (_again) { var object = _x, property = _x2, receiver = _x3; desc = parent = getter = undefined; _again = false; if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { _x = parent; _x2 = property; _x3 = receiver; _again = true; continue _function; } } else if ('value' in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } } };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _asynk = require('asynk');

var _asynk2 = _interopRequireDefault(_asynk);

var _sqlBuilder = require('./sqlBuilder');

var sql = _interopRequireWildcard(_sqlBuilder);

var _AbstractConstructorMethods = require('./Abstract.constructorMethods');

var _AbstractConstructorMethods2 = _interopRequireDefault(_AbstractConstructorMethods);

var InstanceMethods = (function (_ConstructorMethods) {
	_inherits(InstanceMethods, _ConstructorMethods);

	function InstanceMethods() {
		_classCallCheck(this, InstanceMethods);

		_get(Object.getPrototypeOf(InstanceMethods.prototype), 'constructor', this).call(this);
	}

	_createClass(InstanceMethods, [{
		key: 'toJSON',
		value: function toJSON() {
			var model = this.constructor,
			    attributes = model.attributes;

			var obj = {};

			for (var att in attributes) {
				obj[att] = this[att];
			}

			return obj;
		}
	}, {
		key: 'findByAttributes',
		value: function findByAttributes(keys, cb) {

			var model = this.constructor,
			    attributes = model.attributes;

			var where = [],
			    values = [];

			var _iteratorNormalCompletion = true;
			var _didIteratorError = false;
			var _iteratorError = undefined;

			try {
				for (var _iterator = keys[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
					var att = _step.value;

					console.assert(att in attributes, 'Attribute \'' + att + '\' not defined in schema');

					var value = this[att];

					where.push('`' + att + '` = ?');

					// If foreign reference
					if (typeof attributes[att] === 'function') {
						var _model = attributes[att];
						values.push(value[_model.primaryKey]);
					} else {
						values.push(value);
					}
				}
			} catch (err) {
				_didIteratorError = true;
				_iteratorError = err;
			} finally {
				try {
					if (!_iteratorNormalCompletion && _iterator['return']) {
						_iterator['return']();
					}
				} finally {
					if (_didIteratorError) {
						throw _iteratorError;
					}
				}
			}

			model.find(where, values, cb);
		}
	}, {
		key: 'findSelf',
		value: function findSelf(cb) {
			var _this = this;

			var model = this.constructor;

			var attributes = undefined;

			// Find by primary key
			if (this[model.primaryKey]) {
				attributes = [model.primaryKey];
			}

			// Find by unique keys
			else if (model.uniqueKeys instanceof Array && model.uniqueKeys.length > 0 && model.uniqueKeys.every(function (att) {
					return _this[att] !== undefined;
				})) {
					attributes = model.uniqueKeys;
				}

			if (!attributes) {
				cb(false);
			}

			// IMPLEMENT
			// Fetch Data
			this.findByAttributes(attributes, function (err, models) {

				console.assert(!err, 'There was an error ' + err);

				if (models.length === 0) {
					return cb(false);
				}

				console.assert(models.length === 1, 'More than one models matched. Please revise your schema');

				for (var att in models[0]) {

					// If attribues don't exist
					if (_this[att] === undefined) {
						_this[att] = models[0][att];
					}
				}

				cb(_this);
			});
		}

		// Insert or update

		// In order to save a model, it must be ensured that it can be retrieved again in the future
		// We will enforce a composite key in the form of either a primary key or unique keys
	}, {
		key: 'save',
		value: function save(cb) {

			return _asynk2['default'].call(this, regeneratorRuntime.mark(function callee$2$0(resume) {
				var _model$_connection;

				var model, att, err, result, _ref, _ref2, found, query, _ref3, _ref32;

				return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
					var _this2 = this;

					while (1) switch (context$3$0.prev = context$3$0.next) {
						case 0:
							model = this.constructor;

							/* Validation */
							for (att in model.attributes) {

								/* Validation - Required */
								if (model.attributes[att].required) {
									console.assert([undefined, null].indexOf(this[att]) === -1, 'Missing required field "' + att + '" in ' + JSON.stringify(this));
								}
							}

							err = undefined, result = undefined;
							context$3$0.next = 5;
							return this.findSelf(resume);

						case 5:
							_ref = context$3$0.sent;
							_ref2 = _slicedToArray(_ref, 1);
							found = _ref2[0];

							if (!found) {
								context$3$0.next = 10;
								break;
							}

							return context$3$0.abrupt('return', this.update(cb));

						case 10:
							query = sql.insertModel.call(this, model, this);
							context$3$0.next = 13;
							return (_model$_connection = model._connection).query.apply(_model$_connection, _toConsumableArray(query).concat([resume]));

						case 13:
							_ref3 = context$3$0.sent;
							_ref32 = _slicedToArray(_ref3, 2);
							err = _ref32[0];
							result = _ref32[1];

							if (result.insertId > 0) {
								this[model.primaryKey] = result.insertId;
							}

							if (!err) {
								context$3$0.next = 23;
								break;
							}

							if (!(err.code === 'ER_DUP_ENTRY')) {
								context$3$0.next = 21;
								break;
							}

							return context$3$0.abrupt('return', this.findSelf(function () {
								return _this2.update(cb);
							}));

						case 21:

							if (typeof cb === 'function') {
								cb(err);
							}
							return context$3$0.abrupt('return');

						case 23:

							console.assert(result.affectedRows === 1, 'Failed to insert new row');

							// Assign primary key - not reliable, always numeric
							// if (model.primaryKey && result instanceof Object && result.insertId !== null) {
							// 	this[model.primaryKey] = result.insertId;
							// }

							if (typeof cb === 'function') {
								cb(null, this);
							}

						case 25:
						case 'end':
							return context$3$0.stop();
					}
				}, callee$2$0, this);
			}));
		}
	}, {
		key: 'update',
		value: function update(cb) {

			return _asynk2['default'].call(this, regeneratorRuntime.mark(function callee$2$0(resume) {
				var model, _sql$updateModel$call, _sql$updateModel$call2, query, values, _ref4, _ref42, err, rows, fields;

				return regeneratorRuntime.wrap(function callee$2$0$(context$3$0) {
					while (1) switch (context$3$0.prev = context$3$0.next) {
						case 0:
							model = this.constructor;

							if (this[model.primaryKey]) {
								context$3$0.next = 3;
								break;
							}

							throw new Error('Please add a primary key in ' + JSON.stringify(this));

						case 3:
							_sql$updateModel$call = sql.updateModel.call(this, model);
							_sql$updateModel$call2 = _slicedToArray(_sql$updateModel$call, 2);
							query = _sql$updateModel$call2[0];
							values = _sql$updateModel$call2[1];
							context$3$0.next = 9;
							return model._connection.query(query, values, resume);

						case 9:
							_ref4 = context$3$0.sent;
							_ref42 = _slicedToArray(_ref4, 3);
							err = _ref42[0];
							rows = _ref42[1];
							fields = _ref42[2];

							if (!err) {
								context$3$0.next = 16;
								break;
							}

							return context$3$0.abrupt('return', cb(err));

						case 16:
							if (!(rows.affectedRows !== 1)) {
								context$3$0.next = 18;
								break;
							}

							throw new Error(rows.affectedRows + ' rows affected! ' + query);

						case 18:

							if (typeof cb === 'function') {
								cb(null, this);
							}

						case 19:
						case 'end':
							return context$3$0.stop();
					}
				}, callee$2$0, this);
			}));
		}
	}]);

	return InstanceMethods;
})(_AbstractConstructorMethods2['default']);

exports['default'] = InstanceMethods;
module.exports = exports['default'];

// Save instance

// EDIT LATER
//# sourceMappingURL=Abstract.instanceMethods.js.map

'use strict';

Object.defineProperty(exports, '__esModule', {
	value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _utils = require('./utils');

var _signatureJs = require('signature.js');

var _signatureJs2 = _interopRequireDefault(_signatureJs);

var _sqlBuilder = require('./sqlBuilder');

var sql = _interopRequireWildcard(_sqlBuilder);

// States
var SQL_QUERYING = Symbol('Querying');
var SQL_COMPLETED = Symbol('Completed');

var ModelConstructorMethods = (function () {
	function ModelConstructorMethods() {
		_classCallCheck(this, ModelConstructorMethods);
	}

	_createClass(ModelConstructorMethods, null, [{
		key: 'createTable',
		value: function createTable(cb) {

			var model = this;

			/* Validation */
			console.assert(typeof this.tableName === 'string', this.name + '.tableName: Must be a string');
			console.assert(this.tableName.length > 0, 'tableName: Cannot be an empty string');

			console.assert(typeof this.attributes === 'object', this.name + '.attributes: Must be an object');
			console.assert(Object.keys(this.attributes).length > 0, this.name + '.attributes: Must have at least one attribute');

			if (model.tableCreated === SQL_QUERYING) {
				typeof cb === 'function' && (0, _utils.EE)(model).once('tableCreated', cb);
				return;
			}

			if (model.tableCreated === SQL_COMPLETED) {
				typeof cb === 'function' && cb(null, false);
				return;
			}

			model.tableCreated = SQL_QUERYING;

			this._connection.query(sql.createTable(model), function (err) {

				model.tableCreated = SQL_COMPLETED;

				if (typeof cb === 'function') {
					cb(err, true);
				}

				(0, _utils.EE)(model).emit('tableCreated', err, true);
			});

			return this;
		}
	}, {
		key: 'find',
		value: function find() {
			var _signature = (0, _signatureJs2['default'])([['function', 'cb']], [[Array, 'where']], [[Array, 'where'], ['function', 'cb']], [[Array, 'where'], [Array, 'replacements'], ['function', 'cb']])(arguments);

			var where = _signature.where;
			var replacements = _signature.replacements;
			var cb = _signature.cb;

			var model = this;

			var innerJoins = [];

			var _where = [];

			if (where) {
				var _iteratorNormalCompletion = true;
				var _didIteratorError = false;
				var _iteratorError = undefined;

				try {
					for (var _iterator = where[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
						var clause = _step.value;

						if (typeof clause === 'string') {
							_where.push(model.tableName + '.' + clause);
						}

						if (clause instanceof Object) {

							var fModel = clause.model,
							    fKey = findFK.call(model, fModel);

							innerJoins.push.apply(innerJoins, ['\n\t\t\t\t\t\tINNER JOIN ' + fModel.tableName + ' ON\n\t\t\t\t\t\t' + fModel.tableName + '.' + fModel.primaryKey + ' = ' + model.tableName + '.' + fKey + '\n\t\t\t\t\t'].concat(_toConsumableArray(clause.innerJoins)));

							_where.push.apply(_where, _toConsumableArray(clause.where));
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
			}

			if (!cb) {
				return {
					model: model,
					where: _where,
					innerJoins: innerJoins
				};
			}

			var query = 'SELECT * FROM `' + model.tableName + '` ';

			if (innerJoins.length > 0) {
				query += innerJoins.join(' ');
			}
			if (_where.length > 0) {
				query += 'WHERE ' + (0, _utils.buildWhere)(_where, function (a) {
					return a;
				});
			}

			this._connection.query({
				sql: query,
				nestTables: true
			}, replacements, function (err, rows, fields) {

				if (err) {
					return cb(err);
				}

				cb(null, rows.map(function (row) {
					return new model((0, _utils.structureModel)(model, row));
				}));
			});
		}
	}]);

	return ModelConstructorMethods;
})();

exports['default'] = ModelConstructorMethods;
module.exports = exports['default'];
//# sourceMappingURL=Abstract.constructorMethods.js.map

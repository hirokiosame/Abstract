import {EE, buildWhere, structureModel} from './utils';
import signature from 'signature.js';
import * as sql from './sqlBuilder';


// States
const SQL_QUERYING = Symbol('Querying');
const SQL_COMPLETED = Symbol('Completed');



export default class ModelConstructorMethods {

	constructor(){

	}


	
	static createTable (cb) {

		const model = this;

		/* Validation */
		console.assert(typeof this.tableName === 'string', this.name + '.tableName: Must be a string');
		console.assert(this.tableName.length > 0, 'tableName: Cannot be an empty string');

		console.assert(typeof this.attributes === 'object', this.name + '.attributes: Must be an object');
		console.assert(Object.keys(this.attributes).length > 0, this.name + '.attributes: Must have at least one attribute');


		if (model.tableCreated === SQL_QUERYING) {
			typeof cb === 'function' && EE(model).once('tableCreated', cb);
			return;
		}

		if (model.tableCreated === SQL_COMPLETED) {
			typeof cb === 'function' && cb(null, false);
			return;
		}

		model.tableCreated = SQL_QUERYING;

		this._connection.query(sql.createTable(model), (err) => {

			model.tableCreated = SQL_COMPLETED;

			if (typeof cb === 'function') { cb(err, true); }

			EE(model).emit('tableCreated', err, true);
		});

		return this;
	}





	static find(){

		let { where, replacements, cb } = signature(
			[['function', 'cb']],
			[[Array, 'where']],
			[[Array, 'where'], ['function', 'cb']],
			[[Array, 'where'], [Array, 'replacements'], ['function', 'cb']]
		)(arguments);

		console.log(where);
		console.log(replacements);



		const model = this;

		let innerJoins = [];

		let _where = [];

		if (where ) {
			for (let clause of where) {

				if (typeof clause === 'string') {
					_where.push(model.tableName + '.' + clause);
				}

				if (clause instanceof Object) {

					let fModel = clause.model,
						fKey = model::findFK(fModel);


					innerJoins.push(`
						INNER JOIN ${fModel.tableName} ON
						${fModel.tableName}.${fModel.primaryKey} = ${model.tableName}.${fKey}
					`, ...clause.innerJoins);

					_where.push(...clause.where);
				}
			}
		}

		if (!cb) {
			return {
				model,
				where: _where,
				innerJoins
			};
		}




		let query = `SELECT * FROM \`${model.tableName}\` `;


		if (innerJoins.length > 0) {
			query += innerJoins.join(' ');
		}
		if (_where.length > 0) {
			query += 'WHERE ' + buildWhere(_where, (a)=> a );
		}

		console.log(query, replacements);
		this._connection.query({
			sql: query,
			nestTables: true
		}, replacements, (err, rows, fields) => {

			if (err) { return cb(err); }

			console.log('Raw find result', err, rows);

			cb(null, rows.map( row => new model(structureModel(model, row)) ));
		});
	}

}
import asynk from 'asynk';
import * as sql from './sqlBuilder';
import ConstructorMethods from './Abstract.constructorMethods';

export default class InstanceMethods extends ConstructorMethods {

	constructor(){
		super();
	}

	toJSON () {
		const	model = this.constructor,
				attributes = model.attributes;

		let obj = {};

		for (let att in attributes) {
			obj[att] = this[att];
		}

		return obj;
	}

	findByAttributes (keys, cb) {

		const	model = this.constructor,
				attributes = model.attributes;


		let where = [],
			values = [];

		for (let att of keys) {

			console.assert(att in attributes, `Attribute '${att}' not defined in schema`);

			let value = this[att];

			where.push(`\`${att}\` = ?`);


			// If foreign reference
			if( typeof attributes[att] === 'function' ){
				let _model = attributes[att];
				values.push(value[_model.primaryKey]);
			}else{
				values.push(value);
			}
		}

		model.find(where, values, cb);
	}


	findSelf (cb) {

		const model = this.constructor;

		let attributes;

		// Find by primary key
		if (this[model.primaryKey]) {
			attributes = [model.primaryKey];
		}

		// Find by unique keys
		else if (
			model.uniqueKeys instanceof Array &&
			model.uniqueKeys.length > 0 &&
			model.uniqueKeys.every((att) => this[att] !== undefined )
		) {
			attributes = model.uniqueKeys;
		}

		if (!attributes) {
			cb(false);
		}


		// IMPLEMENT
		// Fetch Data
		this.findByAttributes(attributes, (err, models) => {

			console.assert(!err, 'There was an error ' + err);


			if (models.length === 0) {
				return cb(false);
			}

			console.assert(models.length === 1, 'More than one models matched. Please revise your schema');

			for (let att in models[0]) {

				// If attribues don't exist
				if (this[att] === undefined) {
					this[att] = models[0][att];
				}
			}

			cb(this);
		});
	}

	// Insert or update

	// In order to save a model, it must be ensured that it can be retrieved again in the future
	// We will enforce a composite key in the form of either a primary key or unique keys
	save (cb) {

		return this::asynk(function* (resume) {

			const model = this.constructor;

			/* Validation */
			for (let att in model.attributes) {

				/* Validation - Required */
				if (model.attributes[att].required) {
					console.assert([undefined, null].indexOf(this[att]) === -1, 'Missing required field "' + att + '" in ' + JSON.stringify(this));
				}
			}

			let err, result;

			let [found] = yield this.findSelf(resume);

			if (found) { return this.update(cb); }
		

			// Save instance
			let query = this::sql.insertModel(model, this);

			[err, result] = yield model._connection.query(...query, resume);

			if (result.insertId > 0) {
				this[model.primaryKey] = result.insertId;
			}


			if (err) {

				if (err.code === 'ER_DUP_ENTRY') {
					return this.findSelf( () => this.update(cb) );
				}

				if (typeof cb === 'function') { cb(err); }
				return;
			}

			console.assert(result.affectedRows === 1, 'Failed to insert new row');

			// Assign primary key - not reliable, always numeric
			// if (model.primaryKey && result instanceof Object && result.insertId !== null) {
			// 	this[model.primaryKey] = result.insertId;
			// }

			if (typeof cb === 'function') { cb(null, this); }
		});
	}


	update (cb) {

		return this::asynk(function* (resume) {

			const model = this.constructor;

			// EDIT LATER
			if (!this[model.primaryKey]) { throw new Error('Please add a primary key in ' + JSON.stringify(this)); }


			let [query, values] = this::sql.updateModel(model);

			let [err, rows, fields] = yield model._connection.query(query, values, resume);

			if (err) { return cb(err); }

			if (rows.affectedRows !== 1) {
				throw new Error(`${rows.affectedRows} rows affected! ${query}`);
			}

			if (typeof cb === 'function') { cb(null, this); }
		});
	}
}
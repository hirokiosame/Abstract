import asynk from 'asynk';
import * as sql from './sqlBuilder';
import ConstructorMethods from './constructorMethods';

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


	belongsTo (...objs) {

		// console.log('belongsTo');

		const model = this.constructor;

		for (let obj of objs) {

			if (!(obj instanceof Model)) { continue; }

			let instanceParent = obj.constructor;

			// Verify has primary key
			if (!obj.hasOwnProperty(instanceParent.primaryKey)) {
				throw new Error('Cannot establish relation without a primary key');
			}

			// Verify that the relation exists in schema
			let exists = false;
			for (let att in model.attributes) {
				if (model.attributes[att] === instanceParent) {
					exists = att; break;
				}
			}

			if (exists === false) { throw new Error('The relationship does not exist'); }


			// let opts = {};
			// opts[instanceParent.primaryKey] = obj[instanceParent.primaryKey];

			this[exists] = obj;
		}

		return this;
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

			// if( value instanceof Object ){
			// 	let _model = value.constructor;
			// 	values.push(value[_model.primaryKey]);
			// }else{
				values.push(value);
			// }
		}

		model.find(where, values, cb);
	}


	findSelf (cb) {

		const model = this.constructor;

		// Find by primary key
		if (this[model.primaryKey]) {

			// IMPLEMENT
			// Fetch Data
			this.findByAttributes([model.primaryKey], (err, models) => {

				console.assert(!err, 'There was an error ' + err);

				console.log('found', models);
				if (models instanceof Array && models.length > 0) {

					for (let att in models[0]) {

						// If attribues don't exist
						if( !this.hasOwnProperty(att) ){
							this[att] = models[0][att];
						}
					}
					cb(this);


					// Only extend key properties
					// cb( this::extendProperties(model, models[0]) );
				}else{
					cb(false);
				}
			});
			return;
		}

		// Find by unique keys
		if (
			model.uniqueKeys instanceof Array &&
			model.uniqueKeys.every((att) => this[att] !== undefined )
		) {

			// Fetch Data
			this.findByAttributes(model.uniqueKeys, (err, models) => {

				if (models instanceof Array && models.length > 0) {

					for (let att in models[0]) {

						// If attribues don't exist
						if (!this.hasOwnProperty(att)) {
							this[att] = models[0][att];
						}
					}
					cb(this);


					// Only extend key properties
					// cb( this::extendProperties(model, models[0]) );
				}else{
					cb(false);
				}
			});
			return;
		}

		cb(false);
	}

	// Insert or update
	save (cb) {
		return this::asynk(function* (resume) {

			const model = this.constructor;

			console.log('Save', this);

			// Validation
			for( let att in model.attributes ){
				if (model.attributes[att].required) {
					console.assert(!this[att], 'Missing required field ' + att + ' in ' + JSON.stringify(this));
				}
			}

			let err, result;


			let tableCreated;
			[err, tableCreated] = yield model.createTable(resume);
			console.assert(err === null, err);


			// If table already existed, find self
			if (!tableCreated) {

				let [found] = yield this.findSelf(resume);

				console.log('found?', found);

				if (found) { return this.update(cb); }
			}


			// Save instance
			let query = sql.insertModel(model, this);
			console.log(query);
			[err, result] = yield model._connection.query(...query, resume);
			console.log(err, result);

			if (err) {

				if (err.code === 'ER_DUP_ENTRY') {
					return this.findSelf( () => this.update(cb) );
				}

				typeof cb === 'function' && cb(err);
				return;
			}

			console.assert(result.affectedRows === 1, 'Failed to insert new row');

			// Assign primary key - not reliable, always numeric
			// if (model.primaryKey && result instanceof Object && result.insertId !== null) {
			// 	this[model.primaryKey] = result.insertId;
			// }

			typeof cb === 'function' && cb(null, this);
		});
	}


	update (cb) {


		console.log('update!')

		const model = this.constructor;

		// EDIT LATER
		if (!this[model.primaryKey]) { throw new Error('Please add a primary key in ' + JSON.stringify(this)); }


		let set = [],
			values = [];

		for (let att in this) {
			// if( att === model.primaryKey ){ continue; }

			let value = this[att];

			set.push(`\`${att}\` = ?`);

			if (value instanceof Object) {
				let _model = value.constructor;
				values.push(value[_model.primaryKey]);
			}else{
				values.push(value);
			}
		}
		values.push(this[model.primaryKey]);


		if (set.length === 0) {
			return cb(null, this);
		}

		this::asynk(function* (resume) {

			let query = `UPDATE ${model.tableName} SET ${set} WHERE ${model.primaryKey} = ?;`;

			console.log(query, values);

			let [err, rows, fields] = yield model._connection.query(query, values, resume);

			if (err) { return cb(err); }

			if (rows.affectedRows !== 1) {
				throw new Error(`${rows.affectedRows} rows affected! ${query}`);
			}

			cb(null, this);
		});
	}
}
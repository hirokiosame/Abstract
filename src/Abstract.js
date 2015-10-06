import mysql from 'mysql';
import InstanceMethods from './Abstract.instanceMethods';


class A {
	b = [];
}



export default class Abstract extends InstanceMethods {

	unsyncd = {};

	constructor(properties){
		super();

		if (!(properties instanceof Object)) { return; }

		const	model = this.constructor,
				attributes = model.attributes;

		// Iterate schema attributes
		for (let attrName in attributes) {

			// Validate the schema
			console.assert(
				attributes[attrName] instanceof Object || attributes[attrName] instanceof Function,
				`'${attrName}' has an invalid schema`
			);

			// If reference, make sure it has a primary key
			// TODO: Allow reference ket to be set (Model.referenceBy('phoneNumber'))
			if (attributes[attrName] instanceof Function) {
				console.assert(typeof attributes[attrName].primaryKey === 'string', 'Reference schema must have a primary key');

				let primaryKey = attributes[attrName].primaryKey;

				console.assert(attributes[attrName].attributes.hasOwnProperty(primaryKey), 'Reference primary key must exist');
			}


			this::setAttribute(attrName, attributes[attrName]);

			if (properties[attrName]) {
				this[attrName] = properties[attrName];
			}
		}


		model.createTable((err) => { if (err) { throw err; } });
	}


	static connect(config){

		this._connection = mysql.createConnection(config);
		this._connection.connect();
	}
};


function setAttribute (attrName, attrSchema) {

	let attrSymbol = Symbol(attrName);

	Object.defineProperty(this, attrName, {
		get: function() {
			return this[attrSymbol];
		},
		set: function(val) {

			if (attrSchema instanceof Function) {
				console.assert(val instanceof attrSchema, 'Value must be an instance of the reference');
				console.assert(val.hasOwnProperty(attrSchema.primaryKey), 'Reference must hold a primary key');
			}

			this[attrSymbol] = val;

			// Mark as unsyncd
			if( !this.unsyncd[attrName] ){ this.unsyncd[attrName] = 1; }

			return val;
		}
	});
}


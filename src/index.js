import mysql from 'mysql';
import InstanceMethods from './instanceMethods';


export default class Abstract extends InstanceMethods {

	constructor(properties){
		super();

		if (!(properties instanceof Object)) { return; }

		const	model = this.constructor,
				schema = model.attributes;

		// Iterate schema attributes
		for (let att in schema) {

			// Validation of attribute
			if (!properties.hasOwnProperty(att)) { continue; }

			let attribute = schema[att];

			// If foreign reference
			if (attribute instanceof Function) {

				// Validate reference
				if (!(
					properties[att] instanceof Object &&
					properties[att].hasOwnProperty(attribute.primaryKey)
				)){ continue; }

				// Create the instance
				if( !(properties[att] instanceof attribute) ){
					properties[att] = new attribute(properties[att]);
				}
			}

			// Add
			this::setAttribute(att, properties[att]);
		}

		console.log(JSON.stringify(this));
	}


	static connect(config){

		this._connection = mysql.createConnection(config);
		this._connection.connect();
	}
};


function setAttribute (attrName, value) {

	let attrSymbol = Symbol(attrName);

	this[attrSymbol] = value;

	Object.defineProperty(this, attrName, {
		get: function() {
			return this[attrSymbol];
		},
		set: function( val ) {
			this.unsyncd = true;
			return this[attrSymbol] = val;
		}
	});
}


import credentials from './credentials';
import Model from '../src';


Model.connect(credentials);

Model._connection.query(`DROP TABLE IF EXISTS user`);

class User extends Model {
	static tableName = 'user';
	static primaryKey = 'firstName';
	static attributes = {
		firstName: {
			type: 'VARCHAR(100)'
		},
		lastName: {
			type: 'VARCHAR(100)'
		}
	};
}

var user1 = new User({
	firstName: 'hello1',
	lastName: 'hello2',
});



console.log(user1.save(function() {
	console.log('saved!', arguments);

	setTimeout(function() {


		user1.lastName = 'good bye';
		console.log('check', user1.firstName, user1.lastName);
		console.log(user1.save(function() {
			console.log('saved!', arguments);
		}));

	}, 5000);
}));

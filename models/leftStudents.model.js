var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var leftStudents = new Schema({
	name: {
		type: String
	},
	std: {
		type: String
	},
	address: {
		type: String
	},
	postCode: {
		type: String
	},
	modeOfTransport: {
		type: String
	}
});

module.exports = mongoose.model('leftStudents' ,leftStudents);
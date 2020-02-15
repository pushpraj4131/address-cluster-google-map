var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var foundStudents = new Schema({
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
	},
	geoCode: {
		type: Object
	}
});

module.exports = mongoose.model('foundStudents' ,foundStudents);
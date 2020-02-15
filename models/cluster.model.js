var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var clusterSchema = new Schema({
	clusterName: {
		type: String
	},
	clusterObj: []
});

module.exports = mongoose.model('cluster' ,clusterSchema);
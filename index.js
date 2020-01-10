const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
var bodyParser = require('body-parser');
var fs = require('fs');
const csv = require('csv-parser');

const app = express();

//Import Model
var studentsModel = require('./models/students.model');
var leftStudents = require('./models/leftStudents.model');
//use express function
app.use(cors());
app.use(express.json());
app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false }));


//database connection
mongoose.connect('mongodb://localhost/cluster', {useNewUrlParser: true , useUnifiedTopology: true}  )
.then(() => console.log("Congratulations you are connected to Database"))
.catch(err => console.log(err));


app.get('/get-data-from-excel'  , (req, res)=>{
	var arr = [];
	var counter = 0;
	console.log("In get");
	fs.createReadStream("Primary.csv")
	.pipe(csv())
	.on('data', async (data)=>{
		if(data["11"] != ""){
			console.log(data);
			data['modeOfTransport'] = data["14"];
			delete data["14"];
			data['postCode'] = data["18"];
			delete data["18"];
			data["name"] = data["11"];
			delete data["11"];
			data["std"] = data["12"];
			delete data["12"];
			data["address"] = data["16"];
			delete data["16"];
			arr.push(data);
		}
	})
	.on('end', () => {
		console.log(arr[2]);
		studentsModel.insertMany(arr);
		console.log(arr.length)
	});
});
let count = 0;
app.get('/get-student-data', (req, res)=>{

	studentsModel.find()
	.skip(25 * 15/*count*/)
	.limit(25)
	.exec((err, foundStudent)=>{
		if(err)
			res.send(err);
		else
			count = count + 1;
			console.log(count)
			res.send(foundStudent);
	});
});

app.post('/insert-left-student', (req, res)=>{
	console.log(req.body);
	leftStudents.insertMany(req.body)
	// .skip(100)
	// .limit(100)
	// .exec((err, foundStudent)=>{
	// 	if(err)
	// 		res.send(err);
	// 	else
	// 		res.send(foundStudent);
	// });
});

app.listen(5000);
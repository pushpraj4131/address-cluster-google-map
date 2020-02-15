const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
var bodyParser = require('body-parser');
var fs = require('fs');
const csv = require('csv-parser');
const path = require('path');
const app = express();
const createCsvWriter = require('csv-writer').createObjectCsvWriter;

//Import Model
var studentsModel = require('./models/students.model');
var leftStudentsModel = require('./models/leftStudents.model');
var foundStudetnsModel = require('./models/foundStudents.model');
var clusterModel = require('./models/cluster.model');
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
let count = 1;
app.get('/get-student-data', (req, res)=>{

	studentsModel.find()
	// .skip(500)
	
	.exec((err, foundStudent)=>{
		if(err)
			res.send(err);
		else
			if(foundStudent != null){
				console.log(count)
				count = count + 1;
				res.send(foundStudent);
			}
			else{
				console.log("Null");
			}
	});
});

app.post('/insert-left-student', (req, res)=>{
	// console.log(req.body);
	var found = req.body.addressFoundStudentList;
	var lost = req.body.addressNotFoundStudentList;
	
	var insert = foundStudetnsModel.insertMany(found)
	insert.then((data)=>{
	
		if(lost){
			var lose = leftStudentsModel.insertMany(lost);
			lose.then((lost)=>{
				res.send("Next cycle");
			});
		}
		else{
				// console.log("error");
				res.send("Next cycle");
		}
	});
});

var nextCounter = 0
app.get('/get-found-student-data', (req, res)=>{

	studentsModel.find()
	// .skip(nextCounter * 10)
	.limit(50)
	.exec((err, foundStudent)=>{
		if(err)
			res.send(err);
		else
			if(foundStudent != null){
				console.log(count)
				nextCounter = nextCounter + 1;
				res.send(foundStudent);
			}
			else{
				console.log("Null");
			}
	});
});


let AllStudents = [];
let clusterName = []
app.get('/get-cluster',async (req, res)=>{

	const directoryPath = path.join(__dirname, './clusterSheets');
	console.log("function called");

	var fileArray = []
	await fs.readdir(directoryPath, async function (err, files) {
        //handling error
        if (err) {
        	return console.log('Unable to scan directory: ' + err);
        } 
        //listing all files using forEach
        files.forEach(function (file) {
        	if(file.includes(".csv")){
        		fileArray.push(file);   
        		// console.log(file); 
            }    // Do whatever you want to do with the file
        });
        // console.log("file array =====> " , fileArray);

        // let temp = fileArray.map((key) => tempGetObj(key));
        // const response = await Promise.all(temp);
        // // console.log("r    esponse ====>", response);
        // res.send(response);    
		var studentArr = [];
		var clusterObj = {

		}
		fileArray.forEach((fileName)=>{
			// console.log(fileName);
			str = "./clusterSheets/"+fileName;
			fs.createReadStream(str)
			.pipe(csv())
			.on('data', async (data)=>{
				fileName = fileName.split(".")[0];
				if(!clusterObj[fileName]){
					clusterObj[fileName] = [];
				}
				// console.log(data);
				var obj = {
					name : data.Name,
					address: data.Address 
				}
				studentArr.push(obj) ; // To get the unrecorded data 
				// clusterObj[fileName].push(obj); // tp save the data cluster wise
			})
			.on('end', () => {
				console.log("HELLOOOO ", studentArr.length);
				// console.log("CLuster -===========>", clusterObj);
				
				//For saving data cluster wise	
				/*req.body["clusterName"] = fileName;
				req.body["clusterObj"] = clusterObj[fileName];
				var cluster = new clusterModel(req.body);
				cluster.save();*/
				// console.log(" =====================      CLuster OVER -===========>");

			});
				clusterObj = {
					
				}
		});
		var counter = 0;
		var unRecordedStudents = [];
		

		/*FOR FINDING THE REMAINING ADDRESS*/
		studentsModel.find()
		.exec((err, foundStudents)=>{
			if(err){
				res.send(err);
			}
			else{
				foundStudents.forEach((allStudent)=>{
					var flag = 0;
					allStudent.name  = allStudent.name.replace(/\s*/gm,'');
					studentArr.forEach((clusterStudent)=>{
						clusterStudent.name = clusterStudent.name.replace(/\s+|\s+/gm,'');
						if(clusterStudent.name.toLowerCase() == allStudent.name.toLowerCase()){
							flag = 1;
							console.log("=========== MATCH ===============", );
						}
					});
					if(flag == 0){
						// console.log("===== NOT MATCH ========", allStudent.name.toLowerCase() );
						counter = counter + 1;

						unRecordedStudents.push(allStudent);
						// unRecordedStudents = clusterStudent;
					}
				});
				console.log("TOTAL UNRECORDED ========+++>", counter);
				console.log("TOTAL UNRECORDED ========+++>", unRecordedStudents.length);
				res.send(unRecordedStudents);
			}
		});


    });

});

app.post('/get-student-info-by-id', (req, res)=>{
	console.log(req.body);
	studentsModel.find({name: {$regex: req.body.name }})
	.exec((err, found)=>{
		if(err){
			res.send(err);
		}
		else{
			console.log(found)
			res.send(found)
		}
	});
	
});




app.get('/get-cluster-sheet-std', (req, res)=>{
	var notFound = [];
	var found = [];
	var all = [];
	console.log("called");
	fs.createReadStream("./Clusters copy - Hanuman Madhi.csv")
	.pipe(csv())
	.on('data', async (data)=>{
		all.push(data);
	})
	.on('end', () => {
		console.log("all.length" , all.length);
		studentsModel.find()
		.exec((err, foundStudents)=>{
			foundStudents.forEach((databaseStudent)=>{
				var flag = 0;
				all.forEach((sheetStudent)=>{
					// console.log("databaseStudent.name ==>", databaseStudent.name , "<=====>", sheetStudent.Name);
					databaseStudent.name = databaseStudent.name.replace(/^\s+|\s+$/g, '');
					sheetStudent.Name = sheetStudent.Name.replace(/^\s+|\s+$/g, '');
					if(databaseStudent.name == sheetStudent.Name){
						flag = 1;
					}
				});
				if(flag == 1){
					delete databaseStudent['_id'];
					delete databaseStudent['modeOfTransport'];
					delete databaseStudent['postCode'];
					found.push(databaseStudent);
				}
			});
			all.forEach((sheetStudent)=>{
				var flag = 0;
				found.forEach((founded)=>{
					founded.name = founded.name.replace(/^\s+|\s+$/g, '');
					sheetStudent.Name = sheetStudent.Name.replace(/^\s+|\s+$/g, '');
					if(founded.name == sheetStudent.Name){
						flag = 1;
					}
				});
				if(flag == 0){
					notFound.push(sheetStudent);
				}
			});
			const csvWriter = createCsvWriter({
				path: './std_folder/Hanuman Madhi.csv',
				header: [
					{id: 'name', title: 'Name'},
					{id: 'std', title: 'Std'},
					{id: 'address', title: 'Address'},
				]
			});

			

			csvWriter
			.writeRecords(found)
			.then(()=> console.log('The CSV file was written successfully'));
			res.json({
				// data: all,
				"length": found.length,
				"found" : found.length,
				"notFound": notFound
			});
		});
		// all.filter(async (data)=>{
		// 	var hello = await studentsModel.findOne({name: data.Name});
		// 	// console.log(hello);
		// 	if(hello == null){
		// 		notFound.push(data);	
		// 	}
		// 	else{
		// 		data["std"] = hello.std;
		// 		found.push(data)
		// 	}
		// 	// .exec((err, found)=>{
		// 	// 	if(err){
		// 	// 		notFound.push(data);
		// 	// 	}
		// 	// 	else if(found == null || found.length == 0){
		// 	// 		notFound.push(data);
		// 	// 	}else{
		// 	// 		data["std"] = found.std
		// 	// 		found.push(data);
		// 	// 	}
		// 	// });
		// 	console.log(found);
		// });
			// console.log(arr[2]);
		// studentsModel.insertMany(arr);
		// console.log(arr.length)
	});
});
app.listen(5000);	



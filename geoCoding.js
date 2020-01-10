const tempGetObj = (data)=>{
   return new Promise((resolve, reject)=>{
      // var result = $.ajax({url: "https://geocoder.ls.hereapi.com/6.2/geocode.json?apiKey=eCJhkhQSw_8QMWX8-AeSC9Zot2iadnbIoxP_UpRAxjE&searchtext="+data.newAddress});
      var result = $.ajax({
         url: "https://maps.googleapis.com/maps/api/geocode/json?key=AIzaSyAHyK08CHb5PEfGHwUc34x-Lnp86YsODGg&address=" + data.newAddress
      });
      result.then((found)=>{
         data['latLong'] = found;
         console.log('lat lng in tempGetObj', result.responseJSON);
         return resolve(data)
      })
   });
}


const clusterStudent = (data)=>{
   // console.log("Daataa ==========.", data);
   var AddressNotFoundStudentList = [];
   var MultipleAddressFoundStudentList = [];
   var AddressFoundStudentList = [];
   data.forEach((obj)=>{
      console.log("obj =====>" , obj.latLong)
      if(obj.latLong.status == "OK"){
         AddressFoundStudentList.push(obj);
         obj['geoCode'] = obj.latLong.results[0].geometry.location;
      }else{
         AddressNotFoundStudentList.push(obj)
      }
   });
   console.log();
   // return {
   //    addressFoundStudentList: AddressFoundStudentList,
   //    addressNotFoundStudentList: AddressNotFoundStudentList
   // }
    return data;  
}

// University  || Uni // Kalawad // Nana Mova // Mota Mova // Mavdi Chowk // Raiya // Kothariya // Race Course // Amin Marg // Nirmala Convent // Bhaktinagar // Hanuman Madhi // Nanawati Chowk // Indira Circle // Sadhuvasvani // Punit Nagar // Airport // Kankot // Nageshwar || Jamnagar // Rail nagar // Junction // Madhapar // Ishwariya // Ghanteshwar // 150 ring //bhavnagar

var areaName = ["","","saurashtrakala","kendra","mahila", "college","morbi","pedak", "gandhigram","kuvadva", "bajarangwadi", "satya",  "sai", "jamnagar", "dudh", "sagar", "yaganik","big","bazar","","neel","club","ayodhya", "university","uni", "feet", "ft" ,"kalawad","nana","mova","mota","mova","mavdi","raiya","kothariya","race","course","amin", "marg","nirmala","mauva","convent","bhaktinagar","hanuman","madhi","nanawati","indira","circle","sadhuvasvani","kevdavadi" , "sadhuvaswani","punit","airport","kankot","nageshwar"," jamnagar","rail","junction","madhapar","ishwariya","ghanteshwar","150","ring","bhavnagar"]
let cluster = [];
let notFoundAddress = [];
let clusterObj = {};
console.log("=============>", areaName.includes("Raiya"));
const groupStudentFormat = (data)=>{
  console.log("IN CLUSTERING STUDENT", data);
  data.forEach((studentRecord)=>{
    var addressArr = studentRecord.address.split(/[\s,.-]+/);
    // console.log(addressArr);
    let str = "";
    addressArr.forEach((eachAddr)=>{
      eachAddr = eachAddr.toLowerCase();
      // console.log("each addr", eachAddr );
      if(areaName.includes(eachAddr)){
        console.log("Includes");
        str = str +" "+eachAddr;
      }
    });
    if(str == ""){
      notFoundAddress.push(studentRecord);
    }
    console.log("str ====>", str);
    cluster.push(str);
  });
  cluster.forEach((eachStr)=>{
    if(clusterObj.eachStr){
      clusterObj.eachStr.push(eachStr);
    }
    else{
      clusterObj[eachStr] = [];
      clusterObj.eachStr.push(eachStr);
    }
  });

  console.log("cluster ==>", cluster , "Not found ============>", notFoundAddress);
  console.log("cluster Object ==>",clusterObj );
}

// const verifyAddress = (studentList)=>{
//    studentList.forEach((list)=>{
//       if(list.results.length > 1){
//          list.results.forEach((result)=>{

//          });
//       }
//       else{

//       }
//    });
// }





function initMap(locat) {
    //Ravi Residensy, Opp.Gandhi Gram, Dharam Nagar Road
    console.log("called second");
    var center = {lat: 22.29063, lng: 70.76917};
    var locations = [];
    locat.forEach((obj)=>{
       var arr = [];
       arr.push(obj.name.toString()+ "  "+ obj.address.toString());
       arr.push(obj.geoCode.lat);
       arr.push(obj.geoCode.lng);
       locations.push(arr);
    });
    /*var locations = [
    ["Ravi Residensy",22.26779, 70.77773]
    ]*/
    var map = new google.maps.Map(document.getElementById('map'), {
       zoom: 10,
       center: center
    });
    var infowindow =  new google.maps.InfoWindow({});
    var marker, count;
    for (count = 0; count < locations.length; count++) {
       marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[count][1], locations[count][2]),
          map: map,
          title: locations[count][0]
       });
       google.maps.event.addListener(marker, 'click', (function (marker, count) {
          return function () {
             infowindow.setContent(locations[count][0]);
             infowindow.open(map, marker);
          }
       })(marker, count));
    }
 }
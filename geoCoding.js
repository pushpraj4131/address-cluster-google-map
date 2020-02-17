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
      // console.log("obj =====>" , obj.latLong)
      if(obj.latLong.status == "OK"){
         AddressFoundStudentList.push(obj);
         obj['geoCode'] = obj.latLong.results[0].geometry.location;
         delete obj.latLong;
      }else{
         AddressNotFoundStudentList.push(obj)
      }
   });
 
    return data;  
}


var areaName = ["crystal","mall","sadhuwaswani","sadhuwasvani","vashvani", "40", "80", "sorathiyawadi","gondal","sadhuvashvani", "sadhu","vaswani","vasvani", "mahaddev","wadi","nanmauva", "saurashtrakala","kendra","mahila", "college","morbi","pedak", "gandhigram","kuvadva", "bajarangwadi", "satya",  "sai", "jamnagar", "dudh", "sagar", "yaganik","yagnik","big","bazar","neel","club","ayodhya", "university","uni", "feet", "ft" ,"kalawad","nana","mova","mota","mova","mavdi","raiya","kothariya","race","course","amin", "marg","nirmala","mauva","convent","bhaktinagar","hanuman","madhi","nanawati","indira","sadhuvasvani","kevdavadi" , "sadhuvaswani","punit","airport","kankot","nageshwar","jamnagar","rail","junction","madhapar","ishwariya","ghanteshwar","150","ring","bhavnagar"]
let cluster = [];
let notFoundAddress = [];
let clusterObj = {};
console.log("=============>", areaName.includes("Raiya"));
const groupStudentFormat = (data)=>{
  console.log("IN CLUSTERING STUDENT", data);
  data.forEach((studentRecord, index)=>{
    // console.log("@49 ==>", studentRecord , index);
    var addressArr = studentRecord.address.split(/[\s,.-]+/);
    // console.log(addressArr);
    let str = "";
    addressArr.forEach((eachAddr)=>{
      eachAddr = eachAddr.toLowerCase();
      // console.log("each addr", eachAddr );
      if(areaName.includes(eachAddr)){
        // console.log("Includes");
        str = str +" "+eachAddr;
      }
    });
    if(str == ""){
      notFoundAddress.push(studentRecord);
    }
    else{
      studentRecord["str"] = str;
      cluster.push(studentRecord);
      // console.log("str ====>", str);

    }
  });
  console.log(notFoundAddress , cluster)
  cluster.forEach((eachStr)=>{
    // console.log(eachStr);
    var string =  eachStr.str;
    if(clusterObj[string]){
      clusterObj[string].push(eachStr);
    }
    else{
      // Object.defineProperty(clusterObj,string, {value : [],
      //   writable : true,
      //   enumerable : true,
      //   configurable : true});
      // var string = []
      clusterObj[string] = [];
      // console.log(clusterObj , string);
      // clusterObj[]
      clusterObj[string].push(eachStr);

    }
  });

  console.log("cluster ==>", cluster , "Not found ============>", notFoundAddress);
  console.log("cluster Object ==>",clusterObj );
  return {
    "clusterObj": clusterObj,
    "foundAddress": cluster,
    "notFound": notFoundAddress
  };
}







function initMap(locat) {
    //Ravi Residensy, Opp.Gandhi Gram, Dharam Nagar Road
    console.log("called second @120" , locat);
    var center = {lat: 22.29063, lng: 70.76917};
    var locations = [];
    locat.forEach((obj, index)=>{
       var arr = [];
       console.log("erorr in line index ===>", index)
        if(obj.geoCode){
          arr.push(obj.name.toString()+ "  "+ obj.address.toString());
          arr.push(obj.geoCode.lat);
          arr.push(obj.geoCode.lng);
          locations.push(arr);
        }
    });
    var map = new google.maps.Map(document.getElementById('map'), {
       zoom: 10,
       center: center
    });
    // var iconBase = 'https://i.ya-webdesign.com/images/green-crosshair-png-6.png';
    // var iconBase = 'https://maps.google.com/mapfiles/kml/pushpin/red-pushpin.png';
    // var iconBase = 'https://maps.google.com/mapfiles/kml/paddle/red-circle.png';
    var iconBase = 'http://maps.google.com/mapfiles/kml/pal4/icon53.png';
    var icon = {
    url: iconBase /*+ 'man.png'*/, // url
    scaledSize: new google.maps.Size(23, 23), // scaled size
    origin: new google.maps.Point(0,0), // origin
    anchor: new google.maps.Point(0, 0) // anchor
  };
    var infowindow =  new google.maps.InfoWindow({});
    var marker, count;
    for (count = 0; count < locations.length; count++) {
       marker = new google.maps.Marker({
          position: new google.maps.LatLng(locations[count][1], locations[count][2]),
          map: map,
          title: locations[count][0],
          icon: icon
       });
       google.maps.event.addListener(marker, 'click', (function (marker, count) {
          return function () {
             infowindow.setContent(locations[count][0]);
             infowindow.open(map, marker);
          }
       })(marker, count));
    }
 }


 
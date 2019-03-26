
var topojson = require("topojson-client");
var fs = require("fs");

var muniFiles = ["BUF.topojson", "CPT.topojson", "EC101.topojson", "EC102.topojson", "EC103.topojson", "EC104.topojson", "EC105.topojson", "EC106.topojson", "EC107.topojson", "EC108.topojson", "EC109.topojson", "EC121.topojson", "EC122.topojson", "EC123.topojson", "EC124.topojson", "EC126.topojson", "EC127.topojson", "EC128.topojson", "EC131.topojson", "EC132.topojson", "EC133.topojson", "EC134.topojson", "EC135.topojson", "EC136.topojson", "EC137.topojson", "EC138.topojson", "EC141.topojson", "EC142.topojson", "EC143.topojson", "EC144.topojson", "EC153.topojson", "EC154.topojson", "EC155.topojson", "EC156.topojson", "EC157.topojson", "EC441.topojson", "EC442.topojson", "EC443.topojson", "EC444.topojson", "EKU.topojson", "ETH.topojson", "FS161.topojson", "FS162.topojson", "FS163.topojson", "FS164.topojson", "FS181.topojson", "FS182.topojson", "FS183.topojson", "FS184.topojson", "FS185.topojson", "FS191.topojson", "FS192.topojson", "FS193.topojson", "FS194.topojson", "FS195.topojson", "FS196.topojson", "FS201.topojson", "FS203.topojson", "FS204.topojson", "FS205.topojson", "GT421.topojson", "GT422.topojson", "GT423.topojson", "GT481.topojson", "GT482.topojson", "GT483.topojson", "GT484.topojson", "JHB.topojson", "KZN211.topojson", "KZN212.topojson", "KZN213.topojson", "KZN214.topojson", "KZN215.topojson", "KZN216.topojson", "KZN221.topojson", "KZN222.topojson", "KZN223.topojson", "KZN224.topojson", "KZN225.topojson", "KZN226.topojson", "KZN227.topojson", "KZN232.topojson", "KZN233.topojson", "KZN234.topojson", "KZN235.topojson", "KZN236.topojson", "KZN241.topojson", "KZN242.topojson", "KZN244.topojson", "KZN245.topojson", "KZN252.topojson", "KZN253.topojson", "KZN254.topojson", "KZN261.topojson", "KZN262.topojson", "KZN263.topojson", "KZN265.topojson", "KZN266.topojson", "KZN271.topojson", "KZN272.topojson", "KZN273.topojson", "KZN274.topojson", "KZN275.topojson", "KZN281.topojson", "KZN282.topojson", "KZN283.topojson", "KZN284.topojson", "KZN285.topojson", "KZN286.topojson", "KZN291.topojson", "KZN292.topojson", "KZN293.topojson", "KZN294.topojson", "KZN431.topojson", "KZN432.topojson", "KZN433.topojson", "KZN434.topojson", "KZN435.topojson", "LIM331.topojson", "LIM332.topojson", "LIM333.topojson", "LIM334.topojson", "LIM335.topojson", "LIM341.topojson", "LIM342.topojson", "LIM343.topojson", "LIM344.topojson", "LIM351.topojson", "LIM352.topojson", "LIM353.topojson", "LIM354.topojson", "LIM355.topojson", "LIM361.topojson", "LIM362.topojson", "LIM364.topojson", "LIM365.topojson", "LIM366.topojson", "LIM367.topojson", "LIM471.topojson", "LIM472.topojson", "LIM473.topojson", "LIM474.topojson", "LIM475.topojson", "MAN.topojson", "MP301.topojson", "MP302.topojson", "MP303.topojson", "MP304.topojson", "MP305.topojson", "MP306.topojson", "MP307.topojson", "MP311.topojson", "MP312.topojson", "MP313.topojson", "MP314.topojson", "MP315.topojson", "MP316.topojson", "MP321.topojson", "MP322.topojson", "MP323.topojson", "MP324.topojson", "MP325.topojson", "NC061.topojson", "NC062.topojson", "NC064.topojson", "NC065.topojson", "NC066.topojson", "NC067.topojson", "NC071.topojson", "NC072.topojson", "NC073.topojson", "NC074.topojson", "NC075.topojson", "NC076.topojson", "NC077.topojson", "NC078.topojson", "NC081.topojson", "NC082.topojson", "NC083.topojson", "NC084.topojson", "NC085.topojson", "NC086.topojson", "NC091.topojson", "NC092.topojson", "NC093.topojson", "NC094.topojson", "NC451.topojson", "NC452.topojson", "NC453.topojson", "NMA.topojson", "NW371.topojson", "NW372.topojson", "NW373.topojson", "NW374.topojson", "NW375.topojson", "NW381.topojson", "NW382.topojson", "NW383.topojson", "NW384.topojson", "NW385.topojson", "NW392.topojson", "NW393.topojson", "NW394.topojson", "NW396.topojson", "NW397.topojson", "NW401.topojson", "NW402.topojson", "NW403.topojson", "NW404.topojson", "TSH.topojson", "WC011.topojson", "WC012.topojson", "WC013.topojson", "WC014.topojson", "WC015.topojson", "WC022.topojson", "WC023.topojson", "WC024.topojson", "WC025.topojson", "WC026.topojson", "WC031.topojson", "WC032.topojson", "WC033.topojson", "WC034.topojson", "WC041.topojson", "WC042.topojson", "WC043.topojson", "WC044.topojson", "WC045.topojson", "WC047.topojson", "WC048.topojson", "WC051.topojson", "WC052.topojson", "WC053.topojson"];

function getMunicipalityiecId(properties) {
    return properties.PKLVDNUMBE;
}

muniFiles.forEach(muniFile => {
    var muniName = muniFile.split(".")[0];
    var geoJsonData = JSON.parse(fs.readFileSync('./public/mapdata/'+muniFile, 'utf8'));
    geoJsonData = topojson.feature(geoJsonData, geoJsonData.objects[muniName]);

    var jsonDataFeatures = geoJsonData.features;
    jsonDataFeatures.forEach(feature => {
        var iecId = getMunicipalityiecId(feature.properties);
        var data = {
            "type":"FeatureCollection", 
            "features": [
                feature
            ]
        }
        fs.writeFile("./public/mapdata/vd-data/"+muniName+"-"+iecId+".geojson", JSON.stringify(data), function(err) {
            if(err) {
                return console.log(err);
            }
        
            console.log("./public/mapdata/vd-data/"+muniName+"-"+iecId+".geojson was saved!");
        }); 
    })
})
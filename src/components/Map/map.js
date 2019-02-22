import React, { Component } from "react";
import * as d3 from "d3";
import * as topojson from "topojson-client";
import { SideNav, Nav } from "react-sidenav";

import config from "../../config";
import polylabel from "polylabel";
import styles from "./map.css";
import events from "../../events";
import ReactLoading from "react-loading";

var regionColor = "#9c9c9c";
var regionBorderColor = "#eeeeee";


function className(originName) {
  return styles[originName] || originName;
}

var provincesData = [
    {
        "name": "Limpopo",
        "abbreviation": "LIM",
        "munis": [{"provinceName":"Limpopo","muniName":"LIM331 - Greater Giyani [Giyani]","muniCode":"LIM331"},{"provinceName":"Limpopo","muniName":"LIM332 - Greater Letaba [Duiwelskloof]","muniCode":"LIM332"},{"provinceName":"Limpopo","muniName":"LIM333 - Greater Tzaneen [Tzaneen]","muniCode":"LIM333"},{"provinceName":"Limpopo","muniName":"LIM334 - Ba-Phalaborwa [Phalaborwa]","muniCode":"LIM334"},{"provinceName":"Limpopo","muniName":"LIM335 - Maruleng [Hoedspruit]","muniCode":"LIM335"},{"provinceName":"Limpopo","muniName":"LIM341 - Musina [Messina]","muniCode":"LIM341"},{"provinceName":"Limpopo","muniName":"LIM342 - Mutale [Mutale-Masisi]","muniCode":"LIM342"},{"provinceName":"Limpopo","muniName":"LIM343 - Thulamela [Thohoyandou]","muniCode":"LIM343"},{"provinceName":"Limpopo","muniName":"LIM344 - Makhado [Louis Trichardt]","muniCode":"LIM344"},{"provinceName":"Limpopo","muniName":"LIM351 - Blouberg [Bochum/My Darling]","muniCode":"LIM351"},{"provinceName":"Limpopo","muniName":"LIM352 - Aganang [Moletji/Matlala]","muniCode":"LIM352"},{"provinceName":"Limpopo","muniName":"LIM353 - Molemole [Dendron/Dikgale]","muniCode":"LIM353"},{"provinceName":"Limpopo","muniName":"LIM354 - Polokwane [Pietersburg]","muniCode":"LIM354"},{"provinceName":"Limpopo","muniName":"LIM355 - Lepele-Nkumpi [Lebowakgomo]","muniCode":"LIM355"},{"provinceName":"Limpopo","muniName":"LIM361 - Thabazimbi [Thabazimbi]","muniCode":"LIM361"},{"provinceName":"Limpopo","muniName":"LIM362 - Lephalale [Ellisras]","muniCode":"LIM362"},{"provinceName":"Limpopo","muniName":"LIM364 - Mookgopong [Naboomspruit]","muniCode":"LIM364"},{"provinceName":"Limpopo","muniName":"LIM365 - Modimolle [Nylstroom]","muniCode":"LIM365"},{"provinceName":"Limpopo","muniName":"LIM366 - Bela-Bela [Warmbad]","muniCode":"LIM366"},{"provinceName":"Limpopo","muniName":"LIM367 - Mogalakwena [Potgietersrus]","muniCode":"LIM367"},{"provinceName":"Limpopo","muniName":"LIM471 - Ephraim Mogale [Marble Hall]","muniCode":"LIM471"},{"provinceName":"Limpopo","muniName":"LIM472 - Elias Motsoaledi [Groblersdal]","muniCode":"LIM472"},{"provinceName":"Limpopo","muniName":"LIM473 - Makhuduthamaga [Ngwaritsi]","muniCode":"LIM473"},{"provinceName":"Limpopo","muniName":"LIM474 - Fetakgomo [Fetakgomo ]","muniCode":"LIM474"},{"provinceName":"Limpopo","muniName":"LIM475 - Greater Tubatse [Burgersfort/Ohrigstad/Eastern Tubatse]","muniCode":"LIM475"}]
    },
    {
        "name": "Mpumalanga",
        "abbreviation": "MP",
        "munis": [{"provinceName":"Mpumalanga","muniName":"MP301 - Albert Luthuli [Elukwatini/Carolina]","muniCode":"MP301"},{"provinceName":"Mpumalanga","muniName":"MP302 - Msukaligwa [Ermelo]","muniCode":"MP302"},{"provinceName":"Mpumalanga","muniName":"MP303 - Mkhondo [Piet Retief]","muniCode":"MP303"},{"provinceName":"Mpumalanga","muniName":"MP304 - Pixley Ka Seme [Volksrust]","muniCode":"MP304"},{"provinceName":"Mpumalanga","muniName":"MP305 - Lekwa [Standerton]","muniCode":"MP305"},{"provinceName":"Mpumalanga","muniName":"MP306 - Dipaleseng [Balfour]","muniCode":"MP306"},{"provinceName":"Mpumalanga","muniName":"MP307 - Govan Mbeki [Highveld Ridge]","muniCode":"MP307"},{"provinceName":"Mpumalanga","muniName":"MP311 - Delmas [Delmas]","muniCode":"MP311"},{"provinceName":"Mpumalanga","muniName":"MP312 - Emalahleni [Witbank]","muniCode":"MP312"},{"provinceName":"Mpumalanga","muniName":"MP313 - Steve Tshwete [Middelburg]","muniCode":"MP313"},{"provinceName":"Mpumalanga","muniName":"MP314 - Emakhazeni [Belfast]","muniCode":"MP314"},{"provinceName":"Mpumalanga","muniName":"MP315 - Thembisile [KwaMhlanga]","muniCode":"MP315"},{"provinceName":"Mpumalanga","muniName":"MP316 - Dr JS Moroka [Mdutjana]","muniCode":"MP316"},{"provinceName":"Mpumalanga","muniName":"MP321 - Thaba Chweu [Sabie]","muniCode":"MP321"},{"provinceName":"Mpumalanga","muniName":"MP322 - Mbombela [Nelspruit]","muniCode":"MP322"},{"provinceName":"Mpumalanga","muniName":"MP323 - Umjindi [Barberton]","muniCode":"MP323"},{"provinceName":"Mpumalanga","muniName":"MP324 - Nkomazi [Nkomazi]","muniCode":"MP324"},{"provinceName":"Mpumalanga","muniName":"MP325 - Bushbuckridge [Bushbuckridge]","muniCode":"MP325"}]
    },
    {
        "name": "Gauteng",
        "abbreviation": "GT",
        "munis": [{"provinceName":"Gauteng","muniName":"EKU - Ekurhuleni [East Rand]","muniCode":"EKU"},{"provinceName":"Gauteng","muniName":"GT421 - Emfuleni [Vereeniging]","muniCode":"GT421"},{"provinceName":"Gauteng","muniName":"GT422 - Midvaal [Meyerton]","muniCode":"GT422"},{"provinceName":"Gauteng","muniName":"GT423 - Lesedi [Heidelberg]","muniCode":"GT423"},{"provinceName":"Gauteng","muniName":"GT481 - Mogale City [Krugersdorp]","muniCode":"GT481"},{"provinceName":"Gauteng","muniName":"GT482 - Randfontein [Randfontein]","muniCode":"GT482"},{"provinceName":"Gauteng","muniName":"GT483 - Westonaria [Westonaria]","muniCode":"GT483"},{"provinceName":"Gauteng","muniName":"GT484 - Merafong City [Carletonville]","muniCode":"GT484"},{"provinceName":"Gauteng","muniName":"JHB - City of Johannesburg [Johannesburg]","muniCode":"JHB"},{"provinceName":"Gauteng","muniName":"TSH - Tshwane Metro [Pretoria]","muniCode":"TSH"}]
    },
    {
        "name": "KwaZulu-Natal",
        "abbreviation": "KZN",
        "munis": [{"provinceName":"KwaZulu-Natal","muniName":"ETH - eThekwini [Durban Metro]","muniCode":"ETH"},{"provinceName":"KwaZulu-Natal","muniName":"KZN211 - Vulamehlo [Dududu]","muniCode":"KZN211"},{"provinceName":"KwaZulu-Natal","muniName":"KZN212 - Umdoni [Scottburgh]","muniCode":"KZN212"},{"provinceName":"KwaZulu-Natal","muniName":"KZN213 - Umzumbe [Umzumbe]","muniCode":"KZN213"},{"provinceName":"KwaZulu-Natal","muniName":"KZN214 - UMuziwabantu [Harding]","muniCode":"KZN214"},{"provinceName":"KwaZulu-Natal","muniName":"KZN215 - Ezinqoleni [Izinqolweni]","muniCode":"KZN215"},{"provinceName":"KwaZulu-Natal","muniName":"KZN216 - Hibiscus Coast [Port Shepstone]","muniCode":"KZN216"},{"provinceName":"KwaZulu-Natal","muniName":"KZN221 - uMshwathi [Wartburg]","muniCode":"KZN221"},{"provinceName":"KwaZulu-Natal","muniName":"KZN222 - uMngeni [Howick]","muniCode":"KZN222"},{"provinceName":"KwaZulu-Natal","muniName":"KZN223 - Mooi Mpofana [Mooirivier]","muniCode":"KZN223"},{"provinceName":"KwaZulu-Natal","muniName":"KZN224 - Impendle [Impendle]","muniCode":"KZN224"},{"provinceName":"KwaZulu-Natal","muniName":"KZN225 - Msunduzi [Pietermaritzburg]","muniCode":"KZN225"},{"provinceName":"KwaZulu-Natal","muniName":"KZN226 - Mkhambathini [Camperdown]","muniCode":"KZN226"},{"provinceName":"KwaZulu-Natal","muniName":"KZN227 - Richmond [Richmond]","muniCode":"KZN227"},{"provinceName":"KwaZulu-Natal","muniName":"KZN232 - Emnambithi/Ladysmith [Ladysmith]","muniCode":"KZN232"},{"provinceName":"KwaZulu-Natal","muniName":"KZN233 - Indaka [Waaihoek]","muniCode":"KZN233"},{"provinceName":"KwaZulu-Natal","muniName":"KZN234 - Umtshezi [Estcourt]","muniCode":"KZN234"},{"provinceName":"KwaZulu-Natal","muniName":"KZN235 - Okhahlamba [Bergville]","muniCode":"KZN235"},{"provinceName":"KwaZulu-Natal","muniName":"KZN236 - Imbabazane [Loskop]","muniCode":"KZN236"},{"provinceName":"KwaZulu-Natal","muniName":"KZN241 - Endumeni [Dundee]","muniCode":"KZN241"},{"provinceName":"KwaZulu-Natal","muniName":"KZN242 - Nqutu [Nqutu]","muniCode":"KZN242"},{"provinceName":"KwaZulu-Natal","muniName":"KZN244 - Msinga [Pomeroy]","muniCode":"KZN244"},{"provinceName":"KwaZulu-Natal","muniName":"KZN245 - Umvoti [Greytown]","muniCode":"KZN245"},{"provinceName":"KwaZulu-Natal","muniName":"KZN252 - Newcastle [Newcastle]","muniCode":"KZN252"},{"provinceName":"KwaZulu-Natal","muniName":"KZN253 - eMadlangeni [Utrecht]","muniCode":"KZN253"},{"provinceName":"KwaZulu-Natal","muniName":"KZN254 - Dannhauser [Durnacol]","muniCode":"KZN254"},{"provinceName":"KwaZulu-Natal","muniName":"KZN261 - eDumbe [Paulpietersburg]","muniCode":"KZN261"},{"provinceName":"KwaZulu-Natal","muniName":"KZN262 - UPhongolo [Pongola]","muniCode":"KZN262"},{"provinceName":"KwaZulu-Natal","muniName":"KZN263 - Abaqulusi [Vryheid]","muniCode":"KZN263"},{"provinceName":"KwaZulu-Natal","muniName":"KZN265 - Nongoma [Nongoma]","muniCode":"KZN265"},{"provinceName":"KwaZulu-Natal","muniName":"KZN266 - Ulundi [Ulundi]","muniCode":"KZN266"},{"provinceName":"KwaZulu-Natal","muniName":"KZN271 - Umhlabuyalingana [Emangusi]","muniCode":"KZN271"},{"provinceName":"KwaZulu-Natal","muniName":"KZN272 - Jozini [Mkuze]","muniCode":"KZN272"},{"provinceName":"KwaZulu-Natal","muniName":"KZN273 - The Big 5 False Bay [Hluhluwe]","muniCode":"KZN273"},{"provinceName":"KwaZulu-Natal","muniName":"KZN274 - Hlabisa [Somkele]","muniCode":"KZN274"},{"provinceName":"KwaZulu-Natal","muniName":"KZN275 - Mtubatuba [Mtubatuba]","muniCode":"KZN275"},{"provinceName":"KwaZulu-Natal","muniName":"KZN281 - Mfolozi [KwaMbonambi]","muniCode":"KZN281"},{"provinceName":"KwaZulu-Natal","muniName":"KZN282 - uMhlathuze [Richards Bay]","muniCode":"KZN282"},{"provinceName":"KwaZulu-Natal","muniName":"KZN283 - Ntambana [Ntambana]","muniCode":"KZN283"},{"provinceName":"KwaZulu-Natal","muniName":"KZN284 - uMlalazi [Eshowe]","muniCode":"KZN284"},{"provinceName":"KwaZulu-Natal","muniName":"KZN285 - Mthonjaneni [Melmoth]","muniCode":"KZN285"},{"provinceName":"KwaZulu-Natal","muniName":"KZN286 - Nkandla [Nkandla]","muniCode":"KZN286"},{"provinceName":"KwaZulu-Natal","muniName":"KZN291 - Mandeni [Mandeni]","muniCode":"KZN291"},{"provinceName":"KwaZulu-Natal","muniName":"KZN292 - KwaDukuza [Stanger]","muniCode":"KZN292"},{"provinceName":"KwaZulu-Natal","muniName":"KZN293 - Ndwedwe [Ndwedwe]","muniCode":"KZN293"},{"provinceName":"KwaZulu-Natal","muniName":"KZN294 - Maphumulo [Maphumulo]","muniCode":"KZN294"},{"provinceName":"KwaZulu-Natal","muniName":"KZN431 - Ingwe [Creighton]","muniCode":"KZN431"},{"provinceName":"KwaZulu-Natal","muniName":"KZN432 - Kwa Sani [Underberg]","muniCode":"KZN432"},{"provinceName":"KwaZulu-Natal","muniName":"KZN433 - Greater Kokstad [Kokstad]","muniCode":"KZN433"},{"provinceName":"KwaZulu-Natal","muniName":"KZN434 - Ubuhlebezwe [Ixopo]","muniCode":"KZN434"},{"provinceName":"KwaZulu-Natal","muniName":"KZN435 - Umzimkhulu [Umzimkulu]","muniCode":"KZN435"}]
    },
    {
        "name": "North West",
        "abbreviation": "NW",
        "munis": [{"provinceName":"North West","muniName":"NW371 - Moretele [Makapanstad]","muniCode":"NW371"},{"provinceName":"North West","muniName":"NW372 - Madibeng [Brits]","muniCode":"NW372"},{"provinceName":"North West","muniName":"NW373 - Rustenburg [Rustenburg]","muniCode":"NW373"},{"provinceName":"North West","muniName":"NW374 - Kgetlengrivier [Koster]","muniCode":"NW374"},{"provinceName":"North West","muniName":"NW375 - Moses Kotane [Mogwase]","muniCode":"NW375"},{"provinceName":"North West","muniName":"NW381 - Ratlou [Setlagole]","muniCode":"NW381"},{"provinceName":"North West","muniName":"NW382 - Tswaing [Delareyville]","muniCode":"NW382"},{"provinceName":"North West","muniName":"NW383 - Mafikeng [Mafikeng]","muniCode":"NW383"},{"provinceName":"North West","muniName":"NW384 - Ditsobotla [Lichtenburg]","muniCode":"NW384"},{"provinceName":"North West","muniName":"NW385 - Ramotshere Moiloa [Zeerust]","muniCode":"NW385"},{"provinceName":"North West","muniName":"NW392 - Naledi [Vryburg]","muniCode":"NW392"},{"provinceName":"North West","muniName":"NW393 - Mamusa [Schweizer-Reneke]","muniCode":"NW393"},{"provinceName":"North West","muniName":"NW394 - Greater Taung [Reivilo]","muniCode":"NW394"},{"provinceName":"North West","muniName":"NW396 - Lekwa-Teemane [Christiana]","muniCode":"NW396"},{"provinceName":"North West","muniName":"NW397 - NW397 Local Municipality [Ganyesa/Pomfret]","muniCode":"NW397"},{"provinceName":"North West","muniName":"NW401 - Ventersdorp [Ventersdorp]","muniCode":"NW401"},{"provinceName":"North West","muniName":"NW402 - Tlokwe [Potchefstroom]","muniCode":"NW402"},{"provinceName":"North West","muniName":"NW403 - Matlosana [Klerksdorp]","muniCode":"NW403"},{"provinceName":"North West","muniName":"NW404 - Maquassi Hills [Wolmaransstad]","muniCode":"NW404"}]
    },
    {
        "name": "Free State",
        "abbreviation": "FS",
        "munis": [{"provinceName":"Free State","muniName":"FS161 - Letsemeng [Koffiefontein]","muniCode":"FS161"},{"provinceName":"Free State","muniName":"FS162 - Kopanong [Trompsburg]","muniCode":"FS162"},{"provinceName":"Free State","muniName":"FS163 - Mohokare [Zastron]","muniCode":"FS163"},{"provinceName":"Free State","muniName":"FS164 - Naledi [Dewetsdorp]","muniCode":"FS164"},{"provinceName":"Free State","muniName":"FS181 - Masilonyana [Theunissen]","muniCode":"FS181"},{"provinceName":"Free State","muniName":"FS182 - Tokologo [Dealesville]","muniCode":"FS182"},{"provinceName":"Free State","muniName":"FS183 - Tswelopele [Hoopstad]","muniCode":"FS183"},{"provinceName":"Free State","muniName":"FS184 - Matjhabeng [Welkom]","muniCode":"FS184"},{"provinceName":"Free State","muniName":"FS185 - Nala [Bothaville]","muniCode":"FS185"},{"provinceName":"Free State","muniName":"FS191 - Setsoto [Senekal]","muniCode":"FS191"},{"provinceName":"Free State","muniName":"FS192 - Dihlabeng [Bethlehem]","muniCode":"FS192"},{"provinceName":"Free State","muniName":"FS193 - Nketoana [Reitz]","muniCode":"FS193"},{"provinceName":"Free State","muniName":"FS194 - Maluti a Phofung [Qwa-Qwa]","muniCode":"FS194"},{"provinceName":"Free State","muniName":"FS195 - Phumelela [Vrede]","muniCode":"FS195"},{"provinceName":"Free State","muniName":"FS196 - Mantsopa [Ladybrand]","muniCode":"FS196"},{"provinceName":"Free State","muniName":"FS201 - Moqhaka [Kroonstad]","muniCode":"FS201"},{"provinceName":"Free State","muniName":"FS203 - Ngwathe [Parys]","muniCode":"FS203"},{"provinceName":"Free State","muniName":"FS204 - Metsimaholo [Sasolburg]","muniCode":"FS204"},{"provinceName":"Free State","muniName":"FS205 - Mafube [Frankfort]","muniCode":"FS205"},{"provinceName":"Free State","muniName":"MAN - Mangaung [Bloemfontein]","muniCode":"MAN"}]
    },
    {
        "name": "Eastern Cape",
        "abbreviation": "EC",
        "munis": [{"provinceName":"Eastern Cape","muniName":"BUF - Buffalo City [East London]","muniCode":"BUF"},{"provinceName":"Eastern Cape","muniName":"EC101 - Camdeboo [Graaff-Reinet]","muniCode":"EC101"},{"provinceName":"Eastern Cape","muniName":"EC102 - Blue Crane Route [Somerset East]","muniCode":"EC102"},{"provinceName":"Eastern Cape","muniName":"EC103 - Ikwezi [Jansenville]","muniCode":"EC103"},{"provinceName":"Eastern Cape","muniName":"EC104 - Makana [Grahamstown]","muniCode":"EC104"},{"provinceName":"Eastern Cape","muniName":"EC105 - Ndlambe [Port Alfred]","muniCode":"EC105"},{"provinceName":"Eastern Cape","muniName":"EC106 - Sundays River Valley [Kirkwood]","muniCode":"EC106"},{"provinceName":"Eastern Cape","muniName":"EC107 - Baviaans [Willowmore]","muniCode":"EC107"},{"provinceName":"Eastern Cape","muniName":"EC108 - Kouga [Humansdorp]","muniCode":"EC108"},{"provinceName":"Eastern Cape","muniName":"EC109 - Kou-Kamma [Kareedouw]","muniCode":"EC109"},{"provinceName":"Eastern Cape","muniName":"EC121 - Mbhashe [Idutywa]","muniCode":"EC121"},{"provinceName":"Eastern Cape","muniName":"EC122 - Mnquma [Butterworth]","muniCode":"EC122"},{"provinceName":"Eastern Cape","muniName":"EC123 - Great Kei [Komga]","muniCode":"EC123"},{"provinceName":"Eastern Cape","muniName":"EC124 - Amahlathi [Stutterheim]","muniCode":"EC124"},{"provinceName":"Eastern Cape","muniName":"EC126 - Ngqushwa [Peddie]","muniCode":"EC126"},{"provinceName":"Eastern Cape","muniName":"EC127 - Nkonkobe [Alice]","muniCode":"EC127"},{"provinceName":"Eastern Cape","muniName":"EC128 - Nxuba [Adelaide]","muniCode":"EC128"},{"provinceName":"Eastern Cape","muniName":"EC131 - Inxuba Yethemba [Cradock]","muniCode":"EC131"},{"provinceName":"Eastern Cape","muniName":"EC132 - Tsolwana [Tarkastad]","muniCode":"EC132"},{"provinceName":"Eastern Cape","muniName":"EC133 - Inkwanca [Molteno]","muniCode":"EC133"},{"provinceName":"Eastern Cape","muniName":"EC134 - Lukhanji [Queenstown]","muniCode":"EC134"},{"provinceName":"Eastern Cape","muniName":"EC135 - Intsika Yethu [Cofimvaba]","muniCode":"EC135"},{"provinceName":"Eastern Cape","muniName":"EC136 - Emalahleni [Lady Frere]","muniCode":"EC136"},{"provinceName":"Eastern Cape","muniName":"EC137 - Engcobo [Engcobo]","muniCode":"EC137"},{"provinceName":"Eastern Cape","muniName":"EC138 - Sakhisizwe [Elliot]","muniCode":"EC138"},{"provinceName":"Eastern Cape","muniName":"EC141 - Elundini [Mount Fletcher]","muniCode":"EC141"},{"provinceName":"Eastern Cape","muniName":"EC142 - Senqu [Lady Grey]","muniCode":"EC142"},{"provinceName":"Eastern Cape","muniName":"EC143 - Maletswai [Aliwal North]","muniCode":"EC143"},{"provinceName":"Eastern Cape","muniName":"EC144 - Gariep [Burgersdorp]","muniCode":"EC144"},{"provinceName":"Eastern Cape","muniName":"EC153 - Ngquza Hill [Flagstaff]","muniCode":"EC153"},{"provinceName":"Eastern Cape","muniName":"EC154 - Port St Johns [Port St Johns]","muniCode":"EC154"},{"provinceName":"Eastern Cape","muniName":"EC155 - Nyandeni [Libode]","muniCode":"EC155"},{"provinceName":"Eastern Cape","muniName":"EC156 - Mhlontlo [Qumbu]","muniCode":"EC156"},{"provinceName":"Eastern Cape","muniName":"EC157 - King Sabata Dalindyebo [Umtata]","muniCode":"EC157"},{"provinceName":"Eastern Cape","muniName":"EC441 - Matatiele [Matatiele]","muniCode":"EC441"},{"provinceName":"Eastern Cape","muniName":"EC442 - Umzimvubu [Mount Ayliff]","muniCode":"EC442"},{"provinceName":"Eastern Cape","muniName":"EC443 - Mbizana [Bizana]","muniCode":"EC443"},{"provinceName":"Eastern Cape","muniName":"EC444 - Ntabankulu [Ntabankulu]","muniCode":"EC444"},{"provinceName":"Eastern Cape","muniName":"NMA - Nelson Mandela Bay [Port Elizabeth]","muniCode":"NMA"}]
    },
    {
        "name": "Northern Cape",
        "abbreviation": "NC",
        "munis": [{"provinceName":"Northern Cape","muniName":"NC061 - RICHTERSVELD [Port Nolloth]","muniCode":"NC061"},{"provinceName":"Northern Cape","muniName":"NC062 - NAMA KHOI [Springbok]","muniCode":"NC062"},{"provinceName":"Northern Cape","muniName":"NC064 - KAMIESBERG [Garies]","muniCode":"NC064"},{"provinceName":"Northern Cape","muniName":"NC065 - HANTAM [Calvinia]","muniCode":"NC065"},{"provinceName":"Northern Cape","muniName":"NC066 - KAROO HOOGLAND [Fraserburg]","muniCode":"NC066"},{"provinceName":"Northern Cape","muniName":"NC067 - KHI-MA [Pofadder]","muniCode":"NC067"},{"provinceName":"Northern Cape","muniName":"NC071 - UBUNTU [Victoria West]","muniCode":"NC071"},{"provinceName":"Northern Cape","muniName":"NC072 - UMSOBOMVU [Colesberg]","muniCode":"NC072"},{"provinceName":"Northern Cape","muniName":"NC073 - EMTHANJENI [De Aar]","muniCode":"NC073"},{"provinceName":"Northern Cape","muniName":"NC074 - KAREEBERG [Carnarvon]","muniCode":"NC074"},{"provinceName":"Northern Cape","muniName":"NC075 - RENOSTERBERG [Phillipstown]","muniCode":"NC075"},{"provinceName":"Northern Cape","muniName":"NC076 - THEMBELIHLE [Hopetown]","muniCode":"NC076"},{"provinceName":"Northern Cape","muniName":"NC077 - SIYATHEMBA [Prieska]","muniCode":"NC077"},{"provinceName":"Northern Cape","muniName":"NC078 - SIYANCUMA [Griekwastad]","muniCode":"NC078"},{"provinceName":"Northern Cape","muniName":"NC081 - MIER [Mier]","muniCode":"NC081"},{"provinceName":"Northern Cape","muniName":"NC082 - KAI !GARIB [Keimoes]","muniCode":"NC082"},{"provinceName":"Northern Cape","muniName":"NC083 - KHARA HAIS [Upington]","muniCode":"NC083"},{"provinceName":"Northern Cape","muniName":"NC084 - !KHEIS [Groblershoop]","muniCode":"NC084"},{"provinceName":"Northern Cape","muniName":"NC085 - TSANTSABANE [Postmasburg]","muniCode":"NC085"},{"provinceName":"Northern Cape","muniName":"NC086 - KGATELOPELE [Danielskuil]","muniCode":"NC086"},{"provinceName":"Northern Cape","muniName":"NC091 - Sol Plaatje [Kimberley]","muniCode":"NC091"},{"provinceName":"Northern Cape","muniName":"NC092 - Dikgatlong [Barkley West]","muniCode":"NC092"},{"provinceName":"Northern Cape","muniName":"NC093 - Magareng [Warrenton]","muniCode":"NC093"},{"provinceName":"Northern Cape","muniName":"NC094 - Phokwane [Hartswater]","muniCode":"NC094"},{"provinceName":"Northern Cape","muniName":"NC451 - Joe Morolong [Kgalagadi]","muniCode":"NC451"},{"provinceName":"Northern Cape","muniName":"NC452 - GA-SEGONYANA [Kuruman]","muniCode":"NC452"},{"provinceName":"Northern Cape","muniName":"NC453 - GAMAGARA [Kathu]","muniCode":"NC453"}]
    },
    {
        "name": "Western Cape",
        "abbreviation": "WC",
        "munis": [{"provinceName":"Western Cape","muniName":"CPT - City of Cape Town [Cape Town]","muniCode":"CPT"},{"provinceName":"Western Cape","muniName":"WC011 - Matzikama [Vredendal]","muniCode":"WC011"},{"provinceName":"Western Cape","muniName":"WC012 - Cederberg [Citrusdal]","muniCode":"WC012"},{"provinceName":"Western Cape","muniName":"WC013 - Bergrivier [Velddrif]","muniCode":"WC013"},{"provinceName":"Western Cape","muniName":"WC014 - Saldanha Bay [West Coast Peninsula]","muniCode":"WC014"},{"provinceName":"Western Cape","muniName":"WC015 - Swartland [Malmesbury]","muniCode":"WC015"},{"provinceName":"Western Cape","muniName":"WC022 - Witzenberg [Ceres]","muniCode":"WC022"},{"provinceName":"Western Cape","muniName":"WC023 - Drakenstein [Paarl]","muniCode":"WC023"},{"provinceName":"Western Cape","muniName":"WC024 - Stellenbosch [Stellenbosch]","muniCode":"WC024"},{"provinceName":"Western Cape","muniName":"WC025 - Breede Valley [Worcester]","muniCode":"WC025"},{"provinceName":"Western Cape","muniName":"WC026 - Langeberg [Robertson]","muniCode":"WC026"},{"provinceName":"Western Cape","muniName":"WC031 - Theewaterskloof [Caledon]","muniCode":"WC031"},{"provinceName":"Western Cape","muniName":"WC032 - Overstrand [Greater Hermanus]","muniCode":"WC032"},{"provinceName":"Western Cape","muniName":"WC033 - Cape Agulhas [Bredasdorp]","muniCode":"WC033"},{"provinceName":"Western Cape","muniName":"WC034 - Swellendam [Barrydale/Swellendam ]","muniCode":"WC034"},{"provinceName":"Western Cape","muniName":"WC041 - Kannaland [Ladismith]","muniCode":"WC041"},{"provinceName":"Western Cape","muniName":"WC042 - Hessequa [Heidelberg/Riversdale]","muniCode":"WC042"},{"provinceName":"Western Cape","muniName":"WC043 - Mossel Bay [Mossel Bay]","muniCode":"WC043"},{"provinceName":"Western Cape","muniName":"WC044 - George [George]","muniCode":"WC044"},{"provinceName":"Western Cape","muniName":"WC045 - Oudtshoorn [Oudtshoorn]","muniCode":"WC045"},{"provinceName":"Western Cape","muniName":"WC047 - Bitou [Greater Plettenberg Bay]","muniCode":"WC047"},{"provinceName":"Western Cape","muniName":"WC048 - Knysna [Knysna]","muniCode":"WC048"},{"provinceName":"Western Cape","muniName":"WC051 - Laingsburg [Laingsburg]","muniCode":"WC051"},{"provinceName":"Western Cape","muniName":"WC052 - Prince Albert [Prins Albert]","muniCode":"WC052"},{"provinceName":"Western Cape","muniName":"WC053 - Beaufort West [Beaufort West]","muniCode":"WC053"}]
    }
]

class Map extends Component {

    constructor(props) {
        super(props);
        this.state = {
            disableNavigation: false,
            regionType: "national",
            provinceName: "",
            muniName: "",
            muniCode: "",
            vdNumber: "",
        }

        if (props.regionType) {
            this.state.regionType = props.regionType;
        }
        if (props.provinceName) {
            this.state.provinceName = props.provinceName;
        }
        if (props.muniName) {
            this.state.muniName = props.muniName;
        }
        if (props.disableNavigation) {
            this.state.disableNavigation = props.disableNavigation;
        }
        this.handlePreviewEvent = this.handlePreviewEvent.bind(this);
    }

    draw(container, props) {
        this.drawGraph(container, props);
    }

    componentDidMount() {
        this.draw(this.getContainer(), this.props)
        document.addEventListener(events.MAP_PREVIEW, this.handlePreviewEvent);
    }

    componentWillUnmount() {
      document.removeEventListener(events.MAP_PREVIEW, this.handlePreviewEvent);
    }

    componentDidUpdate() {
        this.draw(this.getContainer(), this.props)
    }

    handlePreviewEvent(event) {
        var newState = event.detail;
        this.setState(newState)
    }

    handleNavBarSelection(regionType, selectionData) {
        var newState;
        if (regionType == "national") {
            newState = {regionType: regionType};
            if (this.state.regionType == newState.regionType)
                return;
        } else if (regionType == "province") {
            newState = {
                regionType: regionType,
                provinceName: selectionData.name
            };
            if (this.state.regionType == newState.regionType && this.state.provinceName == newState.provinceName)
                return;
        } else if (regionType == "municipality") {
            newState = {
                regionType: regionType,
                provinceName: selectionData.provinceName,
                muniName: selectionData.muniName,
                muniCode: selectionData.muniCode,
            }; 
            if (this.state.regionType == newState.regionType 
                && this.state.provinceName == newState.provinceName
                && this.state.newState == newState.muniName)
                return;
        }

        var event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
        document.dispatchEvent(event);
        this.setState(newState);
    }

    getContainer() {
        return d3.select(this.refs.vizcontainer)
    }

    getLoadingSpinner() {
        return d3.select(this.refs.loading)
    }
      
    render () {
        const theme = {
            selectionColor: "#C51162"
        };
        var {
            disableNavigation
        } = this.state;
        return (
            <div className="map-container">
                {
                    !disableNavigation &&
                        <div className={className("map-navbar")}>
                            <SideNav
                                defaultSelectedPath="1"
                                theme={theme}
                                onItemSelection={this.onItemSelection}
                                className={className("map-navbar")}
                            >
                                <Nav id="navbar-national" onClick={this.handleNavBarSelection.bind(this, "national")}>
                                    National
                                </Nav>
                                {
                                    provincesData.map(province => {
                                        return <Nav 
                                            key={province.abbreviation} 
                                            id={"navbar-province-"+province.abbreviation}
                                            onClick={this.handleNavBarSelection.bind(this, "province", province)}>
                                                { province.name }
                                                {
                                                    province.munis.map(muni => {
                                                        return <Nav 
                                                            key={muni.muniCode} 
                                                            id={"navbar-muni-"+muni.muniCode}
                                                            onClick={this.handleNavBarSelection.bind(this, "municipality", muni)}
                                                            >
                                                                {muni.muniCode}
                                                            </Nav>
                                                    })
                                                }
                                        </Nav>
                                    })
                                }
                            </SideNav>
                        </div> 
                }

                <div className="loading-spinner" ref="loading">
                    <ReactLoading type={"spin"} color={"#777"} height={100} width={100} />
                </div>
                <div ref="vizcontainer" className="map"></div>
            </div>
        )
    }

    drawGraph(container, props) {
        var self = this;
        var nationalMapFile = "province_lo-res.geojson";

        function getRegionFileName() {
            function getProvinceFileName(provinceName) {
                var provinceNameToFileMap = {
                    "Limpopo": "lim_lo-res.geojson",
                    "Mpumalanga": "mp_lo-res.geojson",
                    "Gauteng": "gt_lo-res.geojson",
                    "KwaZulu-Natal": "kzn_lo-res.geojson",
                    "North West": "nw_lo-res.geojson",
                    "Free State": "fs_lo-res.geojson",
                    "Eastern Cape": "ec_lo-res.geojson",
                    "Northern Cape": "nc_lo-res.geojson",
                    "Western Cape": "wc_lo-res.geojson",
                }
                return provinceNameToFileMap[provinceName];
            }
            switch(self.state.regionType) {
                case "national":
                    return nationalMapFile;
                case "province":
                    return getProvinceFileName(self.state.provinceName);
                case "municipality":
                    return self.state.muniCode + ".topojson";
                default:
                    return null;
            }
        }

        var fullRouteGeoJsonFile = config.DOMAIN + "/mapdata/" + getRegionFileName();

        self.getLoadingSpinner()
            .style("display", "block")
            .transition()
            .duration(200)
            .style("opacity", 1);

        var tooltipDiv;
        if (document.getElementsByClassName("tooltip")[0]) {
          tooltipDiv = d3.select(".tooltip");
        } else {
          tooltipDiv = d3.select("body").append("div")	
            .attr("class", className("tooltip"))				
            .style("opacity", 0);
        }

        console.log("process.env", process.env)
        console.log("fullRouteGeoJsonFile", fullRouteGeoJsonFile);

        var w = 900;
        var h = 800;
        container.selectAll("svg").remove();
        var svg = container.append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet").style("background-color","#ffffff")
            .attr("viewBox", "0 0 " + w + " " + h)
            .classed("svg-content", true);

        // if (!self.state.disableNavigation) {
        //     var fo = svg.append("foreignObject")
        //         .attr("x", w - 100)
        //         .attr("y", 10)
        //         .attr("width", 100)
        //         .attr("height", 30)
        //         .attr("class", "map-controls")
        //     fo.append("xhtml:div")
        //         .append("button")
        //         .attr("class", "go-back")
        //         .html("go back")
        //         .on("click", function() {
        //             var regionType = self.state.regionType;
        //             var newState, event;

        //             var newState = {
        //                 regionType: self.state.regionType, 
        //                 provinceName: self.state.provinceName,
        //                 muniName: self.state.muniName,
        //                 muniImuniCodeD: self.state.muniCode,
        //                 vdNumber: self.state.vdNumber,
        //             }
                    
        //             if (regionType === "province") {
        //                 newState.regionType = "national";
        //             } else if (regionType === "municipality") {
        //                 newState.regionType = "province";
        //             }

        //             event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
        //             document.dispatchEvent(event);
        //             self.setState(newState);
        //         });
        // }

        var geoJsonLoader = d3.json(fullRouteGeoJsonFile);

        Promise.all([geoJsonLoader]).then(function(values){ 
            var geoJsonData = values[0];

            var getJsonDataFeatures;
            if (fullRouteGeoJsonFile.indexOf(".topojson") !== -1) {//topojson is used for only munis
                geoJsonData = topojson.feature(geoJsonData, geoJsonData.objects[self.state.muniCode]);
            }

            getJsonDataFeatures = geoJsonData.features;

            var projection = d3.geoMercator().fitSize([w, h], geoJsonData);
            var path = d3.geoPath().projection(projection);

            // fill region with regionColor
            svg.selectAll(`.${className("region")}`)
                .data(getJsonDataFeatures)
                .enter()
                .append("path")
                .attr("class", className("region"))
                .attr("stroke", regionBorderColor)
                .attr("fill", regionColor)
                .attr("id", function(d, i) {
                    return `region-${i}`;
                })
                .attr("d", path);
            
            // if (self.state.regionType == "province") {
            //    console.log("fetch muni Names and codes", JSON.stringify(getJsonDataFeatures.map(d => {
            //         function getMunicipalityCode(properties) {
            //             return properties.code || properties.smunicipal.split("-")[0].replace(/\s/g, "");
            //         }
            //         var newState = {
            //             provinceName: self.state.provinceName,
            //             muniName: d.properties.smunicipal,
            //             muniCode: getMunicipalityCode(d.properties),
            //         }
            //         return newState;
            //     })));
            // }
            
            if (self.state.regionType !== "municipality") {
                svg.selectAll(".place-label")
                    .data(getJsonDataFeatures)
                .enter().append("text")
                    .attr("class", "place-label")
                    .attr("font-size", "12px")
                    .attr("transform", function(d) { 
                        var center, projectionCenter;
                        if (d.geometry.type === "Polygon") {
                            center = polylabel(d.geometry.coordinates);
                            projectionCenter = projection(center);
                            projectionCenter[1] -= 12;
                            return "translate(" + projectionCenter + ")"; 
                        } else { //"MultiPolygon"
                            center = polylabel(d.geometry.coordinates[0]);
                            projectionCenter = projection(center);
                            projectionCenter[1] -= 5;
                            return "translate(" + projectionCenter + ")"; 
                        }
                    })
                    .attr("dy", ".35em")
                    .style("text-anchor", "middle")
                    .text(function(d) { 
                        if (self.state.regionType === "national") {
                            return d.properties.SPROVINCE;
                        } else if (self.state.regionType === "province") {
                            return d.properties.smunicipal.split("-")[1].split("[")[0]; 
                        } else {//municipality
                            return d.properties.SMUNICIPAL.split("-")[1].split("[")[0]; 
                        }
                    })
            }

            if (self.state.regionType !== "municipality") {
                var labelElements = document.getElementsByClassName("place-label");

                var regions = {};
                var overlapCnt = {};
                var i;

                for (i = 0; i < getJsonDataFeatures.length; i ++) {
                    regions[i] = labelElements[i].getBoundingClientRect();
                }
    
                for (i = 0; i < getJsonDataFeatures.length; i ++) {
                    for (var j = 0; j < i; j ++) {
                        var rect1 = regions[i];
                        var rect2 = regions[j];
                        var overlap = !(rect1.right < rect2.left || 
                            rect1.left > rect2.right || 
                            rect1.bottom < rect2.top || 
                            rect1.top > rect2.bottom);
                        if (overlap) {
                            overlapCnt[i] = overlapCnt[i]? (overlapCnt[i] + 1): 1;
                        }
                    }
                    if (overlapCnt[i] > 2) {
                        labelElements[i].setAttribute("opacity", 0)
                    } else if (overlapCnt[i] > 0){
                        labelElements[i].innerHTML = labelElements[i].innerHTML.slice(0, 3) + "...";
                    } else {
    
                    }
                }
            }

            //hidden area for catching events
            svg.selectAll(".eventLayer")
                .data(getJsonDataFeatures)
            .enter()
                .append("path")
                .attr("d", path)
                .attr("class", "eventLayer")
                .attr("id", function(d, i) {
                    return `eventLayer-${i}`;
                })
                .attr("fill", "transparent")
                .on("mouseover", function(d, i) {
                    d3.select(`#region-${i}`)
                        .attr("stroke-width", 3)
                        .style("fill-opacity", 0.8);
                })
                .on("mousemove", function(d) {	
                    if (self.state.regionType === "municipality") return;
                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 1);
                    function regionName() {
                        if (self.state.regionType === "national") {
                            return d.properties.SPROVINCE;
                        } else if (self.state.regionType === "province") {
                            return d.properties.smunicipal.split("-")[1].split("[")[0]; 
                        } else {//municipality
                            return d.properties.SMUNICIPAL.split("-")[1].split("[")[0]; 
                        }
                    }
                    tooltipDiv.html(regionName())	
                        .style("left", (d3.event.pageX) + "px")		
                        .style("top", (d3.event.pageY - 28) + "px");	
                })
                .on("mouseout", function(d, i) {
                    d3.select(`#region-${i}`)
                        .attr("stroke-width", 1)
                        .style("fill-opacity", 1);
                    
                    if (self.state.regionType === "municipality") return;

                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 0);	
                })
                .on("click", function(d, i) {
                    if (self.state.disableNavigation) {
                        return;
                    }
                    console.log("click event", i, d.properties);
                    tooltipDiv.transition()		
                        .duration(200)		
                        .style("opacity", 0);	
                    
                    var regionType = self.state.regionType;
                    var newState, event;
                    if (regionType === "national") {
                        newState = {
                            regionType: "province",
                            provinceName: d.properties.SPROVINCE
                        }
                        event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
                        document.dispatchEvent(event);
                        self.setState(newState);
                    } else if (regionType === "province") {
                        function getMunicipalityCode(properties) {
                            return properties.code || properties.smunicipal.split("-")[0].replace(/\s/g, "");
                        }
                        newState = {
                            regionType: "municipality", 
                            provinceName: self.state.provinceName,
                            muniName: d.properties.smunicipal,
                            muniCode: getMunicipalityCode(d.properties),
                        }
                        event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
                        document.dispatchEvent(event);

                        self.setState(newState);
                    } else { // "municipality"
                        function getMunicipalityVdNumber(properties) {
                            return properties.PKLVDNUMBE;
                        }
                        var newState = {
                            regionType: "municipality-vd", 
                            provinceName: self.state.provinceName,
                            muniName: self.state.muniName,
                            muniCode: self.state.muniCode,
                            vdNumber: getMunicipalityVdNumber(d.properties),
                        }
                        var event = new CustomEvent(events.REGION_CHANGE, { detail: newState });
                        document.dispatchEvent(event);
                    }
                })
            self.getLoadingSpinner()
                .style("display", "none");
        })

        var redrawChart = function() {

        };

        window.addEventListener("resize", redrawChart, 200);
    }
}

export default Map;

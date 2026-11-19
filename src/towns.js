/* Six independent towns. Only one is loaded at a time; the bus is the only way between them.
   b = bounds [x0,x1,z0,z1]. roads = [x0,x1,z0,z1,axis]. plots = empty lots [x0,x1,z0,z1,doorSide,opts]. */
const PI=Math.PI;
export const ORDER=['vashupur','kaapikunj','memepura','basti','barfii','delulugarh'];
export const TOWNS={
  vashupur:{ready:true,name:'Vashupur',tag:'The capital. Lolu Mall, PM House, Choupati, the Outpulse Museum, the National Stadium and the bus stand.',color:'#ff6a3d',
    b:[-186,172,-111,176],scale:1.89,
    roads:[[-186,172,-7.5,7.5,'x'],[-7.5,7.5,-111,97.1,'z'],[-7.5,7.5,141.5,176,'z'],[-186,-22.2,112,127,'x'],[22.2,172,112,127,'x']],road:{w:15,side:3},
    round:{x:0,z:119.5,r0:14.1,r1:22.2},busStand:true,
    bus:{x:-127,z:140},spawn:{x:-121,z:128.8,yaw:0},scooter:[-100,133,Math.PI/2],
    plots:[],
    zones:[['Signal Chowk',-18,18,-18,18],['Roundabout',-28,28,92,147],['Outpulse Residential Towers',-186,-10.5,-111,-10.5],['Lolu Mall',10.5,106,-111,-10.5],['Central Jail',106,171,-110,-12.7],['National Stadium',-180.3,-42.6,12,106.6],['Stadium Parking',-42.6,-10.5,10.7,95.7],['Outpulse Labs',10.7,110,10.6,109],['PM House',110,172,10.6,59.6],['The Boring Wear',110,172,59.6,109],['Bus Stand',-172,-84,127,176],['Fire Station',-84,-46.5,129,176],['City Kotwali',-46.5,-10.5,129,176],['Meow Club',10.5,61,129,176],['Choupati',61,111.7,129,176],['Outpulse Museum',111.7,172,129,176]],
    trees:70,flora:'mix'},
  kaapikunj:{ready:true,name:'Kaapikunj',tag:'Coffee town. The café strip, the coffee estate and Vedshree Kunj.',color:'#8b6a4a',
    b:[-78,-8,-52,26],
    roads:[[-78,-8,-4,4,'x']],
    bus:{x:-12.4,z:8,ry:PI,bx:-17,bz:2.4,bry:PI/2},spawn:{x:-15,z:5.4,yaw:-PI/2},scooter:[-19.5,6.2,0],
    plots:[[-40,-22,-22,-8,'s'],[-74,-62,-48,-30,'s'],[-58,-46,-48,-30,'s'],[-42,-30,-48,-30,'s'],[-26,-14,-48,-30,'s']],
    zones:[['Vedshree Kunj',-62,-32,6,24],['Coffee Estate',-78,-62,6,26],['Café Strip',-78,-8,-6,6]],
    trees:30,flora:'mix'},
  memepura:{ready:true,name:'Memepura',tag:'Meme town. Poster Street, the beach and everyone who is very online.',color:'#ff3b8d',
    b:[12,99,-28,92],
    roads:[[12,99,-4,4,'x']],
    bus:{x:17.4,z:8,ry:PI,bx:21.5,bz:2.4,bry:PI/2},spawn:{x:18,z:5.4,yaw:PI/2},scooter:[27,6.2,0],
    plots:[[42,53,15,24,'n'],[56,67,15,24,'n'],[70,81,15,24,'n'],[84,95,15,24,'n'],[18,30,52,64,'n'],[33,44,52,64,'n'],[18,30,70,82,'n'],[33,44,70,82,'n']],
    zones:[['Poster Street',12,99,-6,12],["Builders' Row",12,99,-28,-6],['Football Pitch',16,46,24,47],['Lagoon & Beach',44,99,40,92]],
    trees:40,flora:'palm',sea:true},
  basti:{ready:true,name:'Political Basti',tag:'Rallies, concerts and promises. Lots of promises.',color:'#8b1e2d',
    b:[-98,16,14,94],
    roads:[[-4,4,14,94,'z']],
    bus:{x:9.6,z:22,ry:-PI/2,bx:3.4,bz:24,bry:0},spawn:{x:6.8,z:20,yaw:0},scooter:[9,33,PI],
    plots:[[-24,-12,74,88,'e'],...[[-94,-82],[-78,-66],[-62,-52]].flatMap(([a,b])=>[[22,34],[40,52],[58,70],[76,88]].map(([c,d])=>[a,b,c,d,'e']))],
    zones:[['Rally Ground',-47,-9,24,69],['School Road',-47,8,69,94],['The Lanes',-98,-48,14,94]],
    trees:50,flora:'mix',lanes:true},
  barfii:{ready:true,name:'Barfii Town',tag:'Snow, chalets, a frozen pond and warm barfi.',color:'#9cc6dd',
    b:[-100,-26,-52,26],
    roads:[[-72,-26,-4,4,'x']],
    bus:{x:-31,z:8,ry:PI,bx:-36,bz:2.4,bry:PI/2},spawn:{x:-33,z:5.4,yaw:-PI/2},scooter:[-40,6.2,0],
    plots:[[-96,-86,-24,-10,'s'],[-82,-72,-24,-10,'s'],[-68,-58,-24,-10,'s'],[-54,-44,-24,-10,'s'],[-40,-30,-24,-10,'s'],
      [-68,-58,11,24,'n'],[-54,-44,11,24,'n'],[-40,-30,11,24,'n'],
      [-96,-84,-48,-32,'s'],[-80,-68,-48,-32,'s'],[-64,-52,-48,-32,'s'],[-48,-36,-48,-32,'s']],
    zones:[['Lookout',-96,-72,-12,9],['Frozen Pond',-98,-78,9,26]],
    trees:70,flora:'pine',snow:true},
  delulugarh:{ready:true,name:'Delulugarh',tag:'Skyscraper city. NTH Labs and a skyline of big dreams.',color:'#3bd1ff',
    b:[-92,92,-156,36],
    roads:[[-92,92,18,26,'x'],[-92,92,-24,-16,'x'],[-92,92,-72,-64,'x'],[-92,92,-120,-112,'x'],[-48,-40,-152,36,'z'],[40,48,-152,36,'z'],[-4,4,-16,18,'z']],
    bus:{x:12,z:29.6,ry:PI,bx:20,bz:22,bry:PI/2},spawn:{x:1.5,z:27.4,yaw:PI},scooter:[-9,28.2,0],
    plots:[],
    zones:[['NTH Labs',-20,20,-64,-26],['Central Lawn',-20,20,-112,-72],['Supertall Row',-92,92,-156,-120]],
    trees:0,flora:'city',city:true}
};
/* 8 beans across the towns. A string first item means "inside that room" (offset from room centre). */
/* all 8 beans are in Vashupur, out in the open on the main streets (index order kept so saved progress still matches) */
export const BEANS=[
  {t:'vashupur',p:[-104,.95,128.7]},   // bus stand pavement, right where you arrive
  {t:'vashupur',p:[30,.95,132.6]},     // outside Meow Club
  {t:'vashupur',p:[86.2,.95,134.6]},   // under the Choupati arch
  {t:'vashupur',p:[141,.95,134.4]},    // Outpulse Museum path
  {t:'vashupur',p:[9,.95,40]},         // pavement outside Outpulse Labs
  {t:'vashupur',p:[125,.95,9]},        // pavement outside PM House
  {t:'vashupur',p:[66,.95,-28.6]},     // Lolu Mall entrance
  {t:'vashupur',p:[-9,.95,60.8]}];     // pavement by the stadium parking

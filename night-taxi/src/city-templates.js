// Eight geographic zones; both HUD and city templates use the same bounds.
export function districtIndex(x,z){
 const col=Math.max(0,Math.min(3,Math.floor((x+400)/200)));
 const row=Math.max(0,Math.min(1,Math.floor((z+400)/400)));
 return row*4+col;
}
export function buildingTemplate(x,z,seed){
 const district=districtIndex(x,z);
 const styles=['office','residential','industrial','waterfront','station','market','abandoned','suburban'];
 const heights=[28,19,10,18,17,12,16,8];
 const extra=[4,3,1,2,2,2,2,1];
 return {district,style:styles[district],height:heights[district]+(seed%5)*extra[district]};
}

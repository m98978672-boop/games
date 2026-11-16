// Map-facing Cartesian coordinates: origin at map centre, +x east, +y north.
// Simulation coordinates and saves remain unchanged (+y points down).
// Distances are world units, not metres or kilometres.
export const MAP_STEPS = Object.freeze([1,2,5,10,25,50,100,250,500,1000,2000,5000]);
export function worldToMap(world, x, y) { return {x:x-world.W/2,y:world.H/2-y}; }
export function mapToWorld(world, x, y) { return {x:x+world.W/2,y:world.H/2-y}; }
export function mapVector(a,b) {
  const x=b.x-a.x,y=a.y-b.y,length=Math.hypot(x,y);
  return {x,y,length,unitX:length?x/length:0,unitY:length?y/length:0};
}
function stepFor(zoom,maxPixels) {
  if (!Number.isFinite(zoom)||zoom<=0) throw new RangeError('zoom must be positive');
  let result=MAP_STEPS[0];
  for(const step of MAP_STEPS) if(step*zoom<=maxPixels) result=step;
  return result;
}
// Same 1/2/5/10/25/... progression and 220px grid target as Ratgrad,
// adapted to this game's uncalibrated world units.
export const gridStep = zoom => stepFor(zoom,220);
export const scaleBarStep = zoom => stepFor(zoom,160);
export function visibleGrid(world,camera,width,height) {
  const z=camera.zoom,step=gridStep(z),halfW=width/(2*z),halfH=height/(2*z);
  const x0=Math.max(0,camera.x-halfW),x1=Math.min(world.W,camera.x+halfW);
  const y0=Math.max(0,camera.y-halfH),y1=Math.min(world.H,camera.y+halfH);
  if(x0>x1||y0>y1)return {step,vertical:[],horizontal:[],bounds:null};
  const minX=x0-world.W/2,maxX=x1-world.W/2,minY=world.H/2-y1,maxY=world.H/2-y0;
  const vertical=[],horizontal=[];
  for(let i=Math.ceil(minX/step);i<=Math.floor(maxX/step);i++)vertical.push({value:i*step,world:i*step+world.W/2});
  for(let i=Math.ceil(minY/step);i<=Math.floor(maxY/step);i++)horizontal.push({value:i*step,world:world.H/2-i*step});
  return {step,vertical,horizontal,bounds:{x0,x1,y0,y1}};
}
// Preserve the point under the cursor, except where world-edge clamping applies.
export function zoomCamera(camera,view,world,nextZoom,anchor,limits={min:0.02,max:1.8}) {
  const z=Math.max(limits.min,Math.min(limits.max,nextZoom));
  const a=anchor||{x:view.width/2,y:view.height/2};
  const wx=camera.x+(a.x-view.width/2)/camera.zoom,wy=camera.y+(a.y-view.height/2)/camera.zoom;
  return {x:Math.max(0,Math.min(world.W,wx-(a.x-view.width/2)/z)),
    y:Math.max(0,Math.min(world.H,wy-(a.y-view.height/2)/z)),zoom:z};
}
export function fitCamera(view,world,limits={min:0.02,max:1.8}) {
  return {x:world.W/2,y:world.H/2,zoom:Math.max(limits.min,Math.min(limits.max,Math.min(view.width/world.W,view.height/world.H)*0.96))};
}

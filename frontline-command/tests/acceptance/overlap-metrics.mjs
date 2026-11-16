// Count frame occurrences separately from unordered pair-frame occurrences.
// Strict radius overlap remains the acceptance criterion; 0.7 is additional.
export function observeOverlaps(units, totals) {
  let strict=0, deep=0, maxOverlap=0;
  for(let i=0;i<units.length;i++)for(let j=i+1;j<units.length;j++){
    const a=units[i],b=units[j],sum=a.radius+b.radius,d=Math.hypot(a.x-b.x,a.y-b.y);
    if(d<sum){strict++;maxOverlap=Math.max(maxOverlap,sum-d);}
    if(d<0.7*sum)deep++;
  }
  if(strict)totals.overlapFrames++;
  if(deep)totals.overlapFrames70++;
  totals.overlapPairFrames+=strict;
  totals.overlapPairFrames70+=deep;
  totals.maxOverlap=Math.max(totals.maxOverlap,maxOverlap);
}
export function emptyOverlapMetrics(){return {overlapFrames:0,overlapPairFrames:0,overlapFrames70:0,overlapPairFrames70:0,maxOverlap:0};}

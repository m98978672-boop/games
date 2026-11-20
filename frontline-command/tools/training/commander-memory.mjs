// Research adapter for the same side-isolated memory shape used by the client.
import {recentOwnOrders,repeatsPending} from '../../src/sim/commander_memory.js';
export {recentOwnOrders,repeatsPending};
export function inputWithMemory(game,snapshot){
 const i=snapshot.input;
 return {squads:i.squads.map(x=>({...x})),points:i.points.map(x=>({...x})),builds:i.builds.map(x=>({...x})),memory:{recent:recentOwnOrders(game,snapshot),experience:[]}};
}

export type FlightKind='landing'|'takeoff';
export const AIRCRAFT_GROUND_Y=3.35;
export const FLIGHT_DURATION={landing:24,takeoff:21};
export function flightPose(kind:FlightKind,seconds:number){
 const t=Math.min(1,Math.max(0,seconds/FLIGHT_DURATION[kind]));
 if(kind==='landing'){
  const airborne=Math.min(1,t/.58),roll=Math.max(0,(t-.58)/.42);
  return {x:t<.58?-108+83*airborne:-25+51*(1-Math.pow(1-roll,2)),y:t<.58?AIRCRAFT_GROUND_Y+18*Math.pow(1-airborne,1.3):AIRCRAFT_GROUND_Y,z:-67,pitch:t<.58?.045:.045*(1-Math.min(1,roll*4)),gear:1,done:t===1,phase:t<.58?'APPROACH':roll<.15?'TOUCHDOWN':'ROLLOUT'};
 }
 const climb=Math.max(0,(t-.63)/.37);
 return {x:-67+170*t*t,y:AIRCRAFT_GROUND_Y+29*Math.pow(climb,1.25),z:-67,pitch:climb>0?Math.min(.16,climb*.45):0,gear:1-Math.min(1,Math.max(0,(t-.78)/.18)),done:t===1,phase:t<.63?'TAKEOFF ROLL':t<.82?'ROTATION':'CLIMB'};
}

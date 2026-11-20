import test from 'node:test';
import assert from 'node:assert/strict';
import { flightPose, FLIGHT_DURATION, AIRCRAFT_GROUND_Y } from '../src/flight.ts';

test('landing stays outside the glass and descends to a stable runway height', () => {
  let previousX = -Infinity,
    previousY = Infinity;
  for (let time = 0; time <= FLIGHT_DURATION.landing; time += 0.1) {
    const pose = flightPose('landing', time);
    assert.equal(pose.z, -67);
    assert.ok(pose.x >= previousX);
    assert.ok(pose.y <= previousY + 0.0001);
    assert.ok(pose.y >= AIRCRAFT_GROUND_Y);
    assert.equal(pose.gear, 1);
    previousX = pose.x;
    previousY = pose.y;
  }
  const end = flightPose('landing', 100);
  assert.equal(end.y, AIRCRAFT_GROUND_Y);
  assert.equal(end.pitch, 0);
  assert.equal(end.done, true);
});
test('takeoff rolls before climbing and only retracts gear after rotation', () => {
  assert.equal(flightPose('takeoff', 5).y, AIRCRAFT_GROUND_Y);
  assert.equal(flightPose('takeoff', 5).gear, 1);
  const rotation = flightPose('takeoff', 15);
  assert.ok(rotation.y > AIRCRAFT_GROUND_Y);
  assert.ok(rotation.pitch > 0);
  assert.equal(rotation.gear, 1);
  const climb = flightPose('takeoff', 20);
  assert.ok(climb.y > rotation.y);
  assert.ok(climb.gear < 1);
  assert.equal(climb.z, -67);
});
test('flight time clamps at both ends', () => {
  for (const kind of ['landing', 'takeoff']) {
    assert.deepEqual(flightPose(kind, -100), flightPose(kind, 0));
    assert.deepEqual(flightPose(kind, 1000), flightPose(kind, FLIGHT_DURATION[kind]));
  }
});

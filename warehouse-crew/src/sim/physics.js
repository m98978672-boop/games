// Rigid-body simulation for cargo. Coordinates are Three.js coordinates (Y is up).
(function (root, factory) {
  var C = typeof module === 'object' && module.exports ? require('../../vendor/cannon-es.min.js') : root.CANNON;
  var api = factory(C);
  if (typeof module === 'object' && module.exports) module.exports = api;
  if (root) root.WarehousePhysics = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function (C) {
  'use strict';
  if (!C) throw new Error('Cannon physics engine is missing');
  function create(layout, dimensions, levels) {
    var world = new C.World({ gravity: new C.Vec3(0, -9.81, 0), allowSleep: true });
    world.solver.iterations = 12;
    world.defaultContactMaterial.friction = 0.45;
    world.defaultContactMaterial.restitution = 0.18;
    var bodies = new Map();
    var ragdolls = new Map();
    var actors = new Map();
    var droplets = new Map();
    var fluidObstacles = new Map();
    var impacts = new Map();
    var forkliftBody = null;
    var fluid = new C.SPHSystem();
    fluid.smoothingRadius = 0.16; fluid.density = 0.3; fluid.speedOfSound = 0.6; fluid.viscosity = 0.002;
    world.subsystems.push(fluid);
    function fixed(x, y, z, sx, sy, sz) {
      var body = new C.Body({ mass: 0, shape: new C.Box(new C.Vec3(sx / 2, sy / 2, sz / 2)) });
      body.position.set(x, y, z); world.addBody(body);
    }
    fixed(0, -0.15, 2.5, 27, 0.3, 24);
    fixed(-12.6, 1.5, 2.5, 0.3, 3, 24);
    fixed(12.6, 1.5, 2.5, 0.3, 3, 24);
    fixed(0, 1.5, -8.65, 25, 3, 0.3);
    fixed(0, 1.5, 14.55, 25, 3, 0.3);
    layout.racks.forEach(function (rack) {
      levels.forEach(function (level) { fixed(rack.x, level.height, 0, 1.24, 0.05, 11.8); });
      // Open shelf fronts leave room for goods; the uprights carry impacts.
      [-5.9, -3.25, 0, 3.25, 5.9].forEach(function (z) {
        fixed(rack.x - 0.59, 1.2, z, 0.1, 2.4, 0.1);
        fixed(rack.x + 0.59, 1.2, z, 0.1, 2.4, 0.1);
      });
    });
    fixed(10.6, 0.48, 0, 1.2, 0.96, 5.2);
    fixed(-10.6, .42, 7.2, .8, .84, 1.9);
    fixed(-6.2, .26, 7.35, 1.8, .52, .54);
    var t = layout.toilet;
    if (t) {
      fixed(t.x - t.w / 2, 1.25, t.y, 0.1, 2.5, t.d);
      fixed(t.x + t.w / 2, 1.25, t.y, 0.1, 2.5, t.d);
      fixed(t.x, 1.25, t.y + t.d / 2, t.w, 2.5, 0.1);
      var side = (t.w - t.doorWidth) / 2;
      fixed(t.x - (t.doorWidth + side) / 2, 1.25, t.y - t.d / 2, side, 2.5, 0.1);
      fixed(t.x + (t.doorWidth + side) / 2, 1.25, t.y - t.d / 2, side, 2.5, 0.1);
    }
    // Standing/walking actors are kinematic: navigation drives them and they
    // impart contact forces to dynamic boxes; walls are enforced by navigation.
    function syncActors(list, dt) {
      var seen = new Set();
      list.forEach(function (wrapper) {
        var actor = wrapper.state && typeof wrapper.state === 'object' ? wrapper.state : wrapper;
        if (!actor || !actor.pos || actor.dead || actor.state === 'down' || actor.onForklift || actor.inToilet || actor.privacy) return;
        seen.add(actor);
        var body = actors.get(actor);
        if (!body) {
          body = new C.Body({ mass: 0, type: C.Body.KINEMATIC, shape: new C.Box(new C.Vec3(.22, .78, .16)) });
          body.position.set(actor.pos.x, .83, actor.pos.y); world.addBody(body); actors.set(actor, body);
        }
        var vx = (actor.pos.x - body.position.x) / Math.max(dt, 1e-6);
        var vz = (actor.pos.y - body.position.z) / Math.max(dt, 1e-6);
        body.velocity.set(vx, 0, vz);
        body.quaternion.setFromAxisAngle(new C.Vec3(0,1,0), -actor.heading || 0);
        body.aabbNeedsUpdate = true;
      });
      actors.forEach(function (body, actor) { if (!seen.has(actor)) { world.removeBody(body); actors.delete(actor); } });
    }
    // The vehicle is navigation-driven but has a moving Cannon collider. It can
    // push loose cargo and contact ragdolls; it is not a wheel/suspension solver.
    function syncForklift(forklift, dt) {
      if (!forklift) {
        if (forkliftBody) world.removeBody(forkliftBody);
        forkliftBody = null; return;
      }
      if (!forkliftBody) {
        forkliftBody = new C.Body({ mass: 0, type: C.Body.KINEMATIC,
          shape: new C.Box(new C.Vec3(.78, .31, .475)) });
        forkliftBody.position.set(forklift.x, .61, forklift.y);
        world.addBody(forkliftBody);
      }
      forkliftBody.velocity.set((forklift.x - forkliftBody.position.x) / Math.max(dt, 1e-6), 0,
        (forklift.y - forkliftBody.position.z) / Math.max(dt, 1e-6));
      forkliftBody.quaternion.setFromAxisAngle(new C.Vec3(0,1,0), -forklift.yaw || 0);
      forkliftBody.aabbNeedsUpdate = true;
    }
    // A constrained articulated body shares the cargo world, so boxes can strike it.
    function beginRagdoll(actor) {
      if (ragdolls.has(actor)) return;
      var parts = {}, joints = [], yaw = -actor.heading;
      var c = Math.cos(yaw), s = Math.sin(yaw);
      function segment(name, dx, height, dz, sx, sy, sz, mass) {
        var body = new C.Body({ mass: mass, shape: new C.Box(new C.Vec3(sx/2, sy/2, sz/2)),
          collisionFilterGroup: 2, collisionFilterMask: 1, linearDamping: 0.08, angularDamping: 0.2,
          allowSleep: true, sleepSpeedLimit: 0.12, sleepTimeLimit: 1 });
        body.position.set(actor.pos.x + c * dx + s * dz, height, actor.pos.y - s * dx + c * dz);
        body.quaternion.setFromAxisAngle(new C.Vec3(0, 1, 0), yaw);
        // Loss of balance is an initial impulse, not a scripted fall pose.
        body.velocity.set(0.4 * s, 0, 0.4 * c);
        world.addBody(body); parts[name] = body;
      }
      segment('pelvis', 0, .87, 0, .32, .22, .23, 12);
      segment('torso', 0, 1.18, 0, .36, .40, .22, 25);
      segment('head', 0, 1.57, 0, .20, .21, .20, 5);
      [-1, 1].forEach(function (side) {
        var suffix = side > 0 ? 'L' : 'R';
        segment('upperArm'+suffix, side*.23, 1.20, 0, .105, .27, .105, 2);
        segment('forearm'+suffix, side*.23, .94, 0, .09, .25, .09, 1.4);
        segment('hand'+suffix, side*.23, .765, 0, .08, .10, .065, .5);
        segment('thigh'+suffix, side*.085, .60, 0, .145, .38, .16, 7);
        segment('shin'+suffix, side*.085, .24, 0, .115, .34, .13, 4);
        segment('foot'+suffix, side*.085, .04, .045, .13, .08, .235, 1);
      });
      function join(a, b, point, cone) {
        var pa = new C.Vec3(actor.pos.x + c*point[0] + s*point[2], point[1], actor.pos.y - s*point[0] + c*point[2]);
        var localA = parts[a].pointToLocalFrame(pa), localB = parts[b].pointToLocalFrame(pa);
        var joint = new C.ConeTwistConstraint(parts[a], parts[b], { pivotA: localA, pivotB: localB,
          axisA: new C.Vec3(0,1,0), axisB: new C.Vec3(0,1,0), angle: cone, twistAngle: 0.45, collideConnected: false });
        world.addConstraint(joint); joints.push(joint);
      }
      join('pelvis','torso',[0,.98,0],.45);
      join('torso','head',[0,1.46,0],.55);
      [-1, 1].forEach(function (side) {
        var suffix = side > 0 ? 'L' : 'R';
        join('torso','upperArm'+suffix,[side*.20,1.34,0],1.0);
        join('upperArm'+suffix,'forearm'+suffix,[side*.23,1.065,0],.9);
        join('forearm'+suffix,'hand'+suffix,[side*.23,.815,0],.45);
        join('pelvis','thigh'+suffix,[side*.085,.79,0],.8);
        join('thigh'+suffix,'shin'+suffix,[side*.085,.41,0],.8);
        join('shin'+suffix,'foot'+suffix,[side*.085,.07,0],.35);
      });
      parts.torso.angularVelocity.set(0.8, 0, 0.25);
      ragdolls.set(actor, { parts: parts, joints: joints });
      actor.ragdoll = {};
      syncRagdolls();
    }
    function endRagdoll(actor) {
      var rag = ragdolls.get(actor);
      if (!rag) return;
      rag.joints.forEach(function (joint) { world.removeConstraint(joint); });
      Object.keys(rag.parts).forEach(function (key) { world.removeBody(rag.parts[key]); });
      ragdolls.delete(actor); actor.ragdoll = null;
    }
    function syncRagdolls() {
      ragdolls.forEach(function (rag, actor) {
        Object.keys(rag.parts).forEach(function (key) {
          var b = rag.parts[key];
          actor.ragdoll[key] = { x:b.position.x, y:b.position.y, z:b.position.z,
            q:{ x:b.quaternion.x, y:b.quaternion.y, z:b.quaternion.z, w:b.quaternion.w } };
        });
      });
    }
    // Separate fluid world mirrors cargo as kinematic obstacles without stepping
    // the cargo simulation twice. Contacts still use the current box transforms.
    function syncFluidObstacles(orders) {
      var seen = new Set();
      orders.forEach(function (o) {
        if (!o.pose || ['ruined', 'missed', 'loaded', 'carried'].indexOf(o.status) !== -1) return;
        seen.add(o);
        var b = fluidObstacles.get(o), d = dimensions[o.size] || dimensions.medium;
        if (!b) {
          b = new C.Body({ mass: 0, type: C.Body.KINEMATIC, shape: new C.Box(new C.Vec3(d.halfW, d.h/2, d.halfD)) });
          world.addBody(b); fluidObstacles.set(o, b);
        }
        b.position.set(o.pose.x, Number.isFinite(o.pose.centerY) ? o.pose.centerY : o.pose.z + d.h/2, o.pose.y);
        if (o.pose.quaternion) b.quaternion.set(o.pose.quaternion.x, o.pose.quaternion.y, o.pose.quaternion.z, o.pose.quaternion.w);
        else b.quaternion.setFromEuler(o.pose.tilt || 0, o.pose.yaw || 0, o.pose.roll || 0, 'XYZ');
        b.aabbNeedsUpdate = true;
      });
      fluidObstacles.forEach(function (b, o) { if (!seen.has(o)) { world.removeBody(b); fluidObstacles.delete(o); } });
    }
    // SPH pressure/viscosity act between fluid particles; collision contacts
    // turn the first surface impact into a decal and remove the particle.
    function stepFluid(items, dt, splash) {
      var active = new Set(items);
      droplets.forEach(function (record, item) {
        if (!active.has(item)) { fluid.remove(record.body); world.removeBody(record.body); droplets.delete(item); }
      });
      items.forEach(function (item) {
        if (droplets.has(item)) return;
        var body = new C.Body({ mass: .0006, shape: new C.Sphere(.035), collisionFilterGroup: 4, collisionFilterMask: 1,
          linearDamping: .02, angularDamping: .05 });
        body.position.set(item.x, item.z, item.y);
        body.velocity.set(item.vx, item.vz, item.vy);
        var record = { body: body, hit: false };
        body.addEventListener('collide', function () { record.hit = true; });
        droplets.set(item, record); fluid.add(body); world.addBody(body);
      });
      var n = Math.max(1, Math.ceil(dt / (1/240)));
      for (var i=0; i<n; i++) world.step(dt/n);
      for (var j=items.length-1; j>=0; j--) {
        var item = items[j], rec = droplets.get(item), b = rec.body;
        item.life -= dt; item.x = b.position.x; item.y = b.position.z; item.z = b.position.y;
        item.vx = b.velocity.x; item.vy = b.velocity.z; item.vz = b.velocity.y;
        if (rec.hit || item.life <= 0 || !Number.isFinite(item.z)) {
          if (rec.hit && Number.isFinite(item.z)) splash(item);
          fluid.remove(b); world.removeBody(b); droplets.delete(item); items.splice(j,1);
        }
      }
    }
    function remove(record) { world.removeBody(record.body); }
    function syncCargo(orders) {
      var active = new Set();
      orders.forEach(function (o) {
        if (!o.pose || ['ruined', 'missed', 'loaded', 'carried'].indexOf(o.status) !== -1) return;
        active.add(o);
        var rec = bodies.get(o);
        var dynamic = !!o._physicalDynamic;
        if (!rec || rec.dynamic !== dynamic || rec.generation !== (o._physicsGeneration || 0)) {
          if (rec) remove(rec);
          var d = dimensions[o.size] || dimensions.medium;
          var body = new C.Body({ mass: dynamic ? Math.max(1, o.mass || 10) : 0,
            shape: new C.Box(new C.Vec3(d.halfW, d.h / 2, d.halfD)),
            linearDamping: 0.08, angularDamping: 0.18, allowSleep: true,
            sleepSpeedLimit: 0.16, sleepTimeLimit: 0.8 });
          body.position.set(o.pose.x, o.pose.z + d.h / 2, o.pose.y);
          body.quaternion.setFromEuler(o.pose.tilt || 0, o.pose.yaw || 0, o.pose.roll || 0, 'XYZ');
          if (!dynamic && o.status !== 'stored') {
            body.addEventListener('collide', function (event) {
              var other = event.body;
              var impact = Math.abs(event.contact.getImpactVelocityAlongNormal());
              if (o.status === 'stored' || !other || impact < 1.0 || !other.velocity) return;
              var prior = impacts.get(o);
              if (!prior || impact > prior.impact) impacts.set(o, { impact: impact,
                vx: other.velocity.x * .45, vy: other.velocity.z * .45, vz: Math.max(.05, other.velocity.y * .3) });
            });
          }
          if (dynamic) {
            body.velocity.set(o.vel.x, o.vel.vz, o.vel.y);
            body.angularVelocity.set(o.vel.spin || 0, (o.vel.spin || 0) * 0.45, 0);
            body.addEventListener('collide', function (event) {
              if (event.contact.getImpactVelocityAlongNormal() > 0.5) o.bounces = (o.bounces || 0) + 1;
            });
          }
          world.addBody(body);
          rec = { body: body, dynamic: dynamic, generation: o._physicsGeneration || 0, dims: d };
          bodies.set(o, rec);
        } else if (!dynamic) {
          rec.body.position.set(o.pose.x, o.pose.z + rec.dims.h / 2, o.pose.y);
          rec.body.quaternion.setFromEuler(o.pose.tilt || 0, o.pose.yaw || 0, o.pose.roll || 0, 'XYZ');
          rec.body.aabbNeedsUpdate = true;
        }
      });
      bodies.forEach(function (rec, o) { if (!active.has(o)) { remove(rec); bodies.delete(o); } });
      return active;
    }
    function step(orders, dt) {
      var active = syncCargo(orders);
      // Adaptive substeps limit displacement per step; this is not full CCD.
      var maxSpeed = 0;
      bodies.forEach(function (r) { if (r.dynamic) maxSpeed = Math.max(maxSpeed, r.body.velocity.length()); });
      var n = Math.max(1, Math.ceil(dt / Math.min(1 / 120, 0.05 / Math.max(1, maxSpeed))));
      n = Math.min(240, n);
      for (var i = 0; i < n; i++) world.step(dt / n);
      impacts.forEach(function (hit, o) {
        if (!active.has(o) || o.status === 'stored' || o.status === 'carried') return;
        o._physicalDynamic = true; o._physicsGeneration = (o._physicsGeneration || 0) + 1;
        o.physics = true; o.grounded = false; o.drops = Math.max(1, o.drops || 0);
        o.intake = null;
        o.vel = { x: hit.vx, y: hit.vy, vz: hit.vz, spin: Math.min(4, hit.impact * .25) };
      });
      impacts.clear();
      syncRagdolls();
      bodies.forEach(function (rec, o) {
        if (!rec.dynamic) return;
        var b = rec.body, q = b.quaternion, d = rec.dims;
        var extY = Math.abs(2 * (q.x * q.y + q.z * q.w)) * d.halfW +
          Math.abs(1 - 2 * (q.x * q.x + q.z * q.z)) * d.h / 2 +
          Math.abs(2 * (q.y * q.z - q.x * q.w)) * d.halfD;
        o.pose.x = b.position.x; o.pose.y = b.position.z;
        o.pose.z = Math.max(0, b.position.y - extY);
        o.pose.quaternion = { x: q.x, y: q.y, z: q.z, w: q.w };
        o.pose.centerY = b.position.y;
        o.pose.lying = extY < d.h * 0.4;
        o.vel = { x: b.velocity.x, y: b.velocity.z, vz: b.velocity.y, spin: b.angularVelocity.x };
        o.x = o.pose.x; o.y = o.pose.y;
        o.physics = b.sleepState !== C.Body.SLEEPING;
        o.grounded = !o.physics;
      });
      return bodies.size;
    }
    function bodyState(b) {
      return { position: { x:b.position.x, y:b.position.y, z:b.position.z },
        quaternion: { x:b.quaternion.x, y:b.quaternion.y, z:b.quaternion.z, w:b.quaternion.w },
        velocity: { x:b.velocity.x, y:b.velocity.y, z:b.velocity.z },
        angularVelocity: { x:b.angularVelocity.x, y:b.angularVelocity.y, z:b.angularVelocity.z },
        sleeping: b.sleepState === C.Body.SLEEPING };
    }
    function applyBodyState(b, saved) {
      if (!saved || !saved.position || !saved.quaternion || !saved.velocity || !saved.angularVelocity) throw new Error('Некорректное физическое тело');
      var v = saved.position, q = saved.quaternion, vel = saved.velocity, ang = saved.angularVelocity;
      if (![v.x,v.y,v.z,q.x,q.y,q.z,q.w,vel.x,vel.y,vel.z,ang.x,ang.y,ang.z].every(Number.isFinite)) throw new Error('Некорректная физика');
      b.position.set(v.x,v.y,v.z); b.quaternion.set(q.x,q.y,q.z,q.w);
      b.velocity.set(vel.x,vel.y,vel.z); b.angularVelocity.set(ang.x,ang.y,ang.z);
      b.aabbNeedsUpdate = true;
      if (saved.sleeping && b.type === C.Body.DYNAMIC) b.sleep(); else b.wakeUp();
    }
    function capturePhysics() {
      var cargo = {}, fallen = {};
      bodies.forEach(function (rec, o) { if (rec.dynamic) cargo[o.id] = bodyState(rec.body); });
      ragdolls.forEach(function (rag, actor) {
        var parts = {};
        Object.keys(rag.parts).forEach(function (name) { parts[name] = bodyState(rag.parts[name]); });
        fallen[actor.id] = parts;
      });
      return { cargo: cargo, fallen: fallen };
    }
    function restorePhysics(saved, orders, workers) {
      saved = saved || { cargo: {}, fallen: {} };
      syncCargo(orders);
      bodies.forEach(function (rec, o) { if (rec.dynamic && saved.cargo && saved.cargo[o.id]) applyBodyState(rec.body, saved.cargo[o.id]); });
      workers.forEach(function (actor) {
        if (actor.state !== 'down') return;
        beginRagdoll(actor);
        var parts = saved.fallen && saved.fallen[actor.id];
        if (parts) Object.keys(ragdolls.get(actor).parts).forEach(function (name) {
          if (!parts[name]) throw new Error('Отсутствует сегмент тела');
          applyBodyState(ragdolls.get(actor).parts[name], parts[name]);
        });
      });
      syncRagdolls();
    }
    return { step: step, world: world, syncActors: syncActors, syncForklift: syncForklift, syncFluidObstacles: syncFluidObstacles, beginRagdoll: beginRagdoll, endRagdoll: endRagdoll, stepFluid: stepFluid, capture: capturePhysics, restore: restorePhysics };
  }
  return { create: create, C: C };
});

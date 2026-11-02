// Физика тягача с полуприцепом: дизель с турбиной, 12-ступенчатая КПП,
// пневматические тормоза, сцепление шин с дорогой, подвеска и сцепка с прицепом.
//
// Что здесь «по-настоящему» (а не «аркадно»):
//  * момент двигателя берётся из кривой по оборотам, а не из константы; турбина
//    раскручивается с задержкой (boost), поэтому газ «отвечает» не мгновенно;
//  * у пневматических тормозов есть ход штока: brakeApplied догоняет педаль за
//    ~0.3 с, воздух расходуется и восполняется компрессором;
//  * тяга ограничена сцеплением: N на ведущей оси падает при разгоне, поэтому
//    на мокром и с грузом колесо буксует (wheelSpin, slip);
//  * поворот считается с недостаточной поворачиваемостью (understeer): чем выше
//    скорость, тем меньше реального угла поворота на тот же ход руля, плюс предел
//    бокового ускорения — тягач физически не может «заложить» на скорости;
//  * подвеска — пружины с демпферами: клевок при торможении, приседание при
//    разгоне, крен в повороте, тряска на неровностях (позиция влияет на кузов);
//  * полуприцеп — кинематика Рауса: срезает поворот, складывается на заднем ходу.
import { clamp, lerp, smoothstep } from './math.js';

const G = 9.81;
const RHO = 1.225;
const WHEEL_R = 0.52; // м, радиус колеса
const WHEELBASE = 4.1; // м
const HITCH_OFFSET = 1.15; // м, задняя ось → седло
const TRAILER_BASE = 8.9; // м, седло → оси прицепа

export const GEAR_RATIOS = [11.32, 8.42, 6.52, 5.11, 4.06, 3.24, 2.62, 2.09, 1.68, 1.34, 1.0, 0.78];

export class TruckSim {
  constructor(config = {}) {
    this.model = config.model || { hp: 460, tank: 480, consumption: 31, gears: 12, finalDrive: 2.85, topSpeed: 89 };
    this.upgradePower = config.upgradePower || 1;
    this.tireGrip = config.tireGrip || 1;
    this.retarder = config.retarder || 0;
    this.cargoMass = config.cargoMass ?? 0; // тонн
    this.reset(config);
  }

  reset(config = {}) {
    this.cargoMass = config.cargoMass ?? this.cargoMass ?? 0;
    this.s = config.s ?? 0;
    this.lat = config.lat ?? 2.0;
    this.speed = 0;
    this.yawRel = 0;
    this.steer = 0;
    this.gear = 0;
    this.gearTimer = 0;
    this.rpm = 620;
    this.throttle = 0;
    this.brake = 0;
    this.brakeApplied = 0;
    this.engineOn = false;
    this.fuel = config.fuel ?? this.model.tank;
    this.fuelCapacity = this.model.tank;
    this.engine = config.engine ?? 100;
    this.tires = config.tires ?? 100;
    this.brakes = config.brakes ?? 100;
    this.temp = 40;
    this.odometer = config.odometer ?? 0;
    this.autoGearbox = true;
    this.handbrake = true;
    this.airPressure = 1;
    this.boost = 0;
    this.engineLoad = 0;
    this.latAccel = 0;
    this.longAccel = 0;
    this.wheelSpin = 0;
    this.trailerYaw = 0;
    this.trailerYawOffset = 0;
    this.trailerSway = 0;
    this.trailerRoll = 0;
    this.heave = 0;
    this.heaveVel = 0;
    this.pitchVel = 0;
    this.rollVel = 0;
    this.pitch = 0;
    this.roll = 0;
    this.bounce = 0;
    this.slip = 0;
    this.limitSpeed = 89;
    this.lastShift = 0;
    this.impact = 0;
    this.jackknife = 0;
    this.wetness = 0;
    this.fatigue = 0;
    this.cruise = null;
    this.cruiseTarget = 0;
    this.engineBrake = 0;
    this.gearHold = 0;
    this.time = 0;
    this.distPhase = 0;
    this.exhaustBrake = false;
  }

  get mass() {
    return 7800 + 6800 + this.cargoMass * 1000;
  }

  get powerW() {
    return this.model.hp * 735.5 * this.upgradePower;
  }

  get maxSpeedLimit() {
    return this.model.topSpeed || 89;
  }

  get gearRatio() {
    if (this.gear === 0) return 0;
    if (this.gear === -1) return -9.5;
    return GEAR_RATIOS[clamp(this.gear - 1, 0, 11)];
  }

  /** Максимальный момент на валу (Н·м) — из мощности на номинальных оборотах. */
  get maxTorque() {
    return ((this.powerW * 0.86) / 1300) / ((2 * Math.PI) / 60);
  }

  /** Нормированная кривая момента дизеля: полка 1050–1550, спад к 2400. */
  torqueCurve(rpm) {
    const r = clamp(rpm, 550, 2450);
    if (r < 1050) return lerp(0.55, 1, smoothstep((r - 550) / 500));
    if (r < 1550) return 1;
    return lerp(1, 0.45, smoothstep((r - 1550) / 850));
  }

  /** Тяга на колёсах (Н) — с учётом турбины, передачи, потерь и износа. */
  get wheelForce() {
    if (!this.engineOn || this.gear === 0) return 0;
    const torque = this.maxTorque * this.torqueCurve(this.rpm) * (0.68 + 0.32 * this.boost) * (0.55 + 0.45 * (this.engine / 100));
    return (torque * this.gearRatio * this.model.finalDrive * 0.92) / WHEEL_R;
  }

  shiftUp() {
    if (this.gear < 12) {
      this.gear = Math.max(1, this.gear + 1);
      this.gearTimer = 0.42;
      this.lastShift = 0.42;
    }
  }

  shiftDown() {
    if (this.gear > -1) {
      this.gear = this.gear === 1 ? 0 : this.gear - 1;
      this.gearTimer = 0.34;
      this.lastShift = 0.34;
    }
  }

  toggleReverse() {
    if (Math.abs(this.speed) > 1.2) return false;
    this.gear = this.gear === -1 ? 0 : -1;
    this.gearTimer = 0.34;
    return true;
  }

  toggleEngine() {
    if (!this.engineOn) {
      this.engineOn = true;
      this.handbrake = false;
      this.rpm = 620;
    } else {
      this.engineOn = false;
      this.speed = 0;
      this.gear = 0;
      this.boost = 0;
    }
  }

  /**
   * @param {number} dt секунды (фиксированный шаг)
   * @param {{throttle:number,brake:number,steer:number,assist?:boolean,retarder?:boolean}} input
   * @param {{curv:number, grade:number, speedLimit:number, bank?:number, roughness?:number}} road
   */
  step(dt, input, road) {
    const model = this.model;
    const maxGear = model.gears || 12;
    this.time += dt;
    this.throttle = clamp(input.throttle, 0, 1);
    this.brake = clamp(input.brake, 0, 1);
    this.limitSpeed = Math.min(this.maxSpeedLimit, road.speedLimit || 80);
    const v = this.speed;

    // ------------------------------------------------------------------ руль
    // Чем быстрее едем, тем меньше максимальный угол колёс — иначе на 80 км/ч
    // любое касание руля выкидывает с трассы. Отклик — первый порядок ~50 мс.
    const steerInput = clamp(input.steer, -1, 1);
    const maxAngle = lerp(0.6, 0.085, clamp(Math.abs(v) / 25, 0, 1));
    const target = steerInput * maxAngle;
    this.steer += (target - this.steer) * (1 - Math.exp(-dt * 17));

    if (this.gearTimer > 0) this.gearTimer = Math.max(0, this.gearTimer - dt);
    if (this.lastShift > 0) this.lastShift = Math.max(0, this.lastShift - dt);

    // ------------------------------------------------------------- двигатель
    const idle = 600 + (this.temp < 60 ? 80 : 0);
    if (this.engineOn) {
      const wheelRpm = (v / WHEEL_R) * this.gearRatio * model.finalDrive * (60 / (2 * Math.PI));
      // На трогании сцепление проскальзывает: обороты держит водитель/автоматика.
      const launch = clamp(1 - Math.abs(v) / 4, 0, 1);
      const slipTarget = idle + this.throttle * 900 * launch;
      const engaged = this.gear !== 0;
      const fromWheels = engaged ? Math.abs(wheelRpm) : 0;
      const wanted = Math.max(engaged ? fromWheels : idle, slipTarget, this.gear === 0 ? idle + this.throttle * 1200 : 0);
      // Инерция коленвала: обороты не прыгают мгновенно.
      this.rpm += (wanted - this.rpm) * (1 - Math.exp(-dt * 7));
      this.rpm = clamp(this.rpm, idle - 30, 2400);
    } else {
      this.rpm = Math.max(0, this.rpm - dt * 900);
      this.boost = Math.max(0, this.boost - dt * 2);
    }

    // Турбина: раскручивается ~0.5 с, сбрасывается быстрее.
    const wantBoost = this.engineOn ? this.throttle * clamp(this.rpm / 1300, 0.2, 1) : 0;
    const boostTau = wantBoost > this.boost ? 0.5 : 0.22;
    this.boost += (wantBoost - this.boost) * (1 - Math.exp(-dt / boostTau));

    // Автоматическая КПП: переключения по оборотам с паузой после смены
    // (без выдержки коробка «охотится»: вверх-вниз на каждой передаче).
    if (this.autoGearbox && this.engineOn) {
      if (this.gear === -1) {
        if (Math.abs(v) < 0.2 && this.throttle < 0.03) this.gear = 0;
      } else if (this.gear === 0 && this.throttle > 0.05) {
        this.gear = 1;
        this.gearTimer = 0.28;
        this.gearHold = 0.7;
      }
      if (this.gearHold > 0) this.gearHold -= dt;
      if (this.gearTimer <= 0 && this.gear > 0 && this.gearHold <= 0) {
        const up = 1580 + this.throttle * 260;
        const down = 980 - this.throttle * 40;
        if (this.rpm > up && this.gear < maxGear) {
          this.shiftUp();
          this.gearHold = 0.9;
        } else if (this.rpm < down && this.gear > 1 && this.rpm * 1.34 < 2150) {
          this.shiftDown();
          this.gearHold = 0.9;
        } else if (Math.abs(v) < 0.6 && this.throttle < 0.05) {
          this.gear = 0;
        }
      }
    }

    // ------------------------------------------------------------------ силы
    const m = this.mass;
    const grade = road.grade || 0;
    const wetGrip = 1 - clamp(this.wetness || 0, 0, 1) * 0.28;
    const tyreFactor = 0.62 + 0.38 * (this.tires / 100);
    const mu = 0.78 * this.tireGrip * tyreFactor * wetGrip;

    // Пневматика: педаль догоняется штоком, запас воздуха тратится и качается.
    const appRate = this.brake > this.brakeApplied ? 3.4 : 5.0;
    this.brakeApplied += clamp(this.brake - this.brakeApplied, -appRate * dt, appRate * dt);
    const airOk = clamp(this.airPressure, 0, 1);
    const airFactor = 0.55 + 0.45 * airOk;
    if (this.engineOn) this.airPressure = clamp(this.airPressure + dt * 0.05 - this.brakeApplied * dt * 0.02, 0.35, 1);

    const driveWanted = this.gearTimer > 0 || !this.engineOn ? 0 : this.wheelForce * this.throttle;
    // Разгон перераспределяет вес назад (на ведущую ось), торможение — вперёд.
    const rearShare = clamp(0.62 + (this.longAccel / G) * 0.35, 0.28, 0.9);
    const rearLoad = m * G * rearShare;
    const traction = Math.max(1500, mu * rearLoad);
    const demand = Math.abs(driveWanted);
    const spinRaw = demand > traction ? clamp(demand / traction - 1, 0, 1.5) : 0;
    this.wheelSpin = lerp(this.wheelSpin, clamp(spinRaw, 0, 1), Math.min(1, dt * 5));
    // Антипробуксовочная система душит момент, как на настоящем тягаче.
    const asr = 1 - this.wheelSpin * 0.55;
    const drive = Math.sign(driveWanted) * Math.min(demand, traction * 1.05) * asr;

    const absV = Math.abs(v);
    const rolling = absV > 0.05 ? 0.0058 * m * G * (1 - Math.min(0.3, absV / 120)) : 0;
    const aero = 0.5 * RHO * 7.4 * v * absV;
    const brakeForce = this.brakeApplied * airFactor * m * G * 0.62 * (0.62 + 0.38 * (this.brakes / 100));
    const parkBrake = this.handbrake ? m * G * 0.3 : 0;
    // Горный тормоз работает только при сброшенном газе (как заслонка в выпуске).
    const idleGas = (input.throttle || 0) < 0.08;
    const brakeMode = this.exhaustBrake && idleGas ? 1 : this.brakeApplied > 0.05 || input.retarder ? 0.55 : 0;
    const retarderForce = this.retarder * brakeMode * m * G * 0.16 * clamp(1 - (this.speed || 0) / 90, 0.15, 1);
    const gravity = m * G * Math.sin(grade);
    const engineBraking =
      this.throttle < 0.03 && v > 2 && this.gear > 0 ? m * G * 0.028 * clamp(this.rpm / 1200, 0.5, 1.6) : 0;
    // Круиз-контроль.
    if (this.cruise != null && this.gear > 0) {
      const targetKm = clamp(this.cruise, 20, Math.min(this.maxSpeedLimit, road.speedLimit));
      const err = targetKm / 3.6 - v;
      if (this.brake > 0.05) this.cruise = null;
      else if (err > 0.2) this.throttle = clamp(err * 0.3, 0, 0.9);
      else if (err < -0.3) this.throttle = 0;
    }
    // Ползучий режим автомата: без газа машина сама крадётся ~2 км/ч.
    const creep = this.autoGearbox && this.engineOn && this.gear > 0 && this.throttle < 0.05 && this.brakeApplied < 0.05 && v < 1.4 ? 1 : 0;

    let net = drive - gravity - engineBraking;
    if (absV > 0.05) net -= rolling + aero * Math.sign(v);
    net -= brakeForce * Math.sign(v || 1) + parkBrake * Math.sign(v || 1) + retarderForce * Math.sign(v || 1);
    if (creep) net += m * 0.22;

    if (absV < 0.35 && (brakeForce > 0 || this.handbrake)) {
      this.speed = 0;
    } else {
      this.speed += (net / m) * dt;
    }
    if (this.speed < 0 && absV < 0.12 && drive >= 0) this.speed = 0;

    const hard = this.maxSpeedLimit / 3.6;
    if (this.speed > hard + 2) this.speed = lerp(this.speed, hard + 2, 0.25);
    if (Math.abs(this.speed) < 0.02 && this.throttle < 0.02 && !creep) this.speed = 0;

    // ------------------------------------------------------- продольное движение
    this.s += this.speed * dt;

    // ------------------------------------------------------------ боковая динамика
    const fatigueFactor = 1 - clamp((this.fatigue || 0) / 100, 0, 1) * 0.22;
    const bank = road.bank || 0;
    // Боковое сцепление: сухой асфальт ≈0.4 g, мокрый меньше, вираж помогает.
    const maxLat = (G * (0.42 + Math.abs(Math.tan(bank))) * (mu / 0.78)) * fatigueFactor;
    const speedAbs = Math.abs(this.speed);
    const yawLimit = speedAbs > 1 ? maxLat / speedAbs : 2.4;
    // Недостаточная поворачиваемость: с ростом скорости тот же руль даёт меньший
    // реальный радиус (передние шины уходят в снос).
    const understeer = 1 + 0.0026 * speedAbs * speedAbs;
    const rawYaw = (this.speed * Math.tan(this.steer / understeer)) / WHEELBASE;
    const yawFromSteer = -yawLimit * Math.tanh(rawYaw / yawLimit);
    // Автопомощь в кривых — только если игрок её включил (на ПК по умолчанию нет).
    const assist = input.assist === false ? 0 : 0.45;
    const drift = (road.curv || 0) * this.speed * (1 - assist);
    this.yawRel += (yawFromSteer - drift) * dt;
    this.yawRel *= 1 / (1 + dt * 3.2); // шины гасят рыскание
    this.yawRel = clamp(this.yawRel, -0.55, 0.55);

    this.lat += this.yawRel * this.speed * dt;
    this.latAccel = -this.yawRel * this.speed;

    // Обочина: сброс скорости и тряска.
    const edge = 2.9;
    if (Math.abs(this.lat) > edge + 0.9) {
      const dir = Math.sign(this.lat);
      this.speed *= 1 - 0.9 * dt;
      this.yawRel -= dir * 1.6 * dt;
      this.slip = clamp((Math.abs(this.lat) - edge) / 3, 0, 1);
    } else {
      this.slip = 0;
      // Автовозврат к полосе — только при включённой помощи (телефон).
      if (input.assist !== false && Math.abs(steerInput) < 0.06 && Math.abs(this.lat) > 1.5) {
        this.lat -= Math.sign(this.lat) * 0.34 * dt;
      }
    }
    this.lat = clamp(this.lat, -7.5, 7.5);

    // ------------------------------------------------------------------ прицеп
    const phi = this.trailerYawOffset;
    const phiDot =
      this.yawRel * (1 + (HITCH_OFFSET / TRAILER_BASE) * Math.cos(phi)) - (this.speed / TRAILER_BASE) * Math.sin(phi);
    const prevPhi = this.trailerYawOffset;
    this.trailerYawOffset += phiDot * dt;
    const swayKick = (this.trailerYawOffset - prevPhi) / Math.max(dt, 1e-4);
    this.trailerSway += (swayKick - this.trailerSway * (2.6 + Math.abs(this.speed) * 0.12)) * dt;
    this.trailerSway = clamp(this.trailerSway, -0.9, 0.9);
    this.trailerYawOffset += this.trailerSway * dt * 0.35;
    const maxArt = 1.32;
    if (Math.abs(this.trailerYawOffset) > maxArt) {
      this.trailerYawOffset = clamp(this.trailerYawOffset, -maxArt, maxArt);
      this.trailerSway *= 0.4;
      this.speed *= 1 - 0.9 * dt;
      this.jackknife = Math.min(1, this.jackknife + dt * 2.2);
    } else {
      this.jackknife = Math.max(0, this.jackknife - dt * 1.6);
    }
    const trailerLat = this.speed * this.yawRel;
    this.trailerRoll = lerp(this.trailerRoll, clamp(-trailerLat * 0.016 - this.trailerSway * 0.05, -0.1, 0.1), Math.min(1, dt * 5));
    this.trailerYaw = this.yawRel + this.trailerYawOffset;

    // ------------------------------------------------------------------ подвеска
    const rough = clamp(road.roughness ?? 0.12, 0, 1);
    this.distPhase += Math.abs(this.speed) * dt;
    const excite =
      Math.sin(this.distPhase * 1.7) * 0.6 + Math.sin(this.distPhase * 4.3 + 1.1) * 0.3 + Math.sin(this.distPhase * 9.1) * 0.1;
    const heaveTarget = excite * 0.008 * rough * clamp(Math.abs(this.speed) / 16, 0, 1);
    this.heaveVel += ((heaveTarget - this.heave) * 120 - this.heaveVel * 14) * dt;
    this.heave += this.heaveVel * dt;
    this.heave = clamp(this.heave, -0.09, 0.09);
    this.bounce = this.heave;

    const accelNow = (this.speed - (this.prevSpeed ?? this.speed)) / Math.max(dt, 1e-4);
    this.longAccel = lerp(this.longAccel, accelNow, Math.min(1, dt * 6));
    this.prevSpeed = this.speed;
    // Клевок при торможении и приседание при разгоне + профиль дороги.
    const pitchTarget = clamp(-Math.asin(clamp(grade, -1, 1)) - this.longAccel * 0.006, -0.14, 0.14);
    this.pitchVel += ((pitchTarget - this.pitch) * 70 - this.pitchVel * 11) * dt;
    this.pitch += this.pitchVel * dt;
    // Крен: боковое ускорение + уклон виража.
    const rollTarget = clamp(-this.latAccel * 0.016 + bank * 0.85, -0.09, 0.09);
    this.rollVel += ((rollTarget - this.roll) * 60 - this.rollVel * 10) * dt;
    this.roll += this.rollVel * dt;
    if (this.impact > 0) this.impact = Math.max(0, this.impact - dt * 1.5);

    // ------------------------------------------------- расход, температура, износ
    const load = clamp(this.throttle * (0.35 + clamp(this.rpm / 2200, 0, 1)) + Math.abs(this.speed) * 0.004, 0, 1);
    this.engineLoad = load;
    const targetTemp = 62 + load * 46 + (this.engine < 50 ? 12 : 0);
    this.temp += ((targetTemp - this.temp) * dt) / 24;
    if (this.engineOn) {
      const fuelPerHour =
        1.2 + (this.model.consumption / 100) * Math.max(0, this.speed * 3.6) * (0.5 + load) * (1 + this.cargoMass / 45);
      this.fuel = Math.max(0, this.fuel - (fuelPerHour * dt) / 3600);
      if (this.fuel <= 0) {
        this.engineOn = false;
        this.throttle = 0;
      }
      this.odometer += Math.abs(this.speed) * dt;
      if (this.temp > 108) this.engine = Math.max(0, this.engine - dt * 1.4);
      if (this.brakeApplied > 0.3) this.brakes = Math.max(0, this.brakes - dt * 0.02 * this.brakeApplied);
      this.engine = Math.max(0, this.engine - Math.abs(this.speed) * dt * 0.000012 * (1 + Math.max(0, this.temp - 95) / 20));
      this.tires = Math.max(0, this.tires - Math.abs(this.speed) * dt * 0.000009);
    }

    return this;
  }

  status() {
    return {
      speedKmh: Math.abs(this.speed) * 3.6,
      rpm: this.rpm,
      gear: this.gear,
      fuel: this.fuel,
      fuelPct: this.fuel / this.fuelCapacity,
      temp: this.temp,
      engine: this.engine,
      tires: this.tires,
      brakes: this.brakes,
      s: this.s,
      lat: this.lat,
      odometer: this.odometer,
      throttle: this.throttle,
      brake: this.brakeApplied,
      load: this.engineLoad,
      boost: this.boost,
      air: this.airPressure,
      latAccel: this.latAccel,
      slip: this.wheelSpin,
    };
  }
}

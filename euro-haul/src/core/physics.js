// Физика тягача с полуприцепом: двигатель, 12-ступенчатая КПП, тормоза, сцепление с дорогой.
import { clamp, lerp, smoothstep } from './math.js';

const G = 9.81;
const RHO = 1.225;

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
    this.rpm = 700;
    this.throttle = 0;
    this.brake = 0;
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
    this.trailerYaw = 0;
    this.trailerYawOffset = 0;
    this.trailerSway = 0;
    this.trailerRoll = 0;
    this.bounce = 0;
    this.wheelSpin = 0;
    this.slip = 0;
    this.pitch = 0;
    this.roll = 0;
    this.limitSpeed = 89;
    this.lastShift = 0;
    this.impact = 0;
    this.jackknife = 0;
    this.wetness = 0;
    this.fatigue = 0;
    this.cruise = null;
    this.cruiseTarget = 0;
    this.engineBrake = 0;
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

  get wheelForce() {
    if (!this.engineOn || this.gear === 0) return 0;
    const torqueMax = (this.powerW * 0.82) / (1250 * (2 * Math.PI) / 60);
    const r = clamp(this.rpm, 600, 2100);
    // Кривая момента: полка 1100–1500 об/мин.
    const curve = 0.45 + 0.55 * smoothstep((r - 600) / 500) * (r > 1700 ? clamp(1 - (r - 1700) / 700, 0.5, 1) : 1);
    const torque = torqueMax * curve * (this.engine / 100);
    return (torque * this.gearRatio * this.model.finalDrive * 0.9) / 0.52;
  }

  shiftUp() {
    if (this.gear < 12) {
      this.gear = Math.max(1, this.gear + 1);
      this.gearTimer = 0.35;
      this.lastShift = 0.35;
    }
  }

  shiftDown() {
    if (this.gear > -1) {
      this.gear = this.gear === 1 ? 0 : this.gear - 1;
      this.gearTimer = 0.3;
      this.lastShift = 0.3;
    }
  }

  toggleReverse() {
    if (Math.abs(this.speed) > 1.2) return false;
    this.gear = this.gear === -1 ? 0 : -1;
    this.gearTimer = 0.3;
    return true;
  }

  toggleEngine() {
    if (!this.engineOn) {
      this.engineOn = true;
      this.handbrake = false;
    } else {
      this.engineOn = false;
      this.speed = 0;
      this.gear = 0;
    }
  }

  /**
   * @param {number} dt секунды (фиксированный шаг)
   * @param {{throttle:number,brake:number,steer:number}} input -1..1
   * @param {{curv:number, grade:number, speedLimit:number}} road
   */
  step(dt, input, road) {
    const model = this.model;
    const maxGear = model.gears || 12;
    this.throttle = clamp(input.throttle, 0, 1);
    this.brake = clamp(input.brake, 0, 1);
    this.limitSpeed = Math.min(this.maxSpeedLimit, road.speedLimit || 80);

    // Руль: угол зависит от скорости, но отклик остаётся линейным в начале хода.
    const steerInput = clamp(input.steer, -1, 1);
    const maxAngle = lerp(0.55, 0.1, clamp(Math.abs(this.speed) / 24, 0, 1));
    const target = steerInput * maxAngle;
    // Первый порядок, ~70 мс: руль «тяжелеет», но не запаздывает как раньше.
    const follow = 1 - Math.exp(-dt * 19);
    this.steer += (target - this.steer) * follow;

    if (this.gearTimer > 0) this.gearTimer = Math.max(0, this.gearTimer - dt);
    if (this.lastShift > 0) this.lastShift = Math.max(0, this.lastShift - dt);

    // Автоматическая КПП.
    if (this.autoGearbox && this.engineOn) {
      if (this.gear === -1) {
        if (Math.abs(this.speed) < 0.2 && this.throttle < 0.03) this.gear = 0;
        this.rpm = clamp(700 + this.throttle * 900, 650, 2400);
      } else if (this.gear === 0 && this.throttle > 0.05) this.gear = 1;
      const wheelRpm = (this.speed / 0.52) * this.gearRatio * model.finalDrive * (60 / (2 * Math.PI));
      if (this.gear > 0) this.rpm = clamp(Math.max(wheelRpm, 650), 650, 2400);
      if (this.gearTimer <= 0 && this.gear > 0) {
        if (this.rpm > 1750 && this.gear < maxGear) this.shiftUp();
        else if (this.rpm < 950 && this.gear > 1) this.shiftDown();
        else if (this.gear > 0 && this.speed < 1.2 && this.throttle < 0.1) this.gear = 0;
      }
    } else if (this.engineOn) {
      const wheelRpm = (this.speed / 0.52) * this.gearRatio * model.finalDrive * (60 / (2 * Math.PI));
      this.rpm = clamp(Math.max(Math.abs(wheelRpm), 600 + this.throttle * 900), 600, 2400);
    } else {
      this.rpm = clamp(this.rpm - dt * 700, 0, 2400);
    }
    if (this.gearTimer > 0) this.rpm *= 0.9;

    // Силы.
    const v = this.speed;
    const m = this.mass;
    const grade = road.grade || 0;
    const wetGrip = 1 - clamp(this.wetness || 0, 0, 1) * 0.26;
    const grip =
      this.tireGrip * (0.55 + 0.45 * (this.tires / 100)) * (1 - Math.min(0.25, Math.abs(v) / 90)) * wetGrip;
    let accel = 0;

    const drive = this.gearTimer > 0 ? 0 : this.wheelForce * this.throttle * grip;
    const rolling = 0.0065 * m * G * Math.sign(v || 1) * (this.brake > 0.02 ? 0 : 1);
    const aero = 0.5 * RHO * 7.4 * v * Math.abs(v);
    const brakeForce =
      (this.handbrake ? 1 : this.brake) * m * G * 0.78 * (0.4 + 0.6 * (this.brakes / 100)) * (0.82 + 0.18 * wetGrip);
    const retarderForce = this.retarder * (this.brake > 0.05 ? 1 : 0) * m * G * 0.22;
    const gravity = m * G * Math.sin(grade);
    const engineBrake = (this.throttle < 0.03 && v > 2 && this.gear > 0 ? 1 : 0) * m * G * 0.055 * (this.rpm / 1500);

    let net = drive - aero - gravity - engineBrake;
    if (Math.abs(v) > 0.05) net -= rolling;
    net -= brakeForce + retarderForce;

    // Тормоз не должен разгонять машину назад.
    if (Math.abs(v) < 0.4 && (brakeForce > 0 || this.handbrake)) {
      net = 0;
      this.speed = 0;
    } else {
      this.speed += (net / m) * dt;
    }

    // Аэродинамический ограничитель и ограничитель тягача.
    // Ограничитель тягача (не ограничение дороги): превышать разрешённую скорость можно.
    const hard = this.maxSpeedLimit / 3.6;
    if (this.speed > hard + 3) this.speed = lerp(this.speed, hard + 3, 0.2);

    if (this.speed < 0.02 && this.throttle < 0.02) this.speed = 0;

    // Круиз-контроль.
    if (this.cruise != null && this.gear > 0) {
      const targetKm = clamp(this.cruise, 20, Math.min(this.maxSpeedLimit, road.speedLimit));
      const err = targetKm / 3.6 - this.speed;
      if (this.brake > 0.05) this.cruise = null;
      else if (err > 0.2) this.throttle = clamp(err * 0.3, 0, 0.9);
      else if (err < -0.3) this.throttle = 0;
    }

    // Продольное движение.
    this.s += this.speed * dt;

    // Боковая динамика: поворот руля + инерция в повороте.
    const wheelbase = 4.1;
    // Сцепление шин ограничивает скорость поворота: тягач не может «заложить» на скорости.
    const fatigueFactor = 1 - clamp((this.fatigue || 0) / 100, 0, 1) * 0.25;
    const maxLatAccel = 3.1 * grip * fatigueFactor;
    const yawLimit = Math.abs(this.speed) > 1 ? maxLatAccel / Math.abs(this.speed) : 2;
    // Мягкое насыщение вместо жёсткого clamp: малые углы руля дают малую скорость
    // поворота (как в жизни), но за предел сцепления машина не выходит.
    const rawYaw = (this.speed * Math.tan(this.steer)) / wheelbase;
    // Знак: положительный steer (D) уводит тягач вправо по экрану (-x мира).
    const yawFromSteer = -yawLimit * Math.tanh(rawYaw / yawLimit);
    // Помощь в поворотах можно выключить в настройках.
    const assist = input.assist === false ? 0 : 0.45;
    const drift = (road.curv || 0) * this.speed * (1 - assist);
    this.yawRel += (yawFromSteer - drift) * dt;
    this.yawRel *= 1 / (1 + dt * 3.4); // шины гасят рыскание
    this.yawRel = clamp(this.yawRel, -0.55, 0.55);

    this.lat += this.yawRel * this.speed * dt;

    // Отклонение от дороги.
    const edge = 2.9;
    if (Math.abs(this.lat) > edge + 0.9) {
      const dir = Math.sign(this.lat);
      this.speed *= 1 - 0.9 * dt;
      this.yawRel -= dir * 1.6 * dt;
      this.slip = clamp((Math.abs(this.lat) - edge) / 3, 0, 1);
    } else {
      this.slip = 0;
      // Автовозврат к удобной полосе при слабом рулении (помощь новичкам).
      if (input.assist !== false && Math.abs(steerInput) < 0.06 && Math.abs(this.lat) > 1.5) {
        this.lat -= Math.sign(this.lat) * 0.34 * dt;
      }
    }
    this.lat = clamp(this.lat, -7.5, 7.5);

    // --- Полуприцеп: кинематика сцепки (модель Рауса).
    // Седельно-сцепное устройство стоит позади задней оси тягача, оси прицепа — ещё
    // дальше; из-за этого прицеп «срезает» поворот и складывается при заднем ходе.
    const hitchOffset = 1.15; // м: задняя ось → седло
    const trailerBase = 8.9; // м: седло → оси прицепа
    const phi = this.trailerYawOffset; // угол складывания (ψ − θ)
    // φ' = ψ'(1 + a/L·cosφ) − (v/L)·sinφ
    const phiDot = this.yawRel * (1 + (hitchOffset / trailerBase) * Math.cos(phi)) - (this.speed / trailerBase) * Math.sin(phi);
    const prevPhi = this.trailerYawOffset;
    this.trailerYawOffset += phiDot * dt;
    // Раскачка: свободная степень свободы гасится трением, но на скорости подхватывает.
    const swayKick = (this.trailerYawOffset - prevPhi) / Math.max(dt, 1e-4);
    this.trailerSway += (swayKick - this.trailerSway * (2.6 + Math.abs(this.speed) * 0.12)) * dt;
    this.trailerSway = clamp(this.trailerSway, -0.9, 0.9);
    this.trailerYawOffset += this.trailerSway * dt * 0.35;
    // Предел складывания: дальше сцепка не пускает, скорость гасится.
    const maxArt = 1.32;
    if (Math.abs(this.trailerYawOffset) > maxArt) {
      this.trailerYawOffset = clamp(this.trailerYawOffset, -maxArt, maxArt);
      this.trailerSway *= 0.4;
      this.speed *= 1 - 0.9 * dt;
      this.jackknife = Math.min(1, this.jackknife + dt * 2.2);
    } else {
      this.jackknife = Math.max(0, this.jackknife - dt * 1.6);
    }
    // Крен прицепа в повороте и подрагивание на неровностях.
    const trailerLat = this.speed * this.yawRel;
    this.trailerRoll = lerp(this.trailerRoll, clamp(-trailerLat * 0.014 - this.trailerSway * 0.05, -0.09, 0.09), Math.min(1, dt * 5));
    this.trailerYaw = this.yawRel + this.trailerYawOffset;

    // Температура, износ и расход.
    const load = this.throttle * (0.5 + Math.abs(this.speed) / 60);
    const targetTemp = 62 + load * 48 + (this.engine < 50 ? 12 : 0);
    this.temp += ((targetTemp - this.temp) * dt) / 22;
    if (this.engineOn) {
      const fuelPerHour =
        1.4 + (this.model.consumption / 100) * Math.max(0, this.speed * 3.6) * (0.55 + load) * (1 + this.cargoMass / 45);
      this.fuel = Math.max(0, this.fuel - (fuelPerHour * dt) / 3600);
      if (this.fuel <= 0) {
        this.engineOn = false;
        this.throttle = 0;
      }
      this.odometer += Math.abs(this.speed) * dt;
      if (this.temp > 108) this.engine = Math.max(0, this.engine - dt * 1.4);
      if (this.brake > 0.3) this.brakes = Math.max(0, this.brakes - dt * 0.02 * this.brake);
      this.engine = Math.max(0, this.engine - Math.abs(this.speed) * dt * 0.000012 * (1 + Math.max(0, this.temp - 95) / 20));
      this.tires = Math.max(0, this.tires - Math.abs(this.speed) * dt * 0.000009);
    }

    const longAccel = (this.speed - (this.prevSpeed ?? this.speed)) / Math.max(dt, 1e-4);
    this.prevSpeed = this.speed;
    const dive = clamp(longAccel * 0.0038, -0.035, 0.035);
    this.pitch = lerp(this.pitch, clamp(-Math.asin(clamp(grade, -1, 1)), -0.3, 0.3) - dive, Math.min(1, dt * 6));
    // Мелкая тряска кузова: тем сильнее, чем грубее покрытие и выше скорость.
    const rough = (road.roughness ?? 0) + clamp(Math.abs(this.speed) / 30, 0, 1) * 0.35;
    this.bounce = Math.sin(performance.now() * 0.011 + this.speed * 0.7) * 0.004 * rough;
    this.roll = lerp(this.roll, clamp(-this.yawRel * this.speed * 0.012, -0.06, 0.06), Math.min(1, dt * 4));
    if (this.impact > 0) this.impact = Math.max(0, this.impact - dt * 1.5);

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
      brake: this.brake,
    };
  }
}

import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';
import { airfoil, addTailplanes } from './airframe-parts';
/** Original web-scale interpretation, with 73.9:64.8 length/span proportions. */
export function buildBoeing(maxAnisotropy: number) {
  const group = new THREE.Group();
  group.userData.animated = true;
  group.rotation.order = 'YXZ';
  const gear = new THREE.Group();
  group.add(gear);
  const fans: THREE.Group[] = [],
    wheels: THREE.Group[] = [];
  const white = new THREE.MeshPhysicalMaterial({
    color: '#f4f5f5',
    roughness: 0.34,
    metalness: 0.08,
    clearcoat: 0.23,
    side: THREE.DoubleSide,
  });
  const wingPaint = new THREE.MeshStandardMaterial({
    color: '#d2d7da',
    roughness: 0.36,
    metalness: 0.25,
    side: THREE.DoubleSide,
  });
  const red = new THREE.MeshPhysicalMaterial({
    color: '#cb1228',
    roughness: 0.3,
    clearcoat: 0.4,
    side: THREE.DoubleSide,
  });
  const metal = new THREE.MeshStandardMaterial({ color: '#89959e', metalness: 0.88, roughness: 0.25 });
  const dark = new THREE.MeshStandardMaterial({ color: '#18222b', roughness: 0.5, metalness: 0.3 });
  const rubber = new THREE.MeshStandardMaterial({ color: '#25272a', roughness: 0.85 });
  const mesh = (
    geo: THREE.BufferGeometry,
    mat: THREE.Material,
    parent: THREE.Object3D = group,
    x = 0,
    y = 0,
    z = 0,
  ) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(x, y, z);
    m.castShadow = true;
    m.receiveShadow = true;
    parent.add(m);
    return m;
  };
  // Shaped rings separate the flight-deck crown from the lowered radome.
  const stations = [
    [-20.75, 0.02, 0.04, 0.38],
    [-20, 0.22, 0.26, 0.36],
    [-18.4, 0.54, 0.58, 0.28],
    [-16, 1.05, 1.02, 0.16],
    [-13, 1.5, 1.47, 0.06],
    [-10, 1.74, 1.74, 0],
    [12.7, 1.74, 1.74, 0],
    [15.7, 1.72, 1.7, -0.02],
    [17.2, 1.55, 1.44, -0.1],
    [18.25, 1.25, 1.11, -0.18],
    [19.2, 0.98, 0.79, -0.26],
    [20, 0.64, 0.49, -0.31],
    [20.5, 0.34, 0.25, -0.34],
    [20.72, 0.12, 0.095, -0.36],
    [20.75, 0.015, 0.02, -0.36],
  ];
  // Monotone Hermite interpolation keeps the crown and radome smooth without spline bulges.
  const slopes = Array.from({ length: 4 }, (_, column) =>
    stations.map((station, i) => {
      if (i === 0) return (stations[1][column] - station[column]) / (stations[1][0] - station[0]);
      if (i === stations.length - 1)
        return (station[column] - stations[i - 1][column]) / (station[0] - stations[i - 1][0]);
      const left = (station[column] - stations[i - 1][column]) / (station[0] - stations[i - 1][0]),
        right = (stations[i + 1][column] - station[column]) / (stations[i + 1][0] - station[0]);
      return left * right <= 0 ? 0 : (2 * left * right) / (left + right);
    }),
  );
  const sample = (z: number, column: number) => {
    let i = 0;
    while (i < stations.length - 2 && z > stations[i + 1][0]) i++;
    const h = stations[i + 1][0] - stations[i][0],
      t = THREE.MathUtils.clamp((z - stations[i][0]) / h, 0, 1),
      t2 = t * t,
      t3 = t2 * t;
    return (
      (2 * t3 - 3 * t2 + 1) * stations[i][column] +
      (t3 - 2 * t2 + t) * h * slopes[column][i] +
      (-2 * t3 + 3 * t2) * stations[i + 1][column] +
      (t3 - t2) * h * slopes[column][i + 1]
    );
  };
  const vertices: number[] = [],
    uvs: number[] = [],
    indices: number[] = [];
  const rings = 176,
    sides = 64;
  for (let i = 0; i <= rings; i++) {
    const z = -20.75 + (i / rings) * 41.5;
    for (let j = 0; j <= sides; j++) {
      const a = (j / sides) * Math.PI * 2;
      vertices.push(Math.cos(a) * sample(z, 1), Math.sin(a) * sample(z, 2) + sample(z, 3), z);
      uvs.push(j / sides, i / rings);
    }
  }
  for (let i = 0; i < rings; i++)
    for (let j = 0; j < sides; j++) {
      const a = i * (sides + 1) + j,
        b = a + sides + 1;
      indices.push(a, a + 1, b, b, a + 1, b + 1);
    }
  const bodyGeometry = new THREE.BufferGeometry();
  bodyGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
  bodyGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  bodyGeometry.setIndex(indices);
  bodyGeometry.computeVertexNormals();
  const body = mesh(bodyGeometry, white);
  body.updateMatrixWorld();
  // Raked tips, swept planform, and gentle dihedral distinguish the 777 from the A350.
  for (const side of [-1, 1]) {
    mesh(
      airfoil(
        [
          { x: 1.35, y: -0.8, lead: 5.5, chord: 8.4 },
          { x: 4.8, y: -0.58, lead: 3.5, chord: 6.7 },
          { x: 12, y: 0.08, lead: -1.2, chord: 3.05 },
          { x: 16.7, y: 0.62, lead: -5.5, chord: 1.25 },
          { x: 18.2, y: 0.85, lead: -7.1, chord: 0.09 },
        ],
        side,
        0.085,
      ),
      wingPaint,
    );
    for (let i = 0; i < 3; i++)
      mesh(
        new THREE.CapsuleGeometry(0.11, 0.9, 4, 10),
        white,
        group,
        side * (5.5 + i * 3),
        -0.65 + i * 0.25,
        -2.3 - i * 1.45,
      ).rotation.x = Math.PI / 2;
    // GE90-style nacelle: open intake, lip, recessed fan and exhaust cone.
    const engine = new THREE.Group();
    engine.position.set(side * 5.6, -1.45, 4.2);
    group.add(engine);
    const nacelle = mesh(
      new THREE.LatheGeometry(
        [
          new THREE.Vector2(0.72, -2.5),
          new THREE.Vector2(1, -1.8),
          new THREE.Vector2(1.22, 0.4),
          new THREE.Vector2(1.2, 1.45),
          new THREE.Vector2(1.12, 1.7),
          new THREE.Vector2(1.02, 1.65),
          new THREE.Vector2(0.98, 1.25),
          new THREE.Vector2(0.93, 0.7),
        ],
        48,
      ),
      white,
      engine,
    );
    nacelle.rotation.x = Math.PI / 2;
    const lip = mesh(new THREE.TorusGeometry(1.1, 0.075, 10, 48), metal, engine, 0, 0, 1.6);
    mesh(new THREE.CylinderGeometry(0.99, 0.99, 0.12, 48), dark, engine, 0, 0, 1.15).rotation.x = Math.PI / 2;
    const rotor = new THREE.Group();
    rotor.position.z = 1.23;
    engine.add(rotor);
    fans.push(rotor);
    const bladeShape = new THREE.Shape();
    bladeShape.moveTo(-0.07, -0.29);
    bladeShape.quadraticCurveTo(0.13, -0.03, 0.11, 0.34);
    bladeShape.lineTo(-0.04, 0.34);
    bladeShape.quadraticCurveTo(0.02, 0.02, -0.12, -0.27);
    bladeShape.closePath();
    const blades = new THREE.InstancedMesh(
      new THREE.ExtrudeGeometry(bladeShape, { depth: 0.025, bevelEnabled: false }),
      metal,
      22,
    );
    const bladePose = new THREE.Object3D();
    for (let i = 0; i < 22; i++) {
      const a = (i * Math.PI * 2) / 22;
      bladePose.position.set(Math.sin(a) * 0.57, Math.cos(a) * 0.57, 0);
      bladePose.rotation.z = -a + 0.28;
      bladePose.updateMatrix();
      blades.setMatrixAt(i, bladePose.matrix);
    }
    rotor.add(blades);

    mesh(new THREE.ConeGeometry(0.25, 0.5, 32), metal, rotor, 0, 0, 0.12).rotation.x = Math.PI / 2;
    mesh(new THREE.ConeGeometry(0.48, 1.5, 32), metal, engine, 0, 0, -2.4).rotation.x = -Math.PI / 2;
    mesh(new THREE.BoxGeometry(0.22, 1.1, 2.5), wingPaint, group, side * 5.6, -0.55, 3.7);
  }
  addTailplanes(group, white, '777');
  const finShape = new THREE.Shape();
  finShape.moveTo(-19.9, 0.65);
  finShape.lineTo(-17.9, 6.1);
  finShape.quadraticCurveTo(-17.7, 6.45, -17.35, 6.45);
  finShape.lineTo(-16.25, 6.45);
  finShape.quadraticCurveTo(-16.05, 6.45, -15.92, 6.2);
  finShape.lineTo(-12.5, 1.7);
  finShape.quadraticCurveTo(-11.9, 0.85, -10.8, 0.65);
  finShape.closePath();
  const finGeometry = new THREE.ExtrudeGeometry(finShape, {
    depth: 0.075,
    bevelEnabled: true,
    bevelThickness: 0.035,
    bevelSize: 0.045,
    bevelSegments: 3,
    curveSegments: 20,
  });
  finGeometry.rotateY(-Math.PI / 2);
  const fin = mesh(finGeometry, red);
  fin.position.x = 0.0375;
  fin.updateMatrixWorld();
  // Windows follow the skin, including the aft taper, instead of sinking into it.
  const windows = new THREE.InstancedMesh(new RoundedBoxGeometry(0.045, 0.215, 0.15, 3, 0.045), dark, 200);
  const matrix = new THREE.Matrix4();
  let n = 0;
  const doorPositions = [13.25, 6.7, 0.15, -6.5, -12.3];
  for (const side of [-1, 1])
    for (let i = 0; i < 100; i++) {
      const z = -13.7 + i * 0.294;
      if (doorPositions.some(door => Math.abs(z - door) < 0.43)) continue;
      const y = 0.67;
      const rx = sample(z, 1),
        ry = sample(z, 2);
      const x = rx * Math.sqrt(Math.max(0, 1 - Math.pow((y - sample(z, 3)) / ry, 2))) + 0.026;
      matrix.makeTranslation(side * x, y, z);
      windows.setMatrixAt(n++, matrix);
    }
  windows.count = n;
  group.add(windows);
  const decal = (
    target: THREE.Mesh,
    canvas: HTMLCanvasElement,
    pos: THREE.Vector3,
    side: number,
    size: THREE.Vector3,
  ) => {
    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = maxAnisotropy;
    const m = mesh(
      new DecalGeometry(target, pos, new THREE.Euler(0, (side * Math.PI) / 2, 0), size),
      new THREE.MeshStandardMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
      }),
    );
    m.renderOrder = 2;
  };
  // Project panel outlines and separated flight-deck glazing directly onto the curved skin.
  const doorCanvas = document.createElement('canvas');
  doorCanvas.width = 256;
  doorCanvas.height = 512;
  const dc = doorCanvas.getContext('2d')!;
  dc.strokeStyle = '#78858b';
  dc.lineWidth = 4;
  dc.beginPath();
  dc.roundRect(38, 22, 180, 465, 28);
  dc.stroke();
  dc.fillStyle = '#81929b';
  dc.beginPath();
  dc.roundRect(100, 105, 55, 64, 12);
  dc.fill();
  dc.fillStyle = '#b32832';
  dc.fillRect(133, 263, 40, 7);
  dc.fillStyle = '#586870';
  dc.font = '18px Arial';
  dc.fillText('EXIT', 105, 66);
  const cockpitCanvas = document.createElement('canvas');
  cockpitCanvas.width = 1024;
  cockpitCanvas.height = 384;
  const cc = cockpitCanvas.getContext('2d')!;
  cc.fillStyle = '#203441';
  cc.strokeStyle = '#a8b3b8';
  cc.lineWidth = 7;
  for (const polygon of [
    [
      [50, 90],
      [250, 65],
      [263, 282],
      [78, 276],
    ],
    [
      [280, 65],
      [555, 95],
      [600, 280],
      [280, 282],
    ],
    [
      [587, 110],
      [827, 185],
      [945, 283],
      [634, 280],
    ],
  ]) {
    cc.beginPath();
    polygon.forEach(([x, y], i) => (i ? cc.lineTo(x, y) : cc.moveTo(x, y)));
    cc.closePath();
    cc.fill();
    cc.stroke();
  }
  for (const side of [-1, 1]) {
    for (const z of doorPositions)
      decal(
        body,
        doorCanvas,
        new THREE.Vector3(side * 1.72, 0.08, z),
        side,
        new THREE.Vector3(0.66, 1.55, 0.7),
      );
    decal(
      body,
      cockpitCanvas,
      new THREE.Vector3(side * 1.35, 0.91, 17.3),
      side,
      new THREE.Vector3(2.35, 0.68, 2.2),
    );
  }
  const letters = document.createElement('canvas');
  letters.width = 1024;
  letters.height = 256;
  const c = letters.getContext('2d')!;
  c.fillStyle = '#c81024';
  c.font = '600 200px Arial';
  c.fillText('SWISS', 12, 202);
  const flag = document.createElement('canvas');
  flag.width = flag.height = 512;
  const fc = flag.getContext('2d')!;
  fc.fillStyle = 'white';
  fc.fillRect(105, 213, 302, 86);
  fc.fillRect(213, 105, 86, 302);
  for (const side of [-1, 1]) {
    decal(body, letters, new THREE.Vector3(side * 1.6, 0.4, 11.2), side, new THREE.Vector3(6.5, 1.65, 1));
    decal(fin, flag, new THREE.Vector3(side * 0.1, 4.8, -16.7), side, new THREE.Vector3(2.65, 2.65, 0.5));
  }
  for (const [x, z, main] of [
    [-1.9, -3.8, true],
    [1.9, -3.8, true],
    [0, 14, false],
  ] as const) {
    mesh(new THREE.CylinderGeometry(0.06, 0.09, 1.35, 12), metal, gear, x, -2.12, z);
    const bogie = mesh(new THREE.BoxGeometry(0.35, 0.13, main ? 1.8 : 0.3), metal, gear, x, -2.96, z);
    for (const side of [-1, 1])
      for (let axle = 0; axle < (main ? 3 : 1); axle++) {
        const wheel = new THREE.Group();
        wheel.position.set(
          x + side * (main ? 0.3 : 0.19),
          main ? -3.12 : -3.28,
          z + (main ? (axle - 1) * 0.65 : 0),
        );
        gear.add(wheel);
        const radius = main ? 0.44 : 0.28;
        mesh(new THREE.CylinderGeometry(radius, radius, 0.25, 24), rubber, wheel).rotation.z = Math.PI / 2;
        mesh(new THREE.CylinderGeometry(radius * 0.45, radius * 0.45, 0.26, 20), metal, wheel).rotation.z =
          Math.PI / 2;
        wheels.push(wheel);
      }
  }
  const state = { loaded: true, source: 'zln-777-300er', error: false };
  return { group, gear, fans, wheels, state, ready: Promise.resolve() };
}

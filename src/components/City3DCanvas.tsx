import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import {
  CameraView,
  CarState,
  DisplayVisionMode,
  ObstacleObject,
  RouteStatus,
  ScenarioDetail,
  ScenarioType,
  WeatherMode,
} from '../types/simulator';

interface City3DCanvasProps {
  isDriving: boolean;
  onToggleDrive?: () => void;
  weather: WeatherMode;
  cameraView: CameraView;
  displayVision: DisplayVisionMode;
  driveMode: 'auto' | 'manual';
  activeScenario: ScenarioType;
  manualControls: { forward: boolean; backward: boolean; left: boolean; right: boolean };
  onTelemetryUpdate: (car: CarState, obstacles: ObstacleObject[], decision: string) => void;
  onHazardAvoided: () => void;
  onResetCameraView?: () => void;
  is2DActive: boolean;
  onScenarioDetailUpdate?: (detail: ScenarioDetail | null) => void;
  onScenarioCompleted?: () => void;
  onRouteProgressUpdate?: (status: RouteStatus) => void;
}

export const City3DCanvas: React.FC<City3DCanvasProps> = ({
  isDriving,
  weather,
  cameraView,
  displayVision,
  driveMode,
  activeScenario,
  manualControls,
  onTelemetryUpdate,
  onHazardAvoided,
  is2DActive,
  onScenarioDetailUpdate,
  onScenarioCompleted,
  onRouteProgressUpdate,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stateRef = useRef({
    isDriving,
    weather,
    cameraView,
    displayVision,
    driveMode,
    activeScenario,
    manualControls,
    is2DActive,
  });

  const scenarioRanOnceRef = useRef<{
    pedestrian: boolean;
    car_brake: boolean;
    red_light: boolean;
  }>({
    pedestrian: false,
    car_brake: false,
    red_light: false,
  });

  useEffect(() => {
    // When activeScenario changes, allow the newly activated scenario to run
    if (activeScenario === 'none') {
      scenarioRanOnceRef.current = {
        pedestrian: false,
        car_brake: false,
        red_light: false,
      };
    } else {
      scenarioRanOnceRef.current[activeScenario] = false;
    }
  }, [activeScenario]);

  useEffect(() => {
    stateRef.current = {
      isDriving,
      weather,
      cameraView,
      displayVision,
      driveMode,
      activeScenario,
      manualControls,
      is2DActive,
    };
  }, [isDriving, weather, cameraView, displayVision, driveMode, activeScenario, manualControls, is2DActive]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // SCENE, CAMERA, RENDERER
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xF5F7FA);

    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );

    // Initial position: Default is "Ikuti Mobil" (Chase Cam behind the Lamborghini)
    // Car starts at (-30, 0, -34.2) facing East (+X, rotation = PI / 2)
    // Behind car along East is -X: x = -30 - 8.5 = -38.5, y = 3.2, z = -34.2
    camera.position.set(-38.5, 3.2, -34.2);
    camera.lookAt(-22, 1.0, -34.2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);

    // Orbit camera controls
    let isDragging = false;
    let prevMouseX = 0;
    let prevMouseY = 0;
    let sphericalTheta = Math.PI / 4;
    let sphericalPhi = Math.PI / 3;
    let sphericalRadius = 38;
    const orbitTarget = new THREE.Vector3(-30, 1.0, -34.2);

    const onMouseDown = (e: MouseEvent) => {
      if (stateRef.current.cameraView !== 'orbit') return;
      isDragging = true;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging || stateRef.current.cameraView !== 'orbit') return;
      const deltaX = e.clientX - prevMouseX;
      const deltaY = e.clientY - prevMouseY;
      prevMouseX = e.clientX;
      prevMouseY = e.clientY;

      sphericalTheta -= deltaX * 0.007;
      sphericalPhi = Math.max(0.12, Math.min(Math.PI / 2.1, sphericalPhi - deltaY * 0.007));
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      if (stateRef.current.cameraView !== 'orbit') return;
      sphericalRadius = Math.max(10, Math.min(85, sphericalRadius + e.deltaY * 0.035));
    };

    let touchStartX = 0;
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => {
      if (stateRef.current.cameraView !== 'orbit' || e.touches.length !== 1) return;
      isDragging = true;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isDragging || stateRef.current.cameraView !== 'orbit' || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - touchStartX;
      const deltaY = e.touches[0].clientY - touchStartY;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;

      sphericalTheta -= deltaX * 0.007;
      sphericalPhi = Math.max(0.12, Math.min(Math.PI / 2.1, sphericalPhi - deltaY * 0.007));
    };

    const onTouchEnd = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('wheel', onWheel, { passive: true });
    container.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd);

    // ==========================================
    // LIGHTING & ATMOSPHERE
    // ==========================================
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xfff8ee, 1.35);
    sunLight.position.set(45, 60, 35);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 2048;
    sunLight.shadow.mapSize.height = 2048;
    sunLight.shadow.camera.near = 0.5;
    sunLight.shadow.camera.far = 250;
    const d = 65;
    sunLight.shadow.camera.left = -d;
    sunLight.shadow.camera.right = d;
    sunLight.shadow.camera.top = d;
    sunLight.shadow.camera.bottom = -d;
    scene.add(sunLight);

    // Street Lamps collection
    const streetLights: THREE.PointLight[] = [];

    // ==========================================
    // GROUND & CITY ROAD NETWORK
    // ==========================================
    // Green City Ground
    const groundGeo = new THREE.PlaneGeometry(240, 240);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0x88C488,
      roughness: 0.9,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    scene.add(ground);

    // Dark Grid for LiDAR mode
    const darkGridMat = new THREE.MeshBasicMaterial({
      color: 0x050C1A,
      transparent: true,
      opacity: 0,
    });
    const darkGround = new THREE.Mesh(new THREE.PlaneGeometry(240, 240), darkGridMat);
    darkGround.rotation.x = -Math.PI / 2;
    darkGround.position.y = 0.005;
    scene.add(darkGround);

    const gridHelper = new THREE.GridHelper(160, 80, 0x00E5FF, 0x004466);
    gridHelper.position.y = 0.01;
    gridHelper.visible = false;
    scene.add(gridHelper);

    // ==========================================
    // ROAD NETWORK (LIVELY CITY WITH AVENUE & CROSSINGS)
    // ==========================================
    const roadGroup = new THREE.Group();
    scene.add(roadGroup);

    const asphaltMat = new THREE.MeshStandardMaterial({
      color: 0x1E242D,
      roughness: 0.85,
    });
    const lineMat = new THREE.MeshBasicMaterial({ color: 0xF8FAFC });
    const edgeLineMat = new THREE.MeshBasicMaterial({ color: 0xE2E8F0 });
    const sidewalkMat = new THREE.MeshStandardMaterial({ color: 0xD0D7DE, roughness: 0.8 });

    // Helper to create an asphalt street segment with sidewalks, side edge lines, and uniform dashed markings
    const createStreet = (
      x: number,
      z: number,
      w: number,
      len: number,
      isVertical: boolean
    ) => {
      // Asphalt base
      const asphalt = new THREE.Mesh(new THREE.PlaneGeometry(w, len), asphaltMat);
      asphalt.rotation.x = -Math.PI / 2;
      asphalt.position.set(x, 0.02, z);
      asphalt.receiveShadow = true;
      roadGroup.add(asphalt);

      // Clean Outer Edge Lines (Solid white lanes on both sides)
      const edgeLineWidth = 0.2;
      const edgeInset = 0.35;
      if (isVertical) {
        // Left solid edge
        const edgeL = new THREE.Mesh(new THREE.PlaneGeometry(edgeLineWidth, len), edgeLineMat);
        edgeL.rotation.x = -Math.PI / 2;
        edgeL.position.set(x - w / 2 + edgeInset, 0.028, z);
        roadGroup.add(edgeL);

        // Right solid edge
        const edgeR = new THREE.Mesh(new THREE.PlaneGeometry(edgeLineWidth, len), edgeLineMat);
        edgeR.rotation.x = -Math.PI / 2;
        edgeR.position.set(x + w / 2 - edgeInset, 0.028, z);
        roadGroup.add(edgeR);
      } else {
        // Top solid edge
        const edgeT = new THREE.Mesh(new THREE.PlaneGeometry(len, edgeLineWidth), edgeLineMat);
        edgeT.rotation.x = -Math.PI / 2;
        edgeT.position.set(x, 0.028, z - w / 2 + edgeInset);
        roadGroup.add(edgeT);

        // Bottom solid edge
        const edgeB = new THREE.Mesh(new THREE.PlaneGeometry(len, edgeLineWidth), edgeLineMat);
        edgeB.rotation.x = -Math.PI / 2;
        edgeB.position.set(x, 0.028, z + w / 2 - edgeInset);
        roadGroup.add(edgeB);
      }

      // Center dashed lines (neatly proportioned: 2m dash, 2m gap)
      const step = 4.0;
      const count = Math.floor(len / step);
      for (let i = 0; i < count; i++) {
        const offset = -len / 2 + (i + 0.5) * step;
        const dash = new THREE.Mesh(
          new THREE.PlaneGeometry(isVertical ? 0.28 : 2.0, isVertical ? 2.0 : 0.28),
          lineMat
        );
        dash.rotation.x = -Math.PI / 2;
        if (isVertical) {
          dash.position.set(x, 0.03, z + offset);
        } else {
          dash.position.set(x + offset, 0.03, z);
        }
        roadGroup.add(dash);
      }

      // Sidewalk curbs
      const curbThick = 1.2;
      if (isVertical) {
        const swL = new THREE.Mesh(new THREE.BoxGeometry(curbThick, 0.2, len), sidewalkMat);
        swL.position.set(x - w / 2 - curbThick / 2, 0.1, z);
        swL.receiveShadow = true;
        scene.add(swL);

        const swR = new THREE.Mesh(new THREE.BoxGeometry(curbThick, 0.2, len), sidewalkMat);
        swR.position.set(x + w / 2 + curbThick / 2, 0.1, z);
        swR.receiveShadow = true;
        scene.add(swR);
      } else {
        const swTop = new THREE.Mesh(new THREE.BoxGeometry(len, 0.2, curbThick), sidewalkMat);
        swTop.position.set(x, 0.1, z - w / 2 - curbThick / 2);
        swTop.receiveShadow = true;
        scene.add(swTop);

        const swBot = new THREE.Mesh(new THREE.BoxGeometry(len, 0.2, curbThick), sidewalkMat);
        swBot.position.set(x, 0.1, z + w / 2 + curbThick / 2);
        swBot.receiveShadow = true;
        scene.add(swBot);
      }
    };

    // 1. Outer Circuit:
    // North Road: Z = -34.2, from X = -40 to 40 (width 8.5)
    createStreet(0, -34.2, 8.5, 84, false);
    // South Road: Z = 34.2, from X = -40 to 40
    createStreet(0, 34.2, 8.5, 84, false);
    // East Road: X = 34.2, from Z = -40 to 40
    createStreet(34.2, 0, 8.5, 84, true);
    // West Road: X = -34.2, from Z = -40 to 40
    createStreet(-34.2, 0, 8.5, 84, true);

    // 2. Center Cross Avenue (Connected City Grid):
    createStreet(0, 0, 8.0, 60, true);
    createStreet(0, 0, 8.0, 60, false);

    // Intersection patches with clean cross asphalt
    const createJunctionPatch = (x: number, z: number, size: number) => {
      const p = new THREE.Mesh(new THREE.PlaneGeometry(size, size), asphaltMat);
      p.rotation.x = -Math.PI / 2;
      p.position.set(x, 0.025, z);
      p.receiveShadow = true;
      roadGroup.add(p);
    };
    createJunctionPatch(-34.2, -34.2, 8.6);
    createJunctionPatch(34.2, -34.2, 8.6);
    createJunctionPatch(34.2, 34.2, 8.6);
    createJunctionPatch(-34.2, 34.2, 8.6);
    createJunctionPatch(0, -34.2, 8.6);
    createJunctionPatch(0, 34.2, 8.6);
    createJunctionPatch(-34.2, 0, 8.6);
    createJunctionPatch(34.2, 0, 8.6);

    // ==========================================
    // CENTRAL ALUN-ALUN TUGU MALANG (CITY MONUMENT PARK)
    // ==========================================
    const tuguGroup = new THREE.Group();
    tuguGroup.position.set(0, 0, 0);
    scene.add(tuguGroup);

    // Central roundabout grass circle
    const grassCircle = new THREE.Mesh(
      new THREE.CylinderGeometry(5.8, 6.2, 0.35, 32),
      new THREE.MeshStandardMaterial({ color: 0x48BB78, roughness: 0.8 })
    );
    grassCircle.position.y = 0.18;
    grassCircle.receiveShadow = true;
    tuguGroup.add(grassCircle);

    // Fountain water basin
    const fountainBasin = new THREE.Mesh(
      new THREE.CylinderGeometry(3.6, 3.8, 0.45, 24),
      new THREE.MeshStandardMaterial({ color: 0xCBD5E1, roughness: 0.5 })
    );
    fountainBasin.position.y = 0.35;
    tuguGroup.add(fountainBasin);

    const waterSurface = new THREE.Mesh(
      new THREE.CircleGeometry(3.2, 24),
      new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.1, metalness: 0.8 })
    );
    waterSurface.rotation.x = -Math.PI / 2;
    waterSurface.position.y = 0.52;
    tuguGroup.add(waterSurface);

    // Tugu Malang Obelisk Monument
    const tuguPillar = new THREE.Mesh(
      new THREE.CylinderGeometry(0.35, 0.7, 4.2, 8),
      new THREE.MeshStandardMaterial({ color: 0xF8FAFC, metalness: 0.4, roughness: 0.3 })
    );
    tuguPillar.position.y = 2.6;
    tuguPillar.castShadow = true;
    tuguGroup.add(tuguPillar);

    const tuguGoldTip = new THREE.Mesh(
      new THREE.ConeGeometry(0.4, 0.9, 8),
      new THREE.MeshStandardMaterial({ color: 0xF59E0B, metalness: 0.9, roughness: 0.2 })
    );
    tuguGoldTip.position.y = 5.1;
    tuguGroup.add(tuguGoldTip);

    // Flowers around Tugu
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const flower = new THREE.Mesh(
        new THREE.DodecahedronGeometry(0.35),
        new THREE.MeshStandardMaterial({ color: i % 2 === 0 ? 0xEF4444 : 0xFBBF24 })
      );
      flower.position.set(Math.cos(angle) * 4.6, 0.45, Math.sin(angle) * 4.6);
      tuguGroup.add(flower);
    }

    // ==========================================
    // LANDMARK 1: STASIUN MALANG (STARTING POINT)
    // ==========================================
    const stasiunGroup = new THREE.Group();
    stasiunGroup.position.set(-30, 0, -42.5);
    scene.add(stasiunGroup);

    // Platform Base
    const stasiunPlatform = new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.4, 5.5),
      new THREE.MeshStandardMaterial({ color: 0xE2E8F0, roughness: 0.6 })
    );
    stasiunPlatform.position.y = 0.2;
    stasiunPlatform.receiveShadow = true;
    stasiunGroup.add(stasiunPlatform);

    // Station Canopy Roof
    const stasiunCanopy = new THREE.Mesh(
      new THREE.BoxGeometry(17, 0.3, 6.0),
      new THREE.MeshStandardMaterial({ color: 0x1E88E5, roughness: 0.3 })
    );
    stasiunCanopy.position.set(0, 3.8, 0);
    stasiunCanopy.castShadow = true;
    stasiunGroup.add(stasiunCanopy);

    // Station Pillars
    for (let px of [-7, -3, 3, 7]) {
      const col = new THREE.Mesh(
        new THREE.CylinderGeometry(0.12, 0.12, 3.6, 8),
        new THREE.MeshStandardMaterial({ color: 0x64748B, metalness: 0.6 })
      );
      col.position.set(px, 1.8, 2.2);
      stasiunGroup.add(col);
    }

    // Station Signboard "STASIUN KOTA MALANG"
    const stasiunSign = new THREE.Mesh(
      new THREE.BoxGeometry(9.5, 1.1, 0.2),
      new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.4 })
    );
    stasiunSign.position.set(0, 4.6, 2.6);
    stasiunGroup.add(stasiunSign);

    const stasiunSignFace = new THREE.Mesh(
      new THREE.PlaneGeometry(9.0, 0.8),
      new THREE.MeshBasicMaterial({ color: 0x0284C7 })
    );
    stasiunSignFace.position.set(0, 4.6, 2.72);
    stasiunGroup.add(stasiunSignFace);

    // Station drop-off parking bay (off the road at Z = -39.0 so it NEVER blocks driving lanes!)
    const taxiBay = new THREE.Mesh(
      new THREE.PlaneGeometry(16, 3.2),
      new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.9 })
    );
    taxiBay.rotation.x = -Math.PI / 2;
    taxiBay.position.set(0, 0.025, 3.8);
    stasiunGroup.add(taxiBay);

    // Parked Blue Taxi (SAFELY parked off-road in station bay!)
    const taxi = new THREE.Group();
    taxi.position.set(4.0, 0, 3.8);
    stasiunGroup.add(taxi);
    const taxiBody = new THREE.Mesh(
      new THREE.BoxGeometry(1.8, 0.65, 3.6),
      new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.4 })
    );
    taxiBody.position.y = 0.5;
    taxi.add(taxiBody);
    const taxiCabin = new THREE.Mesh(
      new THREE.BoxGeometry(1.5, 0.55, 2.0),
      new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.2 })
    );
    taxiCabin.position.set(0, 1.05, -0.2);
    taxi.add(taxiCabin);

    // ==========================================
    // LANDMARK 2: UNIVERSITAS MA CHUNG (DESTINATION POINT)
    // ==========================================
    const maChungGroup = new THREE.Group();
    maChungGroup.position.set(-42.5, 0, -18);
    maChungGroup.rotation.y = Math.PI / 2;
    scene.add(maChungGroup);

    // Distinctive Campus Gate Arch Pillars (Red & Green Ma Chung Identity)
    const pillarL = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 5.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xB91C1C, roughness: 0.5 })
    );
    pillarL.position.set(-5.5, 2.6, 0);
    maChungGroup.add(pillarL);

    const pillarR = new THREE.Mesh(
      new THREE.BoxGeometry(1.2, 5.2, 1.2),
      new THREE.MeshStandardMaterial({ color: 0xB91C1C, roughness: 0.5 })
    );
    pillarR.position.set(5.5, 2.6, 0);
    maChungGroup.add(pillarR);

    // Cross arch banner
    const archTop = new THREE.Mesh(
      new THREE.BoxGeometry(12.5, 1.2, 1.0),
      new THREE.MeshStandardMaterial({ color: 0x00C896, roughness: 0.3 })
    );
    archTop.position.set(0, 5.4, 0);
    maChungGroup.add(archTop);

    // Campus Main Building behind gate
    const campusBldg = new THREE.Mesh(
      new THREE.BoxGeometry(15, 8.5, 8),
      new THREE.MeshStandardMaterial({ color: 0xF8FAFC, roughness: 0.5 })
    );
    campusBldg.position.set(0, 4.25, -6.5);
    campusBldg.castShadow = true;
    maChungGroup.add(campusBldg);

    // Campus Blue Glass facade
    const campusGlass = new THREE.Mesh(
      new THREE.PlaneGeometry(13, 6.5),
      new THREE.MeshStandardMaterial({ color: 0x38BDF8, roughness: 0.2, metalness: 0.7 })
    );
    campusGlass.position.set(0, 4.5, -2.4);
    maChungGroup.add(campusGlass);

    // Welcome Arrival Banner
    const arriveBanner = new THREE.Mesh(
      new THREE.PlaneGeometry(10.5, 0.9),
      new THREE.MeshBasicMaterial({ color: 0x1E88E5 })
    );
    arriveBanner.position.set(0, 5.4, 0.52);
    maChungGroup.add(arriveBanner);

    // Arrival Finish Stop Bay
    const arriveBay = new THREE.Mesh(
      new THREE.PlaneGeometry(6, 4),
      new THREE.MeshStandardMaterial({ color: 0x00C896, transparent: true, opacity: 0.4 })
    );
    arriveBay.rotation.x = -Math.PI / 2;
    arriveBay.position.set(-34.2, 0.03, -18);
    scene.add(arriveBay);

    // ==========================================
    // VARIETY OF BUILDINGS & HOUSES (NON-BLOCKING)
    // ==========================================
    const buildingWireframes: THREE.LineSegments[] = [];
    const wireMat = new THREE.LineBasicMaterial({ color: 0x00E5FF, transparent: true, opacity: 0.7 });

    const createShopHouse = (x: number, z: number, w: number, d: number, h: number, wallColor: number, awningColor: number) => {
      const bMesh = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.6 })
      );
      bMesh.position.set(x, h / 2, z);
      bMesh.castShadow = true;
      bMesh.receiveShadow = true;
      scene.add(bMesh);

      // Awning
      const awning = new THREE.Mesh(
        new THREE.BoxGeometry(w, 0.25, 1.2),
        new THREE.MeshStandardMaterial({ color: awningColor, roughness: 0.5 })
      );
      awning.position.set(x, 2.6, z + d / 2 + 0.5);
      scene.add(awning);

      // LiDAR wireframe outline
      const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d));
      const wf = new THREE.LineSegments(edges, wireMat);
      wf.position.copy(bMesh.position);
      wf.visible = false;
      scene.add(wf);
      buildingWireframes.push(wf);
    };

    const createPitchedHouse = (x: number, z: number, w: number, d: number, wallColor: number, roofColor: number) => {
      const wallH = 2.4;
      const wall = new THREE.Mesh(
        new THREE.BoxGeometry(w, wallH, d),
        new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.8 })
      );
      wall.position.set(x, wallH / 2, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      scene.add(wall);

      // Gable roof
      const roofH = 1.6;
      const roofGeo = new THREE.ConeGeometry(Math.max(w, d) * 0.75, roofH, 4);
      const roof = new THREE.Mesh(roofGeo, new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 }));
      roof.position.set(x, wallH + roofH / 2, z);
      roof.rotation.y = Math.PI / 4;
      roof.castShadow = true;
      scene.add(roof);

      const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(w, wallH, d));
      const wf = new THREE.LineSegments(edges, wireMat);
      wf.position.copy(wall.position);
      wf.visible = false;
      scene.add(wf);
      buildingWireframes.push(wf);
    };

    // City Buildings & Houses Placed in city blocks (safely away from roads!)
    // North-West Block
    createShopHouse(-16, -18, 7, 5, 4.5, 0xF8FAFC, 0x1E88E5);
    createPitchedHouse(-26, -18, 5, 5, 0xFEF08A, 0xDC2626);
    createPitchedHouse(-16, -26, 5, 5, 0xBBF7D0, 0x2563EB);

    // North-East Block
    createShopHouse(16, -18, 7, 6, 5.0, 0xF1F5F9, 0x00C896);
    createPitchedHouse(26, -18, 5, 5, 0xFED7AA, 0x7C3AED);
    createShopHouse(16, -26, 6, 5, 4.2, 0xE2E8F0, 0xF59E0B);

    // South-West Block
    createPitchedHouse(-18, 18, 5.5, 5, 0xE0E7FF, 0xEA580C);
    createShopHouse(-26, 18, 6, 5, 4.6, 0xF8FAFC, 0x0284C7);
    createPitchedHouse(-18, 26, 5, 5, 0xFEF9C3, 0x059669);

    // South-East Block
    createShopHouse(18, 18, 7, 5, 4.8, 0xF8FAFC, 0xE11D48);
    createPitchedHouse(26, 18, 5, 5, 0xCFFAFE, 0x4F46E5);
    createShopHouse(18, 26, 6, 5, 4.5, 0xF1F5F9, 0x10B981);

    // Outer perimeter houses
    createPitchedHouse(-20, -44, 4.5, 4.5, 0xFEF08A, 0xB91C1C);
    createPitchedHouse(18, -44, 4.5, 4.5, 0xE2E8F0, 0x0284C7);
    createPitchedHouse(28, -44, 4.5, 4.5, 0xBBF7D0, 0xEA580C);
    createShopHouse(44, -18, 5, 6, 4.5, 0xF8FAFC, 0x1E88E5);
    createPitchedHouse(44, 18, 4.5, 4.5, 0xFED7AA, 0x059669);
    createPitchedHouse(-18, 44, 5, 4.5, 0xCFFAFE, 0x7C3AED);
    createPitchedHouse(18, 44, 5, 4.5, 0xFEF08A, 0xDC2626);

    // ==========================================
    // TREES & STREET LAMPS
    // ==========================================
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x78350F, roughness: 0.9 });
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x15803D, roughness: 0.7 });

    const createTree = (x: number, z: number, scale = 1.0) => {
      const tree = new THREE.Group();
      tree.position.set(x, 0, z);

      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18 * scale, 0.25 * scale, 1.8 * scale, 7), trunkMat);
      trunk.position.y = (1.8 * scale) / 2;
      trunk.castShadow = true;
      tree.add(trunk);

      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.2 * scale), foliageMat);
      foliage.position.y = 2.0 * scale;
      foliage.castShadow = true;
      tree.add(foliage);

      // LiDAR wireframe bounding box for tree
      const treeEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.4 * scale, 3.2 * scale, 2.4 * scale));
      const treeWf = new THREE.LineSegments(treeEdges, wireMat);
      treeWf.position.set(x, (3.2 * scale) / 2, z);
      treeWf.visible = false;
      scene.add(treeWf);
      buildingWireframes.push(treeWf);

      scene.add(tree);
    };

    // Trees along avenues & sidewalks
    createTree(-8, -12, 1.1);
    createTree(8, -12, 1.0);
    createTree(-8, 12, 1.1);
    createTree(8, 12, 1.0);
    createTree(-28, -28, 1.2);
    createTree(28, -28, 1.2);
    createTree(-28, 28, 1.2);
    createTree(28, 28, 1.2);
    createTree(-12, -42, 1.0);
    createTree(10, -42, 1.1);
    createTree(42, -5, 1.2);
    createTree(42, 5, 1.2);

    // Street Lamps
    const lampMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
    const lampBulbMat = new THREE.MeshBasicMaterial({ color: 0xFFF3C4 });

    const createStreetLamp = (x: number, z: number) => {
      const lamp = new THREE.Group();
      lamp.position.set(x, 0, z);

      const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 4.2, 8), lampMat);
      pole.position.y = 2.1;
      lamp.add(pole);

      const arm = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.08, 0.08), lampMat);
      arm.position.set(0.3, 4.15, 0);
      lamp.add(arm);

      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.15, 8, 8), lampBulbMat);
      bulb.position.set(0.65, 4.05, 0);
      lamp.add(bulb);

      const pLight = new THREE.PointLight(0xFFF1B8, 0, 16);
      pLight.position.set(0.65, 4.0, 0);
      lamp.add(pLight);
      streetLights.push(pLight);

      scene.add(lamp);
    };

    createStreetLamp(-20, -39);
    createStreetLamp(0, -39);
    createStreetLamp(20, -39);
    createStreetLamp(39, -20);
    createStreetLamp(39, 20);
    createStreetLamp(20, 39);
    createStreetLamp(-20, 39);
    createStreetLamp(-39, 10);

    // ==========================================
    // AMBIENT TRAFFIC (MOTORCYCLE, SEDAN, TAXI)
    // Dynamic city traffic with LiDAR bounding boxes!
    // ==========================================
    const createAmbientCar = (bodyColor: number) => {
      const g = new THREE.Group();
      const bMesh = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 0.6, 3.6),
        new THREE.MeshStandardMaterial({ color: bodyColor, roughness: 0.3, metalness: 0.2 })
      );
      bMesh.position.y = 0.5;
      bMesh.castShadow = true;
      g.add(bMesh);

      const cabin = new THREE.Mesh(
        new THREE.BoxGeometry(1.4, 0.55, 1.8),
        new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.1, metalness: 0.8 })
      );
      cabin.position.set(0, 1.0, -0.2);
      g.add(cabin);

      const hLightL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xEEFFFF }));
      hLightL.position.set(0.6, 0.45, 1.82);
      g.add(hLightL);
      const hLightR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xEEFFFF }));
      hLightR.position.set(-0.6, 0.45, 1.82);
      g.add(hLightR);

      const tLightL = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xCC1100 }));
      tLightL.position.set(0.6, 0.45, -1.82);
      g.add(tLightL);
      const tLightR = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.1, 0.05), new THREE.MeshBasicMaterial({ color: 0xCC1100 }));
      tLightR.position.set(-0.6, 0.45, -1.82);
      g.add(tLightR);

      // LiDAR bounding wireframe
      const carEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(2.1, 1.5, 3.9));
      const carWf = new THREE.LineSegments(carEdges, wireMat);
      carWf.position.y = 0.75;
      carWf.visible = false;
      g.add(carWf);
      buildingWireframes.push(carWf);

      scene.add(g);
      return g;
    };

    // Helper to create an Indonesian city motorbike (Scooter with rider)
    const createAmbientMotorbike = (bikeColor: number) => {
      const g = new THREE.Group();

      // Bike Body Chassis
      const bikeBody = new THREE.Mesh(
        new THREE.BoxGeometry(0.5, 0.5, 1.8),
        new THREE.MeshStandardMaterial({ color: bikeColor, roughness: 0.3 })
      );
      bikeBody.position.y = 0.45;
      bikeBody.castShadow = true;
      g.add(bikeBody);

      // Front Wheel
      const fw = new THREE.Mesh(
        new THREE.CylinderGeometry(0.25, 0.25, 0.12, 12),
        new THREE.MeshStandardMaterial({ color: 0x111827 })
      );
      fw.rotation.z = Math.PI / 2;
      fw.position.set(0, 0.25, 0.75);
      g.add(fw);

      // Rear Wheel
      const rw = fw.clone();
      rw.position.set(0, 0.25, -0.75);
      g.add(rw);

      // Handlebar
      const handle = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.06, 0.06), new THREE.MeshStandardMaterial({ color: 0x334155 }));
      handle.position.set(0, 0.85, 0.45);
      g.add(handle);

      // Headlight
      const mLight = new THREE.Mesh(new THREE.SphereGeometry(0.1, 8, 8), new THREE.MeshBasicMaterial({ color: 0xEEFFFF }));
      mLight.position.set(0, 0.72, 0.92);
      g.add(mLight);

      // Rider figure with helmet
      const riderTorso = new THREE.Mesh(
        new THREE.BoxGeometry(0.42, 0.55, 0.28),
        new THREE.MeshStandardMaterial({ color: 0x1E3A8A })
      );
      riderTorso.position.set(0, 0.95, -0.1);
      g.add(riderTorso);

      const helmet = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 10, 10),
        new THREE.MeshStandardMaterial({ color: 0xE11D48 })
      );
      helmet.position.set(0, 1.4, -0.05);
      g.add(helmet);

      // LiDAR bounding wireframe for motorbike
      const bikeEdges = new THREE.EdgesGeometry(new THREE.BoxGeometry(1.0, 1.7, 2.1));
      const bikeWf = new THREE.LineSegments(bikeEdges, wireMat);
      bikeWf.position.y = 0.85;
      bikeWf.visible = false;
      g.add(bikeWf);
      buildingWireframes.push(bikeWf);

      scene.add(g);
      return g;
    };

    // Ambient Car 1: Emerald sedan cruising on inner boulevard
    const ambientCar1 = createAmbientCar(0x059669);
    let ambientCar1Progress = 0;

    // Ambient Car 2: Crimson hatchback cruising on South road
    const ambientCar2 = createAmbientCar(0xDC2626);
    let ambientCar2Progress = 0.5;

    // Ambient Motorbike 1: Blue scooter cruising on East avenue
    const ambientMotorbike = createAmbientMotorbike(0x0284C7);
    let ambientMotoProgress = 0.25;

    // ==========================================
    // AUTONOMOUS LAMBORGHINI SUPERCAR MODEL
    // ==========================================
    const carRoot = new THREE.Group();
    scene.add(carRoot);

    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      metalness: 0.45,
      roughness: 0.18,
    });
    const carbonMat = new THREE.MeshStandardMaterial({
      color: 0x111827,
      roughness: 0.3,
      metalness: 0.8,
    });
    const canopyGlassMat = new THREE.MeshStandardMaterial({
      color: 0x0F172A,
      roughness: 0.08,
      metalness: 0.95,
    });

    // Lower Wedge Chassis
    const lowerChassis = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.42, 4.5), bodyMat);
    lowerChassis.position.y = 0.38;
    lowerChassis.castShadow = true;
    lowerChassis.receiveShadow = true;
    carRoot.add(lowerChassis);

    // Front Pointed Aero Nose
    const frontWedge = new THREE.Mesh(new THREE.BoxGeometry(2.05, 0.26, 0.85), bodyMat);
    frontWedge.position.set(0, 0.32, 2.5);
    frontWedge.castShadow = true;
    carRoot.add(frontWedge);

    // Carbon Splitter
    const frontSplitter = new THREE.Mesh(new THREE.BoxGeometry(2.18, 0.08, 0.4), carbonMat);
    frontSplitter.position.set(0, 0.18, 2.85);
    carRoot.add(frontSplitter);

    // Sloped Supercar Cabin
    const canopy = new THREE.Mesh(new THREE.BoxGeometry(1.68, 0.52, 2.2), canopyGlassMat);
    canopy.position.set(0, 0.88, -0.2);
    canopy.castShadow = true;
    carRoot.add(canopy);

    // Carbon Rear Wing
    const wingBlade = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.06, 0.45), carbonMat);
    wingBlade.position.set(0, 1.05, -2.35);
    carRoot.add(wingBlade);
    const wingStrutL = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.18), carbonMat);
    wingStrutL.position.set(0.65, 0.86, -2.3);
    carRoot.add(wingStrutL);
    const wingStrutR = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.35, 0.18), carbonMat);
    wingStrutR.position.set(-0.65, 0.86, -2.3);
    carRoot.add(wingStrutR);

    // Waymo gradient stripes along flanks
    const stripeL1 = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.12), new THREE.MeshBasicMaterial({ color: 0x00C896 }));
    stripeL1.rotation.y = Math.PI / 2;
    stripeL1.position.set(1.085, 0.46, 0);
    carRoot.add(stripeL1);

    const stripeL2 = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.06), new THREE.MeshBasicMaterial({ color: 0x1E88E5 }));
    stripeL2.rotation.y = Math.PI / 2;
    stripeL2.position.set(1.085, 0.36, 0);
    carRoot.add(stripeL2);

    const stripeR1 = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.12), new THREE.MeshBasicMaterial({ color: 0x00C896 }));
    stripeR1.rotation.y = -Math.PI / 2;
    stripeR1.position.set(-1.085, 0.46, 0);
    carRoot.add(stripeR1);

    const stripeR2 = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.06), new THREE.MeshBasicMaterial({ color: 0x1E88E5 }));
    stripeR2.rotation.y = -Math.PI / 2;
    stripeR2.position.set(-1.085, 0.36, 0);
    carRoot.add(stripeR2);

    // Roof LiDAR Pod Puck
    const lidarMount = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.24, 0.16, 12),
      new THREE.MeshStandardMaterial({ color: 0x0F172A, metalness: 0.9 })
    );
    lidarMount.position.set(0, 1.22, -0.15);
    carRoot.add(lidarMount);

    const lidarPuck = new THREE.Mesh(
      new THREE.CylinderGeometry(0.18, 0.18, 0.18, 16),
      new THREE.MeshStandardMaterial({ color: 0x00C896, roughness: 0.2, metalness: 0.6 })
    );
    lidarPuck.position.set(0, 1.34, -0.15);
    carRoot.add(lidarPuck);

    // Headlights (Y-signature sharp angles)
    const headlightMat = new THREE.MeshBasicMaterial({ color: 0xEEFFFF });
    const headlightL = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.08), headlightMat);
    headlightL.position.set(0.68, 0.44, 2.76);
    carRoot.add(headlightL);

    const headlightR = new THREE.Mesh(new THREE.BoxGeometry(0.48, 0.1, 0.08), headlightMat);
    headlightR.position.set(-0.68, 0.44, 2.76);
    carRoot.add(headlightR);

    // Headlight Spot Beams
    const spotTarget = new THREE.Object3D();
    spotTarget.position.set(0, 0.2, 18);
    carRoot.add(spotTarget);

    const spotL = new THREE.SpotLight(0xEEFFFF, 1.5, 35, Math.PI / 6, 0.4, 1.2);
    spotL.position.set(0.68, 0.44, 2.76);
    spotL.target = spotTarget;
    carRoot.add(spotL);

    const spotR = new THREE.SpotLight(0xEEFFFF, 1.5, 35, Math.PI / 6, 0.4, 1.2);
    spotR.position.set(-0.68, 0.44, 2.76);
    spotR.target = spotTarget;
    carRoot.add(spotR);

    // Full-width LED Tail Brake Light Strip
    const brakeMatOff = new THREE.MeshStandardMaterial({ color: 0x4A0000, roughness: 0.6 });
    const brakeMatOn = new THREE.MeshStandardMaterial({
      color: 0xFF1100,
      emissive: new THREE.Color(0xFF1100),
      emissiveIntensity: 2.5,
      roughness: 0.2,
    });
    const brakeLightStrip = new THREE.Mesh(new THREE.BoxGeometry(1.85, 0.12, 0.06), brakeMatOff);
    brakeLightStrip.position.set(0, 0.58, -2.26);
    carRoot.add(brakeLightStrip);

    const brakePointLight = new THREE.PointLight(0xFF0000, 0, 10);
    brakePointLight.position.set(0, 0.65, -2.6);
    carRoot.add(brakePointLight);

    // Wheels
    const tireMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.8 });
    const rimMat = new THREE.MeshStandardMaterial({ color: 0xE2E8F0, metalness: 0.9, roughness: 0.15 });

    const createLamboWheel = () => {
      const wGroup = new THREE.Group();
      const tire = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.36, 0.32, 18), tireMat);
      tire.rotation.z = Math.PI / 2;
      tire.castShadow = true;
      wGroup.add(tire);

      const rim = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.34, 10), rimMat);
      rim.rotation.z = Math.PI / 2;
      wGroup.add(rim);

      return wGroup;
    };

    const wheelFL = createLamboWheel();
    const wheelFR = createLamboWheel();
    const wheelRL = createLamboWheel();
    const wheelRR = createLamboWheel();

    wheelFL.position.set(1.08, 0.36, 1.45);
    wheelFR.position.set(-1.08, 0.36, 1.45);
    wheelRL.position.set(1.12, 0.36, -1.45);
    wheelRR.position.set(-1.12, 0.36, -1.45);

    carRoot.add(wheelFL, wheelFR, wheelRL, wheelRR);

    // ==========================================
    // TECHNICAL (AI) LIDAR LASER RAYS & RADAR
    // ==========================================
    const sensorGroup = new THREE.Group();
    carRoot.add(sensorGroup);

    const lidarRaysGroup = new THREE.Group();
    sensorGroup.add(lidarRaysGroup);

    const rayCount = 48;
    const rayLines: THREE.Line[] = [];
    const rayMatNormal = new THREE.LineBasicMaterial({
      color: 0x00E5FF,
      transparent: true,
      opacity: 0.45,
    });
    const rayMatWarning = new THREE.LineBasicMaterial({
      color: 0xFFB800,
      transparent: true,
      opacity: 0.85,
    });
    const rayMatDanger = new THREE.LineBasicMaterial({
      color: 0xEF4444,
      transparent: true,
      opacity: 0.95,
    });

    for (let i = 0; i < rayCount; i++) {
      const angle = (i / rayCount) * Math.PI * 2;
      const rayGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 1.34, -0.15),
        new THREE.Vector3(Math.cos(angle) * 18, 0.05, Math.sin(angle) * 18),
      ]);
      const rayLine = new THREE.Line(rayGeo, rayMatNormal);
      lidarRaysGroup.add(rayLine);
      rayLines.push(rayLine);
    }

    const arcGeo = new THREE.RingGeometry(11.8, 12.0, 32, 1, 0, Math.PI / 2.2);
    const arcMat = new THREE.MeshBasicMaterial({
      color: 0x00C896,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.6,
    });
    const frontRadarArc = new THREE.Mesh(arcGeo, arcMat);
    frontRadarArc.rotation.x = -Math.PI / 2;
    frontRadarArc.rotation.z = Math.PI / 4.4;
    frontRadarArc.position.set(0, 0.08, 2.5);
    sensorGroup.add(frontRadarArc);

    // ==========================================
    // RAIN PARTICLES
    // ==========================================
    const rainCount = 1500;
    const rainGeo = new THREE.BufferGeometry();
    const rainPos = new Float32Array(rainCount * 3);
    for (let i = 0; i < rainCount; i++) {
      rainPos[i * 3] = (Math.random() - 0.5) * 130;
      rainPos[i * 3 + 1] = Math.random() * 35;
      rainPos[i * 3 + 2] = (Math.random() - 0.5) * 130;
    }
    rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
    const rainMat = new THREE.PointsMaterial({
      color: 0x93C5FD,
      size: 0.24,
      transparent: true,
      opacity: 0.6,
    });
    const rainPoints = new THREE.Points(rainGeo, rainMat);
    rainPoints.visible = false;
    scene.add(rainPoints);

    // ==========================================
    // DYNAMIC SCENARIO OBJECTS (IMMEDIATE AT VEHICLE POSITION)
    // ==========================================

    // 1. DYNAMIC PEDESTRIAN (WALKS ACROSS STREET FROM SIDEWALK TO SIDEWALK - NO ZEBRA CROSS)
    const pedestrianGroup = new THREE.Group();
    pedestrianGroup.visible = false;
    scene.add(pedestrianGroup);

    const pedMat = new THREE.MeshStandardMaterial({ color: 0x2563EB, roughness: 0.7 });
    const skinMat = new THREE.MeshStandardMaterial({ color: 0xFBBF24, roughness: 0.8 });

    const pedTorso = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.7, 0.3), pedMat);
    pedTorso.position.y = 1.0;
    pedTorso.castShadow = true;
    pedestrianGroup.add(pedTorso);

    const pedHead = new THREE.Mesh(new THREE.SphereGeometry(0.2, 8, 8), skinMat);
    pedHead.position.y = 1.55;
    pedHead.castShadow = true;
    pedestrianGroup.add(pedHead);

    const pedLegL = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 6), carbonMat);
    pedLegL.position.set(0.15, 0.35, 0);
    pedLegL.castShadow = true;
    pedestrianGroup.add(pedLegL);

    const pedLegR = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.65, 6), carbonMat);
    pedLegR.position.set(-0.15, 0.35, 0);
    pedLegR.castShadow = true;
    pedestrianGroup.add(pedLegR);

    const pedBoxLineMat = new THREE.LineBasicMaterial({ color: 0xFFB800, linewidth: 2 });
    const pedBoundingBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.0, 2.0, 1.0)),
      pedBoxLineMat
    );
    pedBoundingBox.position.y = 0.95;
    pedBoundingBox.visible = false;
    pedestrianGroup.add(pedBoundingBox);

    // 2. DYNAMIC LEADING VEHICLE (SUDDEN BRAKE)
    const leadingCarGroup = new THREE.Group();
    leadingCarGroup.visible = false;
    scene.add(leadingCarGroup);

    const leadCarMat = new THREE.MeshStandardMaterial({ color: 0x0284C7, roughness: 0.3 });
    const leadChassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.65, 4.0), leadCarMat);
    leadChassis.position.y = 0.55;
    leadChassis.castShadow = true;
    leadingCarGroup.add(leadChassis);

    const leadCabin = new THREE.Mesh(new THREE.BoxGeometry(1.65, 0.6, 2.0), canopyGlassMat);
    leadCabin.position.set(0, 1.15, -0.2);
    leadCabin.castShadow = true;
    leadingCarGroup.add(leadCabin);

    const leadBrakeLightL = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.05), brakeMatOff);
    leadBrakeLightL.position.set(0.7, 0.6, -2.02);
    leadingCarGroup.add(leadBrakeLightL);

    const leadBrakeLightR = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.12, 0.05), brakeMatOff);
    leadBrakeLightR.position.set(-0.7, 0.6, -2.02);
    leadingCarGroup.add(leadBrakeLightR);

    const leadBoxLineMat = new THREE.LineBasicMaterial({ color: 0x00C896, linewidth: 2 });
    const leadBoundingBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(2.3, 1.8, 4.4)),
      leadBoxLineMat
    );
    leadBoundingBox.position.y = 0.9;
    leadBoundingBox.visible = false;
    leadingCarGroup.add(leadBoundingBox);

    // 3. DYNAMIC SMART TRAFFIC LIGHT GANTRY
    const trafficLightGroup = new THREE.Group();
    trafficLightGroup.visible = false;
    scene.add(trafficLightGroup);

    // Overhead Gantry Post & Arm
    const tlPost = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 5.8, 8), lampMat);
    tlPost.position.set(4.2, 2.9, 0);
    trafficLightGroup.add(tlPost);

    const tlArm = new THREE.Mesh(new THREE.BoxGeometry(4.8, 0.18, 0.18), lampMat);
    tlArm.position.set(1.8, 5.5, 0);
    trafficLightGroup.add(tlArm);

    const tlBox = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 1.8, 0.4),
      new THREE.MeshStandardMaterial({ color: 0x0F172A, roughness: 0.3 })
    );
    tlBox.position.set(0, 5.1, 0);
    trafficLightGroup.add(tlBox);

    const redLightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 16), new THREE.MeshBasicMaterial({ color: 0x440000 }));
    redLightMesh.position.set(0, 5.6, 0.2);
    trafficLightGroup.add(redLightMesh);

    // Red light bright emissive glow beam / point light
    const redGlowLight = new THREE.PointLight(0xFF0000, 0, 18);
    redGlowLight.position.set(0, 5.6, 0.6);
    trafficLightGroup.add(redGlowLight);

    // Red light lens glow ring
    const redHalo = new THREE.Mesh(
      new THREE.RingGeometry(0.18, 0.42, 16),
      new THREE.MeshBasicMaterial({ color: 0xFF1100, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    redHalo.position.set(0, 5.6, 0.22);
    trafficLightGroup.add(redHalo);

    const yellowLightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0x221100 }));
    yellowLightMesh.position.set(0, 5.1, 0.2);
    trafficLightGroup.add(yellowLightMesh);

    const greenLightMesh = new THREE.Mesh(new THREE.SphereGeometry(0.18, 12, 12), new THREE.MeshBasicMaterial({ color: 0x002200 }));
    greenLightMesh.position.set(0, 4.6, 0.2);
    trafficLightGroup.add(greenLightMesh);

    const greenGlowLight = new THREE.PointLight(0x00FF88, 0, 18);
    greenGlowLight.position.set(0, 4.6, 0.6);
    trafficLightGroup.add(greenGlowLight);

    const dynamicStopLine = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 0.5), lineMat);
    dynamicStopLine.rotation.x = -Math.PI / 2;
    dynamicStopLine.position.set(0, 0.035, 0);
    trafficLightGroup.add(dynamicStopLine);

    const tlBoundingMat = new THREE.LineBasicMaterial({ color: 0xEF4444, linewidth: 2 });
    const tlBoundingBox = new THREE.LineSegments(
      new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 2.2, 1.2)),
      tlBoundingMat
    );
    tlBoundingBox.position.set(0, 5.1, 0);
    tlBoundingBox.visible = false;
    trafficLightGroup.add(tlBoundingBox);

    // ==========================================
    // ROUTE WAYPOINTS: Stasiun Malang -> Univ Ma Chung
    // Start at Stasiun Malang: (-30, -34.2)
    // End at Univ Ma Chung: (-34.2, -18)
    // ==========================================
    const waypoints: { x: number; z: number }[] = [
      { x: -30, z: -34.2 }, // Stasiun Malang Start
      { x: -14, z: -34.2 },
      { x: 0, z: -34.2 },   // North-South Central Junction
      { x: 16, z: -34.2 },
      { x: 30, z: -34.2 },
      { x: 34.2, z: -30 },  // East Turn
      { x: 34.2, z: -14 },
      { x: 34.2, z: 0 },    // East-West Central Junction
      { x: 34.2, z: 16 },
      { x: 34.2, z: 30 },
      { x: 30, z: 34.2 },   // South Turn
      { x: 14, z: 34.2 },
      { x: 0, z: 34.2 },    // South Central Junction
      { x: -14, z: 34.2 },
      { x: -30, z: 34.2 },
      { x: -34.2, z: 30 },  // West Turn
      { x: -34.2, z: 14 },
      { x: -34.2, z: 0 },   // West Junction
      { x: -34.2, z: -10 },
      { x: -34.2, z: -18 }, // Universitas Ma Chung Gate (FINISH!)
    ];

    let currentWaypointIdx = 0;
    let carX = waypoints[0].x;
    let carZ = waypoints[0].z;
    let carRot = Math.PI / 2; // Facing East (+X)
    let carSpeed = 0;
    let targetSpeed = 0;
    let isBraking = false;
    let cameraShake = 0;

    // SCENARIO STATE MACHINES
    // 1. Pedestrian Crossing State
    let pedActive = false;
    let pedStage: 'walking_to_lane' | 'in_front_crossing' | 'reached_curb' | 'done' = 'walking_to_lane';
    let pedLateralOffset = -3.8; // Across the road
    let pedAnchorPos = new THREE.Vector3();
    let pedForwardDist = 13.5;
    let pedHasCountedHazard = false;

    // 2. Sudden Brake Lead Car State
    let leadCarActive = false;
    let leadCarDist = 13.0;
    let leadCarStage: 'appearing' | 'braking' | 'accelerating_away' | 'done' = 'appearing';
    let leadCarTimer = 0;
    let leadHasCountedHazard = false;

    // 3. Traffic Light State
    let redLightActive = false;
    let redLightStage: 'red' | 'green' | 'done' = 'red';
    let redLightTimer = 0;
    let tlAnchorPos = new THREE.Vector3();
    let tlHasCountedHazard = false;

    const driverCameraPos = new THREE.Vector3(0.35, 0.95, 0.1);

    // ==========================================
    // ANIMATION & SIMULATION LOOP
    // ==========================================
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const delta = Math.min(clock.getDelta(), 0.08);
      const time = clock.getElapsedTime();

      // Spin roof LiDAR puck
      lidarPuck.rotation.y += 0.12;

      // Dark LiDAR Mode vs Normal Mode
      const isDarkLiDAR = stateRef.current.displayVision === 'technical';
      const curWeather = stateRef.current.weather;

      if (isDarkLiDAR) {
        scene.background = new THREE.Color(0x050A14);
        scene.fog = new THREE.FogExp2(0x050A14, 0.012);
        darkGridMat.opacity = 0.95;
        gridHelper.visible = true;
        sunLight.intensity = 0.2;
        sunLight.color.setHex(0x00E5FF);
        ambientLight.intensity = 0.35;
        ambientLight.color.setHex(0x0A2540);
        rainPoints.visible = false;
        streetLights.forEach((l) => (l.intensity = 0.3));
        spotL.intensity = 2.2;
        spotR.intensity = 2.2;
        buildingWireframes.forEach((wf) => (wf.visible = true));
      } else {
        buildingWireframes.forEach((wf) => (wf.visible = false));
        darkGridMat.opacity = 0;
        gridHelper.visible = false;

        if (curWeather === 'sunny') {
          scene.background = new THREE.Color(0xF5F7FA);
          scene.fog = new THREE.FogExp2(0xF5F7FA, 0.005);
          sunLight.intensity = 1.35;
          sunLight.color.setHex(0xFFF8EE);
          ambientLight.intensity = 0.85;
          ambientLight.color.setHex(0xFFFFFF);
          rainPoints.visible = false;
          streetLights.forEach((l) => (l.intensity = 0));
          spotL.intensity = 0.15;
          spotR.intensity = 0.15;
        } else if (curWeather === 'rain') {
          scene.background = new THREE.Color(0x94A3B8);
          scene.fog = new THREE.FogExp2(0x94A3B8, 0.015);
          sunLight.intensity = 0.45;
          sunLight.color.setHex(0xCBD5E1);
          ambientLight.intensity = 0.55;
          ambientLight.color.setHex(0xB0C4DE);
          rainPoints.visible = true;
          streetLights.forEach((l) => (l.intensity = 0.6));
          spotL.intensity = 1.2;
          spotR.intensity = 1.2;

          const positions = rainGeo.attributes.position.array as Float32Array;
          for (let i = 1; i < rainCount * 3; i += 3) {
            positions[i] -= 0.85;
            if (positions[i] < 0) positions[i] = 35;
          }
          rainGeo.attributes.position.needsUpdate = true;
        } else if (curWeather === 'night') {
          scene.background = new THREE.Color(0x0B1120);
          scene.fog = new THREE.FogExp2(0x0B1120, 0.013);
          sunLight.intensity = 0.05;
          ambientLight.intensity = 0.25;
          ambientLight.color.setHex(0x38BDF8);
          rainPoints.visible = false;
          streetLights.forEach((l) => (l.intensity = 1.6));
          spotL.intensity = 2.4;
          spotR.intensity = 2.4;
        }
      }

      // ==========================================
      // AMBIENT CARS MOVEMENT (SMOOTH & BUG-FREE)
      // ==========================================
      // Ambient Car 1: loops smoothly on center avenue
      ambientCar1Progress = (ambientCar1Progress + delta * 0.035) % 1.0;
      const ac1Z = -22 + ambientCar1Progress * 44;
      ambientCar1.position.set(-1.8, 0, ac1Z);
      ambientCar1.rotation.y = 0; // facing +Z

      // Ambient Car 2: loops smoothly on South street westbound
      ambientCar2Progress = (ambientCar2Progress + delta * 0.03) % 1.0;
      const ac2X = 30 - ambientCar2Progress * 60;
      ambientCar2.position.set(ac2X, 0, 36.0);
      ambientCar2.rotation.y = -Math.PI / 2; // facing -X

      // Ambient Motorbike: loops smoothly on East avenue northbound
      ambientMotoProgress = (ambientMotoProgress + delta * 0.045) % 1.0;
      const amZ = 28 - ambientMotoProgress * 56;
      ambientMotorbike.position.set(34.2, 0, amZ);
      ambientMotorbike.rotation.y = Math.PI; // facing -Z

      // ==========================================
      // IMMEDIATE SCENARIO INITIALIZATION (RUNS STRICTLY 1X PER TRIGGER)
      // ==========================================
      const curScenario = stateRef.current.activeScenario;

      // 1. Skenario Orang Menyeberang (Pejalan kaki nyebrang dari trotoar ke trotoar tanpa zebra cross)
      if (curScenario === 'pedestrian' && !pedActive && !scenarioRanOnceRef.current.pedestrian) {
        scenarioRanOnceRef.current.pedestrian = true;
        pedActive = true;
        pedStage = 'walking_to_lane';
        pedLateralOffset = -4.0; // Trotoar kiri
        pedForwardDist = 14.0; // Jarak aman di depan mobil
        pedHasCountedHazard = false;

        pedAnchorPos.set(carX, 0, carZ);
        pedestrianGroup.visible = true;
      }

      // 2. Skenario Mobil Depan Ngerem (Melihat jarak aman & rem halus bertahap)
      if (curScenario === 'car_brake' && !leadCarActive && !scenarioRanOnceRef.current.car_brake) {
        scenarioRanOnceRef.current.car_brake = true;
        leadCarActive = true;
        leadCarDist = 15.0; // Dimulai dari jarak aman 15 meter
        leadCarStage = 'appearing';
        leadCarTimer = 0;
        leadHasCountedHazard = false;
        leadingCarGroup.visible = true;
        leadBrakeLightL.material = brakeMatOff;
        leadBrakeLightR.material = brakeMatOff;
      }

      // 3. Skenario Lampu Merah (Berhenti tertib di persimpangan)
      if (curScenario === 'red_light' && !redLightActive && !scenarioRanOnceRef.current.red_light) {
        scenarioRanOnceRef.current.red_light = true;
        redLightActive = true;
        redLightStage = 'red';
        redLightTimer = 0;
        tlHasCountedHazard = false;

        // Anchor traffic light gantry 16m ahead of the car along heading
        const forwardVec = new THREE.Vector3(0, 0, 16.0).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRot);
        tlAnchorPos = new THREE.Vector3(carX, 0, carZ).add(forwardVec);

        trafficLightGroup.position.copy(tlAnchorPos);
        trafficLightGroup.rotation.y = carRot;
        trafficLightGroup.visible = true;
      }

      // ==========================================
      // OBSTACLE SIMULATION & AI DECISIONS
      // ==========================================
      let decisionText = stateRef.current.isDriving
        ? 'Jalur aman, melaju tenang mengikuti rute menuju Univ Ma Chung'
        : 'Mobil parkir di titik start Stasiun Malang. Tekan Mulai Jalan untuk menjelajah rute.';
      let dangerLevel: 'safe' | 'warning' | 'danger' = 'safe';
      const obstacleList: ObstacleObject[] = [];

      // CALM CRUISING SPEED: ~0.040 (smooth ~26 km/jam, easy to see scenery and AI decisions!)
      const cruisingTarget = 0.040;

      // ------------------------------------------
      // 1. Orang Menyeberang Execution
      // ------------------------------------------
      if (pedActive) {
        // Pedestrian moves across the road from left to right (-3.8 to +3.8)
        pedLateralOffset += delta * 1.35; // walking speed
        pedLegL.rotation.x = Math.sin(time * 8) * 0.6;
        pedLegR.rotation.x = -Math.sin(time * 8) * 0.6;

        // Position pedestrian in world coordinates
        const forwardOffset = new THREE.Vector3(0, 0, pedForwardDist).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRot);
        const lateralOffset = new THREE.Vector3(pedLateralOffset, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRot);
        const pedWorldPos = new THREE.Vector3(carX, 0, carZ).add(forwardOffset).add(lateralOffset);

        pedestrianGroup.position.copy(pedWorldPos);
        pedestrianGroup.rotation.y = carRot + Math.PI / 2; // Facing across street

        const distToCar = pedForwardDist;

        if (pedLateralOffset < 2.8) {
          // Pedestrian is currently crossing the driving lane!
          dangerLevel = 'danger';
          decisionText = 'Ada orang menyeberang jalan dari trotoar! Mobil mengerem halus dan berhenti di jarak aman';
          targetSpeed = 0;
          cameraShake = 0; // Rem halus tanpa guncangan kasar mendadak

          if (!pedHasCountedHazard) {
            pedHasCountedHazard = true;
            onHazardAvoided();
          }

          onScenarioDetailUpdate?.({
            type: 'pedestrian',
            title: 'Skenario: Orang Menyeberang',
            step: 'action',
            stepText: 'Pengereman Halus & Bertahap',
            explanation: 'LiDAR dan sensor kamera mendeteksi pejalan kaki menyeberang jalan. Komputer mobil mengerem halus secara bertahap menjaga jarak aman tanpa hentakan.',
            distanceInfo: `${Math.round(distToCar)} meter di depan (jarak aman)`,
          });
        } else {
          // Pedestrian has safely reached the opposite trotoar!
          dangerLevel = 'safe';
          decisionText = 'Pejalan kaki telah tiba di trotoar seberang dengan selamat. Jalur bersih, melanjutkan rute';

          onScenarioDetailUpdate?.({
            type: 'pedestrian',
            title: 'Skenario: Orang Menyeberang',
            step: 'clearance',
            stepText: 'Pejalan Kaki Tuntas Menyeberang',
            explanation: 'Pejalan kaki telah tiba di trotoar seberang dengan selamat. Sensor mengonfirmasi jalur bersih, mobil kembali melaju otonom.',
            distanceInfo: 'Jalur Bersih',
          });

          // Finish scenario after pedestrian safely walks off
          if (pedLateralOffset > 4.5) {
            pedActive = false;
            pedestrianGroup.visible = false;
            onScenarioCompleted?.();
          }
        }

        obstacleList.push({
          id: 'ped-1',
          type: 'pedestrian',
          name: 'Pejalan Kaki',
          x: pedWorldPos.x,
          z: pedWorldPos.z,
          distance: Math.round(distToCar),
          status: dangerLevel,
          active: true,
        });

        pedBoxLineMat.color.setHex(dangerLevel === 'danger' ? 0xEF4444 : 0x00C896);
      }

      // ------------------------------------------
      // 2. Mobil Depan Ngerem Execution
      // ------------------------------------------
      if (leadCarActive) {
        leadCarTimer += delta;

        // Position lead car in front along heading
        const forwardOffset = new THREE.Vector3(0, 0, leadCarDist).applyAxisAngle(new THREE.Vector3(0, 1, 0), carRot);
        leadingCarGroup.position.set(carX + forwardOffset.x, 0, carZ + forwardOffset.z);
        leadingCarGroup.rotation.y = carRot;

        if (leadCarTimer < 1.0) {
          // Phase 1: Lead car cruising in front
          leadCarStage = 'appearing';
          leadCarDist = 15.0;
          leadBrakeLightL.material = brakeMatOff;
          leadBrakeLightR.material = brakeMatOff;
          leadBoxLineMat.color.setHex(0x00C896);
          decisionText = 'Mobil di depan terdeteksi melaju di jarak aman (15 meter)';

          onScenarioDetailUpdate?.({
            type: 'car_brake',
            title: 'Skenario: Mobil Depan Ngerem',
            step: 'detection',
            stepText: 'Mendeteksi Jarak Kendaraan Depan',
            explanation: 'Radar & LiDAR membaca mobil di depan pada jarak 15 meter dan terus memantau kecepatan serta jarak aman.',
            distanceInfo: `${Math.round(leadCarDist)} meter di depan`,
          });
        } else if (leadCarTimer >= 1.0 && leadCarTimer < 4.2) {
          // Phase 2: Lead car slows down / brakes smoothly
          leadCarStage = 'braking';
          leadBrakeLightL.material = brakeMatOn;
          leadBrakeLightR.material = brakeMatOn;
          leadBoxLineMat.color.setHex(0xEF4444);
          dangerLevel = 'danger';
          decisionText = 'Mobil depan melambat & mengerem! AI menyesuaikan deselerasi halus menjaga jarak aman';
          targetSpeed = 0;
          cameraShake = 0; // Bebas dari hentakan mendadak

          // Closes in gently while preserving a safe 6.5 - 7m cushion
          leadCarDist = Math.max(6.8, leadCarDist - delta * 1.5);

          if (!leadHasCountedHazard) {
            leadHasCountedHazard = true;
            onHazardAvoided();
          }

          onScenarioDetailUpdate?.({
            type: 'car_brake',
            title: 'Skenario: Mobil Depan Ngerem',
            step: 'action',
            stepText: 'Deselerasi Halus Berjarak Aman',
            explanation: 'Radar mendeteksi lampu rem mobil depan menyala. Komputer mobil menyesuaikan kecepatan secara halus dan bertahap, berhenti di jarak aman 7 meter tanpa rem mendadak.',
            distanceInfo: `${Math.round(leadCarDist)} meter (jarak aman terlindungi)`,
          });
        } else if (leadCarTimer >= 4.2) {
          // Phase 3: Lead car accelerates away smoothly
          leadCarStage = 'accelerating_away';
          leadBrakeLightL.material = brakeMatOff;
          leadBrakeLightR.material = brakeMatOff;
          leadBoxLineMat.color.setHex(0x00C896);
          leadCarDist += delta * 8.0; // melaju menjauh secara wajar

          decisionText = 'Mobil depan kembali melaju. Sistem melepaskan rem dan mulai akselerasi tenang';

          onScenarioDetailUpdate?.({
            type: 'car_brake',
            title: 'Skenario: Mobil Depan Ngerem',
            step: 'clearance',
            stepText: 'Mobil Depan Melaju Menjauh',
            explanation: 'Kendaraan di depan telah melaju kembali. Sistem otonom melepaskan rem secara gradual dan mulai bergerak maju mengikuti rute.',
            distanceInfo: `${Math.round(leadCarDist)} meter (menjauh)`,
          });

          // Scenario completes only after lead car pulls completely away (> 24m)
          if (leadCarDist > 24) {
            leadCarActive = false;
            leadingCarGroup.visible = false;
            onScenarioCompleted?.();
          }
        }

        obstacleList.push({
          id: 'car-lead',
          type: 'vehicle',
          name: 'Mobil Depan',
          x: leadingCarGroup.position.x,
          z: leadingCarGroup.position.z,
          distance: Math.round(leadCarDist),
          status: dangerLevel,
          active: true,
        });
      }

      // ------------------------------------------
      // 3. Lampu Merah Execution
      // ------------------------------------------
      if (redLightActive) {
        redLightTimer += delta;
        const distToLight = carRoot.position.distanceTo(tlAnchorPos);

        if (redLightTimer < 5.0) {
          // RED LIGHT
          redLightStage = 'red';
          redLightMesh.material = new THREE.MeshBasicMaterial({ color: 0xFF1100 });
          yellowLightMesh.material = new THREE.MeshBasicMaterial({ color: 0x221100 });
          greenLightMesh.material = new THREE.MeshBasicMaterial({ color: 0x002200 });
          tlBoundingMat.color.setHex(0xEF4444);

          dangerLevel = 'danger';
          const countdown = Math.ceil(5.0 - redLightTimer);
          decisionText = `Mendeteksi lampu merah di persimpangan! Berhenti di garis henti (${countdown}d)`;
          targetSpeed = 0;

          if (!tlHasCountedHazard) {
            tlHasCountedHazard = true;
            onHazardAvoided();
          }

          onScenarioDetailUpdate?.({
            type: 'red_light',
            title: 'Skenario: Lampu Merah',
            step: 'action',
            stepText: `Berhenti Garis Henti (${countdown}d)`,
            explanation: 'Kamera AI mengidentifikasi sinyal lampu merah dan menghentikan kendaraan secara presisi di belakang garis henti putih.',
            distanceInfo: `${Math.round(distToLight)} meter ke lampu`,
          });
        } else {
          // GREEN LIGHT
          redLightStage = 'green';
          redLightMesh.material = new THREE.MeshBasicMaterial({ color: 0x440000 });
          yellowLightMesh.material = new THREE.MeshBasicMaterial({ color: 0x221100 });
          greenLightMesh.material = new THREE.MeshBasicMaterial({ color: 0x00FF88 });
          tlBoundingMat.color.setHex(0x00C896);

          decisionText = 'Lampu telah hijau! Melanjutkan rute melewati persimpangan';
          targetSpeed = cruisingTarget;

          onScenarioDetailUpdate?.({
            type: 'red_light',
            title: 'Skenario: Lampu Merah',
            step: 'clearance',
            stepText: 'Lampu Berganti Hijau',
            explanation: 'Sinyal kamera membaca lampu hijau. Mobil otonom mengonfirmasi persimpangan aman dan berakselerasi halus melintas.',
            distanceInfo: 'Persimpangan Aman',
          });

          // Scenario completes only after car safely passes the traffic light
          if (distToLight < 2.5 || redLightTimer > 7.5) {
            redLightActive = false;
            trafficLightGroup.visible = false;
            onScenarioCompleted?.();
          }
        }

        obstacleList.push({
          id: 'tl-1',
          type: 'traffic_light',
          name: redLightStage === 'red' ? 'Lampu Merah' : 'Lampu Hijau',
          x: tlAnchorPos.x,
          z: tlAnchorPos.z,
          distance: Math.round(distToLight),
          status: redLightStage === 'red' ? 'danger' : 'safe',
          active: true,
        });
      }

      // If driving is OFF, car is stopped
      if (!stateRef.current.isDriving) {
        targetSpeed = 0;
      } else if (dangerLevel === 'safe' && targetSpeed === 0 && stateRef.current.driveMode === 'auto') {
        targetSpeed = cruisingTarget;
      }

      // ==========================================
      // VEHICLE DRIVING CONTROLS & ROUTE PROGRESS
      // ==========================================
      const isManual = stateRef.current.driveMode === 'manual';
      let steerAngle = 0;

      if (isManual) {
        const ctrl = stateRef.current.manualControls;
        if (ctrl.forward) {
          targetSpeed = 0.055;
          decisionText = 'Mode Manual: Akselerasi maju';
        } else if (ctrl.backward) {
          targetSpeed = -0.025;
          decisionText = 'Mode Manual: Mundur perlahan';
        } else {
          targetSpeed = 0;
          decisionText = 'Mode Manual: Siap menerima input kemudi';
        }

        if (ctrl.left) {
          steerAngle = 0.42;
          carRot += 0.028 * (carSpeed >= 0 ? 1 : -1);
        } else if (ctrl.right) {
          steerAngle = -0.42;
          carRot -= 0.028 * (carSpeed >= 0 ? 1 : -1);
        }

        wheelFL.rotation.y = steerAngle;
        wheelFR.rotation.y = steerAngle;
      } else {
        // AUTO MODE: Follow waypoints from Stasiun Malang to Univ Ma Chung
        const targetWp = waypoints[currentWaypointIdx];
        const dx = targetWp.x - carX;
        const dz = targetWp.z - carZ;
        const distToWp = Math.hypot(dx, dz);

        if (distToWp < 3.2) {
          if (currentWaypointIdx < waypoints.length - 1) {
            currentWaypointIdx++;
          } else {
            // Arrived at Universitas Ma Chung!
            targetSpeed = 0;
            decisionText = '🎉 Selamat! Tiba di Universitas Ma Chung. Rute perjalanan sukses diselesaikan!';
            onRouteProgressUpdate?.({
              origin: 'Stasiun Malang',
              destination: 'Univ Ma Chung',
              progressPercent: 100,
              hasArrived: true,
            });
          }
        }

        const desiredAngle = Math.atan2(dx, dz);
        let angleDiff = desiredAngle - carRot;
        while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
        while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

        steerAngle = Math.max(-0.35, Math.min(0.35, angleDiff));
        carRot += angleDiff * 0.055;

        wheelFL.rotation.y = steerAngle;
        wheelFR.rotation.y = steerAngle;

        const progressPct = Math.min(
          100,
          Math.round((currentWaypointIdx / (waypoints.length - 1)) * 100)
        );
        onRouteProgressUpdate?.({
          origin: 'Stasiun Malang',
          destination: 'Univ Ma Chung',
          progressPercent: progressPct,
          hasArrived: progressPct === 100,
        });
      }

      // Smooth acceleration & gentle progressive braking (no sudden jolts)
      const prevSpeed = carSpeed;
      carSpeed += (targetSpeed - carSpeed) * (targetSpeed < carSpeed ? 0.040 : 0.035);
      isBraking = carSpeed < prevSpeed - 0.0006 || (targetSpeed === 0 && carSpeed > 0.003);

      // Tail brake light strip illumination
      if (isBraking || (targetSpeed === 0 && Math.abs(carSpeed) > 0.001)) {
        brakeLightStrip.material = brakeMatOn;
        brakePointLight.intensity = 1.8;
      } else {
        brakeLightStrip.material = brakeMatOff;
        brakePointLight.intensity = 0;
      }

      // Move car position
      carX += Math.sin(carRot) * carSpeed;
      carZ += Math.cos(carRot) * carSpeed;

      carRoot.position.set(carX, 0, carZ);
      carRoot.rotation.y = carRot;

      // Wheel spin
      const rollDelta = carSpeed * 3.0;
      wheelFL.children[0].rotation.x += rollDelta;
      wheelFR.children[0].rotation.x += rollDelta;
      wheelRL.children[0].rotation.x += rollDelta;
      wheelRR.children[0].rotation.x += rollDelta;

      // Technical Vision Display Toggle
      const isTech = stateRef.current.displayVision === 'technical';
      sensorGroup.visible = isTech;
      pedBoundingBox.visible = isTech && pedActive;
      leadBoundingBox.visible = isTech && leadCarActive;
      tlBoundingBox.visible = isTech && redLightActive;

      if (isTech) {
        frontRadarArc.scale.set(
          1 + Math.sin(time * 6) * 0.06,
          1 + Math.sin(time * 6) * 0.06,
          1
        );
        rayLines.forEach((ray) => {
          if (dangerLevel === 'danger') {
            ray.material = rayMatDanger;
          } else {
            ray.material = rayMatNormal;
          }
        });
      }

      // ==========================================
      // CAMERA POV MODES (DEFAULT: CHASE / IKUTI MOBIL)
      // ==========================================
      const currentPov = stateRef.current.cameraView;

      if (cameraShake > 0.001) {
        cameraShake *= 0.88;
      } else {
        cameraShake = 0;
      }
      const shakeOffset = new THREE.Vector3(
        (Math.random() - 0.5) * cameraShake,
        (Math.random() - 0.5) * cameraShake,
        (Math.random() - 0.5) * cameraShake
      );

      if (currentPov === 'orbit') {
        const sx = sphericalRadius * Math.sin(sphericalPhi) * Math.sin(sphericalTheta);
        const sy = sphericalRadius * Math.cos(sphericalPhi);
        const sz = sphericalRadius * Math.sin(sphericalPhi) * Math.cos(sphericalTheta);

        orbitTarget.lerp(new THREE.Vector3(carX, 1.0, carZ), 0.08);
        camera.position.set(orbitTarget.x + sx, orbitTarget.y + sy, orbitTarget.z + sz).add(shakeOffset);
        camera.lookAt(orbitTarget);
      } else if (currentPov === 'top') {
        camera.position.lerp(new THREE.Vector3(carX, 55, carZ), 0.1).add(shakeOffset);
        camera.lookAt(carX, 0, carZ);
        camera.rotation.z = -carRot;
      } else if (currentPov === 'driver') {
        const cabinWorldPos = driverCameraPos.clone().applyMatrix4(carRoot.matrixWorld);
        camera.position.copy(cabinWorldPos).add(shakeOffset);
        const lookForward = new THREE.Vector3(0, 1.0, 12).applyMatrix4(carRoot.matrixWorld);
        camera.lookAt(lookForward);
      } else {
        // 'chase' (Default: Ikuti Mobil)
        // Positioned behind and slightly above the Lamborghini along heading
        const chaseBack = new THREE.Vector3(0, 3.2, -8.5).applyAxisAngle(
          new THREE.Vector3(0, 1, 0),
          carRot
        );
        const desiredCamPos = new THREE.Vector3(carX + chaseBack.x, chaseBack.y, carZ + chaseBack.z);
        camera.position.lerp(desiredCamPos, 0.1).add(shakeOffset);
        const lookAhead = new THREE.Vector3(0, 1.1, 7).applyMatrix4(carRoot.matrixWorld);
        camera.lookAt(lookAhead);
      }

      renderer.render(scene, camera);

      // Report telemetry
      onTelemetryUpdate(
        {
          x: carX,
          z: carZ,
          rotation: carRot,
          speed: carSpeed,
          targetSpeed,
          isBraking,
          steeringAngle: steerAngle,
        },
        obstacleList,
        decisionText
      );
    };

    animationFrameId = requestAnimationFrame(animate);

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);

      renderer.dispose();
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing overflow-hidden"
    />
  );
};

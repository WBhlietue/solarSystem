import {
    AmbientLight,
    BoxGeometry,
    Color,
    DirectionalLight,
    LinearEncoding,
    Mesh,
    MeshBasicMaterial,
    MeshPhongMaterial,
    MeshStandardMaterial,
    PerspectiveCamera,
    Scene,
    sRGBEncoding,
    Texture,
    TextureLoader,
    WebGLRenderer,
} from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { MapControls } from "three/addons/controls/MapControls.js";

const scene = new Scene();
const camera = new PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    100000
);
const renderer = new WebGLRenderer();

renderer.setSize(window.innerWidth, window.innerHeight);

camera.position.z = 75;

const dirLight = new DirectionalLight(0xffffff, 1);
const ambLight = new AmbientLight(0xffffff, 0.1);
dirLight.position.set(1, 2, 3);
scene.add(dirLight);
scene.add(ambLight);

const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

async function LoadObject(modelName, textureName, scale, pos, cameraDis, rot) {
    const loader = new FBXLoader();
    const model = await loader.loadAsync("src/models/" + modelName + ".fbx");
    const texture = await new TextureLoader().loadAsync(
        "src/texture/" + textureName + ".jpg"
    );
    const material = new MeshPhongMaterial();
    material.color = new Color(0xffffff);
    material.side = 2;
    material.map = texture;
    model.scale.x = scale.x;
    model.scale.y = scale.y;
    model.scale.z = scale.z;
    model.position.x = pos.x;
    model.position.y = pos.y;
    model.position.z = pos.z;
    model.rotation.x = (rot * Math.PI) / 180;
    // model.material = material;
    model.traverse((o) => {
        if (o.isMesh) o.material = material;
    });
    scene.add(model);
    const Update = () => {
        requestAnimationFrame(Update);
        model.rotation.y += 0.01;
        controls.update();
        renderer.render(scene, camera);
    };
    Update();
    return () => {
        camera.position.x = model.position.x;
        camera.position.y = model.position.y;
        camera.position.z = cameraDis;
        // camera.rotation.x= 0;
        // camera.rotation.y= 90;
        camera.rotation.z = 100;
        controls.target.set(
            model.position.x,
            model.position.y,
            model.position.z
        );
    };
}

// const sunSize = 1.0925
const sunSize = 0.3;
const sizes = [0.00383, 0.0095, 0.01, 0.00532, 0.197, 0.0914, 0.0398, 0.0387];
const distance = [40, 70, 100, 150, 520, 950, 1920, 3010];
const cameraDis = [75, 1, 2, 2, 2, 45, 80, 10, 10];
const rot = [7.25, 0, 177.36, 23.4, 25.19, 3.13, 26.73, 97.77, 28.32];

for (let i = 0; i < distance.length; i++) {
    distance[i] += 50;
}
const names = [
    "mercury",
    "venus",
    "earth",
    "mars",
    "jupiter",
    "saturn",
    "uranus",
    "neptune",
];

const changeCameraPos = [];
changeCameraPos.push(
    await LoadObject(
        "Earth",
        "sun",
        { x: sunSize, y: sunSize, z: sunSize },
        { x: 0, y: 0, z: 0 },
        cameraDis[0],
        rot[0]
    )
);

for (let i = 0; i < 8; i++) {
    changeCameraPos.push(
        await LoadObject(
            "Earth",
            names[i],
            { x: sizes[i], y: sizes[i], z: sizes[i] },
            { x: distance[i], y: 0, z: 0 },
            cameraDis[i + 1],
            rot[i + 1]
        )
    );
}
LoadObject(
    "Ring",
    "saturnRing",
    { x: 0.2, y: 0.2, z: 0.2 },
    { x: 950 + 50, y: 0, z: 0 },
    0,
    rot[6]
);
// OnRender();

names.unshift("sun");
await SetControls();

async function SetControls() {
    const main = document.getElementById("controls");
    for (let i = 0; i < names.length; i++) {
        const child = document.createElement("div");
        child.innerHTML = names[i];
        child.classList.add("child");
        child.addEventListener("click", () => {
            const res = changeCameraPos[i]
            res()
        });
        main.appendChild(child);
    }
    document.getElementById("loading").remove()
    document.body.appendChild(renderer.domElement);
}

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// ======================================================
// SCENE
// ======================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x222222);


// ======================================================
// CAMERA
// ======================================================

const camera = new THREE.PerspectiveCamera(
    45,
    1,
    0.1,
    1000
);

camera.position.set(22, 18, 25);


// ======================================================
// RENDERER
// ======================================================

const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setPixelRatio(window.devicePixelRatio);

renderer.setSize(
    document.getElementById('scene').clientWidth,
    document.getElementById('scene').clientHeight
);

document.getElementById('scene').appendChild(renderer.domElement);


// ======================================================
// CONTROLS
// ======================================================

const controls = new OrbitControls(
    camera,
    renderer.domElement
);

controls.enableDamping = true;

controls.target.set(0, 2, 0);

controls.update();


// ======================================================
// LIGHT
// ======================================================

const ambientLight = new THREE.AmbientLight(
    0xffffff,
    1.5
);

scene.add(ambientLight);


const directionalLight = new THREE.DirectionalLight(
    0xffffff,
    2
);

directionalLight.position.set(
    10,
    20,
    10
);

scene.add(directionalLight);


// ======================================================
// GRID
// ======================================================

const grid = new THREE.GridHelper(
    50,
    50
);

grid.position.y = 0;

scene.add(grid);


// ======================================================
// TRUCK
// ======================================================

const truckLength = 20;
const truckWidth = 8;
const truckHeight = 4;


// floor

const floorGeometry = new THREE.BoxGeometry(
    truckLength,
    0.3,
    truckWidth
);

const floorMaterial = new THREE.MeshStandardMaterial({
    color: 0x555555
});

const floor = new THREE.Mesh(
    floorGeometry,
    floorMaterial
);

floor.position.y = 0;

scene.add(floor);


// left wall

const wallGeometry = new THREE.BoxGeometry(
    truckLength,
    truckHeight,
    0.3
);

const wallMaterial = new THREE.MeshStandardMaterial({
    color: 0x777777
});

const leftWall = new THREE.Mesh(
    wallGeometry,
    wallMaterial
);

leftWall.position.set(
    0,
    truckHeight / 2,
    -truckWidth / 2
);

scene.add(leftWall);


// right wall

const rightWall = leftWall.clone();

rightWall.position.z = truckWidth / 2;

scene.add(rightWall);


// front wall

const frontWallGeometry = new THREE.BoxGeometry(
    0.3,
    truckHeight,
    truckWidth
);

const frontWall = new THREE.Mesh(
    frontWallGeometry,
    wallMaterial
);

frontWall.position.set(
    -truckLength / 2,
    truckHeight / 2,
    0
);

scene.add(frontWall);


// ======================================================
// CARGO
// ======================================================

const cargoes = [];

let cargoCounter = 0;

let selectedCargo = null;

let dragging = false;

let dragOffset = new THREE.Vector3();

let lastValidPosition = new THREE.Vector3();


// ======================================================
// COLORS
// ======================================================

const cargoColors = [
    0xff6600,
    0x22c55e,
    0x3b82f6,
    0xa855f7,
    0xeab308,
    0xef4444,
    0x06b6d4
];


// ======================================================
// CREATE CARGO
// ======================================================

function createCargo(
    length,
    width,
    height,
    color,
    name = null
) {

    cargoCounter++;

    const cargo = {

        id: cargoCounter,

        name: name || `Груз ${cargoCounter}`,

        length: length,

        width: width,

        height: height,

        weight: 100,

        canRotate: true,

        canStack: true,

        rotation: 0,

        color: color,

        mesh: null

    };


    const geometry = new THREE.BoxGeometry(
        length,
        height,
        width
    );


    const material = new THREE.MeshStandardMaterial({
        color: color
    });


    const mesh = new THREE.Mesh(
        geometry,
        material
    );


    cargo.mesh = mesh;


    mesh.userData.cargo = cargo;


    mesh.position.set(
        0,
        height / 2 + 0.15,
        0
    );


    cargoes.push(cargo);

    scene.add(mesh);


    renderCargoList();

    selectCargo(cargo);

    return cargo;
}


// ======================================================
// UPDATE CARGO GEOMETRY
// ======================================================

function updateCargoGeometry(cargo) {

    const oldGeometry = cargo.mesh.geometry;

    oldGeometry.dispose();


    cargo.mesh.geometry = new THREE.BoxGeometry(
        cargo.length,
        cargo.height,
        cargo.width
    );


    cargo.mesh.rotation.y =
        THREE.MathUtils.degToRad(cargo.rotation);


    cargo.mesh.position.y =
        calculateHeight(
            cargo,
            cargo.mesh.position.x,
            cargo.mesh.position.z
        ) + cargo.height / 2;
}


// ======================================================
// CARGO LIST
// ======================================================

function renderCargoList() {

    const list =
        document.getElementById('cargoList');

    list.innerHTML = '';


    cargoes.forEach(cargo => {

        const item =
            document.createElement('div');

        item.className = 'cargo-item';


        if (
            selectedCargo &&
            selectedCargo.id === cargo.id
        ) {
            item.classList.add('selected');
        }


        item.innerHTML = `
            <div class="cargo-name">
                ${cargo.name}
            </div>

            <div class="cargo-info">
                ${cargo.length} × ${cargo.width} × ${cargo.height}
                см
                <br>
                Вес: ${cargo.weight} кг
            </div>
        `;


        item.addEventListener(
            'click',
            () => selectCargo(cargo)
        );


        list.appendChild(item);

    });
}


// ======================================================
// SELECT CARGO
// ======================================================

function selectCargo(cargo) {

    selectedCargo = cargo;


    document.getElementById(
        'cargoProperties'
    ).classList.remove('hidden');


    document.getElementById(
        'cargoName'
    ).value = cargo.name;


    document.getElementById(
        'cargoLength'
    ).value = cargo.length;


    document.getElementById(
        'cargoWidth'
    ).value = cargo.width;


    document.getElementById(
        'cargoHeight'
    ).value = cargo.height;


    document.getElementById(
        'cargoWeight'
    ).value = cargo.weight;


    document.getElementById(
        'cargoCanStack'
    ).checked = cargo.canStack;


    document.getElementById(
        'cargoCanRotate'
    ).checked = cargo.canRotate;


    renderCargoList();

}


// ======================================================
// PROPERTY INPUTS
// ======================================================

document.getElementById(
    'cargoName'
).addEventListener(
    'input',
    function () {

        if (!selectedCargo) return;

        selectedCargo.name = this.value;

        renderCargoList();

    }
);


document.getElementById(
    'cargoLength'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) return;

        const value = Number(this.value);

        if (value <= 0) return;

        selectedCargo.length = value;

        updateCargoGeometry(selectedCargo);

        renderCargoList();

    }
);


document.getElementById(
    'cargoWidth'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) return;

        const value = Number(this.value);

        if (value <= 0) return;

        selectedCargo.width = value;

        updateCargoGeometry(selectedCargo);

        renderCargoList();

    }
);


document.getElementById(
    'cargoHeight'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) return;

        const value = Number(this.value);

        if (value <= 0) return;

        selectedCargo.height = value;

        updateCargoGeometry(selectedCargo);

        renderCargoList();

    }
);


document.getElementById(
    'cargoWeight'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) return;

        const value = Number(this.value);

        if (value < 0) return;

        selectedCargo.weight = value;

        renderCargoList();

    }
);


document.getElementById(
    'cargoCanStack'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) return;

        selectedCargo.canStack =
            this.checked;

    }
);


document.getElementById(
    'cargoCanRotate'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) return;

        selectedCargo.canRotate =
            this.checked;

    }
);


// ======================================================
// ROTATE
// ======================================================

document.getElementById(
    'rotateCargo'
).addEventListener(
    'click',
    function () {

        if (!selectedCargo) return;

        if (!selectedCargo.canRotate) {

            alert(
                'Этот груз нельзя поворачивать.'
            );

            return;
        }


        selectedCargo.rotation += 90;


        if (selectedCargo.rotation >= 360) {
            selectedCargo.rotation = 0;
        }


        const oldLength =
            selectedCargo.length;


        selectedCargo.length =
            selectedCargo.width;


        selectedCargo.width =
            oldLength;


        updateCargoGeometry(
            selectedCargo
        );


        selectCargo(
            selectedCargo
        );

    }
);


// ======================================================
// DELETE
// ======================================================

document.getElementById(
    'deleteCargo'
).addEventListener(
    'click',
    function () {

        if (!selectedCargo) return;


        const index =
            cargoes.indexOf(selectedCargo);


        if (index !== -1) {

            scene.remove(
                selectedCargo.mesh
            );


            selectedCargo.mesh.geometry.dispose();

            selectedCargo.mesh.material.dispose();


            cargoes.splice(
                index,
                1
            );

        }


        selectedCargo = null;


        document.getElementById(
            'cargoProperties'
        ).classList.add('hidden');


        renderCargoList();

    }
);


// ======================================================
// ADD CARGO
// ======================================================

document.getElementById(
    'addCargo'
).addEventListener(
    'click',
    function () {

        const color =
            cargoColors[
                cargoes.length %
                cargoColors.length
            ];


        createCargo(
            3,
            2,
            2,
            color,
            `Груз ${cargoCounter + 1}`
        );

    }
);


// ======================================================
// INITIAL CARGO
// ======================================================

createCargo(
    4,
    2,
    2,
    0xff6600,
    'Коробка 1'
);


// ======================================================
// RAYCASTER
// ======================================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


// ======================================================
// DRAG PLANE
// ======================================================

const dragPlane =
    new THREE.Plane(
        new THREE.Vector3(0, 1, 0),
        -0.15
    );


// ======================================================
// POINTER DOWN
// ======================================================

renderer.domElement.addEventListener(
    'pointerdown',
    function (event) {

        const rect =
            renderer.domElement.getBoundingClientRect();


        mouse.x =
            (
                (event.clientX - rect.left)
                /
                rect.width
            ) * 2 - 1;


        mouse.y =
            -(
                (event.clientY - rect.top)
                /
                rect.height
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const intersections =
            raycaster.intersectObjects(
                cargoes.map(c => c.mesh)
            );


        if (intersections.length === 0) {
            return;
        }


        const cargo =
            intersections[0]
                .object
                .userData
                .cargo;


        selectCargo(cargo);


        dragging = true;


        lastValidPosition.copy(
            cargo.mesh.position
        );


        controls.enabled = false;


        const point =
            new THREE.Vector3();


        raycaster.ray.intersectPlane(
            dragPlane,
            point
        );


        dragOffset.subVectors(
            cargo.mesh.position,
            point
        );

    }
);


// ======================================================
// POINTER MOVE
// ======================================================

renderer.domElement.addEventListener(
    'pointermove',
    function (event) {

        if (!dragging || !selectedCargo) {
            return;
        }


        const rect =
            renderer.domElement.getBoundingClientRect();


        mouse.x =
            (
                (event.clientX - rect.left)
                /
                rect.width
            ) * 2 - 1;


        mouse.y =
            -(
                (event.clientY - rect.top)
                /
                rect.height
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const point =
            new THREE.Vector3();


        raycaster.ray.intersectPlane(
            dragPlane,
            point
        );


        let x =
            point.x +
            dragOffset.x;


        let z =
            point.z +
            dragOffset.z;


        const cargo =
            selectedCargo;


        // ----------------------------------
        // BOUNDS
        // ----------------------------------

        const halfLength =
            cargo.length / 2;


        const halfWidth =
            cargo.width / 2;


        x = Math.max(
            -truckLength / 2 + halfLength,
            Math.min(
                truckLength / 2 - halfLength,
                x
            )
        );


        z = Math.max(
            -truckWidth / 2 + halfWidth,
            Math.min(
                truckWidth / 2 - halfWidth,
                z
            )
        );


        // ----------------------------------
        // HEIGHT
        // ----------------------------------

        const supportHeight =
    calculateHeight(
        cargo,
        x,
        z
    );


const newPosition =
    new THREE.Vector3(
        x,
        supportHeight +
        cargo.height / 2,
        z
    );


        // ----------------------------------
        // COLLISION
        // ----------------------------------

        if (
            intersectsCargo(
                cargo,
                newPosition
            )
        ) {

            cargo.mesh.position.copy(
                lastValidPosition
            );

            return;

        }


        cargo.mesh.position.copy(
            newPosition
        );

        cargo.mesh.position.x =
    Math.round(
        cargo.mesh.position.x * 10
    ) / 10;

cargo.mesh.position.z =
    Math.round(
        cargo.mesh.position.z * 10
    ) / 10;


        lastValidPosition.copy(
            newPosition
        );

    }
);


// ======================================================
// POINTER UP
// ======================================================

renderer.domElement.addEventListener(
    'pointerup',
    function () {

        dragging = false;

        controls.enabled = true;

    }
);


// ======================================================
// CALCULATE HEIGHT
// ======================================================

function calculateHeight(cargo, x, z) {

    const groundHeight = 0.15;

    let bestHeight = groundHeight;

    const cargoHalfLength = cargo.length / 2;
    const cargoHalfWidth = cargo.width / 2;

    const cargoLeft = x - cargoHalfLength;
    const cargoRight = x + cargoHalfLength;

    const cargoFront = z - cargoHalfWidth;
    const cargoBack = z + cargoHalfWidth;


    for (const support of cargoes) {

        if (support === cargo) {
            continue;
        }

        // ----------------------------------
        // Нельзя ставить на этот груз
        // ----------------------------------

        if (!support.canStack) {
            continue;
        }


        const supportLeft =
            support.mesh.position.x -
            support.length / 2;

        const supportRight =
            support.mesh.position.x +
            support.length / 2;

        const supportFront =
            support.mesh.position.z -
            support.width / 2;

        const supportBack =
            support.mesh.position.z +
            support.width / 2;


        // ----------------------------------
        // Пересечение площадей сверху
        // ----------------------------------

        const overlapX =
            Math.max(
                0,
                Math.min(
                    cargoRight,
                    supportRight
                ) -
                Math.max(
                    cargoLeft,
                    supportLeft
                )
            );


        const overlapZ =
            Math.max(
                0,
                Math.min(
                    cargoBack,
                    supportBack
                ) -
                Math.max(
                    cargoFront,
                    supportFront
                )
            );


        const overlapArea =
            overlapX * overlapZ;


        if (overlapArea <= 0) {
            continue;
        }


        // ----------------------------------
        // Площадь основания груза
        // ----------------------------------

        const cargoArea =
            cargo.length *
            cargo.width;


        const supportPercentage =
            overlapArea /
            cargoArea;


        // Минимум 60% площади должно
        // находиться над опорой
        if (supportPercentage < 0.6) {
            continue;
        }


        // ----------------------------------
        // Верхняя точка опоры
        // ----------------------------------

        const supportTop =
            support.mesh.position.y +
            support.height / 2;


        if (supportTop > bestHeight) {
            bestHeight = supportTop;
        }

    }


    return bestHeight;
}

function hasSupport(
    cargo,
    x,
    z,
    height
) {

    const cargoHalfLength =
        cargo.length / 2;

    const cargoHalfWidth =
        cargo.width / 2;


    const cargoLeft =
        x - cargoHalfLength;

    const cargoRight =
        x + cargoHalfLength;

    const cargoFront =
        z - cargoHalfWidth;

    const cargoBack =
        z + cargoHalfWidth;


    // Если груз стоит на полу
    if (
        Math.abs(height - 0.15) < 0.01
    ) {
        return true;
    }


    let supportedArea = 0;


    for (const support of cargoes) {

        if (support === cargo) {
            continue;
        }


        if (!support.canStack) {
            continue;
        }


        const supportTop =
            support.mesh.position.y +
            support.height / 2;


        // Груз должен находиться
        // непосредственно над опорой

        if (
            Math.abs(
                supportTop - height
            ) > 0.01
        ) {
            continue;
        }


        const supportLeft =
            support.mesh.position.x -
            support.length / 2;

        const supportRight =
            support.mesh.position.x +
            support.length / 2;

        const supportFront =
            support.mesh.position.z -
            support.width / 2;

        const supportBack =
            support.mesh.position.z +
            support.width / 2;


        const overlapX =
            Math.max(
                0,
                Math.min(
                    cargoRight,
                    supportRight
                ) -
                Math.max(
                    cargoLeft,
                    supportLeft
                )
            );


        const overlapZ =
            Math.max(
                0,
                Math.min(
                    cargoBack,
                    supportBack
                ) -
                Math.max(
                    cargoFront,
                    supportFront
                )
            );


        supportedArea +=
            overlapX * overlapZ;

    }


    const cargoArea =
        cargo.length *
        cargo.width;


    return (
        supportedArea /
        cargoArea
    ) >= 0.6;

}
// ======================================================
// COLLISION
// ======================================================

function intersectsCargo(
    cargo,
    position
) {

    const aHalfLength =
        cargo.length / 2;

    const aHalfWidth =
        cargo.width / 2;


    const aLeft =
        position.x -
        aHalfLength;

    const aRight =
        position.x +
        aHalfLength;

    const aFront =
        position.z -
        aHalfWidth;

    const aBack =
        position.z +
        aHalfWidth;


    const aBottom =
        position.y -
        cargo.height / 2;

    const aTop =
        position.y +
        cargo.height / 2;


    for (const other of cargoes) {

        if (other === cargo) {
            continue;
        }


        const bHalfLength =
            other.length / 2;

        const bHalfWidth =
            other.width / 2;


        const bLeft =
            other.mesh.position.x -
            bHalfLength;

        const bRight =
            other.mesh.position.x +
            bHalfLength;

        const bFront =
            other.mesh.position.z -
            bHalfWidth;

        const bBack =
            other.mesh.position.z +
            bHalfWidth;


        const bBottom =
            other.mesh.position.y -
            other.height / 2;

        const bTop =
            other.mesh.position.y +
            other.height / 2;


        const overlapX =
            aLeft < bRight &&
            aRight > bLeft;


        const overlapZ =
            aFront < bBack &&
            aBack > bFront;


        const overlapY =
            aBottom < bTop &&
            aTop > bBottom;


        if (
            overlapX &&
            overlapZ &&
            overlapY
        ) {

            return true;

        }

    }


    return false;

}


// ======================================================
// RESIZE
// ======================================================

window.addEventListener(
    'resize',
    function () {

        const container =
            document.getElementById('scene');


        const width =
            container.clientWidth;


        const height =
            container.clientHeight;


        camera.aspect =
            width / height;


        camera.updateProjectionMatrix();


        renderer.setSize(
            width,
            height
        );

    }
);


// ======================================================
// ANIMATION
// ======================================================

function animate() {

    requestAnimationFrame(
        animate
    );


    controls.update();


    renderer.render(
        scene,
        camera
    );

}

animate();
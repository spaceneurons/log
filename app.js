import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';


// ======================================================
// CONFIG
// ======================================================

// Все размеры теперь В САНТИМЕТРАХ.
//
// 1 единица Three.js = 1 сантиметр.

const truck = {
    length: 1360,
    width: 245,
    height: 270
};


// Пол кузова
const floorThickness = 10;


// Минимальный зазор между грузами
const cargoGap = 1;


// ======================================================
// SCENE
// ======================================================

const scene = new THREE.Scene();

scene.background = new THREE.Color(0x202020);


// ======================================================
// CAMERA
// ======================================================

const camera = new THREE.PerspectiveCamera(
    45,
    1,
    1,
    5000
);

camera.position.set(
    1600,
    1200,
    1800
);


// ======================================================
// RENDERER
// ======================================================

const container =
    document.getElementById('scene');

const renderer =
    new THREE.WebGLRenderer({
        antialias: true
    });

renderer.setPixelRatio(
    window.devicePixelRatio
);

renderer.setSize(
    container.clientWidth,
    container.clientHeight
);

container.appendChild(
    renderer.domElement
);


// ======================================================
// CONTROLS
// ======================================================

const controls =
    new OrbitControls(
        camera,
        renderer.domElement
    );

controls.enableDamping = true;

controls.target.set(
    0,
    100,
    0
);

controls.update();


// ======================================================
// LIGHT
// ======================================================

const ambientLight =
    new THREE.AmbientLight(
        0xffffff,
        1.5
    );

scene.add(
    ambientLight
);


const directionalLight =
    new THREE.DirectionalLight(
        0xffffff,
        2
    );

directionalLight.position.set(
    1000,
    2000,
    1000
);

scene.add(
    directionalLight
);


// ======================================================
// GRID
// ======================================================

const grid =
    new THREE.GridHelper(
        3000,
        60
    );

grid.position.y =
    -floorThickness / 2;

scene.add(grid);


// ======================================================
// TRUCK
// ======================================================

const floorGeometry =
    new THREE.BoxGeometry(
        truck.length,
        floorThickness,
        truck.width
    );

const floorMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x555555
    });

const floor =
    new THREE.Mesh(
        floorGeometry,
        floorMaterial
    );

floor.position.y = 0;

scene.add(floor);


// ------------------------------------------------------
// WALLS
// ------------------------------------------------------

const wallMaterial =
    new THREE.MeshStandardMaterial({
        color: 0x777777,
        transparent: true,
        opacity: 0.35
    });


// left / right

const sideWallGeometry =
    new THREE.BoxGeometry(
        truck.length,
        truck.height,
        10
    );


const leftWall =
    new THREE.Mesh(
        sideWallGeometry,
        wallMaterial
    );

leftWall.position.set(
    0,
    truck.height / 2,
    -truck.width / 2
);

scene.add(leftWall);


const rightWall =
    leftWall.clone();

rightWall.position.z =
    truck.width / 2;

scene.add(rightWall);


// front / rear

const endWallGeometry =
    new THREE.BoxGeometry(
        10,
        truck.height,
        truck.width
    );


const frontWall =
    new THREE.Mesh(
        endWallGeometry,
        wallMaterial
    );

frontWall.position.set(
    -truck.length / 2,
    truck.height / 2,
    0
);

scene.add(frontWall);


const rearWall =
    frontWall.clone();

rearWall.position.x =
    truck.length / 2;

scene.add(rearWall);


// ======================================================
// CARGO
// ======================================================

const cargoes = [];

let cargoCounter = 0;

let selectedCargo = null;

let dragging = false;

let dragOffset =
    new THREE.Vector3();

let lastValidPosition =
    new THREE.Vector3();


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
    0x06b6d4,
    0xf97316
];


// ======================================================
// CREATE CARGO
// ======================================================

function createCargo(
    length,
    width,
    height,
    weight = 100,
    color = null,
    name = null
) {

    cargoCounter++;


    const cargo = {

        id: cargoCounter,

        name:
            name ||
            `Груз ${cargoCounter}`,

        length,

        width,

        height,

        weight,

        canRotate: true,

        canStack: true,

        rotation: 0,

        color:
            color ||
            cargoColors[
                (cargoCounter - 1)
                %
                cargoColors.length
            ],

        mesh: null,

        packed: true

    };


    const geometry =
        new THREE.BoxGeometry(
            length,
            height,
            width
        );


    const material =
        new THREE.MeshStandardMaterial({
            color: cargo.color
        });


    const mesh =
        new THREE.Mesh(
            geometry,
            material
        );


    cargo.mesh = mesh;


    mesh.userData.cargo =
        cargo;


    // Начальная позиция
    mesh.position.set(
        0,
        floorThickness +
        height / 2,
        0
    );


    cargoes.push(cargo);

    scene.add(mesh);


    return cargo;
}


// ======================================================
// UPDATE GEOMETRY
// ======================================================

function updateCargoGeometry(cargo) {

    if (!cargo.mesh) {
        return;
    }


    cargo.mesh.geometry.dispose();


    cargo.mesh.geometry =
        new THREE.BoxGeometry(
            cargo.length,
            cargo.height,
            cargo.width
        );


    cargo.mesh.rotation.y =
        THREE.MathUtils.degToRad(
            cargo.rotation
        );

}


// ======================================================
// LIST
// ======================================================

function renderCargoList() {

    const list =
        document.getElementById(
            'cargoList'
        );

    list.innerHTML = '';


    cargoes.forEach(
        cargo => {

            const item =
                document.createElement(
                    'div'
                );


            item.className =
                'cargo-item';


            if (
                selectedCargo &&
                selectedCargo.id === cargo.id
            ) {

                item.classList.add(
                    'selected'
                );

            }


            item.innerHTML = `

                <div class="cargo-name">
                    ${cargo.name}
                </div>

                <div class="cargo-info">

                    ${cargo.length}
                    ×
                    ${cargo.width}
                    ×
                    ${cargo.height}
                    см

                    <br>

                    Вес:
                    ${cargo.weight}
                    кг

                    <br>

                    ${cargo.packed
                        ? '✓ Загружен'
                        : '⚠ Не загружен'}

                </div>

            `;


            item.addEventListener(
                'click',
                () => {

                    selectCargo(
                        cargo
                    );

                }
            );


            list.appendChild(
                item
            );

        }
    );

}


// ======================================================
// SELECT
// ======================================================

function selectCargo(cargo) {

    selectedCargo =
        cargo;


    document
        .getElementById(
            'cargoProperties'
        )
        .classList
        .remove('hidden');


    document.getElementById(
        'cargoName'
    ).value =
        cargo.name;


    document.getElementById(
        'cargoLength'
    ).value =
        cargo.length;


    document.getElementById(
        'cargoWidth'
    ).value =
        cargo.width;


    document.getElementById(
        'cargoHeight'
    ).value =
        cargo.height;


    document.getElementById(
        'cargoWeight'
    ).value =
        cargo.weight;


    document.getElementById(
        'cargoCanStack'
    ).checked =
        cargo.canStack;


    document.getElementById(
        'cargoCanRotate'
    ).checked =
        cargo.canRotate;


    renderCargoList();

}


// ======================================================
// PROPERTY EVENTS
// ======================================================

document.getElementById(
    'cargoName'
).addEventListener(
    'input',
    function () {

        if (!selectedCargo) {
            return;
        }

        selectedCargo.name =
            this.value;

        renderCargoList();

    }
);


document.getElementById(
    'cargoLength'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) {
            return;
        }

        const value =
            Number(this.value);


        if (value <= 0) {
            return;
        }


        selectedCargo.length =
            value;


        updateCargoGeometry(
            selectedCargo
        );


        renderCargoList();

    }
);


document.getElementById(
    'cargoWidth'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) {
            return;
        }

        const value =
            Number(this.value);


        if (value <= 0) {
            return;
        }


        selectedCargo.width =
            value;


        updateCargoGeometry(
            selectedCargo
        );


        renderCargoList();

    }
);


document.getElementById(
    'cargoHeight'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) {
            return;
        }

        const value =
            Number(this.value);


        if (value <= 0) {
            return;
        }


        selectedCargo.height =
            value;


        updateCargoGeometry(
            selectedCargo
        );


        renderCargoList();

    }
);


document.getElementById(
    'cargoWeight'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) {
            return;
        }

        const value =
            Number(this.value);


        if (value < 0) {
            return;
        }


        selectedCargo.weight =
            value;


        renderCargoList();

    }
);


document.getElementById(
    'cargoCanStack'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) {
            return;
        }

        selectedCargo.canStack =
            this.checked;

    }
);


document.getElementById(
    'cargoCanRotate'
).addEventListener(
    'change',
    function () {

        if (!selectedCargo) {
            return;
        }

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

        if (!selectedCargo) {
            return;
        }


        if (!selectedCargo.canRotate) {

            alert(
                'Этот груз нельзя поворачивать.'
            );

            return;
        }


        const oldLength =
            selectedCargo.length;


        selectedCargo.length =
            selectedCargo.width;


        selectedCargo.width =
            oldLength;


        selectedCargo.rotation +=
            90;


        if (
            selectedCargo.rotation >= 360
        ) {

            selectedCargo.rotation = 0;

        }


        updateCargoGeometry(
            selectedCargo
        );


        renderCargoList();

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

        if (!selectedCargo) {
            return;
        }


        const index =
            cargoes.indexOf(
                selectedCargo
            );


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


        document
            .getElementById(
                'cargoProperties'
            )
            .classList
            .add('hidden');


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

        const cargo =
            createCargo(
                120,
                80,
                60,
                500
            );


        cargo.name =
            `Груз ${cargo.id}`;


        renderCargoList();

        selectCargo(cargo);

    }
);


// ======================================================
// DEMO CARGO
// ======================================================

createCargo(
    120,
    80,
    60,
    500,
    0xff6600,
    'Коробка 1'
);


createCargo(
    100,
    100,
    80,
    700,
    0x22c55e,
    'Коробка 2'
);


createCargo(
    200,
    120,
    100,
    1000,
    0x3b82f6,
    'Коробка 3'
);


renderCargoList();

selectCargo(
    cargoes[0]
);


// ======================================================
// AUTO PACK BUTTON
// ======================================================

const autoPackButton =
    document.createElement(
        'button'
    );


autoPackButton.textContent =
    '🚚 Автозагрузка';


autoPackButton.style.marginLeft =
    '10px';


document
    .querySelector('.header')
    .appendChild(
        autoPackButton
    );


autoPackButton.addEventListener(
    'click',
    autoPack
);


// ======================================================
// CLEAR PACKING
// ======================================================

function clearPacking() {

    for (
        const cargo of cargoes
    ) {

        cargo.mesh.position.set(
            0,
            floorThickness +
            cargo.height / 2,
            0
        );

        cargo.rotation = 0;

        cargo.packed = true;

    }

}


// ======================================================
// AUTO PACK
// ======================================================

// ======================================================
// AUTO PACKING
// ======================================================

function autoPack() {

    // ------------------------------------------
    // Сбрасываем позиции
    // ------------------------------------------

    for (const cargo of cargoes) {

        cargo.packed = false;

        cargo.mesh.position.set(
            0,
            floorThickness + cargo.height / 2,
            0
        );

    }


    // ------------------------------------------
    // Сначала самые большие и тяжёлые грузы
    // ------------------------------------------

    const sortedCargoes = [...cargoes].sort(
        (a, b) => {

            const volumeA =
                a.length *
                a.width *
                a.height;

            const volumeB =
                b.length *
                b.width *
                b.height;


            // Сначала объём
            if (volumeA !== volumeB) {
                return volumeB - volumeA;
            }


            // При одинаковом объёме
            // сначала более тяжёлый
            return b.weight - a.weight;

        }
    );


    // ------------------------------------------
    // Загружаем по одному
    // ------------------------------------------

    for (const cargo of sortedCargoes) {

        const placement =
            findBestCargoPlacement(
                cargo
            );


        if (!placement) {

            cargo.packed = false;

            continue;

        }


        applyPlacement(
            cargo,
            placement
        );

    }


    renderCargoList();


    if (cargoes.length > 0) {

        selectCargo(
            cargoes[0]
        );

    }


    console.log(
        'Автозагрузка завершена'
    );

}


// ======================================================
// FIND BEST POSITION
// ======================================================

function findBestCargoPlacement(cargo) {

    const orientations =
        getCargoOrientations(cargo);

    let bestPlacement = null;

    for (
        const orientation
        of orientations
    ) {

        const candidates =
            generatePlacementCandidates(
                cargo,
                cargoes,
                orientation
            );

        for (
            const candidate
            of candidates
        ) {

            if (
                !isInsideTruck(
                    candidate
                )
            ) {

                continue;

            }

            if (
                placementCollides(
                    cargo,
                    candidate
                )
            ) {

                continue;

            }

            const support =
                calculateSupport(
                    cargo,
                    candidate
                );

            if (
                candidate.y >
                floorThickness + 0.1
            ) {

                if (
                    !support.valid
                ) {

                    continue;

                }

            }

            candidate.supportPercent =
                support.percent;

            candidate.score =
                calculatePlacementScore(
                    candidate,
                    cargo
                );

            if (
                bestPlacement === null ||
                candidate.score <
                bestPlacement.score
            ) {

                bestPlacement =
                    candidate;

            }

        }

    }

    return bestPlacement;

}


// ======================================================
// ORIENTATIONS
// ======================================================

function getCargoOrientations(cargo) {

    const orientations = [];


    orientations.push({

        length:
            cargo.length,

        width:
            cargo.width,

        height:
            cargo.height,

        rotation: 0

    });


    if (
        cargo.canRotate &&
        cargo.length !== cargo.width
    ) {

        orientations.push({

            length:
                cargo.width,

            width:
                cargo.length,

            height:
                cargo.height,

            rotation: 90

        });

    }


    return orientations;

}


// ======================================================
// GENERATE CANDIDATE POSITIONS
// ======================================================

function generatePlacementCandidates(
    cargo,
    cargos,
    orientation
) {

    const candidates = [];

    const length =
        orientation.length;

    const width =
        orientation.width;

    const height =
        orientation.height;


    // ==================================================
    // 1. ПЕРВАЯ ПОЗИЦИЯ НА ПОЛУ
    // ==================================================

    const startX =
        -truck.length / 2 +
        length / 2 +
        cargoGap;


    /*
     * Сначала пытаемся поставить
     * прямо у передней стенки.
     */

    addCandidate(
        candidates,
        startX,
        floorThickness,
        0,
        orientation
    );


    /*
     * Затем слева и справа.
     */

    const zOffset =
        (truck.width - width) / 2 -
        cargoGap;


    if (zOffset > 0) {

        addCandidate(
            candidates,
            startX,
            floorThickness,
            -zOffset,
            orientation
        );

        addCandidate(
            candidates,
            startX,
            floorThickness,
            zOffset,
            orientation
        );

    }


    // ==================================================
    // 2. СТРОИМ СЛЕДУЮЩИЕ ПОЗИЦИИ НА ПОЛУ
    // ==================================================

    for (
        const base of cargos
    ) {

        if (
            base === cargo ||
            !base.packed
        ) {

            continue;

        }


        /*
         * Правая граница груза.
         *
         * Именно здесь можно поставить
         * следующий груз.
         */

        const nextX =
            base.mesh.position.x +
            base.length / 2 +
            length / 2 +
            cargoGap;


        if (
            nextX <=
            truck.length / 2
        ) {

            addCandidate(
                candidates,
                nextX,
                floorThickness,
                base.mesh.position.z,
                orientation
            );

        }


        /*
         * Также пробуем позиции
         * рядом по ширине.
         */

        const nextZ =
            base.mesh.position.z +
            base.width / 2 +
            width / 2 +
            cargoGap;


        if (
            nextZ <=
            truck.width / 2
        ) {

            addCandidate(
                candidates,
                base.mesh.position.x,
                floorThickness,
                nextZ,
                orientation
            );

        }


        const previousZ =
            base.mesh.position.z -
            base.width / 2 -
            width / 2 -
            cargoGap;


        if (
            previousZ >=
            -truck.width / 2
        ) {

            addCandidate(
                candidates,
                base.mesh.position.x,
                floorThickness,
                previousZ,
                orientation
            );

        }

    }


    // ==================================================
    // 3. СТАВИМ СВЕРХУ
    // ==================================================

    for (
        const base of cargos
    ) {

        if (
            base === cargo ||
            !base.packed
        ) {

            continue;

        }


        if (
            !base.canStack
        ) {

            continue;

        }


        const baseTop =
            base.mesh.position.y +
            base.height / 2;


        /*
         * Ставим по центру существующего груза.
         */

        addCandidate(
            candidates,
            base.mesh.position.x,
            baseTop,
            base.mesh.position.z,
            orientation
        );


        /*
         * И несколько вариантов
         * по X/Z.
         */

        const positions = [

            {
                x:
                    base.mesh.position.x -
                    base.length / 2 +
                    length / 2,

                z:
                    base.mesh.position.z
            },

            {
                x:
                    base.mesh.position.x +
                    base.length / 2 -
                    length / 2,

                z:
                    base.mesh.position.z
            },

            {
                x:
                    base.mesh.position.x,

                z:
                    base.mesh.position.z -
                    base.width / 2 +
                    width / 2
            },

            {
                x:
                    base.mesh.position.x,

                z:
                    base.mesh.position.z +
                    base.width / 2 -
                    width / 2
            }

        ];


        for (
            const position of positions
        ) {

            addCandidate(
                candidates,
                position.x,
                baseTop,
                position.z,
                orientation
            );

        }

    }


    return removeDuplicateCandidates(
        candidates
    );

}


// ======================================================
// ADD CANDIDATE
// ======================================================

function addCandidate(
    candidates,
    x,
    y,
    z,
    orientation
) {

    candidates.push({

        x: x,

        y: y,

        z: z,

        length:
            orientation.length,

        width:
            orientation.width,

        height:
            orientation.height,

        rotation:
            orientation.rotation

    });

}


// ======================================================
// TRUCK BOUNDS
// ======================================================

function isInsideTruck(
    placement
) {

    const left =
        placement.x -
        placement.length / 2;


    const right =
        placement.x +
        placement.length / 2;


    const back =
        placement.z -
        placement.width / 2;


    const front =
        placement.z +
        placement.width / 2;


    const top =
        placement.y +
        placement.height;


    return (

        left >=
        -truck.length / 2

        &&

        right <=
        truck.length / 2

        &&

        back >=
        -truck.width / 2

        &&

        front <=
        truck.width / 2

        &&

        top <=
        truck.height

    );

}


// ======================================================
// COLLISION
// ======================================================

function placementCollides(
    cargo,
    placement
) {

    const aLeft =
        placement.x -
        placement.length / 2;

    const aRight =
        placement.x +
        placement.length / 2;


    const aBack =
        placement.z -
        placement.width / 2;

    const aFront =
        placement.z +
        placement.width / 2;


    const aBottom =
        placement.y;

    const aTop =
        placement.y +
        placement.height;


    for (
        const other
        of cargoes
    ) {

        if (
            other === cargo ||
            !other.packed
        ) {

            continue;

        }


        const bLeft =
            other.mesh.position.x -
            other.length / 2;

        const bRight =
            other.mesh.position.x +
            other.length / 2;


        const bBack =
            other.mesh.position.z -
            other.width / 2;

        const bFront =
            other.mesh.position.z +
            other.width / 2;


        const bBottom =
            other.mesh.position.y -
            other.height / 2;

        const bTop =
            other.mesh.position.y +
            other.height / 2;


        const overlapX =
            aLeft <
            bRight &&
            aRight >
            bLeft;


        const overlapZ =
            aBack <
            bFront &&
            aFront >
            bBack;


        const overlapY =
            aBottom <
            bTop &&
            aTop >
            bBottom;


        if (
            overlapX &&
            overlapY &&
            overlapZ
        ) {

            return true;

        }

    }


    return false;

}


// ======================================================
// SUPPORT CALCULATION
// ======================================================

function calculateSupport(
    cargo,
    placement
) {

    // Груз стоит на полу

    if (
        Math.abs(
            placement.y -
            floorThickness
        ) < 0.1
    ) {

        return {

            valid: true,

            percent: 1

        };

    }


    const left =
        placement.x -
        placement.length / 2;

    const right =
        placement.x +
        placement.length / 2;


    const back =
        placement.z -
        placement.width / 2;

    const front =
        placement.z +
        placement.width / 2;


    let supportedArea = 0;


    for (
        const support
        of cargoes
    ) {

        if (
            support === cargo ||
            !support.packed
        ) {

            continue;

        }


        if (
            !support.canStack
        ) {

            continue;

        }


        const supportTop =
            support.mesh.position.y +
            support.height / 2;


        // Должен быть непосредственно сверху

        if (
            Math.abs(
                supportTop -
                placement.y
            ) > 2
        ) {

            continue;

        }


        const supportLeft =
            support.mesh.position.x -
            support.length / 2;


        const supportRight =
            support.mesh.position.x +
            support.length / 2;


        const supportBack =
            support.mesh.position.z -
            support.width / 2;


        const supportFront =
            support.mesh.position.z +
            support.width / 2;


        const overlapX =
            Math.max(

                0,

                Math.min(
                    right,
                    supportRight
                )
                -
                Math.max(
                    left,
                    supportLeft
                )

            );


        const overlapZ =
            Math.max(

                0,

                Math.min(
                    front,
                    supportFront
                )
                -
                Math.max(
                    back,
                    supportBack
                )

            );


        supportedArea +=
            overlapX *
            overlapZ;

    }


    const cargoArea =
        placement.length *
        placement.width;


    const percent =
        supportedArea /
        cargoArea;


    return {

        valid:
            percent >= 0.6,

        percent

    };

}


// ======================================================
// PLACEMENT SCORE
// ======================================================

function calculatePlacementScore(placement, cargo) {
    /*
     * Главный принцип:
     * груз должен располагаться как можно ближе к началу кузова.
     *
     * X = длина машины.
     * Чем меньше X, тем ближе груз к передней части.
     */

    const frontPenalty = placement.x * 100000;

    /*
     * Небольшой штраф за смещение по ширине.
     * Сначала стараемся укладывать ближе к центру ширины,
     * чтобы ряд получался компактным.
     */
    const widthPenalty = Math.abs(placement.z) * 10;

    /*
     * Высота имеет меньший приоритет, чем положение по X.
     * Но между двумя вариантами с одинаковым X
     * предпочтительнее более низкий.
     */
    const heightPenalty = placement.y * 100;

    /*
     * Если груз стоит сверху другого груза,
     * это хорошо: не занимаем новое место по полу.
     */
    const stackingBonus = placement.y > 0 ? -5000 : 0;

    return (
        frontPenalty +
        widthPenalty +
        heightPenalty +
        stackingBonus
    );
}


// ======================================================
// APPLY PLACEMENT
// ======================================================

function applyPlacement(
    cargo,
    placement
) {

    cargo.length =
        placement.length;

    cargo.width =
        placement.width;

    cargo.height =
        placement.height;


    cargo.rotation =
        placement.rotation;


    cargo.mesh.position.set(

        placement.x,

        placement.y +
        placement.height / 2,

        placement.z

    );


    cargo.packed =
        true;


    updateCargoGeometry(
        cargo
    );

}


// ======================================================
// REMOVE DUPLICATE CANDIDATES
// ======================================================

function removeDuplicateCandidates(
    candidates
) {

    const result = [];

    const keys =
        new Set();


    for (
        const candidate
        of candidates
    ) {

        const key = [

            Math.round(
                candidate.x
            ),

            Math.round(
                candidate.y
            ),

            Math.round(
                candidate.z
            ),

            candidate.length,

            candidate.width,

            candidate.rotation

        ].join('|');


        if (
            keys.has(key)
        ) {

            continue;

        }


        keys.add(key);

        result.push(
            candidate
        );

    }


    return result;

}


// ======================================================
// DRAGGING
// ======================================================

const raycaster =
    new THREE.Raycaster();

const mouse =
    new THREE.Vector2();


const dragPlane =
    new THREE.Plane(
        new THREE.Vector3(
            0,
            1,
            0
        ),
        -floorThickness
    );


renderer.domElement.addEventListener(
    'pointerdown',
    event => {

        const rect =
            renderer.domElement
                .getBoundingClientRect();


        mouse.x =
            (
                (
                    event.clientX -
                    rect.left
                )
                /
                rect.width
            ) * 2 - 1;


        mouse.y =
            -(
                (
                    event.clientY -
                    rect.top
                )
                /
                rect.height
            ) * 2 + 1;


        raycaster.setFromCamera(
            mouse,
            camera
        );


        const intersections =
            raycaster.intersectObjects(
                cargoes.map(
                    cargo =>
                        cargo.mesh
                )
            );


        if (
            intersections.length === 0
        ) {
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


        controls.enabled =
            false;


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


renderer.domElement.addEventListener(
    'pointermove',
    event => {

        if (
            !dragging ||
            !selectedCargo
        ) {
            return;
        }


        const rect =
            renderer.domElement
                .getBoundingClientRect();


        mouse.x =
            (
                (
                    event.clientX -
                    rect.left
                )
                /
                rect.width
            ) * 2 - 1;


        mouse.y =
            -(
                (
                    event.clientY -
                    rect.top
                )
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


        const halfLength =
            cargo.length / 2;

        const halfWidth =
            cargo.width / 2;


        x =
            Math.max(
                -truck.length / 2 +
                halfLength,

                Math.min(
                    truck.length / 2 -
                    halfLength,

                    x
                )
            );


        z =
            Math.max(
                -truck.width / 2 +
                halfWidth,

                Math.min(
                    truck.width / 2 -
                    halfWidth,

                    z
                )
            );


        const y =
            calculateManualHeight(
                cargo,
                x,
                z
            );


        const newPosition =
            new THREE.Vector3(
                x,
                y +
                cargo.height / 2,
                z
            );


        if (
            intersectsManual(
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


        cargo.packed =
            true;


        lastValidPosition.copy(
            newPosition
        );

    }
);


renderer.domElement.addEventListener(
    'pointerup',
    () => {

        dragging = false;

        controls.enabled = true;

    }
);


// ======================================================
// MANUAL HEIGHT
// ======================================================

function calculateManualHeight(
    cargo,
    x,
    z
) {

    let height =
        floorThickness;


    for (
        const support of cargoes
    ) {

        if (
            support === cargo ||
            !support.canStack
        ) {
            continue;
        }


        const overlapX =
            Math.abs(
                x -
                support.mesh.position.x
            )
            <
            (
                cargo.length / 2 +
                support.length / 2
            );


        const overlapZ =
            Math.abs(
                z -
                support.mesh.position.z
            )
            <
            (
                cargo.width / 2 +
                support.width / 2
            );


        if (
            overlapX &&
            overlapZ
        ) {

            const top =
                support.mesh.position.y +
                support.height / 2;


            if (
                top > height
            ) {

                height = top;

            }

        }

    }


    return height;

}


// ======================================================
// MANUAL COLLISION
// ======================================================

function intersectsManual(
    cargo,
    position
) {

    const aLeft =
        position.x -
        cargo.length / 2;

    const aRight =
        position.x +
        cargo.length / 2;

    const aFront =
        position.z -
        cargo.width / 2;

    const aBack =
        position.z +
        cargo.width / 2;

    const aBottom =
        position.y -
        cargo.height / 2;

    const aTop =
        position.y +
        cargo.height / 2;


    for (
        const other of cargoes
    ) {

        if (
            other === cargo
        ) {
            continue;
        }


        const bLeft =
            other.mesh.position.x -
            other.length / 2;

        const bRight =
            other.mesh.position.x +
            other.length / 2;

        const bFront =
            other.mesh.position.z -
            other.width / 2;

        const bBack =
            other.mesh.position.z +
            other.width / 2;

        const bBottom =
            other.mesh.position.y -
            other.height / 2;

        const bTop =
            other.mesh.position.y +
            other.height / 2;


        if (
            aLeft < bRight &&
            aRight > bLeft &&
            aFront < bBack &&
            aBack > bFront &&
            aBottom < bTop &&
            aTop > bBottom
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
    () => {

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
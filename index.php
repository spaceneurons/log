<!DOCTYPE html>
<html lang="ru">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Load Planner</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>

<div class="app">

    <header class="header">
        <div class="logo">
            Load Planner
        </div>

        <button id="addCargo">
            + Добавить груз
        </button>
    </header>

    <main class="workspace">

        <section class="viewer">
            <div id="scene"></div>
        </section>

        <aside class="sidebar">

            <div class="sidebar-title">
                <h2>Грузы</h2>
            </div>

            <div id="cargoList"></div>

            <div id="cargoProperties" class="cargo-properties hidden">

                <h3>Свойства груза</h3>

                <label>
                    Название
                    <input type="text" id="cargoName">
                </label>

                <div class="dimensions">

                    <label>
                        Длина
                        <input type="number" id="cargoLength" min="1">
                    </label>

                    <label>
                        Ширина
                        <input type="number" id="cargoWidth" min="1">
                    </label>

                    <label>
                        Высота
                        <input type="number" id="cargoHeight" min="1">
                    </label>

                </div>

                <label>
                    Вес, кг
                    <input type="number" id="cargoWeight" min="0">
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" id="cargoCanStack">
                    Можно ставить сверху
                </label>

                <label class="checkbox-label">
                    <input type="checkbox" id="cargoCanRotate">
                    Можно поворачивать
                </label>

                <div class="property-buttons">

                    <button id="rotateCargo">
                        ↻ Повернуть
                    </button>

                    <button id="deleteCargo" class="delete-button">
                        Удалить
                    </button>

                </div>

            </div>

        </aside>

    </main>

</div>


<script type="importmap">
{
    "imports": {
        "three": "https://cdn.jsdelivr.net/npm/three@0.180.0/build/three.module.js",
        "three/addons/": "https://cdn.jsdelivr.net/npm/three@0.180.0/examples/jsm/"
    }
}
</script>

<script type="module" src="app.js"></script>

</body>
</html>
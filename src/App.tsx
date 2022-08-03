import { Component, createEffect, createSignal } from "solid-js";

interface SelectedTile {
  x: number;
  y: number;
}

const App: Component = () => {
  const [getTileSheetCanvas, setTileSheetCanvas] =
    createSignal<HTMLCanvasElement | null>(null);
  const [getTileMapCanvas, setTileMapCanvas] =
    createSignal<HTMLCanvasElement | null>(null);
  const [getTileSheet, setTileSheet] = createSignal<HTMLImageElement | null>(
    null
  );
  const [getTileWidth, setTileWidth] = createSignal(32);
  const [getTileHeight, setTileHeight] = createSignal(32);
  const [getSelectedTile, setSelectedTile] = createSignal<SelectedTile | null>(
    null
  );
  const [getShowGrid, setShowGrid] = createSignal(false);
  const [getTileMapWidth, setTileMapWidth] = createSignal(32 * 10);
  const [getTileMapHeight, setTileMapHeight] = createSignal(32 * 10);

  createEffect(() => {
    const selectedTile = getSelectedTile();
    const tileSheet = getTileSheet();
    const tileSheetCanvas = getTileSheetCanvas();
    const tileMapCanvas = getTileMapCanvas();

    if (!tileMapCanvas) {
      console.error("No tile map canvas");
      return;
    }

    if (!tileSheetCanvas) {
      console.error("No tile sheet canvas");
      return;
    }

    const tileSheetContext = tileSheetCanvas.getContext("2d");
    const tileMapContext = tileMapCanvas.getContext("2d");

    if (!tileMapContext) {
      console.error("No tile map context");
      return;
    }

    if (!tileSheetContext) {
      console.error("No tile sheet context");
      return;
    }

    tileSheetContext.clearRect(
      0,
      0,
      tileSheetCanvas.width,
      tileSheetCanvas.height
    );

    tileMapContext.fillStyle = "#fff";
    tileMapContext.beginPath();
    tileMapContext.rect(0, 0, tileMapCanvas.width, tileMapCanvas.height);
    tileMapContext.fill();

    if (tileSheet) {
      tileSheetContext.drawImage(tileSheet, 0, 0);
    }

    const maxX = tileSheetCanvas.width / getTileWidth();
    const maxY = tileSheetCanvas.height / getTileHeight();

    for (let x = 1; x < maxX; x++) {
      tileSheetContext.beginPath();
      tileSheetContext.moveTo(x * getTileWidth(), 0);
      tileSheetContext.lineTo(x * getTileWidth(), tileSheetCanvas.height);
      tileSheetContext.stroke();
    }

    for (let y = 1; y < maxY; y++) {
      tileSheetContext.beginPath();
      tileSheetContext.moveTo(0, y * getTileHeight());
      tileSheetContext.lineTo(tileSheetCanvas.width, y * getTileHeight());
      tileSheetContext.stroke();
    }

    if (selectedTile) {
      tileSheetContext.beginPath();
      tileSheetContext.rect(
        selectedTile.x,
        selectedTile.y,
        getTileWidth(),
        getTileHeight()
      );
      tileSheetContext.fillStyle = "#34bde3aa";
      tileSheetContext.fill();
    }

    if (getShowGrid()) {
      const maxX = getTileMapWidth() / getTileWidth();
      const maxY = getTileMapHeight() / getTileHeight();

      for (let x = 1; x < maxX; x++) {
        tileMapContext.beginPath();
        tileMapContext.moveTo(x * getTileWidth(), 0);
        tileMapContext.lineTo(x * getTileWidth(), getTileMapHeight());
        tileMapContext.stroke();
      }

      for (let y = 1; y < maxY; y++) {
        tileMapContext.beginPath();
        tileMapContext.moveTo(0, y * getTileHeight());
        tileMapContext.lineTo(getTileMapWidth(), y * getTileHeight());
        tileMapContext.stroke();
      }
    }
  });

  function handleTilesheetUpload(e: ProgressEvent<FileReader>) {
    const img = document.createElement("img");
    img.src = e.target?.result?.toString() ?? "";

    img.addEventListener("load", function () {
      const canvas = getTileSheetCanvas();

      if (!canvas) {
        console.error("No canvas found");
        return;
      }

      canvas.width = this.width;
      canvas.height = this.height;
      setTileSheet(this);
    });
  }

  return (
    <div class="flex h-screen">
      <div class="flex-grow bg-gray-100 overflow-auto">
        <div class="absolute">
          <input
            type="checkbox"
            checked={getShowGrid()}
            onChange={(e) => setShowGrid(e.currentTarget.checked)}
          />
          <label>Show grid</label>
          <label>Width</label>
          <input
            value={getTileMapWidth()}
            type="number"
            onInput={(e) => {
              const value = parseInt(e.currentTarget.value);

              if (!isNaN(value) && value > 0) {
                setTileMapWidth(value);
              }
            }}
          />

          <label>Height</label>
          <input
            value={getTileMapHeight()}
            type="number"
            onInput={(e) => {
              const value = parseInt(e.currentTarget.value);

              if (!isNaN(value) && value > 0) {
                setTileMapHeight(value);
              }
            }}
          />
        </div>
        <div class="h-full justify-center items-center flex">
          <canvas
            ref={(el) => setTileMapCanvas(el)}
            width={getTileMapWidth()}
            height={getTileMapHeight()}
            class="border"
          ></canvas>
        </div>
      </div>
      <div>
        <input
          type="file"
          onChange={(e) => {
            const files = e.currentTarget.files;

            for (const file of files ?? []) {
              const fileReader = new FileReader();
              console.log(file);

              fileReader.onload = handleTilesheetUpload;
              fileReader.readAsDataURL(file);
            }
          }}
        />
        <div>
          Tile Sheet
          <div class="w-80 h-80 border overflow-scroll">
            <canvas
              onClick={(e) => {
                const tileX = Math.floor(e.offsetX / getTileWidth());
                const tileY = Math.floor(e.offsetY / getTileHeight());

                setSelectedTile({
                  x: tileX * getTileWidth(),
                  y: tileY * getTileHeight(),
                });
              }}
              width={318}
              height={318}
              ref={(el) => setTileSheetCanvas(el)}
            />
          </div>
          <label>Tile Width:</label>
          <input
            type="number"
            value={getTileWidth()}
            onInput={(e) => {
              const value = parseInt(e.currentTarget.value);

              if (!isNaN(value) && value > 0) {
                setTileWidth(value);
                setSelectedTile(null);
              }
            }}
          />
          <label>Tile Height:</label>
          <input
            type="number"
            value={getTileHeight()}
            onInput={(e) => {
              const value = parseInt(e.currentTarget.value);

              if (!isNaN(value) && value > 0) {
                setTileHeight(value);
                setSelectedTile(null);
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default App;

import Engine from "./engine";
import { Deck, OrthographicView } from "@deck.gl/core";
import { LineLayer } from "@deck.gl/layers";

class DeckEngine extends Engine {
  constructor() {
    super();
    this.canvas = document.createElement("div");
    this.canvas.style.width = this.width;
    this.canvas.style.height = this.height;
    this.content.appendChild(this.canvas);
    this.trigger = 0;
  }

  init() { }

  animate() {
    const rects = this.rects;
    for (let i = 0; i < this.count.value; i++) {
      const r = rects[i];
      r.x -= r.speed;
      if (r.x + r.size < 0) {
        r.x = this.width + r.size;
      }

      // const { x, y, size } = r;
      // const y2 = r.y + size;
      // const x2 = r.x + size;
      // const polygon = [
      //   [x, y],
      //   [x, y2],
      //   [x2, y2],
      //   [x2, y],
      //   [x, y],
      // ];
      // r.polygon = polygon;
    }

    this.trigger = Date.now();
    this.deckgl.setProps({
      layers: [
        new LineLayer({
          data: rects,
          widthUnits: "meters",
          getColor: () => [0, 0, 0, 255],
          getSourcePosition: (d) => [d.x, d.y],
          getWidth: (d) => d.size,
          getTargetPosition: (d) => [d.x, d.y2],
          updateTriggers: {
            getSourcePosition: this.trigger,
            getTargetPosition: this.trigger,
          },
        }),
      ],
    });

    this.meter.tick();
    this.request = requestAnimationFrame(() => this.animate());
  }

  render() {
    this.cancelAnimationFrame(this.request);
    const rects = new Array(this.count);
    for (let i = 0; i < this.count.value; i++) {
      const x = Math.random() * this.width;
      const y = Math.random() * this.height;
      const size =
        (this.count.value > 7000 ? 2 : 5) +
        Math.random() * (this.count.value > 7000 ? 2 : 10);
      const speed = 1 + Math.random();
      rects[i] = { x, y, y2: size + y, size, speed };
    }
    this.rects = rects;

    if (!this.deckgl) {
      const deckgl = new Deck({
        parent: this.canvas,
        width: this.width,
        height: this.height,
        views: [
          new OrthographicView({
            id: "main",
            flipY: false,
            width: this.width,
            height: this.height,
            controller: {
              doubleClickZoom: false,
              keyboard: false,
            },
            fovy: 50,
          }),
        ],
        initialViewState: {
          target: [this.width / 2, this.height / 2, 0],
          zoom: 0,
        },
        controller: true,
      });
      this.deckgl = deckgl;
    }
    this.request = requestAnimationFrame(() => this.animate());
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const engine = new DeckEngine();
  engine.init();
  engine.render();
});

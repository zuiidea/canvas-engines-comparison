import Engine from "./engine";
import { Deck, OrthographicView } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";

class DeckEngine extends Engine {
  constructor() {
    super();
    this.canvas = document.createElement("div");
    this.canvas.style.width = this.width;
    this.canvas.style.height = this.height;
    this.content.appendChild(this.canvas);
    this.trigger = 0;
  }

  init() {

  }

  animate() {
    const rects = this.rects;
    for (let i = 0; i < this.count.value; i++) {
      const r = rects[i];
      r.x -= r.speed;
      if (r.x + r.size < 0) {
        r.x = this.width + r.size;
      }
    }

    this.trigger = Date.now();
    this.deckgl.setProps({
      layers: [
        new ScatterplotLayer({
          data: rects,
          stroked: true,
          filled: false,
          getPosition: (d) => [d.x, d.y],
          getRadius: (d) => d.size / 2,
          getLineColor: [0, 0, 0],
          updateTriggers: {
            getPosition: this.trigger,
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
        (this.count.value > 7000 ? 2 : 10) +
        Math.random() * (this.count.value > 7000 ? 2 : 20);
      const speed = 1 + Math.random();
      rects[i] = { x, y, size: size / 2, speed };
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

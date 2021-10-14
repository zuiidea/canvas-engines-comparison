import Engine from "./engine";
import { Deck, OrthographicView } from "@deck.gl/core";
import { ScatterplotLayer } from "@deck.gl/layers";

const fs = `
#define SHADER_NAME rect-layer-fragment-shader
precision highp float;
uniform bool filled;
uniform float stroked;
uniform bool antialiasing;
varying vec4 vFillColor;
varying vec4 vLineColor;
varying vec2 unitPosition;
varying float innerUnitRadius;
varying float outerRadiusPixels;
void main(void) {
  geometry.uv = unitPosition;
  float distToCenter = length(unitPosition) * outerRadiusPixels;
  if (stroked > 0.5) {
    float isLine = (unitPosition.x < -innerUnitRadius || unitPosition.x > innerUnitRadius || unitPosition.y < -innerUnitRadius || unitPosition.y > innerUnitRadius) ? 1.0 : 0.0;
    if (filled) {
      gl_FragColor = mix(vFillColor, vLineColor, isLine);
    } else {
      if (isLine == 0.0) {
        discard;
      }
      gl_FragColor = vec4(vLineColor.rgb, vLineColor.a * isLine);
    }
  } else if (filled) {
    gl_FragColor = vFillColor;
  } else {
    discard;
  }
  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;

class RectLayer extends ScatterplotLayer {
  getShaders() {
    return {
      ...super.getShaders(),
      fs,
    };
  }
}

class DeckEngine extends Engine {
  constructor() {
    super();
    this.canvas = document.createElement("div");
    this.canvas.style.width = this.width;
    this.canvas.style.height = this.height;
    this.content.appendChild(this.canvas);
    this.trigger = 0;
  }

  init() {}

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
        new RectLayer({
          data: rects,
          stroked: true,
          filled: true,
          getPosition: (d) => [d.x, d.y],
          getRadius: (d) => d.size,
          getLineColor: [0, 0, 0],
          getFillColor: [255, 255, 255],
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

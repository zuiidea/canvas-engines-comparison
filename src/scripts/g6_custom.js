import Engine from "./engine";
import G6 from "@antv/g6";

G6.registerNode('RECT', {
    draw(cfg, group) {
        const keyShape = group.addShape('rect', {
            attrs: {
                x: cfg.x || 0,
                y: cfg.y || 0,
                stroke: '#000',
                fill: '#fff',
                width: cfg.size,
                height: cfg.size,
            },
            name: 'rect-shape',
        })
        return keyShape
    }
})



class G6Engine extends Engine {
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

        if (this.graph) {
            this.graph.getNodes().forEach((node, index) => {
                node.update({
                    x: rects[index].x,
                    y: rects[index].y,
                })
            })
        }
        this.meter.tick();
        this.request = requestAnimationFrame(() => this.animate());
    }

    render() {
        this.cancelAnimationFrame(this.request);
        const rects = new Array(this.count);
        for (let i = 0; i < this.count.value; i++) {
            const x = Math.random() * (this.width - 20) / 2;
            const y = Math.random() * (this.height - 20) / 2;
            const size =
                (this.count.value > 7000 ? 2 : 10) +
                Math.random() * (this.count.value > 7000 ? 2 : 20);
            const speed = 1 + Math.random();
            rects[i] = { id: String(i), x, y, size: size * 2, speed };
        }
        this.rects = rects;
        if (!this.graph) {
            const graph =
                new G6.Graph({
                    modes: {
                        default: [
                            {
                                type: 'zoom-canvas',
                                enableOptimize: true,
                                optimizeZoom: 0.9,
                            }
                        ],
                    },
                    container: this.canvas,
                    width: this.width,
                    height: this.height,
                    defaultNode: {
                        type: 'RECT',
                    }
                });
            graph.read({
                nodes: rects,
                edges: [],
            });
            this.graph = graph;
        } else {
            this.graph.changeData({
                nodes: rects,
                edges: [],
            });
        }
        this.request = requestAnimationFrame(() => this.animate());
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const engine = new G6Engine();
    engine.init();
    engine.render();
});

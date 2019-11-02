import dat from "dat.gui";
import fragmentSource from "./shaders/frg-voronoi";
import vertexSource from "./shaders/vrt-shade";
import BaseRender from "./utils/WebGL2Base";
import Mouse from "./utils/mouse";

// Render Class Object //
export default class Render extends BaseRender {
  constructor() {
    super();
    this.frame = 0;
    this.zoom = 5;
    this.start = Date.now();
    this.mouse = new Mouse();
    this.umouse = [0.0, 0.0, 0.0, 0.0];
    this.tmouse = [0.0, 0.0, 0.0, 0.0];
    const mouse = this.mouse.pointer();
    this.init();
  }

  createGui = () => {
    this.options = {
      zoom: this.zoom
    };
    this.gui = new dat.GUI();
    const folderRender = this.gui.addFolder("Render Options");
    folderRender
      .add(this.options, "zoom", 1, 50)
      .step(0.01)
      .onFinishChange(value => {
        this.zoom = value;
        this.gl.uniform1f(this.zm, this.zoom);
      });
    folderRender.open();
  };

  init = () => {
    this.createGui();
    this.createWebGL(vertexSource, fragmentSource);
    this.renderLoop();
  };

  localUniforms = () => {
    this.ut = this.gl.getUniformLocation(this.program, "time");
    this.ms = this.gl.getUniformLocation(this.program, "mouse");
    this.zm = this.gl.getUniformLocation(this.program, "zoom");
  };

  localUpdates = () => {
    this.gl.uniform1f(this.ut, (Date.now() - this.start) / 1000);
    const mouse = this.mouse.pointer();
    this.umouse = [mouse.x, this.canvas.height - mouse.y, mouse.x - mouse.y];
    const factor = 0.15;
    this.tmouse[0] =
      this.tmouse[0] - (this.tmouse[0] - this.umouse[0]) * factor;
    this.tmouse[1] =
      this.tmouse[1] - (this.tmouse[1] - this.umouse[1]) * factor;
    this.tmouse[2] =
      this.tmouse[2] - (this.tmouse[2] - this.umouse[2]) * factor;

    this.gl.uniform1f(this.zm, this.zoom);
    this.gl.uniform4fv(this.ms, this.tmouse);
  };

  renderLoop = () => {
    this.updateUniforms();
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}

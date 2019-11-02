import dat from "dat.gui";
import fragmentSource from "./shaders/frg-voronoi";
import vertexSource from "./shaders/vrt-shade";
import BaseRender from "./utils/WebGL2Base";
import Mouse from "./utils/mouse";

// Render Class Object //
export default class Render extends BaseRender {
  constructor() {
    super();
    this.showBackground = true;
    this.zoom = 5;
    this.color1 = [240, 90, 0];
    this.color2 = [245, 155, 0];
    this.color3 = [10, 0, 245];
    this.start = Date.now();
    this.mouse = new Mouse();
    this.umouse = [0.0, 0.0, 0.0, 0.0];
    this.tmouse = [0.0, 0.0, 0.0, 0.0];
    const mouse = this.mouse.pointer();
    this.init();
  }

  createGui = () => {
    this.options = {
      zoom: this.zoom,
      color1: this.color1,
      color2: this.color2,
      color3: this.color3,
      showBackground: this.showBackground
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
    folderRender.add(this.options, "showBackground").onFinishChange(value => {
      this.showBackground = value;
      this.gl.uniform1f(this.sb, this.showBackground);
    });
    folderRender.addColor(this.options, "color1").onChange(value => {
      this.color1 = value;
      this.gl.uniform3fv(this.c1, this.color1);
    });
    folderRender.addColor(this.options, "color2").onChange(value => {
      this.color2 = value;
      this.gl.uniform3fv(this.c2, this.color2);
    });
    folderRender.addColor(this.options, "color3").onChange(value => {
      this.color3 = value;
      this.gl.uniform3fv(this.c3, this.color3);
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
    this.c1 = this.gl.getUniformLocation(this.program, "colorA");
    this.c2 = this.gl.getUniformLocation(this.program, "colorB");
    this.c3 = this.gl.getUniformLocation(this.program, "colorC");
    this.sb = this.gl.getUniformLocation(this.program, "show");

    this.gl.uniform1f(this.zm, this.zoom);
    this.gl.uniform1f(this.sb, this.showBackground);
    this.gl.uniform3fv(this.c1, this.color1);
    this.gl.uniform3fv(this.c2, this.color2);
    this.gl.uniform3fv(this.c3, this.color3);
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

    this.gl.uniform4fv(this.ms, this.tmouse);
  };

  renderLoop = () => {
    this.updateUniforms();
    this.animation = window.requestAnimationFrame(this.renderLoop);
  };
}

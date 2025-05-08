import { _decorator, Component, Label, game } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('FPSCounter')
export class FPSCounter extends Component {
    @property({ type: Label })
    private fpsLabel: Label = null;

    private updateInterval: number = 0.5;
    private timeSinceLastUpdate: number = 0;

    update(deltaTime: number) {
        this.timeSinceLastUpdate += deltaTime;
        if (this.timeSinceLastUpdate >= this.updateInterval) {
            const fps = Math.floor(1 / deltaTime);
            this.fpsLabel.string = `FPS: ${fps}`;
            this.timeSinceLastUpdate = 0;
        }
    }
}
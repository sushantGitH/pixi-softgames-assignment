import { _decorator, Component, Node, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('MainMenu')
export class MainMenu extends Component {
    @property({ type: Node })
    private fpsCounter: Node = null;

    start() {
        this.fpsCounter.active = true;
    }

    loadAceOfShadows() {
        director.loadScene('AceOfShadow');
    }

    loadMagicWords() {
        director.loadScene('magic-words');
    }

    loadPhoenixFlame() {
        director.loadScene('phoenix-flame');
    }
}
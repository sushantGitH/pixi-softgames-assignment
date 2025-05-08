import { _decorator, Component, Label, Node } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('CardHolder')
export class CardHolder extends Component {
    @property({ type: Label })
    private cardLabel: Label = null;

    start() {

    }

    setCard(index: number) {
        this.cardLabel.string = `${index+1}`;
    }
}


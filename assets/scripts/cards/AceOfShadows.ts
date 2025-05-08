import { _decorator, Component, Node, Sprite, SpriteFrame, Vec3, tween, v3, UITransform, director, Prefab, instantiate } from 'cc';
import { CardHolder } from './CardHolder';
const { ccclass, property } = _decorator;

@ccclass('AceOfShadows')
export class AceOfShadows extends Component {
    @property({ type: Node })
    private mainLayout: Node = null;

    @property({ type: Prefab })
    private cardHolder: Prefab = null;

    @property({ type: Node })
    private layoutList: Node[] = [];

    private mainStack: Node[] = [];
    private slots: Node[][] = [];
    private offset: number = 5;
    private currentSlotIndex: number = 0;

    onLoad() {
        this.createLayout();
        this.schedule(this.moveCardToSlot, 1);
    }

    createLayout() {
        // Create 144 cards in the main stack
        for (let i = 0; i < 144; i++) {
            const card = instantiate(this.cardHolder);
            const cardHolderComponent = card.getComponent(CardHolder);
            if (cardHolderComponent) {
                cardHolderComponent.setCard(i);
            }
            this.mainStack.push(card);
            this.mainLayout.addChild(card);
        }
    }

    moveCardToSlot() {
        if (this.mainStack.length === 0) return;

        const card = this.mainStack.pop();
        const slotIndex = this.currentSlotIndex % this.layoutList.length;
        this.currentSlotIndex++;

        const slotNode = this.layoutList[slotIndex];

        // Calculate positions
        const fromPos = card.getWorldPosition();

        const toPos = slotNode.getWorldPosition();

        // Animate
        card.parent = this.node;
        card.setWorldPosition(fromPos);

        // Create parallel tweens for scale and movement
        tween(card)
            // Scale up in first 0.5 seconds
            .to(0.5, {
                scale: v3(1.2, 1.2, 1)
            }, { easing: 'sineOut' })
            .delay(1) // Delay for 0.5 seconds
            // Then scale down in last 0.5 seconds
            .to(0.5, {
                scale: v3(1, 1, 1)
            }, { easing: 'sineIn' })
            .start();

        tween(card)
            // Move to destination over 2 seconds
            .to(2, {
                worldPosition: toPos
            })
            .call(() => {
                card.parent = slotNode;
                card.setPosition(v3(0, 0, 0));
                card.setScale(v3(1, 1, 1));
            })
            .start();
    }

    backToMenu() {
        director.loadScene('Home');
    }
}
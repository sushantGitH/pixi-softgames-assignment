import { _decorator, Component, Sprite, Color, tween, Vec3, Node, SpriteFrame, randomRange, randomRangeInt, UITransform, director } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('PhoenixFlame')
export class PhoenixFlame extends Component {
    @property({ type: SpriteFrame })
    private flameSpriteFrame: SpriteFrame = null;

    private createFireParticle() {
        const particle = new Node('FireParticle');
        const sprite = particle.addComponent(Sprite);
        sprite.spriteFrame = this.flameSpriteFrame;

        // Initial fire-like settings
        const size = randomRange(20, 50);
        particle.getComponent(UITransform)!.width = size;
        particle.getComponent(UITransform)!.height = size * 1.5; // Flame shape

        // Starting position (fire source)
        const startPos = new Vec3(
            randomRange(-50, 50),
            -200,
            0
        );
        particle.setPosition(startPos);

        // Flame movement path
        const targetPos = new Vec3(
            startPos.x + randomRange(-100, 100),
            startPos.y + randomRange(300, 500),
            0
        );

        // Animation duration
        const duration = randomRange(1.5, 3);

        // 1. COLOR ANIMATION (Fire color evolution)
        sprite.color = new Color(255, 100, 0, 255); // Deep orange

        tween(sprite)
            // Phase 1: Deep orange to yellow (0.3s)
            .to(0.3, {
                color: new Color(255, 200, 0, 255)
            })
            // Phase 2: Yellow to white-hot (0.9s)
            .to(0.9, {
                color: new Color(255, 255, 255, 200)
            })
            // Phase 3: White to fading red (remaining time)
            .to(duration - 1.2, {
                color: new Color(150, 0, 0, 0)
            })
            .start();

        // 2. MOVEMENT ANIMATION (Flickering flame path)
        const movementPath = [
            new Vec3(startPos.x, startPos.y + 50, 0),
            new Vec3(targetPos.x - 30, targetPos.y - 100, 0),
            targetPos
        ];

        tween(particle)
            .to(0.5, { position: movementPath[0] })
            .to(1.0, { position: movementPath[1] })
            .to(duration - 1.5, { position: movementPath[2] })
            .call(() => particle.destroy())
            .start();

        // 3. SCALE ANIMATION (Flame flicker)
        tween(particle)
            .repeatForever(
                tween()
                    .to(0.1, { scale: new Vec3(1.1, 0.9, 1) })
                    .to(0.1, { scale: new Vec3(0.9, 1.1, 1) })
            )
            .start();

        this.node.addChild(particle);
    }

    update() {
        if (this.node.children.length < 10) { // Max 10 particles
            this.createFireParticle();
        }
    }

    backToMenu() {
        director.loadScene('Home');
    }
}
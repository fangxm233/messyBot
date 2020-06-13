export function sandBox() {
    let cpu: any = Game.cpu;
    if(cpu.generatePixel) {
        if(Game.cpu.bucket == 10000) {
            cpu.generatePixel();
        }
    }
}
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

RoomPosition.prototype.getMultiRoomRangeTo = function (pos) {
    // if (this.roomName == pos.roomName) {
    // 	return this.getRangeTo(pos);
    // } else {
    const from = this.roomCoords;
    const to = pos.roomCoords;
    const dx = Math.abs(50 * (to.x - from.x) + pos.x - this.x);
    const dy = Math.abs(50 * (to.y - from.y) + pos.y - this.y);
    return Math.ceil((dx + dy) / 2);
    // }
};
RoomPosition.prototype.getRoomRangeTo = function (pos) {
    if (this.roomName == pos.roomName) {
        return 0;
    }
    else {
        const from = this.roomCoords;
        const to = pos.roomCoords;
        const dx = Math.abs(to.x - from.x);
        const dy = Math.abs(to.y - from.y);
        return Math.sqrt(dx * dx + dy * dy);
    }
};
RoomPosition.prototype.findClosestByMultiRoomRange = function (objects) {
    return minBy(objects, (obj) => this.getMultiRoomRangeTo(obj.pos));
};
Object.defineProperty(RoomPosition.prototype, 'roomCoords', {
    get: function () {
        const parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(this.roomName);
        let x = parseInt(parsed[1], 10);
        let y = parseInt(parsed[2], 10);
        if (this.roomName.includes('W'))
            x = -x;
        if (this.roomName.includes('N'))
            y = -y;
        return { x: x, y: y };
    },
    configurable: true,
});
function minBy(objects, iteratee) {
    let minObj;
    let minVal = Infinity;
    let val;
    for (const i in objects) {
        val = iteratee(objects[i]);
        if (val !== false && val < minVal) {
            minVal = val;
            minObj = objects[i];
        }
    }
    return minObj;
}

RoomVisual.prototype.infoBox = function (info, x, y, opts = {}) {
    _.defaults(opts, {
        color: colors.infoBoxGood,
        textstyle: false,
        textsize: speechSize,
        textfont: 'verdana',
        opacity: 0.7,
    });
    let fontstring = '';
    if (opts.textstyle) {
        fontstring = opts.textstyle + ' ';
    }
    fontstring += opts.textsize + ' ' + opts.textfont;
    let pointer = [
        [.9, -0.25],
        [.9, 0.25],
        [0.3, 0.0],
    ];
    pointer = relPoly(x, y, pointer);
    pointer.push(pointer[0]);
    // Draw arrow
    this.poly(pointer, {
        fill: undefined,
        stroke: opts.color,
        opacity: opts.opacity,
        strokeWidth: 0.0
    });
    // // Draw box
    // this.rect(x + 0.9, y - 0.8 * opts.textsize,
    // 	0.55 * opts.textsize * _.max(_.map(info, line => line.length)), info.length * opts.textsize,
    // 	{
    // 		fill   : undefined,
    // 		opacity: opts.opacity
    // 	});
    // Draw vertical bar
    const x0 = x + 0.9;
    const y0 = y - 0.8 * opts.textsize;
    this.line(x0, y0, x0, y0 + info.length * opts.textsize, {
        color: opts.color,
    });
    // Draw text
    let dy = 0;
    for (const line of info) {
        this.text(line, x + 1, y + dy, {
            color: opts.color,
            // backgroundColor  : opts.background,
            backgroundPadding: 0.1,
            opacity: opts.opacity,
            font: fontstring,
            align: 'left',
        });
        dy += opts.textsize;
    }
    return this;
};
RoomVisual.prototype.multitext = function (textLines, x, y, opts = {}) {
    _.defaults(opts, {
        color: colors.infoBoxGood,
        textstyle: false,
        textsize: speechSize,
        textfont: 'verdana',
        opacity: 0.7,
    });
    let fontstring = '';
    if (opts.textstyle) {
        fontstring = opts.textstyle + ' ';
    }
    fontstring += opts.textsize + ' ' + opts.textfont;
    // // Draw vertical bar
    // let x0 = x + 0.9;
    // let y0 = y - 0.8 * opts.textsize;
    // this.line(x0, y0, x0, y0 + textLines.length * opts.textsize, {
    // 	color: opts.color,
    // });
    // Draw text
    let dy = 0;
    for (const line of textLines) {
        this.text(line, x, y + dy, {
            color: opts.color,
            // backgroundColor  : opts.background,
            backgroundPadding: 0.1,
            opacity: opts.opacity,
            font: fontstring,
            align: 'left',
        });
        dy += opts.textsize;
    }
    return this;
};
RoomVisual.prototype.box = function (x, y, w, h, style) {
    return this.line(x, y, x + w, y, style)
        .line(x + w, y, x + w, y + h, style)
        .line(x + w, y + h, x, y + h, style)
        .line(x, y + h, x, y, style);
};
// Taken from https://github.com/screepers/RoomVisual with slight modification: ========================================
const colors = {
    gray: '#555555',
    light: '#AAAAAA',
    road: '#666',
    energy: '#FFE87B',
    power: '#F53547',
    dark: '#181818',
    outline: '#8FBB93',
    speechText: '#000000',
    speechBackground: '#aebcc4',
    infoBoxGood: '#09ff00',
    infoBoxBad: '#ff2600'
};
const speechSize = 0.5;
const speechFont = 'Times New Roman';
RoomVisual.prototype.structure = function (x, y, type, opts = {}) {
    _.defaults(opts, { opacity: 0.5 });
    switch (type) {
        case STRUCTURE_EXTENSION:
            this.circle(x, y, {
                radius: 0.5,
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.circle(x, y, {
                radius: 0.35,
                fill: colors.gray,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_SPAWN:
            this.circle(x, y, {
                radius: 0.65,
                fill: colors.dark,
                stroke: '#CCCCCC',
                strokeWidth: 0.10,
                opacity: opts.opacity
            });
            this.circle(x, y, {
                radius: 0.40,
                fill: colors.energy,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_POWER_SPAWN:
            this.circle(x, y, {
                radius: 0.65,
                fill: colors.dark,
                stroke: colors.power,
                strokeWidth: 0.10,
                opacity: opts.opacity
            });
            this.circle(x, y, {
                radius: 0.40,
                fill: colors.energy,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_LINK: {
            // let osize = 0.3;
            // let isize = 0.2;
            let outer = [
                [0.0, -0.5],
                [0.4, 0.0],
                [0.0, 0.5],
                [-0.4, 0.0]
            ];
            let inner = [
                [0.0, -0.3],
                [0.25, 0.0],
                [0.0, 0.3],
                [-0.25, 0.0]
            ];
            outer = relPoly(x, y, outer);
            inner = relPoly(x, y, inner);
            outer.push(outer[0]);
            inner.push(inner[0]);
            this.poly(outer, {
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.poly(inner, {
                fill: colors.gray,
                stroke: false,
                opacity: opts.opacity
            });
            break;
        }
        case STRUCTURE_TERMINAL: {
            let outer = [
                [0.0, -0.8],
                [0.55, -0.55],
                [0.8, 0.0],
                [0.55, 0.55],
                [0.0, 0.8],
                [-0.55, 0.55],
                [-0.8, 0.0],
                [-0.55, -0.55],
            ];
            let inner = [
                [0.0, -0.65],
                [0.45, -0.45],
                [0.65, 0.0],
                [0.45, 0.45],
                [0.0, 0.65],
                [-0.45, 0.45],
                [-0.65, 0.0],
                [-0.45, -0.45],
            ];
            outer = relPoly(x, y, outer);
            inner = relPoly(x, y, inner);
            outer.push(outer[0]);
            inner.push(inner[0]);
            this.poly(outer, {
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.poly(inner, {
                fill: colors.light,
                stroke: false,
                opacity: opts.opacity
            });
            this.rect(x - 0.45, y - 0.45, 0.9, 0.9, {
                fill: colors.gray,
                stroke: colors.dark,
                strokeWidth: 0.1,
                opacity: opts.opacity
            });
            break;
        }
        case STRUCTURE_LAB:
            this.circle(x, y - 0.025, {
                radius: 0.55,
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.circle(x, y - 0.025, {
                radius: 0.40,
                fill: colors.gray,
                opacity: opts.opacity
            });
            this.rect(x - 0.45, y + 0.3, 0.9, 0.25, {
                fill: colors.dark,
                stroke: false,
                opacity: opts.opacity
            });
            {
                let box = [
                    [-0.45, 0.3],
                    [-0.45, 0.55],
                    [0.45, 0.55],
                    [0.45, 0.3],
                ];
                box = relPoly(x, y, box);
                this.poly(box, {
                    stroke: colors.outline,
                    strokeWidth: 0.05,
                    opacity: opts.opacity
                });
            }
            break;
        case STRUCTURE_TOWER:
            this.circle(x, y, {
                radius: 0.6,
                fill: colors.dark,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.rect(x - 0.4, y - 0.3, 0.8, 0.6, {
                fill: colors.gray,
                opacity: opts.opacity
            });
            this.rect(x - 0.2, y - 0.9, 0.4, 0.5, {
                fill: colors.light,
                stroke: colors.dark,
                strokeWidth: 0.07,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_ROAD:
            this.circle(x, y, {
                radius: 0.175,
                fill: colors.road,
                stroke: false,
                opacity: opts.opacity
            });
            if (!this.roads)
                this.roads = [];
            this.roads.push([x, y]);
            break;
        case STRUCTURE_RAMPART:
            this.circle(x, y, {
                radius: 0.65,
                fill: '#434C43',
                stroke: '#5D735F',
                strokeWidth: 0.10,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_WALL:
            this.circle(x, y, {
                radius: 0.40,
                fill: colors.dark,
                stroke: colors.light,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_STORAGE:
            const storageOutline = relPoly(x, y, [
                [-0.45, -0.55],
                [0, -0.65],
                [0.45, -0.55],
                [0.55, 0],
                [0.45, 0.55],
                [0, 0.65],
                [-0.45, 0.55],
                [-0.55, 0],
                [-0.45, -0.55],
            ]);
            this.poly(storageOutline, {
                stroke: colors.outline,
                strokeWidth: 0.05,
                fill: colors.dark,
                opacity: opts.opacity
            });
            this.rect(x - 0.35, y - 0.45, 0.7, 0.9, {
                fill: colors.energy,
                opacity: opts.opacity,
            });
            break;
        case STRUCTURE_OBSERVER:
            this.circle(x, y, {
                fill: colors.dark,
                radius: 0.45,
                stroke: colors.outline,
                strokeWidth: 0.05,
                opacity: opts.opacity
            });
            this.circle(x + 0.225, y, {
                fill: colors.outline,
                radius: 0.20,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_NUKER:
            let outline = [
                [0, -1],
                [-0.47, 0.2],
                [-0.5, 0.5],
                [0.5, 0.5],
                [0.47, 0.2],
                [0, -1],
            ];
            outline = relPoly(x, y, outline);
            this.poly(outline, {
                stroke: colors.outline,
                strokeWidth: 0.05,
                fill: colors.dark,
                opacity: opts.opacity
            });
            let inline = [
                [0, -.80],
                [-0.40, 0.2],
                [0.40, 0.2],
                [0, -.80],
            ];
            inline = relPoly(x, y, inline);
            this.poly(inline, {
                stroke: colors.outline,
                strokeWidth: 0.01,
                fill: colors.gray,
                opacity: opts.opacity
            });
            break;
        case STRUCTURE_CONTAINER:
            this.rect(x - 0.225, y - 0.3, 0.45, 0.6, {
                fill: 'yellow',
                opacity: opts.opacity,
                stroke: colors.dark,
                strokeWidth: 0.10,
            });
            break;
        default:
            this.circle(x, y, {
                fill: colors.light,
                radius: 0.35,
                stroke: colors.dark,
                strokeWidth: 0.20,
                opacity: opts.opacity
            });
            break;
    }
    return this;
};
const dirs = [
    [],
    [0, -1],
    [1, -1],
    [1, 0],
    [1, 1],
    [0, 1],
    [-1, 1],
    [-1, 0],
    [-1, -1]
];
RoomVisual.prototype.connectRoads = function (opts = {}) {
    _.defaults(opts, { opacity: 0.5 });
    const color = opts.color || colors.road || 'white';
    if (!this.roads)
        return;
    // this.text(this.roads.map(r=>r.join(',')).join(' '),25,23)
    this.roads.forEach((r) => {
        // this.text(`${r[0]},${r[1]}`,r[0],r[1],{ size: 0.2 })
        for (let i = 1; i <= 4; i++) {
            const d = dirs[i];
            const c = [r[0] + d[0], r[1] + d[1]];
            const rd = _.some(this.roads, r => r[0] == c[0] && r[1] == c[1]);
            // this.text(`${c[0]},${c[1]}`,c[0],c[1],{ size: 0.2, color: rd?'green':'red' })
            if (rd) {
                this.line(r[0], r[1], c[0], c[1], {
                    color: color,
                    width: 0.35,
                    opacity: opts.opacity
                });
            }
        }
    });
    return this;
};
RoomVisual.prototype.speech = function (text, x, y, opts = {}) {
    const background = !!opts.background ? opts.background : colors.speechBackground;
    const textcolor = !!opts.textcolor ? opts.textcolor : colors.speechText;
    // noinspection PointlessBooleanExpressionJS
    const textstyle = !!opts.textstyle ? opts.textstyle : false;
    const textsize = !!opts.textsize ? opts.textsize : speechSize;
    const textfont = !!opts.textfont ? opts.textfont : speechFont;
    const opacity = !!opts.opacity ? opts.opacity : 1;
    let fontstring = '';
    if (textstyle) {
        fontstring = textstyle + ' ';
    }
    fontstring += textsize + ' ' + textfont;
    let pointer = [
        [-0.2, -0.8],
        [0.2, -0.8],
        [0, -0.3]
    ];
    pointer = relPoly(x, y, pointer);
    pointer.push(pointer[0]);
    this.poly(pointer, {
        fill: background,
        stroke: background,
        opacity: opacity,
        strokeWidth: 0.0
    });
    this.text(text, x, y - 1, {
        color: textcolor,
        backgroundColor: background,
        backgroundPadding: 0.1,
        opacity: opacity,
        font: fontstring
    });
    return this;
};
RoomVisual.prototype.animatedPosition = function (x, y, opts = {}) {
    const color = !!opts.color ? opts.color : 'blue';
    const opacity = !!opts.opacity ? opts.opacity : 0.5;
    let radius = !!opts.radius ? opts.radius : 0.75;
    const frames = !!opts.frames ? opts.frames : 6;
    const angle = (Game.time % frames * 90 / frames) * (Math.PI / 180);
    const s = Math.sin(angle);
    const c = Math.cos(angle);
    const sizeMod = Math.abs(Game.time % frames - frames / 2) / 10;
    radius += radius * sizeMod;
    const points = [
        rotate(0, -radius, s, c, x, y),
        rotate(radius, 0, s, c, x, y),
        rotate(0, radius, s, c, x, y),
        rotate(-radius, 0, s, c, x, y),
        rotate(0, -radius, s, c, x, y),
    ];
    this.poly(points, { stroke: color, opacity: opacity });
    return this;
};
function rotate(x, y, s, c, px, py) {
    const xDelta = x * c - y * s;
    const yDelta = x * s + y * c;
    return { x: px + xDelta, y: py + yDelta };
}
function relPoly(x, y, poly) {
    return poly.map(p => {
        p[0] += x;
        p[1] += y;
        return p;
    });
}
RoomVisual.prototype.test = function () {
    const demopos = [19, 24];
    this.clear();
    this.structure(demopos[0] + 0, demopos[1] + 0, STRUCTURE_LAB);
    this.structure(demopos[0] + 1, demopos[1] + 1, STRUCTURE_TOWER);
    this.structure(demopos[0] + 2, demopos[1] + 0, STRUCTURE_LINK);
    this.structure(demopos[0] + 3, demopos[1] + 1, STRUCTURE_TERMINAL);
    this.structure(demopos[0] + 4, demopos[1] + 0, STRUCTURE_EXTENSION);
    this.structure(demopos[0] + 5, demopos[1] + 1, STRUCTURE_SPAWN);
    this.animatedPosition(demopos[0] + 7, demopos[1]);
    this.speech('This is a test!', demopos[0] + 10, demopos[1], { opacity: 0.7 });
    // this.infoBox(['This is', 'a test', 'mmmmmmmmmmmmm'], demopos[0] + 15, demopos[1]);
    return this;
};
const ColorSets = {
    white: ['#ffffff', '#4c4c4c'],
    grey: ['#b4b4b4', '#4c4c4c'],
    red: ['#ff7b7b', '#592121'],
    yellow: ['#fdd388', '#5d4c2e'],
    green: ['#00f4a2', '#236144'],
    blue: ['#50d7f9', '#006181'],
    purple: ['#a071ff', '#371383'],
};
const ResourceColors = {
    [RESOURCE_ENERGY]: ColorSets.yellow,
    [RESOURCE_POWER]: ColorSets.red,
    [RESOURCE_HYDROGEN]: ColorSets.grey,
    [RESOURCE_OXYGEN]: ColorSets.grey,
    [RESOURCE_UTRIUM]: ColorSets.blue,
    [RESOURCE_LEMERGIUM]: ColorSets.green,
    [RESOURCE_KEANIUM]: ColorSets.purple,
    [RESOURCE_ZYNTHIUM]: ColorSets.yellow,
    [RESOURCE_CATALYST]: ColorSets.red,
    [RESOURCE_GHODIUM]: ColorSets.white,
    [RESOURCE_HYDROXIDE]: ColorSets.grey,
    [RESOURCE_ZYNTHIUM_KEANITE]: ColorSets.grey,
    [RESOURCE_UTRIUM_LEMERGITE]: ColorSets.grey,
    [RESOURCE_UTRIUM_HYDRIDE]: ColorSets.blue,
    [RESOURCE_UTRIUM_OXIDE]: ColorSets.blue,
    [RESOURCE_KEANIUM_HYDRIDE]: ColorSets.purple,
    [RESOURCE_KEANIUM_OXIDE]: ColorSets.purple,
    [RESOURCE_LEMERGIUM_HYDRIDE]: ColorSets.green,
    [RESOURCE_LEMERGIUM_OXIDE]: ColorSets.green,
    [RESOURCE_ZYNTHIUM_HYDRIDE]: ColorSets.yellow,
    [RESOURCE_ZYNTHIUM_OXIDE]: ColorSets.yellow,
    [RESOURCE_GHODIUM_HYDRIDE]: ColorSets.white,
    [RESOURCE_GHODIUM_OXIDE]: ColorSets.white,
    [RESOURCE_UTRIUM_ACID]: ColorSets.blue,
    [RESOURCE_UTRIUM_ALKALIDE]: ColorSets.blue,
    [RESOURCE_KEANIUM_ACID]: ColorSets.purple,
    [RESOURCE_KEANIUM_ALKALIDE]: ColorSets.purple,
    [RESOURCE_LEMERGIUM_ACID]: ColorSets.green,
    [RESOURCE_LEMERGIUM_ALKALIDE]: ColorSets.green,
    [RESOURCE_ZYNTHIUM_ACID]: ColorSets.yellow,
    [RESOURCE_ZYNTHIUM_ALKALIDE]: ColorSets.yellow,
    [RESOURCE_GHODIUM_ACID]: ColorSets.white,
    [RESOURCE_GHODIUM_ALKALIDE]: ColorSets.white,
    [RESOURCE_CATALYZED_UTRIUM_ACID]: ColorSets.blue,
    [RESOURCE_CATALYZED_UTRIUM_ALKALIDE]: ColorSets.blue,
    [RESOURCE_CATALYZED_KEANIUM_ACID]: ColorSets.purple,
    [RESOURCE_CATALYZED_KEANIUM_ALKALIDE]: ColorSets.purple,
    [RESOURCE_CATALYZED_LEMERGIUM_ACID]: ColorSets.green,
    [RESOURCE_CATALYZED_LEMERGIUM_ALKALIDE]: ColorSets.green,
    [RESOURCE_CATALYZED_ZYNTHIUM_ACID]: ColorSets.yellow,
    [RESOURCE_CATALYZED_ZYNTHIUM_ALKALIDE]: ColorSets.yellow,
    [RESOURCE_CATALYZED_GHODIUM_ACID]: ColorSets.white,
    [RESOURCE_CATALYZED_GHODIUM_ALKALIDE]: ColorSets.white,
};
RoomVisual.prototype.resource = function (type, x, y, size = 0.25, opacity = 1) {
    if (type == RESOURCE_ENERGY || type == RESOURCE_POWER) {
        this._fluid(type, x, y, size, opacity);
    }
    else if ([RESOURCE_CATALYST, RESOURCE_HYDROGEN, RESOURCE_OXYGEN, RESOURCE_LEMERGIUM, RESOURCE_UTRIUM,
        RESOURCE_ZYNTHIUM, RESOURCE_KEANIUM]
        .includes(type)) {
        this._mineral(type, x, y, size, opacity);
    }
    else if (ResourceColors[type] != undefined) {
        this._compound(type, x, y, size, opacity);
    }
    else {
        return ERR_INVALID_ARGS;
    }
    return OK;
};
RoomVisual.prototype._fluid = function (type, x, y, size = 0.25, opacity = 1) {
    this.circle(x, y, {
        radius: size,
        fill: ResourceColors[type][0],
        opacity: opacity,
    });
    this.text(type[0], x, y - (size * 0.1), {
        font: (size * 1.5),
        color: ResourceColors[type][1],
        backgroundColor: ResourceColors[type][0],
        backgroundPadding: 0,
        opacity: opacity
    });
};
RoomVisual.prototype._mineral = function (type, x, y, size = 0.25, opacity = 1) {
    this.circle(x, y, {
        radius: size,
        fill: ResourceColors[type][0],
        opacity: opacity,
    });
    this.circle(x, y, {
        radius: size * 0.8,
        fill: ResourceColors[type][1],
        opacity: opacity,
    });
    this.text(type, x, y + (size * 0.03), {
        font: 'bold ' + (size * 1.25) + ' arial',
        color: ResourceColors[type][0],
        backgroundColor: ResourceColors[type][1],
        backgroundPadding: 0,
        opacity: opacity
    });
};
RoomVisual.prototype._compound = function (type, x, y, size = 0.25, opacity = 1) {
    const label = type.replace('2', '₂');
    this.text(label, x, y, {
        font: 'bold ' + (size * 1) + ' arial',
        color: ResourceColors[type][1],
        backgroundColor: ResourceColors[type][0],
        backgroundPadding: 0.3 * size,
        opacity: opacity
    });
};

const ALLOT_HARVEST = 0;
const ALLOT_TRANSPORT = 1;
const ALLOT_RESERVE = 3;
const ALLOT_TOWER = 4;
class Alloter {
    static AddType(type, room) {
        if (!Memory.rooms[room])
            Memory.rooms[room] = {};
        if (!Memory.rooms[room].allot)
            Memory.rooms[room].allot = {};
        Memory.rooms[room].allot[type] = [];
    }
    static removeType(type, room) {
        if (!Memory.rooms[room])
            return;
        if (!Memory.rooms[room].allot)
            return;
        delete Memory.rooms[room].allot[type];
    }
    static addUnit(unit, type) {
        let room = unit.roomName;
        if (!Memory.rooms)
            Memory.rooms = {};
        if (!Memory.rooms[room])
            Memory.rooms[room] = {};
        if (!Memory.rooms[room].allot)
            Memory.rooms[room].allot = {};
        if (!Memory.rooms[room].allot[type])
            Memory.rooms[room].allot[type] = [];
        unit.id = Memory.rooms[room].allot[type].push(unit) - 1;
        unit.available = true;
        unit.typeId = type;
        return unit.id;
    }
    static removeUnit(unit) {
        if (!Memory.rooms[unit.roomName])
            return;
        if (!Memory.rooms[unit.roomName].allot)
            return;
        if (!Memory.rooms[unit.roomName].allot[unit.typeId])
            return;
        delete Memory.rooms[unit.roomName].allot[unit.typeId][unit.id];
    }
    static getUnitWithKeyValue(type, room, key, value) {
        if (!Memory.rooms[room])
            return;
        if (!Memory.rooms[room].allot)
            return;
        if (!Memory.rooms[room].allot[type])
            return;
        for (const allotUnit of Memory.rooms[room].allot[type])
            if (allotUnit.data[key] == value)
                return allotUnit;
        return;
    }
    static allot(type, room) {
        if (!Memory.rooms[room])
            return;
        if (!Memory.rooms[room].allot)
            return;
        if (!Memory.rooms[room].allot[type])
            return;
        let allot = Memory.rooms[room].allot[type];
        for (const unit of allot) {
            if (!unit)
                continue;
            if (unit.available) {
                unit.available = false;
                unit.dirty = false;
                return unit;
            }
        }
        return;
    }
    static allotSmallestByRange(type, room, pos) {
        if (!Memory.rooms[room])
            return;
        if (!Memory.rooms[room].allot)
            return;
        if (!Memory.rooms[room].allot[type])
            return;
        let allot = Memory.rooms[room].allot[type];
        let result, dis = 9999;
        for (const unit of allot) {
            if (!unit)
                continue;
            if (!unit.data.pos)
                return;
            if (unit.available) {
                if (pos.getMultiRoomRangeTo(new RoomPosition(unit.data.pos.x, unit.data.pos.y, unit.data.pos.roomName)) < dis) {
                    result = unit;
                    dis = pos.getMultiRoomRangeTo(new RoomPosition(unit.data.pos.x, unit.data.pos.y, unit.data.pos.roomName));
                }
            }
        }
        if (result) {
            result.available = false;
            result.dirty = false;
        }
        return result;
    }
    static allotSmallestByKey(type, room, key) {
        if (!Memory.rooms[room])
            return;
        if (!Memory.rooms[room].allot)
            return;
        if (!Memory.rooms[room].allot[type])
            return;
        let allot = Memory.rooms[room].allot[type];
        let result, s_value = Number.MAX_VALUE;
        for (const unit of allot) {
            if (!unit)
                continue;
            if (!unit.data[key])
                return;
            if (unit.available) {
                if (unit.data[key] < s_value) {
                    result = unit;
                    s_value = unit.data[key];
                }
            }
        }
        if (result) {
            result.available = false;
            result.dirty = false;
        }
        return result;
    }
    static free(unit) {
        if (!unit)
            return;
        if (!Memory.rooms[unit.roomName])
            return;
        if (!Memory.rooms[unit.roomName].allot)
            return;
        if (!Memory.rooms[unit.roomName].allot[unit.typeId])
            return;
        if (!Memory.rooms[unit.roomName].allot[unit.typeId][unit.id])
            return;
        Memory.rooms[unit.roomName].allot[unit.typeId][unit.id].available = true;
    }
    static getUnitCount(type, room) {
        if (!Memory.rooms[room])
            return -1;
        if (!Memory.rooms[room].allot)
            return -1;
        if (!Memory.rooms[room].allot[type])
            return -1;
        return _.without(Memory.rooms[room].allot[type], null).length;
    }
    static exist(type, room, key, value) {
        if (!Memory.rooms[room])
            return false;
        if (!Memory.rooms[room].allot)
            return false;
        if (!Memory.rooms[room].allot[type])
            return false;
        for (const allotUnit of Memory.rooms[room].allot[type])
            if (allotUnit && allotUnit.data[key] == value)
                return true;
        return false;
    }
    static refreshDirty(unit) {
        // console.log('start refresh!')
        // console.log(JSON.stringify(unit));
        if (!Memory.rooms[unit.roomName])
            return;
        if (!Memory.rooms[unit.roomName].allot)
            return;
        if (!Memory.rooms[unit.roomName].allot[unit.typeId])
            return;
        if (!Memory.rooms[unit.roomName].allot[unit.typeId][unit.id])
            return;
        Memory.rooms[unit.roomName].allot[unit.typeId][unit.id].dirty = false;
        // console.log('refresh succeed!')
    }
    static setDirty() {
        for (const room in Memory.rooms) {
            if (Memory.rooms[room].allot) {
                for (const t in Memory.rooms[room].allot) {
                    const units = Memory.rooms[room].allot[t];
                    for (const unit of units) {
                        if (!unit)
                            continue;
                        unit.dirty = true;
                    }
                }
            }
        }
    }
    static checkDirty() {
        for (const room in Memory.rooms) {
            if (Memory.rooms[room].allot) {
                for (const t in Memory.rooms[room].allot) {
                    const units = Memory.rooms[room].allot[t];
                    for (const unit of units) {
                        if (!unit)
                            continue;
                        unit.available = unit.dirty;
                    }
                }
            }
        }
    }
}
class allotUnit {
    constructor(roomName, data) {
        this.roomName = roomName;
        this.data = data;
    }
}

// Type guards library: this allows for instanceof - like behavior for much lower CPU cost. Each type guard
function isStoreStructure(obj) {
    return obj.store != undefined && obj.storeCapacity != undefined;
}
function isStructure(obj) {
    return obj.structureType != undefined;
}
function isTombstone(obj) {
    return obj.deathTime != undefined;
}
function isResource(obj) {
    return obj.amount != undefined;
}

class SourceManager {
    static analyzeRoom(roomName) {
        console.log('analyze');
        if (!Memory.rooms[roomName])
            Memory.rooms[roomName] = {};
        let room = Game.rooms[roomName];
        if (!room)
            return;
        Alloter.removeType(ALLOT_HARVEST, room.name);
        Alloter.removeType(ALLOT_TRANSPORT, room.name);
        const containers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_CONTAINER;
            }
        });
        const sources = room.find(FIND_SOURCES);
        for (const s of sources) {
            let hunit = new allotUnit(room.name, { pos: s.pos });
            let tunit = new allotUnit(room.name, { pos: s.pos });
            Alloter.addUnit(hunit, ALLOT_HARVEST);
            Alloter.addUnit(tunit, ALLOT_TRANSPORT);
        }
        if (room.storage)
            Memory.rooms[room.name].storage = room.storage.id;
        else
            for (const container of containers) {
                if (container.pos.findInRange(FIND_SOURCES, 1).length)
                    continue;
                Memory.rooms[room.name].storage = container.id;
                return;
            }
    }
    static refreshRoom(room) {
        if (Memory.rooms[room.name].underAttacking)
            Memory.rooms[room.name].timeLeft--;
        if (Memory.rooms[room.name].timeLeft <= 0)
            Memory.rooms[room.name].underAttacking = false;
        for (const r of Memory.colonies[room.name]) {
            if (!Memory.rooms[r.name])
                this.analyzeRoom(r.name);
            if (Memory.rooms[r.name].underAttacking)
                Memory.rooms[r.name].timeLeft--;
            if (Memory.rooms[r.name].timeLeft <= 0)
                Memory.rooms[r.name].underAttacking = false;
            if (!Alloter.exist(ALLOT_RESERVE, room.name, 'name', r.name)) {
                let unit = new allotUnit(room.name, { name: r.name, ticksToEnd: 0 });
                Alloter.addUnit(unit, ALLOT_RESERVE);
            }
            let unit = Alloter.getUnitWithKeyValue(ALLOT_RESERVE, room.name, 'name', r.name);
            if (unit && unit.data.ticksToEnd > 0)
                unit.data.ticksToEnd--;
        }
        if (room.storage)
            Memory.rooms[room.name].storage = room.storage.id;
        else {
            const containers = room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.structureType == STRUCTURE_CONTAINER;
                }
            });
            for (const container of containers) {
                if (container.pos.findInRange(FIND_SOURCES, 1).length)
                    continue;
                Memory.rooms[room.name].storage = container.id;
                return;
            }
        }
        if (Memory.rooms[room.name].upgradeLink && Memory.rooms[room.name].centerLink)
            return;
        const links = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_LINK;
            }
        });
        for (const link of links) {
            if (!Memory.rooms[room.name].upgradeLink && room.controller && room.controller.pos.getRangeTo(link.pos) <= 2)
                Memory.rooms[room.name].upgradeLink = link.id;
            if (!Memory.rooms[room.name].centerLink && !link.pos.findInRange(FIND_SOURCES, 2).length) {
                Memory.rooms[room.name].centerLink = link.id;
                return;
            }
        }
    }
    static allotSource(room) {
        if (Alloter.getUnitCount(ALLOT_HARVEST, room.name) <= 0)
            this.analyzeRoom(room.name);
        let source = Alloter.allot(ALLOT_HARVEST, room.name);
        if (source)
            return source;
        for (const r of Memory.colonies[room.name]) {
            if (Memory.rooms[r.name].underAttacking)
                continue;
            if (Alloter.getUnitCount(ALLOT_HARVEST, r.name) <= 0)
                this.analyzeRoom(r.name);
            source = Alloter.allot(ALLOT_HARVEST, r.name);
            if (source)
                return source;
        }
        return undefined;
    }
    static allotTransporter(room) {
        if (Alloter.getUnitCount(ALLOT_TRANSPORT, room.name) == -1)
            this.analyzeRoom(room.name);
        let source = Alloter.allot(ALLOT_TRANSPORT, room.name);
        if (source)
            return source;
        for (const r of Memory.colonies[room.name]) {
            if (Memory.rooms[r.name].underAttacking)
                continue;
            if (Alloter.getUnitCount(ALLOT_TRANSPORT, r.name) == -1)
                this.analyzeRoom(r.name);
            source = Alloter.allot(ALLOT_TRANSPORT, r.name);
            if (source)
                return source;
        }
        return undefined;
    }
    static allotReservist(room) {
        if (Alloter.getUnitCount(ALLOT_RESERVE, room.name) == -1)
            return;
        let source = Alloter.allot(ALLOT_RESERVE, room.name);
        while (source) {
            if (!Memory.rooms[source.data.name].underAttacking)
                return source;
            source = Alloter.allot(ALLOT_RESERVE, room.name);
        }
        return undefined;
    }
    static getSource(creep) {
        if (!creep.memory.sourceTarget) {
            let remain = (creep.carryCapacity - _.sum(creep.carry)) / 2;
            let candidates = creep.room.find(FIND_TOMBSTONES, { filter: tomb => tomb.store[RESOURCE_ENERGY] >= remain });
            candidates.push(...creep.room.find(FIND_STRUCTURES, { filter: structure => isStoreStructure(structure) && structure.store[RESOURCE_ENERGY] >= remain
                    || structure.structureType == STRUCTURE_LINK && structure.energy >= remain }));
            candidates.push(...creep.room.find(FIND_DROPPED_RESOURCES, { filter: drop => drop.resourceType == RESOURCE_ENERGY && drop.amount > remain }));
            if (Memory.rooms[creep.room.name] && Memory.rooms[creep.room.name].storage) {
                var storage = Game.getObjectById(Memory.rooms[creep.room.name].storage);
                if (storage && storage.store[RESOURCE_ENERGY] >= remain)
                    candidates.push(storage);
            }
            if (Memory.rooms[creep.memory.spawnRoom] && Memory.rooms[creep.memory.spawnRoom].storage) {
                var storage = Game.getObjectById(Memory.rooms[creep.room.name].storage);
                if (storage && storage.store[RESOURCE_ENERGY] >= remain)
                    candidates.push(storage);
            }
            if (candidates.length) {
                let target = creep.pos.findClosestByMultiRoomRange(candidates);
                if (target)
                    creep.memory.sourceTarget = target.id;
            }
        }
        if (creep.memory.sourceTarget) {
            let target = Game.getObjectById(creep.memory.sourceTarget);
            if (target) {
                if (isStructure(target))
                    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target, { obstacles: Memory.obstacles });
                        return;
                    }
                    else
                        delete creep.memory.sourceTarget;
                if (isTombstone(target))
                    if (creep.withdraw(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target, { obstacles: Memory.obstacles });
                        return;
                    }
                    else
                        delete creep.memory.sourceTarget;
                if (isResource(target))
                    if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
                        creep.travelTo(target, { obstacles: Memory.obstacles });
                        return;
                    }
                    else
                        delete creep.memory.sourceTarget;
            }
            else
                delete creep.memory.sourceTarget;
        }
    }
}

// import {StructureLayout, StructureMap} from '../roomPlanner/RoomPlanner';
// import {asciiLogo, logoComponents, logoText} from './logos';
const TEXT_COLOR = '#c9c9c9';
const TEXT_SIZE = .8;
const CHAR_WIDTH = TEXT_SIZE * 0.4;
const CHAR_HEIGHT = TEXT_SIZE * 0.9;
/**
 * The Visualizer contains many static methods for drawing room visuals and displaying information through a GUI
 */
class Visualizer {
    static get enabled() {
        return Memory.settings.enableVisuals;
    }
    static textStyle(size = 1, style = {}) {
        return _.defaults(style, {
            color: TEXT_COLOR,
            align: 'left',
            font: `${size * TEXT_SIZE} Trebuchet MS`,
            opacity: 0.8,
        });
    }
    static circle(pos, color = 'red', opts = {}) {
        _.defaults(opts, {
            fill: color,
            radius: 0.35,
            opacity: 0.5,
        });
        return new RoomVisual(pos.roomName).circle(pos.x, pos.y, opts);
    }
    static marker(pos, opts = {}) {
        return new RoomVisual(pos.roomName).animatedPosition(pos.x, pos.y, opts);
    }
    // static drawStructureMap(structureMap: StructureMap): void {
    // 	if (!this.enabled) return;
    // 	const vis: { [roomName: string]: RoomVisual } = {};
    // 	for (const structureType in structureMap) {
    // 		for (const pos of structureMap[structureType]) {
    // 			if (!vis[pos.roomName]) {
    // 				vis[pos.roomName] = new RoomVisual(pos.roomName);
    // 			}
    // 			vis[pos.roomName].structure(pos.x, pos.y, structureType);
    // 		}
    // 	}
    // 	for (const roomName in vis) {
    // 		vis[roomName].connectRoads();
    // 	}
    // }
    // static drawLayout(layout: StructureLayout, anchor: RoomPosition, opts = {}): void {
    // 	_.defaults(opts, {opacity: 0.5});
    // 	if (!this.enabled) return;
    // 	const vis = new RoomVisual(anchor.roomName);
    // 	for (const structureType in layout[8]!.buildings) {
    // 		for (const pos of layout[8]!.buildings[structureType].pos) {
    // 			const dx = pos.x - layout.data.anchor.x;
    // 			const dy = pos.y - layout.data.anchor.y;
    // 			vis.structure(anchor.x + dx, anchor.y + dy, structureType, opts);
    // 		}
    // 	}
    // 	vis.connectRoads(opts);
    // }
    static drawRoads(positoins) {
        const pointsByRoom = _.groupBy(positoins, pos => pos.roomName);
        for (const roomName in pointsByRoom) {
            const vis = new RoomVisual(roomName);
            for (const pos of pointsByRoom[roomName]) {
                vis.structure(pos.x, pos.y, STRUCTURE_ROAD);
            }
            vis.connectRoads();
        }
    }
    static drawPath(path, style) {
        const pointsByRoom = _.groupBy(path, pos => pos.roomName);
        for (const roomName in pointsByRoom) {
            new RoomVisual(roomName).poly(pointsByRoom[roomName], style);
        }
    }
    static displayCostMatrix(costMatrix, roomName, dots = true, color = '#ff0000') {
        const vis = new RoomVisual(roomName);
        let x, y;
        if (dots) {
            let cost;
            let max = 1;
            for (y = 0; y < 50; ++y) {
                for (x = 0; x < 50; ++x) {
                    max = Math.max(max, costMatrix.get(x, y));
                }
            }
            for (y = 0; y < 50; ++y) {
                for (x = 0; x < 50; ++x) {
                    cost = costMatrix.get(x, y);
                    if (cost > 0) {
                        vis.circle(x, y, { radius: costMatrix.get(x, y) / max / 2, fill: color });
                    }
                }
            }
        }
        else {
            for (y = 0; y < 50; ++y) {
                for (x = 0; x < 50; ++x) {
                    vis.text(costMatrix.get(x, y).toString(), x, y, { color: color });
                }
            }
        }
    }
    static showInfo(info, calledFrom, opts = {}) {
        if (calledFrom.room) {
            return calledFrom.room.visual.infoBox(info, calledFrom.pos.x, calledFrom.pos.y, opts);
        }
        else {
            return new RoomVisual(calledFrom.pos.roomName).infoBox(info, calledFrom.pos.x, calledFrom.pos.y, opts);
        }
    }
    static section(title, pos, width, height) {
        const vis = new RoomVisual(pos.roomName);
        vis.rect(pos.x, pos.y - CHAR_HEIGHT, width, 1.1 * CHAR_HEIGHT, { opacity: 0.15 });
        vis.box(pos.x, pos.y - CHAR_HEIGHT, width, height + (1.1 + .25) * CHAR_HEIGHT, { color: TEXT_COLOR });
        vis.text(title, pos.x + .25, pos.y - .05, this.textStyle());
        return { x: pos.x + 0.25, y: pos.y + 1.1 * CHAR_HEIGHT };
    }
    static infoBox(header, content, pos, width) {
        // const vis = new RoomVisual(pos.roomName);
        // vis.rect(pos.x, pos.y - charHeight, width, 1.1 * charHeight, {opacity: 0.15});
        // vis.box(pos.x, pos.y - charHeight, width, ((content.length || 1) + 1.1 + .25) * charHeight,
        // 		{color: textColor});
        // vis.text(header, pos.x + .25, pos.y - .05, this.textStyle());
        const height = CHAR_HEIGHT * (content.length || 1);
        const { x, y } = this.section(header, pos, width, height);
        if (content.length > 0) {
            if (_.isArray(content[0])) {
                this.table(content, {
                    x: x,
                    y: y,
                    roomName: pos.roomName
                });
            }
            else {
                this.multitext(content, {
                    x: x,
                    y: y,
                    roomName: pos.roomName
                });
            }
        }
        // return pos.y - charHeight + ((content.length || 1) + 1.1 + .25) * charHeight + 0.1;
        const spaceBuffer = 0.5;
        return y + height + spaceBuffer;
    }
    static text(text, pos, size = 1, style = {}) {
        new RoomVisual(pos.roomName).text(text, pos.x, pos.y, this.textStyle(size, style));
    }
    static barGraph(progress, pos, width = 7, scale = 1) {
        const vis = new RoomVisual(pos.roomName);
        let percent;
        let mode;
        if (typeof progress === 'number') {
            percent = progress;
            mode = 'percent';
        }
        else {
            percent = progress[0] / progress[1];
            mode = 'fraction';
        }
        // Draw frame
        vis.box(pos.x, pos.y - CHAR_HEIGHT * scale, width, 1.1 * scale * CHAR_HEIGHT, { color: TEXT_COLOR });
        vis.rect(pos.x, pos.y - CHAR_HEIGHT * scale, percent * width, 1.1 * scale * CHAR_HEIGHT, {
            fill: TEXT_COLOR,
            opacity: 0.4,
            strokeWidth: 0
        });
        // Draw text
        if (mode == 'percent') {
            vis.text(`${Math.round(100 * percent)}%`, pos.x + width / 2, pos.y - .1 * CHAR_HEIGHT, this.textStyle(1, { align: 'center' }));
        }
        else {
            const [num, den] = progress;
            vis.text(`${num}/${den}`, pos.x + width / 2, pos.y - .1 * CHAR_HEIGHT, this.textStyle(1, { align: 'center' }));
        }
    }
    static table(data, pos) {
        if (data.length == 0) {
            return;
        }
        const colPadding = 4;
        const vis = new RoomVisual(pos.roomName);
        const style = this.textStyle();
        // Determine column locations
        const columns = Array(_.first(data).length).fill(0);
        for (const entries of data) {
            for (let i = 0; i < entries.length - 1; i++) {
                columns[i] = Math.max(columns[i], entries[i].length);
            }
        }
        // // Draw header and underline
        // vis.text(header, pos.x, pos.y, style);
        // vis.line(pos.x, pos.y + .3 * charHeight,
        // 	pos.x + charWidth * _.sum(columns) + colPadding * columns.length, pos.y + .25 * charHeight, {
        // 			 color: textColor
        // 		 });
        // Draw text
        // let dy = 1.5 * charHeight;
        let dy = 0;
        for (const entries of data) {
            let dx = 0;
            for (const i in entries) {
                vis.text(entries[i], pos.x + dx, pos.y + dy, style);
                dx += CHAR_WIDTH * (columns[i] + colPadding);
            }
            dy += CHAR_HEIGHT;
        }
    }
    static multitext(lines, pos) {
        if (lines.length == 0) {
            return;
        }
        const vis = new RoomVisual(pos.roomName);
        const style = this.textStyle();
        // Draw text
        let dy = 0;
        for (const line of lines) {
            vis.text(line, pos.x, pos.y + dy, style);
            dy += CHAR_HEIGHT;
        }
    }
    // static drawHUD(): void {
    // 	// Draw Overmind logo
    // 	new RoomVisual().multitext(asciiLogo, 0, 0, {textfont: 'monospace'});
    // 	// // Display CPU Information
    // 	// new RoomVisual().text('CPU:' + ' bucket:' + Game.cpu.bucket +
    // 	// 					  ' tickLimit:' + Game.cpu.tickLimit, column, row, style);
    // }
    /* Draws the Overmind logo using component coordinates extracted with Mathematica. This  uses about 0.2 CPU/tick */
    // static drawLogo(): void {
    // 	new RoomVisual().poly(logoComponents.black.points, logoComponents.black.style)
    // 					.poly(logoComponents.dgray.points, logoComponents.dgray.style)
    // 					.poly(logoComponents.lgray.points, logoComponents.lgray.style)
    // 					.poly(logoComponents.blue.points, logoComponents.blue.style)
    // 					.poly(logoComponents.red.points, logoComponents.red.style)
    // 					.poly(logoComponents.purple.points, logoComponents.purple.style)
    // 					.poly(logoComponents.pink.points, logoComponents.pink.style)
    // 					.poly(logoText.V.points, logoText.V.style)
    // 					.poly(logoText.E.points, logoText.E.style)
    // 					.poly(logoText.R1.points, logoText.R1.style)
    // 					.poly(logoText.R2.points, logoText.R2.style)
    // 					.poly(logoText.M.points, logoText.M.style)
    // 					.poly(logoText.I.points, logoText.I.style)
    // 					.poly(logoText.N.points, logoText.N.style)
    // 					.poly(logoText.D.points, logoText.D.style);
    // }
    static drawNotifications(notificationMessages) {
        // const vis = new RoomVisual();
        const x = 10.5;
        const y = 7;
        if (notificationMessages.length == 0) {
            notificationMessages = ['No notifications'];
        }
        const maxStringLength = _.max(_.map(notificationMessages, msg => msg.length));
        const width = Math.max(11, 1.2 * CHAR_WIDTH * maxStringLength);
        this.infoBox('Notifications', notificationMessages, { x, y }, width);
    }
    // static colonyReport(colonyName: string, text: string[]) {
    // 	if (!this.enabled) return;
    // 	new RoomVisual(colonyName).multitext(text, 0, 4, {textfont: 'monospace', textsize: 0.75});
    // }
    static drawGraphs() {
        // this.text(`CPU`, {x: 1, y: 7});
        // this.barGraph(Memory.stats.persistent.avgCPU / Game.cpu.limit, {x: 2.75, y: 7});
        this.text(`BKT`, { x: 1, y: 8 });
        this.barGraph(Game.cpu.bucket / 10000, { x: 2.75, y: 8 });
        this.text(`GCL`, { x: 1, y: 9 });
        this.barGraph(Game.gcl.progress / Game.gcl.progressTotal, { x: 2.75, y: 9 });
    }
    // static summary(): void {
    // 	this.text(`Colonies: ${_.keys(Overmind.colonies).length} | Creeps: ${_.keys(Game.creeps).length}`, {
    // 		x: 1,
    // 		y: 10
    // 	}, .93);
    // }
    // This typically takes about 0.3-0.6 CPU in total
    static visuals() {
        // this.drawLogo();
        this.drawGraphs();
        // this.drawNotifications();
        // this.summary();
    }
}

class CreepManager {
    static run(room) {
        // var upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.memory.spawnRoom == room.name);
        // var haulers = _.filter(Game.creeps, (creep) => creep.memory.role == 'hauler' && creep.memory.spawnRoom == room.name);
        // var dismantlers = _.filter(Game.creeps, (creep) => creep.memory.role == 'dismantler' && creep.memory.spawnRoom == room.name);
        var defencers = _.filter(Game.creeps, (creep) => creep.memory.role == 'defencer' && creep.memory.spawnRoom == room.name);
        // var reservists = _.filter(Game.creeps, (creep) => creep.memory.role == 'reservist' && creep.memory.spawnRoom == room.name);
        // var traders = _.filter(Game.creeps, (creep) => creep.memory.role == 'trader' && creep.memory.spawnRoom == room.name);
        var attack_warriors = _.filter(Game.creeps, (creep) => creep.memory.role == 'attack_warrior' && creep.memory.spawnRoom == room.name);
        var attack_toughs = _.filter(Game.creeps, (creep) => creep.memory.role == 'attack_tough');
        var attack_heals = _.filter(Game.creeps, (creep) => creep.memory.role == 'attack_heal');
        if (room.name == 'E51N21') {
            if (defencers.length < 0) {
                var id = CreepManager.getId('defencer');
                var newName = 'defencer_' + id;
                CreepManager.spawn(room, [ATTACK, ATTACK, MOVE, MOVE], newName, { memory: { role: 'defencer', id: id, spawnRoom: room.name } });
            }
            else 
            // if (haulers.length < 0) {
            //     var id = CreepManager.getId('hauler');
            //     var newName = 'hauler_' + id;
            //     CreepManager.spawn(room, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE
            //     ], newName,
            //         { memory: { role: 'hauler', id: id, spawnRoom: room.name } });
            // } else
            // if (dismantlers.length < 0 && Memory.gotoDismantle) {
            //     var id = CreepManager.getId('dismantler');
            //     var newName = 'dismantler_' + id;
            //     CreepManager.spawn(room, [WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,], newName,
            //         { memory: { role: 'dismantler', id: id, spawnRoom: room.name } });
            // } else
            // if (upgraders.length < 2) {
            //     var id = CreepManager.getId('upgrader');
            //     var newName = 'upgrader_' + id;
            //     CreepManager.spawn(room, [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, 
            //         WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, 
            //         WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, 
            //         WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, 
            //         CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY], newName,
            //         { memory: { role: 'upgrader', id: id, spawnRoom: room.name } });
            // } else
            // if (traders.length < 1) {
            //     var id = CreepManager.getId('trader');
            //     var newName = 'trader_' + id;
            //     CreepManager.spawn(room, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], newName,
            //         { memory: { role: 'trader', id: id, spawnRoom: room.name } });
            // } else
            // console.log(attack_heals.length);
            if (attack_heals.length < 0) {
                var id = CreepManager.getId('attack_heal');
                var newName = 'attack_heal_' + id;
                CreepManager.spawn(room, [MOVE, MOVE, MOVE, MOVE, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL], newName, { memory: { role: 'attack_heal', id: id, spawnRoom: 'E49N22' } });
            }
            // console.log(Memory.source[spawn.room.name].sources.length);
        }
        if (room.name == 'E49N22') {
            if (defencers.length < 0) {
                var id = CreepManager.getId('defencer');
                var newName = 'defencer_' + id;
                CreepManager.spawn(room, [ATTACK, ATTACK, MOVE, MOVE], newName, { memory: { role: 'defencer', id: id, spawnRoom: room.name } });
            }
            else 
            // if (haulers.length < 0) {
            //     var id = CreepManager.getId('hauler');
            //     var newName = 'hauler_' + id;
            //     CreepManager.spawn(room, [CARRY, CARRY, CARRY, CARRY, MOVE, MOVE, MOVE, MOVE], newName,
            //         { memory: { role: 'hauler', id: id, spawnRoom: room.name } });
            // } else
            // if (dismantlers.length < 4 && Memory.gotoDismantle) {
            //     var id = CreepManager.getId('dismantler');
            //     var newName = 'dismantler_' + id;
            //     CreepManager.spawn(room, [
            //         WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE, WORK, WORK, WORK, WORK, WORK, MOVE, MOVE, MOVE, MOVE, MOVE], newName,
            //         { memory: { role: 'dismantler', id: id, spawnRoom: room.name } });
            // } else
            // if (upgraders.length < 1) {
            //     var id = CreepManager.getId('upgrader');
            //     var newName = 'upgrader_' + id;
            //     CreepManager.spawn(room, [WORK, //WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK, WORK,
            //         CARRY, //CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            //         MOVE, //MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE
            //     ], newName,
            //         // CreepManager.spawn(room,[MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,MOVE,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,WORK,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,CARRY], newName, 
            //         { memory: { role: 'upgrader', id: id, spawnRoom: room.name } });
            // } else
            // if (traders.length < 1) {
            //     var id = CreepManager.getId('trader');
            //     var newName = 'trader_' + id;
            //     CreepManager.spawn(room, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
            //         CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], newName,
            //         { memory: { role: 'trader', id: id, spawnRoom: room.name } });
            // } else
            // if (reservists.length < 2) {
            //     if (Memory.colonies[room.name].length) {
            //         var id = CreepManager.getId('reservist');
            //         var newName = 'reservist_' + id;
            //         CreepManager.spawn(room, [CLAIM, MOVE, CLAIM, MOVE, CLAIM, MOVE], newName,
            //             { memory: { role: 'reservist', id: id, spawnRoom: room.name } });
            //     }
            //     // if(!Game.getObjectById(Memory.colonies[room.name][0].controller) || Game.getObjectById(Memory.colonies[room.name][0].controller).reservation.ticksToEnd < 4000){
            //     // console.log(Game.getObjectById(Memory.colonies[room.name][0].controller));
            //     // }
            // } else
            if (attack_warriors.length < 0 && Memory.gotoDismantle) {
                // console.log('fdfd');
                var id = CreepManager.getId('attack_warrior');
                var newName = 'attack_warrior_' + id;
                // console.log(id);
                if (id <= -1)
                    CreepManager.spawn(room, [ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE, ATTACK, ATTACK, MOVE, MOVE], newName, { memory: { role: 'attack_warrior', id: id, spawnRoom: room.name } });
                if (id >= 0)
                    CreepManager.spawn(room, [MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                        ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK, ATTACK], newName, { memory: { role: 'attack_warrior', id: id, spawnRoom: room.name } });
            }
            else if (attack_toughs.length < 0) {
                var id = CreepManager.getId('attack_tough');
                var newName = 'attack_tough_' + id;
                CreepManager.spawn(room, [
                    TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    TOUGH, TOUGH, TOUGH, TOUGH, TOUGH, TOUGH,
                    TOUGH,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE, MOVE, MOVE, MOVE, MOVE, MOVE,
                    MOVE
                ], newName, { memory: { role: 'attack_tough', id: id, spawnRoom: 'E49N22' } });
            }
            else if (attack_heals.length < 0) {
                var id = CreepManager.getId('attack_heal');
                var newName = 'attack_heal_' + id;
                CreepManager.spawn(room, [HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, HEAL, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE, MOVE], newName, { memory: { role: 'attack_heal', id: id, spawnRoom: 'E49N22' } });
            }
        }
        this.run_(room);
    }
    static clearUnexistingCreep() {
        for (const name in Memory.creeps) {
            if (!Game.creeps[name]) {
                console.log('Clearing non-existing creep memory:', name);
                delete Memory.creeps[name];
            }
        }
    }
    static run_(room) {
        let controller = room.controller;
        let spawns = room.find(FIND_MY_SPAWNS);
        if (!controller)
            return;
        if (!spawns.length)
            return;
        var harvesters = [];
        var transporters = [];
        var upgraders = [];
        var workers = [];
        var fillers = [];
        var stableTransporters = [];
        var traders = [];
        var haulers = [];
        var dismantlers = [];
        var pioneers = [];
        for (const creepName in Game.creeps) {
            const creep = Game.creeps[creepName];
            if (creep.memory.spawnRoom != room.name)
                continue;
            switch (creep.memory.role) {
                case 'harvester':
                    harvesters.push(creep);
                    break;
                case 'transporter':
                    transporters.push(creep);
                    break;
                case 'upgrader':
                    upgraders.push(creep);
                    break;
                case 'worker':
                    workers.push(creep);
                    break;
                case 'filler':
                    fillers.push(creep);
                    break;
                case 'stableTransporter':
                    stableTransporters.push(creep);
                    break;
                case 'defencer':
                    break;
                case 'reservist':
                    break;
                case 'trader':
                    traders.push(creep);
                    break;
                case 'attack_warrior':
                    break;
                case 'hauler':
                    haulers.push(creep);
                    break;
                case 'dismantler':
                    dismantlers.push(creep);
                    break;
                case 'pioneer':
                    pioneers.push(creep);
                    break;
                default:
                    break;
            }
        }
        let avaEnergy = room.energyAvailable;
        let capEnergy = room.energyCapacityAvailable;
        if (fillers.length == 0)
            capEnergy = avaEnergy < 300 ? 300 : avaEnergy;
        //filler
        if (fillers.length < (controller.level >= 5 ? 2 : 1)) {
            let budget = Math.min(150 + (capEnergy - 150) / (controller.level >= 5 ? (controller.level >= 7 ? 5 : 2) : 1), capEnergy);
            if (controller.level >= 5)
                budget /= 2;
            if (budget < 300)
                budget = 300;
            let id = CreepManager.getId('filler');
            this.spawn(room, this.getBodies(['c2', 'm1'], budget), 'filler_' + id, { memory: { role: 'filler', id: id, spawnRoom: room.name } });
            return;
        }
        //dismantler
        if (Memory.gotoDismantle && Memory.dismantlerRoom == room.name && dismantlers.length < 2) {
            let id = CreepManager.getId('dismantler');
            this.spawn(room, this.getBodies(['w1', 'm1'], capEnergy), 'dismantler_' + id, { memory: { role: 'dismantler', id: id, spawnRoom: room.name } });
        }
        //hauler
        if (Memory.gotoHaul && Memory.haulerRoom == room.name && haulers.length < 2) {
            let id = CreepManager.getId('hauler');
            this.spawn(room, this.getBodies(['c1', 'm1'], capEnergy), 'hauler_' + id, { memory: { role: 'hauler', id: id, spawnRoom: room.name } });
        }
        //pioneer
        if (Memory.expandRoom == room.name && pioneers.length < 2) {
            let id = CreepManager.getId('pioneer');
            let hasClaim = pioneers.length == 0 && !Memory.claimed;
            let bodies = this.getBodies(['w1', 'c1', 'm1'], capEnergy);
            if (hasClaim)
                bodies = [CLAIM, MOVE];
            this.spawn(room, bodies, 'pioneer_' + id, { memory: { role: 'pioneer', id: id, spawnRoom: room.name } });
        }
        //trader
        if (room.terminal && traders.length < 1) {
            var id = CreepManager.getId('trader');
            var newName = 'trader_' + id;
            CreepManager.spawn(room, [CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY,
                CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, CARRY, MOVE], newName, { memory: { role: 'trader', id: id, spawnRoom: room.name } });
        }
        //reservist
        let reserve = SourceManager.allotReservist(room);
        if (capEnergy >= 1300 && reserve && reserve.data.ticksToEnd < 3000) {
            let budget = Math.min(capEnergy, 2600);
            let id = CreepManager.getId('reservist');
            this.spawn(room, this.getBodies(['C1', 'm1'], budget), 'reservist_' + id, { memory: { role: 'reservist', id: id, spawnRoom: room.name, allotUnit: reserve } });
        }
        if (reserve)
            Alloter.free(reserve);
        //upgrader
        let bodies = this.getBodies([controller.level >= 6 ? 'w2' : 'w1', 'c1', 'm1'], capEnergy);
        if (controller.level == 8)
            bodies = [WORK, CARRY, MOVE];
        let numUpgraders = 1;
        let storage = room.storage;
        if (!storage)
            numUpgraders = 0;
        else if (controller.level != 8) {
            if (storage.store[RESOURCE_ENERGY] >= 600000)
                numUpgraders += 1;
            if (storage.store[RESOURCE_ENERGY] >= 700000)
                numUpgraders += 1;
            if (storage.store[RESOURCE_ENERGY] >= 750000)
                numUpgraders += 1;
            if (storage.store[RESOURCE_ENERGY] >= 800000)
                numUpgraders += 1;
            if (storage.store[RESOURCE_ENERGY] >= 900000)
                numUpgraders += 2;
            if (storage.store[RESOURCE_ENERGY] >= 950000)
                numUpgraders += 3;
        }
        if (upgraders.length < numUpgraders) {
            let id = this.getId('upgrader');
            this.spawn(room, bodies, 'upgrader_' + id, { memory: { role: 'upgrader', id: id, spawnRoom: room.name } });
        }
        //worker
        bodies = this.getBodies(['w1', 'c1', 'm1'], capEnergy);
        const MAX_WORKERS = controller.level >= 4 ? 5 : 10;
        let repairList = room.find(FIND_STRUCTURES, { filter: structure => structure.structureType != STRUCTURE_ROAD
                && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_CONTAINER
                && structure.hits < structure.hitsMax });
        let buildSites = room.find(FIND_CONSTRUCTION_SITES);
        if (Memory.colonies[room.name])
            for (const r of Memory.colonies[room.name])
                if (Game.rooms[r.name])
                    buildSites.push(...Game.rooms[r.name].find(FIND_CONSTRUCTION_SITES));
        const buildTicks = _.sum(buildSites, site => Math.max(site.progressTotal - site.progress, 0)) / BUILD_POWER;
        const repairTicks = _.sum(repairList, structure => structure.hitsMax - structure.hits) / REPAIR_POWER;
        let numWorkers = Math.ceil(2 * (5 * buildTicks + repairTicks) /
            (bodies.length / 3 * CREEP_LIFE_TIME));
        numWorkers = Math.min(numWorkers, MAX_WORKERS);
        if (controller.level < 4)
            numWorkers = Math.max(numWorkers, 5);
        if (workers.length < numWorkers) {
            let id = this.getId('worker');
            this.spawn(room, bodies, 'worker_' + id, { memory: { role: 'worker', id: id, spawnRoom: room.name } });
        }
        // transporter
        let transport = SourceManager.allotTransporter(room);
        if (transport) {
            if (!transport.data.distance && transport.data.pos)
                transport.data.distance = PathFinder.search(room.find(FIND_MY_SPAWNS)[0].pos, transport.data.pos, { swampCost: 1 }).cost + 5;
            if (!transport.data.distance)
                return;
            let capacity = transport.data.distance * 20 * 1.1;
            let multiple = Math.ceil(capacity / 100);
            let cost = multiple * 150 + (transport.roomName == room.name ? 0 : 100);
            cost = (cost > capEnergy ? capEnergy : cost) - (transport.roomName == room.name ? 0 : 100);
            let bodies = this.getBodies(['c2', 'm1'], cost);
            if (transport.roomName != room.name)
                bodies[0] = WORK;
            let id = CreepManager.getId('transporter');
            this.spawn(room, bodies, 'transporter_' + id, { memory: { role: 'transporter', allotUnit: transport, id: id, spawnRoom: room.name } });
        }
        //stableTransporter
        if (Memory.rooms[room.name].centerLink && stableTransporters.length < 1) {
            let id = CreepManager.getId('stableTransporter');
            this.spawn(room, this.getBodies(['c4', 'm1'], 500), 'stableTransporter_' + id, { memory: { role: 'stableTransporter', id: id, spawnRoom: room.name } });
        }
        //harvester
        let source = SourceManager.allotSource(room);
        if (source) {
            let id = CreepManager.getId('harvester');
            let newName = 'harvester_' + id;
            let bodies = [];
            if (capEnergy >= 800)
                bodies = [WORK, WORK, WORK, WORK, WORK, WORK, CARRY, MOVE, MOVE, MOVE];
            else if (capEnergy >= 550)
                bodies = [WORK, WORK, WORK, WORK, WORK, MOVE];
            else if (capEnergy >= 300)
                bodies = [WORK, WORK, MOVE];
            this.spawn(room, bodies, newName, { memory: { role: 'harvester', id: id, spawnRoom: room.name, allotUnit: source } });
        }
        let hcount = Alloter.getUnitCount(ALLOT_HARVEST, room.name);
        if (Memory.colonies[room.name])
            for (const r of Memory.colonies[room.name])
                hcount += Alloter.getUnitCount(ALLOT_HARVEST, r.name);
        let tcount = Alloter.getUnitCount(ALLOT_TRANSPORT, room.name);
        if (Memory.colonies[room.name])
            for (const r of Memory.colonies[room.name])
                tcount += Alloter.getUnitCount(ALLOT_TRANSPORT, r.name);
        let visual = [];
        visual.push(['filler', this.getVisualString(fillers.length, controller.level >= 5 ? 2 : 1)]);
        visual.push(['harvester', this.getVisualString(harvesters.length, hcount)]);
        visual.push(['transporter', this.getVisualString(transporters.length, tcount)]);
        visual.push(['worker', this.getVisualString(workers.length, numWorkers)]);
        visual.push(['upgrader', this.getVisualString(upgraders.length, numUpgraders)]);
        if (room.terminal)
            visual.push(['trader', this.getVisualString(traders.length, 1)]);
        if (Memory.rooms[room.name].centerLink)
            visual.push(['stableTransporter', this.getVisualString(stableTransporters.length, 1)]);
        if (Memory.gotoDismantle && Memory.dismantlerRoom == room.name)
            visual.push(['dismantler', this.getVisualString(dismantlers.length, 2)]);
        if (Memory.gotoHaul && Memory.haulerRoom == room.name)
            visual.push(['hauler', this.getVisualString(haulers.length, 3)]);
        if (Memory.expandRoom == room.name)
            visual.push(['pioneer', this.getVisualString(pioneers.length, 2)]);
        Visualizer.infoBox('creeps', visual, { x: 1, y: 1, roomName: room.name }, 9.5);
    }
    static getVisualString(count, maxCount) {
        return maxCount >= 10 ? count + '/' + maxCount : '  ' + count + '/' + maxCount;
    }
    static refreshObstacles() {
        Memory.obstacles = [];
        for (const name in Memory.creeps) {
            if (Memory.creeps.hasOwnProperty(name)) {
                const creep = Memory.creeps[name];
                if (!Game.creeps[name])
                    continue;
                if (!creep.lastPos) {
                    creep.lastPos = Game.creeps[name].pos;
                    creep.standstillTime = 0;
                    continue;
                }
                if (Game.creeps[name].pos.isEqualTo(creep.lastPos))
                    creep.standstillTime++;
                else {
                    creep.lastPos = Game.creeps[name].pos;
                    creep.standstillTime = 0;
                }
                if (creep.standstillTime >= 5) {
                    Memory.obstacles.push({ pos: Game.creeps[name].pos });
                }
            }
        }
    }
    static spawn(room, parts, name, opts) {
        let spawns = room.find(FIND_MY_SPAWNS);
        for (const spawn of spawns) {
            // console.log(spawn.spawnCreep(parts, name, {dryRun: true}) + name + spawn.name);
            if (spawn.spawnCreep(parts, name, { dryRun: true }) == OK) {
                // console.log(spawn.name + name);
                if (opts.memory.role)
                    console.log('Spawning new ' + opts.memory.role + ': ' + name);
                else
                    console.log('Spawning: ' + name);
                if (spawn.spawnCreep(parts, name, opts) != OK)
                    console.log(`<span style='color:red'>can't spawn creep! bodies: ${parts} name: ${name}</span>`);
                return;
            }
        }
    }
    static t_spawn(room, parts, name, opts) {
        console.log(JSON.stringify(parts));
        console.log((JSON.stringify(opts)));
        let cost = 0;
        for (const body of parts) {
            cost += BODYPART_COST[body];
        }
        console.log('cost ', cost);
    }
    static getId(role) {
        var creeps = _.filter(Game.creeps, (creep) => creep.memory.role == role);
        for (let i = 0; i < 999; i++) {
            var find = false;
            for (const creep of creeps) {
                if (creep.memory.id == i) {
                    find = true;
                    break;
                }
            }
            if (!find)
                return i;
        }
        return -1;
    }
    static getBodies(radio, useEnergy) {
        let cost = 0;
        let count = 0;
        for (const body of radio) {
            let a = this.getBodyByHeadLetter(body[0]);
            cost += BODYPART_COST[a] * Number.parseInt(body[1]);
            count += Number.parseInt(body[1]);
        }
        let multiple = Math.floor(useEnergy / cost);
        if (multiple * count > 50)
            multiple = Math.floor(50 / count);
        let result = [];
        for (const body of radio) {
            let num = Number.parseInt(body[1]) * multiple;
            let a = this.getBodyByHeadLetter(body[0]);
            for (let i = 0; i < num; i++) {
                result.push(a);
            }
        }
        return result;
    }
    static getCost(radio, multiple) {
        let cost = 0;
        for (const body of radio) {
            let a = this.getBodyByHeadLetter(body[0]);
            cost += BODYPART_COST[a] * Number.parseInt(body[1]);
        }
        return cost * multiple;
    }
    static getBodyByHeadLetter(s) {
        switch (s) {
            case 'm':
                return MOVE;
            case 'w':
                return WORK;
            case 'c':
                return CARRY;
            case 'a':
                return ATTACK;
            case 'r':
                return RANGED_ATTACK;
            case 't':
                return TOUGH;
            case 'h':
                return HEAL;
            case 'C':
                return CLAIM;
        }
        throw "UnknownBodyHeadLetter!";
    }
}

class Role {
    constructor(creep) {
        this.creep = creep;
    }
    run() { }
}

class RoleFiller extends Role {
    run() {
        if (!this.creep.ticksToLive)
            return;
        if (this.creep.memory.allotUnit)
            Alloter.refreshDirty(this.creep.memory.allotUnit);
        if (this.creep.carry.energy == 0) {
            SourceManager.getSource(this.creep);
        }
        else {
            var targets = this.creep.room.find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return (structure.structureType == STRUCTURE_EXTENSION ||
                        structure.structureType == STRUCTURE_SPAWN ||
                        structure.structureType == STRUCTURE_POWER_SPAWN) &&
                        structure.energy < structure.energyCapacity;
                }
            });
            if (targets && targets.length) {
                this.creep.memory.idle = false;
                let target = this.creep.pos.findClosestByRange(targets);
                if (target) {
                    if (this.creep.transfer(target, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                        this.creep.travelTo(target, { obstacles: Memory.obstacles });
                    }
                }
            }
            else {
                this.creep.memory.idle = true;
                if (!this.creep.memory.allotUnit)
                    this.creep.memory.allotUnit = Alloter.allotSmallestByRange(ALLOT_TOWER, this.creep.room.name, this.creep.pos);
                if (this.creep.memory.allotUnit) {
                    let tower = Game.getObjectById(this.creep.memory.allotUnit.data.id1);
                    if (!tower) {
                        delete this.creep.memory.allotUnit;
                        return;
                    }
                    let carry = this.creep.carry[RESOURCE_ENERGY];
                    if (this.creep.transfer(tower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                        this.creep.travelTo(tower, { obstacles: Memory.obstacles });
                    else if (carry + tower.energy > 600)
                        delete this.creep.memory.allotUnit;
                    return;
                }
                if (this.creep.pos.getRangeTo(this.creep.room.memory.fillerIdlePos) > 2)
                    this.creep.travelTo(this.creep.room.memory.fillerIdlePos, { obstacles: Memory.obstacles });
            }
        }
    }
}

class RoleTransporter extends Role {
    run() {
        if (!this.creep.memory.allotUnit) {
            this.creep.memory.allotUnit = SourceManager.allotTransporter(Game.rooms[this.creep.memory.spawnRoom]);
        }
        if (!this.creep.memory.allotUnit)
            return;
        if (!this.creep.room.memory.isClaimed && this.creep.room.memory.underAttacking)
            this.creep.suicide();
        if (!(this.creep.ticksToLive && this.creep.ticksToLive <= this.creep.memory.allotUnit.data.distance * 2))
            Alloter.refreshDirty(this.creep.memory.allotUnit);
        if (this.creep.carry.energy < this.creep.carryCapacity * 0.66) {
            let pos = this.creep.memory.allotUnit.data.pos;
            if (!this.creep.memory.containerId) {
                let containers = pos.findInRange(FIND_STRUCTURES, 1, { filter: structure => structure.structureType == STRUCTURE_CONTAINER });
                let container = null;
                if (containers.length)
                    container = containers[0];
                if (container)
                    this.creep.memory.containerId = container.id;
            }
            let container = Game.getObjectById(this.creep.memory.containerId);
            if (this.creep.room.name == pos.roomName) {
                let drops = pos.findInRange(FIND_DROPPED_RESOURCES, 1);
                if (drops.length) {
                    if (this.creep.pickup(drops[0]) == ERR_NOT_IN_RANGE)
                        this.creep.travelTo(drops[0], { obstacles: Memory.obstacles });
                    return;
                }
            }
            if (container && this.creep.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                this.creep.travelTo(container, { obstacles: Memory.obstacles });
            }
        }
        else {
            let targets = Game.rooms[this.creep.room.name].find(FIND_STRUCTURES, {
                filter: (structure) => {
                    return structure.hits < structure.hitsMax
                        && structure.structureType == STRUCTURE_ROAD && structure.pos.getRangeTo(this.creep.pos) <= 3;
                }
            });
            let target = RoleTransporter.findSmallestByHit(targets);
            if (target)
                this.creep.repair(target);
            var storage = Game.getObjectById(Memory.rooms[this.creep.memory.spawnRoom].storage);
            if (storage) {
                if (this.creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE)
                    this.creep.travelTo(storage, { obstacles: Memory.obstacles });
            }
        }
    }
    static findSmallestByHit(targets) {
        var result = targets[0];
        for (const t of targets) {
            if (t.hits < result.hits)
                result = t;
        }
        return result;
    }
}

class RoleStableTransporter extends Role {
    run() {
        if (!this.creep.room.memory.stableTransporterPos)
            return;
        if (!this.creep.room.memory.centerLink)
            return;
        let pos = this.creep.room.memory.stableTransporterPos;
        if (!this.creep.pos.isEqualTo(pos)) {
            this.creep.travelTo(pos, { obstacles: Memory.obstacles });
            return;
        }
        let linkId = this.creep.room.memory.centerLink;
        let link = Game.getObjectById(linkId);
        let upLink = Game.getObjectById(this.creep.room.memory.upgradeLink);
        if (upLink && link && upLink.energy < 600) {
            let remain = upLink.energyCapacity - upLink.energy - link.energy;
            if (remain <= 0) {
                link.transferEnergy(upLink);
                return;
            }
            if (this.creep.room.storage) {
                this.creep.withdraw(this.creep.room.storage, RESOURCE_ENERGY, Math.min(this.creep.carryCapacity, remain));
            }
            this.creep.transfer(link, RESOURCE_ENERGY);
            return;
        }
        if (link) {
            this.creep.withdraw(link, RESOURCE_ENERGY);
            if (this.creep.room.storage)
                this.creep.transfer(this.creep.room.storage, RESOURCE_ENERGY);
        }
    }
}

class RoleHarvester extends Role {
    run() {
        // delete this.creep.memory.allotUnit;
        if (!this.creep.memory.allotUnit) {
            this.creep.memory.allotUnit = SourceManager.allotSource(Game.rooms[this.creep.memory.spawnRoom]);
        }
        if (!this.creep.memory.allotUnit)
            return;
        if (!(this.creep.ticksToLive && this.creep.ticksToLive <= 70))
            Alloter.refreshDirty(this.creep.memory.allotUnit);
        let pos = this.creep.memory.allotUnit.data.pos;
        if (this.creep.pos.roomName == pos.roomName) {
            let enemies = this.creep.room.find(FIND_HOSTILE_CREEPS);
            if (enemies.length) {
                let longest = 0;
                for (const enemy of enemies) {
                    if (enemy.ticksToLive && enemy.ticksToLive > longest)
                        longest = enemy.ticksToLive;
                }
                Memory.rooms[this.creep.pos.roomName].underAttacking = true;
                Memory.rooms[this.creep.pos.roomName].timeLeft = longest;
                if (!this.creep.room.memory.isClaimed)
                    this.creep.suicide();
            }
        }
        if (this.creep.pos.getRangeTo(pos) != 1 && !this.creep.memory.containerId) {
            this.creep.travelTo(pos, { obstacles: Memory.obstacles });
            return;
        }
        if (!this.creep.memory.sourceId) {
            let sources = pos.findInRange(FIND_SOURCES, 0);
            if (sources.length)
                this.creep.memory.sourceId = sources[0].id;
        }
        let source = Game.getObjectById(this.creep.memory.sourceId);
        if (!source)
            return;
        if (!this.creep.memory.containerId && this.creep.memory.containerId != 'none') {
            let containers = pos.findInRange(FIND_STRUCTURES, 1, { filter: structure => structure.structureType == STRUCTURE_CONTAINER });
            this.creep.memory.containerId = 'none';
            if (containers.length)
                this.creep.memory.containerId = containers[0].id;
        }
        let container = Game.getObjectById(this.creep.memory.containerId);
        if (container && this.creep.pos.getRangeTo(container.pos) != 0) {
            this.creep.travelTo(container.pos);
            return;
        }
        this.creep.harvest(source);
        let repair = false;
        if (container) {
            let pickup = false;
            let drops = this.creep.pos.findInRange(FIND_DROPPED_RESOURCES, 0);
            if (drops.length) {
                this.creep.pickup(drops[0]);
                pickup = true;
            }
            if (container.store[RESOURCE_ENERGY] > 0 && !pickup)
                this.creep.withdraw(container, RESOURCE_ENERGY);
            if (container.hitsMax - container.hits >= 600) {
                repair = true;
                this.creep.repair(container);
            }
        }
        if (!this.creep.memory.linkId) {
            let links = this.creep.pos.findInRange(FIND_STRUCTURES, 1, { filter: structure => structure.structureType == STRUCTURE_LINK });
            this.creep.memory.linkId = 'none';
            if (links.length)
                this.creep.memory.linkId = links[0].id;
        }
        if (this.creep.memory.linkId != 'none') {
            let link = Game.getObjectById(this.creep.memory.linkId);
            let centerLink = Game.getObjectById(Memory.rooms[this.creep.room.name].centerLink);
            if (link && centerLink && !repair && this.creep.carry[RESOURCE_ENERGY] == this.creep.carryCapacity) {
                delete Memory.rooms[this.creep.room.name].allot[ALLOT_TRANSPORT][this.creep.memory.allotUnit.id];
                this.creep.transfer(link, RESOURCE_ENERGY);
                if (link.energy >= link.energyCapacity)
                    link.transferEnergy(centerLink);
            }
        }
    }
}

class RoleDefencer extends Role {
    run() {
        var structure = Game.getObjectById('5cb9fd0aa0ee8f67a759b43b');
        if (!structure)
            return;
        var enemy = structure.room.find(FIND_HOSTILE_CREEPS);
        // console.log(enemy.length);
        if (this.creep.room.name != 'E49N22') {
            this.creep.travelTo(structure, { obstacles: Memory.obstacles });
        }
        else if (!this.creep.pos.isEqualTo(structure) && enemy.length == 0) {
            this.creep.travelTo(structure, { obstacles: Memory.obstacles });
        }
        else {
            if (this.creep.attack(enemy[0]) == ERR_NOT_IN_RANGE) {
                this.creep.travelTo(enemy[0], { obstacles: Memory.obstacles });
            }
        }
    }
}

var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var helpers = createCommonjsModule(function (module, exports) {
// Universal reference properties
Object.defineProperty(exports, "__esModule", { value: true });
function deref(ref) {
    return Game.getObjectById(ref) || Game.flags[ref] || Game.creeps[ref] || Game.spawns[ref] || null;
}
exports.deref = deref;
function derefRoomPosition(protoPos) {
    return new RoomPosition(protoPos.x, protoPos.y, protoPos.roomName);
}
exports.derefRoomPosition = derefRoomPosition;
function isEnergyStructure(structure) {
    return structure.energy != undefined && structure.energyCapacity != undefined;
}
exports.isEnergyStructure = isEnergyStructure;
function isStoreStructure(structure) {
    return structure.store != undefined;
}
exports.isStoreStructure = isStoreStructure;
});

unwrapExports(helpers);
var helpers_1 = helpers.deref;
var helpers_2 = helpers.derefRoomPosition;
var helpers_3 = helpers.isEnergyStructure;
var helpers_4 = helpers.isStoreStructure;

var Task_1 = createCommonjsModule(function (module, exports) {
/**
 * Creep tasks setup instructions
 *
 * Javascript:
 * 1. In main.js:    require("creep-tasks");
 * 2. As needed:     var Tasks = require("<path to creep-tasks.js>");
 *
 * Typescript:
 * 1. In main.ts:    import "<path to index.ts>";
 * 2. As needed:     import {Tasks} from "<path to Tasks.ts>"
 *
 * If you use Traveler, change all occurrences of creep.moveTo() to creep.travelTo()
 */
Object.defineProperty(exports, "__esModule", { value: true });


/* An abstract class for encapsulating creep actions. This generalizes the concept of "do action X to thing Y until
 * condition Z is met" and saves a lot of convoluted and duplicated code in creep logic. A Task object contains
 * the necessary logic for traveling to a target, performing a task, and realizing when a task is no longer sensible
 * to continue.*/
class Task {
    constructor(taskName, target, options = {}) {
        // Parameters for the task
        this.name = taskName;
        this._creep = {
            name: '',
        };
        if (target) { // Handles edge cases like when you're done building something and target disappears
            this._target = {
                ref: target.ref,
                _pos: target.pos,
            };
        }
        else {
            this._target = {
                ref: '',
                _pos: {
                    x: -1,
                    y: -1,
                    roomName: '',
                }
            };
        }
        this._parent = null;
        this.settings = {
            targetRange: 1,
            workOffRoad: false,
            oneShot: false,
        };
        _.defaults(options, {
            blind: false,
            moveOptions: {},
        });
        this.tick = Game.time;
        this.options = options;
        this.data = {
            quiet: true,
        };
    }
    get proto() {
        return {
            name: this.name,
            _creep: this._creep,
            _target: this._target,
            _parent: this._parent,
            options: this.options,
            data: this.data,
            tick: this.tick,
        };
    }
    set proto(protoTask) {
        // Don't write to this.name; used in task switcher
        this._creep = protoTask._creep;
        this._target = protoTask._target;
        this._parent = protoTask._parent;
        this.options = protoTask.options;
        this.data = protoTask.data;
        this.tick = protoTask.tick;
    }
    // Getter/setter for task.creep
    get creep() {
        return Game.creeps[this._creep.name];
    }
    set creep(creep) {
        this._creep.name = creep.name;
    }
    // Dereferences the target
    get target() {
        return helpers.deref(this._target.ref);
    }
    // Dereferences the saved target position; useful for situations where you might lose vision
    get targetPos() {
        // refresh if you have visibility of the target
        if (this.target) {
            this._target._pos = this.target.pos;
        }
        return helpers.derefRoomPosition(this._target._pos);
    }
    // Getter/setter for task parent
    get parent() {
        return (this._parent ? initializer.initializeTask(this._parent) : null);
    }
    set parent(parentTask) {
        this._parent = parentTask ? parentTask.proto : null;
        // If the task is already assigned to a creep, update their memory
        if (this.creep) {
            this.creep.task = this;
        }
    }
    // Return a list of [this, this.parent, this.parent.parent, ...] as tasks
    get manifest() {
        let manifest = [this];
        let parent = this.parent;
        while (parent) {
            manifest.push(parent);
            parent = parent.parent;
        }
        return manifest;
    }
    // Return a list of [this.target, this.parent.target, ...] without fully instantiating the list of tasks
    get targetManifest() {
        let targetRefs = [this._target.ref];
        let parent = this._parent;
        while (parent) {
            targetRefs.push(parent._target.ref);
            parent = parent._parent;
        }
        return _.map(targetRefs, ref => helpers.deref(ref));
    }
    // Return a list of [this.target, this.parent.target, ...] without fully instantiating the list of tasks
    get targetPosManifest() {
        let targetPositions = [this._target._pos];
        let parent = this._parent;
        while (parent) {
            targetPositions.push(parent._target._pos);
            parent = parent._parent;
        }
        return _.map(targetPositions, protoPos => helpers.derefRoomPosition(protoPos));
    }
    // Fork the task, assigning a new task to the creep with this task as its parent
    fork(newTask) {
        newTask.parent = this;
        if (this.creep) {
            this.creep.task = newTask;
        }
        return newTask;
    }
    isValid() {
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        let validTarget = false;
        if (this.target) {
            validTarget = this.isValidTarget();
        }
        else if (this.options.blind && !Game.rooms[this.targetPos.roomName]) {
            // If you can't see the target's room but you have blind enabled, then that's okay
            validTarget = true;
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask && validTarget) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            this.finish();
            return this.parent ? this.parent.isValid() : false;
        }
    }
    moveToTarget(range = this.settings.targetRange) {
        if (this.options.moveOptions && !this.options.moveOptions.range) {
            this.options.moveOptions.range = range;
        }
        return this.creep.moveTo(this.targetPos, this.options.moveOptions);
        // return this.creep.travelTo(this.targetPos, this.options.moveOptions); // <- switch if you use Traveler
    }
    /* Moves to the next position on the agenda if specified - call this in some tasks after work() is completed */
    moveToNextPos() {
        if (this.options.nextPos) {
            let nextPos = helpers.derefRoomPosition(this.options.nextPos);
            return this.creep.moveTo(nextPos);
            // return this.creep.travelTo(nextPos); // <- switch if you use Traveler
        }
    }
    // Return expected number of ticks until creep arrives at its first destination; this requires Traveler to work!
    get eta() {
        if (this.creep && this.creep.memory._trav) {
            return this.creep.memory._trav.path.length;
        }
    }
    // Execute this task each tick. Returns nothing unless work is done.
    run() {
        if (this.creep.pos.inRangeTo(this.targetPos, this.settings.targetRange) && !this.creep.pos.isEdge) {
            if (this.settings.workOffRoad) {
                // Move to somewhere nearby that isn't on a road
                this.parkCreep(this.creep, this.targetPos, true);
            }
            let result = this.work();
            if (this.settings.oneShot && result == OK) {
                this.finish();
            }
            return result;
        }
        else {
            this.moveToTarget();
        }
    }
    /* Bundled form of Zerg.park(); adapted from BonzAI codebase*/
    parkCreep(creep, pos = creep.pos, maintainDistance = false) {
        let road = _.find(creep.pos.lookFor(LOOK_STRUCTURES), s => s.structureType == STRUCTURE_ROAD);
        if (!road)
            return OK;
        let positions = _.sortBy(creep.pos.availableNeighbors(), (p) => p.getRangeTo(pos));
        if (maintainDistance) {
            let currentRange = creep.pos.getRangeTo(pos);
            positions = _.filter(positions, (p) => p.getRangeTo(pos) <= currentRange);
        }
        let swampPosition;
        for (let position of positions) {
            if (_.find(position.lookFor(LOOK_STRUCTURES), s => s.structureType == STRUCTURE_ROAD))
                continue;
            let terrain = position.lookFor(LOOK_TERRAIN)[0];
            if (terrain === 'swamp') {
                swampPosition = position;
            }
            else {
                return creep.move(creep.pos.getDirectionTo(position));
            }
        }
        if (swampPosition) {
            return creep.move(creep.pos.getDirectionTo(swampPosition));
        }
        return creep.moveTo(pos);
        // return creep.travelTo(pos); // <-- Switch if you use Traveler
    }
    // Finalize the task and switch to parent task (or null if there is none)
    finish() {
        this.moveToNextPos();
        if (this.creep) {
            this.creep.task = this.parent;
        }
        else {
            console.log(`No creep executing ${this.name}!`);
        }
    }
}
exports.Task = Task;
});

unwrapExports(Task_1);
var Task_2 = Task_1.Task;

var task_attack = createCommonjsModule(function (module, exports) {
// Attack task, includes attack and ranged attack if applicable.
// Use meleeAttack and rangedAttack for the exclusive variants.
Object.defineProperty(exports, "__esModule", { value: true });

class TaskAttack extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskAttack.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(ATTACK) > 0 || this.creep.getActiveBodyparts(RANGED_ATTACK) > 0);
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        let creep = this.creep;
        let target = this.target;
        let attackReturn = 0;
        let rangedAttackReturn = 0;
        if (creep.getActiveBodyparts(ATTACK) > 0) {
            if (creep.pos.isNearTo(target)) {
                attackReturn = creep.attack(target);
            }
            else {
                attackReturn = this.moveToTarget(1); // approach target if you also have attack parts
            }
        }
        if (creep.pos.inRangeTo(target, 3) && creep.getActiveBodyparts(RANGED_ATTACK) > 0) {
            rangedAttackReturn = creep.rangedAttack(target);
        }
        if (attackReturn == OK && rangedAttackReturn == OK) {
            return OK;
        }
        else {
            if (attackReturn != OK) {
                return rangedAttackReturn;
            }
            else {
                return attackReturn;
            }
        }
    }
}
TaskAttack.taskName = 'attack';
exports.TaskAttack = TaskAttack;
});

unwrapExports(task_attack);
var task_attack_1 = task_attack.TaskAttack;

var task_build = createCommonjsModule(function (module, exports) {
// TaskBuild: builds a construction site until creep has no energy or site is complete
Object.defineProperty(exports, "__esModule", { value: true });

class TaskBuild extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskBuild.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
        this.settings.workOffRoad = true;
    }
    isValidTask() {
        return this.creep.carry.energy > 0;
    }
    isValidTarget() {
        return this.target && this.target.my && this.target.progress < this.target.progressTotal;
    }
    work() {
        return this.creep.build(this.target);
    }
}
TaskBuild.taskName = 'build';
exports.TaskBuild = TaskBuild;
});

unwrapExports(task_build);
var task_build_1 = task_build.TaskBuild;

var task_claim = createCommonjsModule(function (module, exports) {
// TaskClaim: claims a new controller
Object.defineProperty(exports, "__esModule", { value: true });

class TaskClaim extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskClaim.taskName, target, options);
        // Settings
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(CLAIM) > 0);
    }
    isValidTarget() {
        return (this.target != null && (!this.target.room || !this.target.owner));
    }
    work() {
        return this.creep.claimController(this.target);
    }
}
TaskClaim.taskName = 'claim';
exports.TaskClaim = TaskClaim;
});

unwrapExports(task_claim);
var task_claim_1 = task_claim.TaskClaim;

var task_dismantle = createCommonjsModule(function (module, exports) {
// TaskDismantle: dismantles a structure
Object.defineProperty(exports, "__esModule", { value: true });

class TaskDismantle extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskDismantle.taskName, target, options);
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(WORK) > 0);
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        return this.creep.dismantle(this.target);
    }
}
TaskDismantle.taskName = 'dismantle';
exports.TaskDismantle = TaskDismantle;
});

unwrapExports(task_dismantle);
var task_dismantle_1 = task_dismantle.TaskDismantle;

var task_fortify = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskFortify extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskFortify.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
        this.settings.workOffRoad = true;
    }
    isValidTask() {
        return (this.creep.carry.energy > 0);
    }
    isValidTarget() {
        let target = this.target;
        return (target != null && target.hits < target.hitsMax); // over-fortify to minimize extra trips
    }
    work() {
        return this.creep.repair(this.target);
    }
}
TaskFortify.taskName = 'fortify';
exports.TaskFortify = TaskFortify;
});

unwrapExports(task_fortify);
var task_fortify_1 = task_fortify.TaskFortify;

var task_getBoosted = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

exports.MIN_LIFETIME_FOR_BOOST = 0.9;
function boostCounts(creep) {
    return _.countBy(this.body, bodyPart => bodyPart.boost);
}
const boostParts = {
    'UH': ATTACK,
    'UO': WORK,
    'KH': CARRY,
    'KO': RANGED_ATTACK,
    'LH': WORK,
    'LO': HEAL,
    'ZH': WORK,
    'ZO': MOVE,
    'GH': WORK,
    'GO': TOUGH,
    'UH2O': ATTACK,
    'UHO2': WORK,
    'KH2O': CARRY,
    'KHO2': RANGED_ATTACK,
    'LH2O': WORK,
    'LHO2': HEAL,
    'ZH2O': WORK,
    'ZHO2': MOVE,
    'GH2O': WORK,
    'GHO2': TOUGH,
    'XUH2O': ATTACK,
    'XUHO2': WORK,
    'XKH2O': CARRY,
    'XKHO2': RANGED_ATTACK,
    'XLH2O': WORK,
    'XLHO2': HEAL,
    'XZH2O': WORK,
    'XZHO2': MOVE,
    'XGH2O': WORK,
    'XGHO2': TOUGH,
};
class TaskGetBoosted extends Task_1.Task {
    constructor(target, boostType, partCount = undefined, options = {}) {
        super(TaskGetBoosted.taskName, target, options);
        // Settings
        this.data.resourceType = boostType;
        this.data.amount = partCount;
    }
    isValidTask() {
        let lifetime = _.any(this.creep.body, part => part.type == CLAIM) ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME;
        if (this.creep.ticksToLive && this.creep.ticksToLive < exports.MIN_LIFETIME_FOR_BOOST * lifetime) {
            return false; // timeout after this amount of lifespan has passed
        }
        let partCount = (this.data.amount || this.creep.getActiveBodyparts(boostParts[this.data.resourceType]));
        return (boostCounts(this.creep)[this.data.resourceType] || 0) < partCount;
    }
    isValidTarget() {
        return true; // Warning: this will block creep actions if the lab is left unsupplied of energy or minerals
    }
    work() {
        let partCount = (this.data.amount || this.creep.getActiveBodyparts(boostParts[this.data.resourceType]));
        if (this.target.mineralType == this.data.resourceType &&
            this.target.mineralAmount >= LAB_BOOST_MINERAL * partCount &&
            this.target.energy >= LAB_BOOST_ENERGY * partCount) {
            return this.target.boostCreep(this.creep, this.data.amount);
        }
        else {
            return ERR_NOT_FOUND;
        }
    }
}
TaskGetBoosted.taskName = 'getBoosted';
exports.TaskGetBoosted = TaskGetBoosted;
});

unwrapExports(task_getBoosted);
var task_getBoosted_1 = task_getBoosted.MIN_LIFETIME_FOR_BOOST;
var task_getBoosted_2 = task_getBoosted.TaskGetBoosted;

var task_getRenewed = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskGetRenewed extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskGetRenewed.taskName, target, options);
    }
    isValidTask() {
        let hasClaimPart = _.filter(this.creep.body, (part) => part.type == CLAIM).length > 0;
        let lifetime = hasClaimPart ? CREEP_CLAIM_LIFE_TIME : CREEP_LIFE_TIME;
        return this.creep.ticksToLive != undefined && this.creep.ticksToLive < 0.9 * lifetime;
    }
    isValidTarget() {
        return this.target.my;
    }
    work() {
        return this.target.renewCreep(this.creep);
    }
}
TaskGetRenewed.taskName = 'getRenewed';
exports.TaskGetRenewed = TaskGetRenewed;
});

unwrapExports(task_getRenewed);
var task_getRenewed_1 = task_getRenewed.TaskGetRenewed;

var task_goTo = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function hasPos(obj) {
    return obj.pos != undefined;
}
class TaskGoTo extends Task_1.Task {
    constructor(target, options = {}) {
        if (hasPos(target)) {
            super(TaskGoTo.taskName, { ref: '', pos: target.pos }, options);
        }
        else {
            super(TaskGoTo.taskName, { ref: '', pos: target }, options);
        }
        // Settings
        this.settings.targetRange = 1;
    }
    isValidTask() {
        return !this.creep.pos.inRangeTo(this.targetPos, this.settings.targetRange);
    }
    isValidTarget() {
        return true;
    }
    isValid() {
        // It's necessary to override task.isValid() for tasks which do not have a RoomObject target
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            let isValid = false;
            if (this.parent) {
                isValid = this.parent.isValid();
            }
            this.finish();
            return isValid;
        }
    }
    work() {
        return OK;
    }
}
TaskGoTo.taskName = 'goTo';
exports.TaskGoTo = TaskGoTo;
});

unwrapExports(task_goTo);
var task_goTo_1 = task_goTo.TaskGoTo;

var task_goToRoom = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskGoToRoom extends Task_1.Task {
    constructor(roomName, options = {}) {
        super(TaskGoToRoom.taskName, { ref: '', pos: new RoomPosition(25, 25, roomName) }, options);
        // Settings
        this.settings.targetRange = 24; // Target is almost always controller flag, so range of 2 is acceptable
    }
    isValidTask() {
        return !this.creep.pos.inRangeTo(this.targetPos, this.settings.targetRange);
    }
    isValidTarget() {
        return true;
    }
    isValid() {
        // It's necessary to override task.isValid() for tasks which do not have a RoomObject target
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            let isValid = false;
            if (this.parent) {
                isValid = this.parent.isValid();
            }
            this.finish();
            return isValid;
        }
    }
    work() {
        return OK;
    }
}
TaskGoToRoom.taskName = 'goToRoom';
exports.TaskGoToRoom = TaskGoToRoom;
});

unwrapExports(task_goToRoom);
var task_goToRoom_1 = task_goToRoom.TaskGoToRoom;

var task_harvest = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

function isSource(obj) {
    return obj.energy != undefined;
}
class TaskHarvest extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskHarvest.taskName, target, options);
    }
    isValidTask() {
        return _.sum(this.creep.carry) < this.creep.carryCapacity;
    }
    isValidTarget() {
        // if (this.target && (this.target instanceof Source ? this.target.energy > 0 : this.target.mineralAmount > 0)) {
        // 	// Valid only if there's enough space for harvester to work - prevents doing tons of useless pathfinding
        // 	return this.target.pos.availableNeighbors().length > 0 || this.creep.pos.isNearTo(this.target.pos);
        // }
        // return false;
        if (isSource(this.target)) {
            return this.target.energy > 0;
        }
        else {
            return this.target.mineralAmount > 0;
        }
    }
    work() {
        return this.creep.harvest(this.target);
    }
}
TaskHarvest.taskName = 'harvest';
exports.TaskHarvest = TaskHarvest;
});

unwrapExports(task_harvest);
var task_harvest_1 = task_harvest.TaskHarvest;

var task_heal = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskHeal extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskHeal.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(HEAL) > 0);
    }
    isValidTarget() {
        return this.target && this.target.hits < this.target.hitsMax && this.target.my;
    }
    work() {
        if (this.creep.pos.isNearTo(this.target)) {
            return this.creep.heal(this.target);
        }
        else {
            this.moveToTarget(1);
        }
        return this.creep.rangedHeal(this.target);
    }
}
TaskHeal.taskName = 'heal';
exports.TaskHeal = TaskHeal;
});

unwrapExports(task_heal);
var task_heal_1 = task_heal.TaskHeal;

var task_meleeAttack = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskMeleeAttack extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskMeleeAttack.taskName, target, options);
        // Settings
        this.settings.targetRange = 1;
    }
    isValidTask() {
        return this.creep.getActiveBodyparts(ATTACK) > 0;
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        return this.creep.attack(this.target);
    }
}
TaskMeleeAttack.taskName = 'meleeAttack';
exports.TaskMeleeAttack = TaskMeleeAttack;
});

unwrapExports(task_meleeAttack);
var task_meleeAttack_1 = task_meleeAttack.TaskMeleeAttack;

var task_pickup = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskPickup extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskPickup.taskName, target, options);
        this.settings.oneShot = true;
    }
    isValidTask() {
        return _.sum(this.creep.carry) < this.creep.carryCapacity;
    }
    isValidTarget() {
        return this.target && this.target.amount > 0;
    }
    work() {
        return this.creep.pickup(this.target);
    }
}
TaskPickup.taskName = 'pickup';
exports.TaskPickup = TaskPickup;
});

unwrapExports(task_pickup);
var task_pickup_1 = task_pickup.TaskPickup;

var task_rangedAttack = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskRangedAttack extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskRangedAttack.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return this.creep.getActiveBodyparts(RANGED_ATTACK) > 0;
    }
    isValidTarget() {
        return this.target && this.target.hits > 0;
    }
    work() {
        return this.creep.rangedAttack(this.target);
    }
}
TaskRangedAttack.taskName = 'rangedAttack';
exports.TaskRangedAttack = TaskRangedAttack;
});

unwrapExports(task_rangedAttack);
var task_rangedAttack_1 = task_rangedAttack.TaskRangedAttack;

var task_withdraw = createCommonjsModule(function (module, exports) {
/* This is the withdrawal task for non-energy resources. */
Object.defineProperty(exports, "__esModule", { value: true });


class TaskWithdraw extends Task_1.Task {
    constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        super(TaskWithdraw.taskName, target, options);
        // Settings
        this.settings.oneShot = true;
        this.data.resourceType = resourceType;
        this.data.amount = amount;
    }
    isValidTask() {
        let amount = this.data.amount || 1;
        return (_.sum(this.creep.carry) <= this.creep.carryCapacity - amount);
    }
    isValidTarget() {
        let amount = this.data.amount || 1;
        let target = this.target;
        if (target instanceof Tombstone || helpers.isStoreStructure(target)) {
            return (target.store[this.data.resourceType] || 0) >= amount;
        }
        else if (helpers.isEnergyStructure(target) && this.data.resourceType == RESOURCE_ENERGY) {
            return target.energy >= amount;
        }
        else {
            if (target instanceof StructureLab) {
                return this.data.resourceType == target.mineralType && target.mineralAmount >= amount;
            }
            else if (target instanceof StructureNuker) {
                return this.data.resourceType == RESOURCE_GHODIUM && target.ghodium >= amount;
            }
            else if (target instanceof StructurePowerSpawn) {
                return this.data.resourceType == RESOURCE_POWER && target.power >= amount;
            }
        }
        return false;
    }
    work() {
        return this.creep.withdraw(this.target, this.data.resourceType, this.data.amount);
    }
}
TaskWithdraw.taskName = 'withdraw';
exports.TaskWithdraw = TaskWithdraw;
});

unwrapExports(task_withdraw);
var task_withdraw_1 = task_withdraw.TaskWithdraw;

var task_repair = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskRepair extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskRepair.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
    }
    isValidTask() {
        return this.creep.carry.energy > 0;
    }
    isValidTarget() {
        return this.target && this.target.hits < this.target.hitsMax;
    }
    work() {
        let result = this.creep.repair(this.target);
        if (this.target.structureType == STRUCTURE_ROAD) {
            // prevents workers from idling for a tick before moving to next target
            let newHits = this.target.hits + this.creep.getActiveBodyparts(WORK) * REPAIR_POWER;
            if (newHits > this.target.hitsMax) {
                this.finish();
            }
        }
        return result;
    }
}
TaskRepair.taskName = 'repair';
exports.TaskRepair = TaskRepair;
});

unwrapExports(task_repair);
var task_repair_1 = task_repair.TaskRepair;

var task_reserve = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskReserve extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskReserve.taskName, target, options);
    }
    isValidTask() {
        return (this.creep.getActiveBodyparts(CLAIM) > 0);
    }
    isValidTarget() {
        let target = this.target;
        return (target != null && !target.owner && (!target.reservation || target.reservation.ticksToEnd < 4999));
    }
    work() {
        return this.creep.reserveController(this.target);
    }
}
TaskReserve.taskName = 'reserve';
exports.TaskReserve = TaskReserve;
});

unwrapExports(task_reserve);
var task_reserve_1 = task_reserve.TaskReserve;

var task_signController = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskSignController extends Task_1.Task {
    constructor(target, signature = 'Your signature here', options = {}) {
        super(TaskSignController.taskName, target, options);
        this.data.signature = signature;
    }
    isValidTask() {
        return true;
    }
    isValidTarget() {
        let controller = this.target;
        return (!controller.sign || controller.sign.text != this.data.signature);
    }
    work() {
        return this.creep.signController(this.target, this.data.signature);
    }
}
TaskSignController.taskName = 'signController';
exports.TaskSignController = TaskSignController;
});

unwrapExports(task_signController);
var task_signController_1 = task_signController.TaskSignController;

var task_transfer = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


class TaskTransfer extends Task_1.Task {
    constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        super(TaskTransfer.taskName, target, options);
        // Settings
        this.settings.oneShot = true;
        this.data.resourceType = resourceType;
        this.data.amount = amount;
    }
    isValidTask() {
        let amount = this.data.amount || 1;
        let resourcesInCarry = this.creep.carry[this.data.resourceType] || 0;
        return resourcesInCarry >= amount;
    }
    isValidTarget() {
        let amount = this.data.amount || 1;
        let target = this.target;
        if (target instanceof Creep) {
            return _.sum(target.carry) <= target.carryCapacity - amount;
        }
        else if (helpers.isStoreStructure(target)) {
            return _.sum(target.store) <= target.storeCapacity - amount;
        }
        else if (helpers.isEnergyStructure(target) && this.data.resourceType == RESOURCE_ENERGY) {
            return target.energy <= target.energyCapacity - amount;
        }
        else {
            if (target instanceof StructureLab) {
                return (target.mineralType == this.data.resourceType || !target.mineralType) &&
                    target.mineralAmount <= target.mineralCapacity - amount;
            }
            else if (target instanceof StructureNuker) {
                return this.data.resourceType == RESOURCE_GHODIUM &&
                    target.ghodium <= target.ghodiumCapacity - amount;
            }
            else if (target instanceof StructurePowerSpawn) {
                return this.data.resourceType == RESOURCE_POWER &&
                    target.power <= target.powerCapacity - amount;
            }
        }
        return false;
    }
    work() {
        return this.creep.transfer(this.target, this.data.resourceType, this.data.amount);
    }
}
TaskTransfer.taskName = 'transfer';
exports.TaskTransfer = TaskTransfer;
});

unwrapExports(task_transfer);
var task_transfer_1 = task_transfer.TaskTransfer;

var task_upgrade = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskUpgrade extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskUpgrade.taskName, target, options);
        // Settings
        this.settings.targetRange = 3;
        this.settings.workOffRoad = true;
    }
    isValidTask() {
        return (this.creep.carry.energy > 0);
    }
    isValidTarget() {
        return this.target && this.target.my;
    }
    work() {
        return this.creep.upgradeController(this.target);
    }
}
TaskUpgrade.taskName = 'upgrade';
exports.TaskUpgrade = TaskUpgrade;
});

unwrapExports(task_upgrade);
var task_upgrade_1 = task_upgrade.TaskUpgrade;

var task_drop = createCommonjsModule(function (module, exports) {
// TaskDrop: drops a resource at a position
Object.defineProperty(exports, "__esModule", { value: true });

class TaskDrop extends Task_1.Task {
    constructor(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        if (target instanceof RoomPosition) {
            super(TaskDrop.taskName, { ref: '', pos: target }, options);
        }
        else {
            super(TaskDrop.taskName, { ref: '', pos: target.pos }, options);
        }
        // Settings
        this.settings.oneShot = true;
        this.settings.targetRange = 0;
        // Data
        this.data.resourceType = resourceType;
        this.data.amount = amount;
    }
    isValidTask() {
        let amount = this.data.amount || 1;
        let resourcesInCarry = this.creep.carry[this.data.resourceType] || 0;
        return resourcesInCarry >= amount;
    }
    isValidTarget() {
        return true;
    }
    isValid() {
        // It's necessary to override task.isValid() for tasks which do not have a RoomObject target
        let validTask = false;
        if (this.creep) {
            validTask = this.isValidTask();
        }
        // Return if the task is valid; if not, finalize/delete the task and return false
        if (validTask) {
            return true;
        }
        else {
            // Switch to parent task if there is one
            let isValid = false;
            if (this.parent) {
                isValid = this.parent.isValid();
            }
            this.finish();
            return isValid;
        }
    }
    work() {
        return this.creep.drop(this.data.resourceType, this.data.amount);
    }
}
TaskDrop.taskName = 'drop';
exports.TaskDrop = TaskDrop;
});

unwrapExports(task_drop);
var task_drop_1 = task_drop.TaskDrop;

var task_invalid = createCommonjsModule(function (module, exports) {
// Invalid task assigned if instantiation fails.
Object.defineProperty(exports, "__esModule", { value: true });

class TaskInvalid extends Task_1.Task {
    constructor(target, options = {}) {
        super('INVALID', target, options);
    }
    isValidTask() {
        return false;
    }
    isValidTarget() {
        return false;
    }
    work() {
        return OK;
    }
}
TaskInvalid.taskName = 'invalid';
exports.TaskInvalid = TaskInvalid;
});

unwrapExports(task_invalid);
var task_invalid_1 = task_invalid.TaskInvalid;

var task_transferAll = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskTransferAll extends Task_1.Task {
    constructor(target, skipEnergy = false, options = {}) {
        super(TaskTransferAll.taskName, target, options);
        this.data.skipEnergy = skipEnergy;
    }
    isValidTask() {
        for (let resourceType in this.creep.carry) {
            if (this.data.skipEnergy && resourceType == RESOURCE_ENERGY) {
                continue;
            }
            let amountInCarry = this.creep.carry[resourceType] || 0;
            if (amountInCarry > 0) {
                return true;
            }
        }
        return false;
    }
    isValidTarget() {
        return _.sum(this.target.store) < this.target.storeCapacity;
    }
    work() {
        for (let resourceType in this.creep.carry) {
            if (this.data.skipEnergy && resourceType == RESOURCE_ENERGY) {
                continue;
            }
            let amountInCarry = this.creep.carry[resourceType] || 0;
            if (amountInCarry > 0) {
                return this.creep.transfer(this.target, resourceType);
            }
        }
        return -1;
    }
}
TaskTransferAll.taskName = 'transferAll';
exports.TaskTransferAll = TaskTransferAll;
});

unwrapExports(task_transferAll);
var task_transferAll_1 = task_transferAll.TaskTransferAll;

var task_withdrawAll = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });

class TaskWithdrawAll extends Task_1.Task {
    constructor(target, options = {}) {
        super(TaskWithdrawAll.taskName, target, options);
    }
    isValidTask() {
        return (_.sum(this.creep.carry) < this.creep.carryCapacity);
    }
    isValidTarget() {
        return _.sum(this.target.store) > 0;
    }
    work() {
        for (let resourceType in this.target.store) {
            let amountInStore = this.target.store[resourceType] || 0;
            if (amountInStore > 0) {
                return this.creep.withdraw(this.target, resourceType);
            }
        }
        return -1;
    }
}
TaskWithdrawAll.taskName = 'withdrawAll';
exports.TaskWithdrawAll = TaskWithdrawAll;
});

unwrapExports(task_withdrawAll);
var task_withdrawAll_1 = task_withdrawAll.TaskWithdrawAll;

var initializer = createCommonjsModule(function (module, exports) {
// Reinstantiation of a task object from protoTask data
Object.defineProperty(exports, "__esModule", { value: true });

























function initializeTask(protoTask) {
    // Retrieve name and target data from the protoTask
    let taskName = protoTask.name;
    let target = helpers.deref(protoTask._target.ref);
    let task;
    // Create a task object of the correct type
    switch (taskName) {
        case task_attack.TaskAttack.taskName:
            task = new task_attack.TaskAttack(target);
            break;
        case task_build.TaskBuild.taskName:
            task = new task_build.TaskBuild(target);
            break;
        case task_claim.TaskClaim.taskName:
            task = new task_claim.TaskClaim(target);
            break;
        case task_dismantle.TaskDismantle.taskName:
            task = new task_dismantle.TaskDismantle(target);
            break;
        case task_drop.TaskDrop.taskName:
            task = new task_drop.TaskDrop(helpers.derefRoomPosition(protoTask._target._pos));
            break;
        case task_fortify.TaskFortify.taskName:
            task = new task_fortify.TaskFortify(target);
            break;
        case task_getBoosted.TaskGetBoosted.taskName:
            task = new task_getBoosted.TaskGetBoosted(target, protoTask.data.resourceType);
            break;
        case task_getRenewed.TaskGetRenewed.taskName:
            task = new task_getRenewed.TaskGetRenewed(target);
            break;
        case task_goTo.TaskGoTo.taskName:
            task = new task_goTo.TaskGoTo(helpers.derefRoomPosition(protoTask._target._pos));
            break;
        case task_goToRoom.TaskGoToRoom.taskName:
            task = new task_goToRoom.TaskGoToRoom(protoTask._target._pos.roomName);
            break;
        case task_harvest.TaskHarvest.taskName:
            task = new task_harvest.TaskHarvest(target);
            break;
        case task_heal.TaskHeal.taskName:
            task = new task_heal.TaskHeal(target);
            break;
        case task_meleeAttack.TaskMeleeAttack.taskName:
            task = new task_meleeAttack.TaskMeleeAttack(target);
            break;
        case task_pickup.TaskPickup.taskName:
            task = new task_pickup.TaskPickup(target);
            break;
        case task_rangedAttack.TaskRangedAttack.taskName:
            task = new task_rangedAttack.TaskRangedAttack(target);
            break;
        case task_repair.TaskRepair.taskName:
            task = new task_repair.TaskRepair(target);
            break;
        case task_reserve.TaskReserve.taskName:
            task = new task_reserve.TaskReserve(target);
            break;
        case task_signController.TaskSignController.taskName:
            task = new task_signController.TaskSignController(target);
            break;
        case task_transfer.TaskTransfer.taskName:
            task = new task_transfer.TaskTransfer(target);
            break;
        case task_transferAll.TaskTransferAll.taskName:
            task = new task_transferAll.TaskTransferAll(target);
            break;
        case task_upgrade.TaskUpgrade.taskName:
            task = new task_upgrade.TaskUpgrade(target);
            break;
        case task_withdraw.TaskWithdraw.taskName:
            task = new task_withdraw.TaskWithdraw(target);
            break;
        case task_withdrawAll.TaskWithdrawAll.taskName:
            task = new task_withdrawAll.TaskWithdrawAll(target);
            break;
        default:
            console.log(`Invalid task name: ${taskName}! task.creep: ${protoTask._creep.name}. Deleting from memory!`);
            task = new task_invalid.TaskInvalid(target);
            break;
    }
    // Set the task proto to what is in memory
    task.proto = protoTask;
    // Return it
    return task;
}
exports.initializeTask = initializeTask;
});

unwrapExports(initializer);
var initializer_1 = initializer.initializeTask;

var caching = createCommonjsModule(function (module, exports) {
// Caches targets every tick to allow for RoomObject.targetedBy property
Object.defineProperty(exports, "__esModule", { value: true });
class TargetCache {
    constructor() {
        this.targets = {};
        this.tick = Game.time; // record last refresh
    }
    // Generates a hash table for targets: key: TargetRef, val: targeting creep names
    cacheTargets() {
        this.targets = {};
        for (let i in Game.creeps) {
            let creep = Game.creeps[i];
            let task = creep.memory.task;
            // Perform a faster, primitive form of _.map(creep.task.manifest, task => task.target.ref)
            while (task) {
                if (!this.targets[task._target.ref])
                    this.targets[task._target.ref] = [];
                this.targets[task._target.ref].push(creep.name);
                task = task._parent;
            }
        }
    }
    // Assert that there is an up-to-date target cache
    static assert() {
        if (!(Game.TargetCache && Game.TargetCache.tick == Game.time)) {
            Game.TargetCache = new TargetCache();
            Game.TargetCache.build();
        }
    }
    // Build the target cache
    build() {
        this.cacheTargets();
    }
}
exports.TargetCache = TargetCache;
});

unwrapExports(caching);
var caching_1 = caching.TargetCache;

var prototypes = createCommonjsModule(function (module, exports) {
// This binds a getter/setter creep.task property
Object.defineProperty(exports, "__esModule", { value: true });


Object.defineProperty(Creep.prototype, 'task', {
    get() {
        if (!this._task) {
            let protoTask = this.memory.task;
            this._task = protoTask ? initializer.initializeTask(protoTask) : null;
        }
        return this._task;
    },
    set(task) {
        // Assert that there is an up-to-date target cache
        caching.TargetCache.assert();
        // Unregister target from old task if applicable
        let oldProtoTask = this.memory.task;
        if (oldProtoTask) {
            let oldRef = oldProtoTask._target.ref;
            if (Game.TargetCache.targets[oldRef]) {
                _.remove(Game.TargetCache.targets[oldRef], name => name == this.name);
            }
        }
        // Set the new task
        this.memory.task = task ? task.proto : null;
        if (task) {
            if (task.target) {
                // Register task target in cache if it is actively targeting something (excludes goTo and similar)
                if (!Game.TargetCache.targets[task.target.ref]) {
                    Game.TargetCache.targets[task.target.ref] = [];
                }
                Game.TargetCache.targets[task.target.ref].push(this.name);
            }
            // Register references to creep
            task.creep = this;
        }
        // Clear cache
        this._task = null;
    },
});
Creep.prototype.run = function () {
    if (this.task) {
        return this.task.run();
    }
};
Object.defineProperties(Creep.prototype, {
    'hasValidTask': {
        get() {
            return this.task && this.task.isValid();
        }
    },
    'isIdle': {
        get() {
            return !this.hasValidTask;
        }
    }
});
// RoomObject prototypes ===============================================================================================
Object.defineProperty(RoomObject.prototype, 'ref', {
    get: function () {
        return this.id || this.name || '';
    },
});
Object.defineProperty(RoomObject.prototype, 'targetedBy', {
    get: function () {
        // Check that target cache has been initialized - you can move this to execute once per tick if you want
        caching.TargetCache.assert();
        return _.map(Game.TargetCache.targets[this.ref], name => Game.creeps[name]);
    },
});
// RoomPosition prototypes =============================================================================================
Object.defineProperty(RoomPosition.prototype, 'isEdge', {
    get: function () {
        return this.x == 0 || this.x == 49 || this.y == 0 || this.y == 49;
    },
});
Object.defineProperty(RoomPosition.prototype, 'neighbors', {
    get: function () {
        let adjPos = [];
        for (let dx of [-1, 0, 1]) {
            for (let dy of [-1, 0, 1]) {
                if (!(dx == 0 && dy == 0)) {
                    let x = this.x + dx;
                    let y = this.y + dy;
                    if (0 < x && x < 49 && 0 < y && y < 49) {
                        adjPos.push(new RoomPosition(x, y, this.roomName));
                    }
                }
            }
        }
        return adjPos;
    }
});
RoomPosition.prototype.isPassible = function (ignoreCreeps = false) {
    // Is terrain passable?
    if (Game.map.getTerrainAt(this) == 'wall')
        return false;
    if (this.isVisible) {
        // Are there creeps?
        if (ignoreCreeps == false && this.lookFor(LOOK_CREEPS).length > 0)
            return false;
        // Are there structures?
        let impassibleStructures = _.filter(this.lookFor(LOOK_STRUCTURES), function (s) {
            return this.structureType != STRUCTURE_ROAD &&
                s.structureType != STRUCTURE_CONTAINER &&
                !(s.structureType == STRUCTURE_RAMPART && (s.my ||
                    s.isPublic));
        });
        return impassibleStructures.length == 0;
    }
    return true;
};
RoomPosition.prototype.availableNeighbors = function (ignoreCreeps = false) {
    return _.filter(this.neighbors, pos => pos.isPassible(ignoreCreeps));
};
});

unwrapExports(prototypes);

var Tasks_1 = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });























class Tasks {
    /* Tasks.chain allows you to transform a list of tasks into a single task, where each subsequent task in the list
     * is the previous task's parent. SetNextPos will chain Task.nextPos as well, preventing creeps from idling for a
     * tick between tasks. If an empty list is passed, null is returned. */
    static chain(tasks, setNextPos = true) {
        if (tasks.length == 0) {
            return null;
        }
        if (setNextPos) {
            for (let i = 0; i < tasks.length - 1; i++) {
                tasks[i].options.nextPos = tasks[i + 1].targetPos;
            }
        }
        // Make the accumulator task from the end and iteratively fork it
        let task = _.last(tasks); // start with last task
        tasks = _.dropRight(tasks); // remove it from the list
        for (let i = (tasks.length - 1); i >= 0; i--) { // iterate over the remaining tasks
            task = task.fork(tasks[i]);
        }
        return task;
    }
    static attack(target, options = {}) {
        return new task_attack.TaskAttack(target, options);
    }
    static build(target, options = {}) {
        return new task_build.TaskBuild(target, options);
    }
    static claim(target, options = {}) {
        return new task_claim.TaskClaim(target, options);
    }
    static dismantle(target, options = {}) {
        return new task_dismantle.TaskDismantle(target, options);
    }
    static drop(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new task_drop.TaskDrop(target, resourceType, amount, options);
    }
    static fortify(target, options = {}) {
        return new task_fortify.TaskFortify(target, options);
    }
    static getBoosted(target, boostType, amount = undefined, options = {}) {
        return new task_getBoosted.TaskGetBoosted(target, boostType, amount, options);
    }
    static getRenewed(target, options = {}) {
        return new task_getRenewed.TaskGetRenewed(target, options);
    }
    static goTo(target, options = {}) {
        return new task_goTo.TaskGoTo(target, options);
    }
    static goToRoom(target, options = {}) {
        return new task_goToRoom.TaskGoToRoom(target, options);
    }
    static harvest(target, options = {}) {
        return new task_harvest.TaskHarvest(target, options);
    }
    static heal(target, options = {}) {
        return new task_heal.TaskHeal(target, options);
    }
    static meleeAttack(target, options = {}) {
        return new task_meleeAttack.TaskMeleeAttack(target, options);
    }
    static pickup(target, options = {}) {
        return new task_pickup.TaskPickup(target, options);
    }
    static rangedAttack(target, options = {}) {
        return new task_rangedAttack.TaskRangedAttack(target, options);
    }
    static repair(target, options = {}) {
        return new task_repair.TaskRepair(target, options);
    }
    static reserve(target, options = {}) {
        return new task_reserve.TaskReserve(target, options);
    }
    static signController(target, signature, options = {}) {
        return new task_signController.TaskSignController(target, signature, options);
    }
    static transfer(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new task_transfer.TaskTransfer(target, resourceType, amount, options);
    }
    static transferAll(target, skipEnergy = false, options = {}) {
        return new task_transferAll.TaskTransferAll(target, skipEnergy, options);
    }
    static upgrade(target, options = {}) {
        return new task_upgrade.TaskUpgrade(target, options);
    }
    static withdraw(target, resourceType = RESOURCE_ENERGY, amount = undefined, options = {}) {
        return new task_withdraw.TaskWithdraw(target, resourceType, amount, options);
    }
    static withdrawAll(target, options = {}) {
        return new task_withdrawAll.TaskWithdrawAll(target, options);
    }
}
exports.Tasks = Tasks;
});

unwrapExports(Tasks_1);
var Tasks_2 = Tasks_1.Tasks;

var dist = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, "__esModule", { value: true });


exports.default = Tasks_1.Tasks;
});

var Tasks$1 = unwrapExports(dist);

class RoleHauler extends Role {
    run() {
        if (!Memory.gotoHaul || !Game.flags['haul'])
            return;
        if (this.creep.hits < this.creep.hitsMax)
            Memory.gotoDismantle = false;
        let room = Game.flags['haul'].room;
        if (!room) {
            this.creep.moveTo(Game.flags['haul']);
            return;
        }
        if (room.name != this.creep.room.name) {
            this.creep.moveTo(Game.flags['haul']);
            return;
        }
        if (!this.creep.task) {
            if (_.sum(this.creep.carry) < this.creep.carryCapacity) {
                let target = this.creep.pos.findClosestByRange(FIND_STRUCTURES, { filter: structure => isStoreStructure(structure) && _.sum(structure.store) > 0 });
                if (target && isStoreStructure(target))
                    Tasks$1.withdrawAll(target);
            }
            else {
                let storage = Game.getObjectById(this.creep.room.memory.storage);
                if (storage)
                    Tasks$1.transferAll(storage);
            }
        }
        else {
            if (this.creep.task.isValid()) {
                this.creep.task.run();
                return;
            }
        }
    }
}

class RoleDismantaler extends Role {
    run() {
        if (!Memory.gotoDismantle || !Game.flags['dismantle'])
            return;
        if (this.creep.hits < this.creep.hitsMax)
            Memory.gotoDismantle = false;
        let room = Game.flags['dismantle'].room;
        if (!room) {
            this.creep.moveTo(Game.flags['dismantle']);
            return;
        }
        if (room.name != this.creep.room.name) {
            this.creep.moveTo(Game.flags['dismantle']);
            return;
        }
        var targets = this.creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                // return structure.structureType == STRUCTURE_RAMPART && !structure.my
                return structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_ROAD && structure.structureType != STRUCTURE_CONTAINER
                    && structure.structureType != STRUCTURE_PORTAL && structure.structureType != STRUCTURE_CONTROLLER && !structure.my;
                // && structure.id != '5bbcafce9099fc012e63b379';
            }
        });
        var target = this.creep.pos.findClosestByRange(targets);
        // var target = Game.getObjectById<Structure>('5cdc5e55d020f43ea44962b6');
        // if (!target) target = Game.getObjectById('5cd5f81dac5d6f1e31c0f366');
        if (!target) {
            Memory.gotoDismantle = false;
            return;
        }
        if (this.creep.dismantle(target) == ERR_NOT_IN_RANGE) {
            this.creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
        }
    }
}

class RoleUpgrader extends Role {
    run() {
        if (Memory.rooms[this.creep.memory.spawnRoom].lowEnergy && this.creep.memory.id != 0) {
            this.creep.travelTo(this.creep.room.memory.lowEnergyIdlePos, { obstacles: Memory.obstacles });
            return;
        }
        if (this.creep.memory.upgrading && this.creep.carry.energy == 0) {
            this.creep.memory.upgrading = false;
        }
        if (!this.creep.memory.upgrading && this.creep.carry.energy >= this.creep.carryCapacity / 2) {
            this.creep.memory.upgrading = true;
            this.creep.say('⚡ upgrade');
        }
        if (this.creep.memory.upgrading) {
            let controller = Game.rooms[this.creep.memory.spawnRoom].controller;
            if (!controller)
                return;
            if (this.creep.upgradeController(controller) == ERR_NOT_IN_RANGE) {
                this.creep.travelTo(controller, { obstacles: Memory.obstacles });
            }
        }
        else {
            SourceManager.getSource(this.creep);
        }
    }
}

class RoleReservist extends Role {
    run() {
        if (this.creep.memory.allotUnit)
            Alloter.refreshDirty(this.creep.memory.allotUnit);
        else
            this.creep.memory.allotUnit = SourceManager.allotReservist(Game.rooms[this.creep.memory.spawnRoom]);
        if (!this.creep.memory.allotUnit)
            return;
        var targetRoom = this.creep.memory.allotUnit.data.name;
        // if (!this.creep.memory.targetRoom) {
        //     let smallest: StructureController = {} as StructureController;
        //     let name = '';
        //     for (const room of Memory.colonies[this.creep.memory.spawnRoom]) {
        //         if(Memory.rooms[room.name].underAttacking) continue;
        //         if (!Game.rooms[room.name]) {
        //             this.creep.memory.targetRoom = room.name;
        //             targetRoom = room.name;
        //             break;
        //         }
        //         let controller = Game.rooms[room.name].controller;
        //         if(!controller) continue;
        //         if(!smallest.reservation) {
        //             smallest = controller;
        //             name = room.name;
        //         }
        //         if (!controller.reservation) {
        //             this.creep.memory.targetRoom = room.name;
        //             targetRoom = room.name;
        //             break;
        //         }
        //         if(smallest.reservation && controller.reservation.ticksToEnd < smallest.reservation.ticksToEnd){
        //             smallest = controller;
        //             name = room.name;
        //         }
        //     }
        //     if(smallest && !targetRoom)
        //         this.creep.memory.targetRoom = name;
        // }
        if (this.creep.room.controller && this.creep.room.controller.reservation) {
            let unit = Alloter.getUnitWithKeyValue(ALLOT_RESERVE, this.creep.memory.spawnRoom, 'name', this.creep.room.name);
            if (unit)
                unit.data.ticksToEnd = this.creep.room.controller.reservation.ticksToEnd;
        }
        if (!Game.rooms[targetRoom]) {
            var exits = this.creep.room.find(this.creep.room.findExitTo(targetRoom));
            let exit = this.creep.pos.findClosestByPath(exits);
            if (!exit)
                return;
            this.creep.moveTo(exit);
            return;
        }
        else if (this.creep.room.name != targetRoom) {
            var exits = this.creep.room.find(this.creep.room.findExitTo(targetRoom));
            let exit = this.creep.pos.findClosestByPath(exits);
            if (!exit)
                return;
            this.creep.moveTo(exit);
            return;
        }
        if (this.creep.room.controller) {
            if (this.creep.room.controller.reservation && this.creep.room.controller.reservation.ticksToEnd >= 4999) {
                delete this.creep.memory.allotUnit;
            }
            else if (this.creep.reserveController(this.creep.room.controller) == ERR_NOT_IN_RANGE)
                this.creep.moveTo(this.creep.room.controller);
        }
    }
}

class GlobalSettings {
}
GlobalSettings.roles = [
    'filler',
    'transporter',
    'stableTransporter',
    'harvester',
    'worker',
    'miner',
    'defencer',
    'hauler',
    'dismantler',
    'upgrader',
    'reservist',
    'trader',
    'pioneer',
    'attack_warrior',
    'attack_tough',
    'attack_heal',
];
GlobalSettings.market = {
    minAmountPerDeal: 1000,
    maxAmountPerDeal: 5000,
};

class RoleTrader extends Role {
    run() {
        if (!this.creep.ticksToLive)
            return;
        if (this.creep.ticksToLive < 3) {
            this.transfer(this.creep, this.creep.room.storage);
            return;
        }
        let market = Memory.market[this.creep.room.name];
        if (!Memory.rooms[this.creep.room.name].traderPos)
            return;
        let pos = Memory.rooms[this.creep.room.name].traderPos;
        if (!this.creep.pos.isEqualTo(pos)) {
            this.creep.travelTo(pos, { obstacles: Memory.obstacles });
            return;
        }
        if (!market)
            return;
        let terminal = this.creep.room.terminal;
        let storage = this.creep.room.storage;
        if (!terminal || !storage)
            return;
        // return;
        this.transfer(this.creep, this.creep.room.storage);
        if (market.sellOrder) {
            let order = Game.market.getOrderById(market.sellOrder);
            if (!order || order.amount == 0)
                market.sellOrder = '';
            else if (order.amount == 0)
                market.sellOrder = '';
            else {
                for (const key in terminal.store) {
                    if (terminal.store.hasOwnProperty(key)) {
                        if (key == order.resourceType || key == RESOURCE_ENERGY)
                            continue;
                        else {
                            this.creep.withdraw(terminal, key);
                            this.creep.transfer(storage, key);
                        }
                    }
                }
                // console.log(Game.market.calcTransactionCost(terminal.store[order.resourceType] > order.amount ? order.amount : terminal.store[order.resourceType]
                //     , order.roomName, this.creep.room.name));
                // console.log(terminal.store[order.resourceType]);
                let tstore = terminal.store[order.resourceType];
                let sstore = storage.store[order.resourceType];
                if (!order.roomName)
                    return;
                if (!tstore || !sstore)
                    return;
                if (tstore > GlobalSettings.market.maxAmountPerDeal) {
                    if (Game.market.calcTransactionCost(terminal.store[order.resourceType] > order.amount ? order.amount : terminal.store[order.resourceType], order.roomName, this.creep.room.name) <= storage.store[RESOURCE_ENERGY])
                        Game.market.deal(order.id, terminal.store[order.resourceType] > order.amount ? order.amount : terminal.store[order.resourceType], this.creep.room.name);
                    else {
                        this.creep.withdraw(storage, RESOURCE_ENERGY);
                        this.creep.transfer(terminal, RESOURCE_ENERGY);
                    }
                }
                else if (tstore < GlobalSettings.market.minAmountPerDeal) {
                    this.creep.withdraw(storage, order.resourceType);
                    this.creep.transfer(terminal, order.resourceType);
                }
                else {
                    if (sstore > 0 || this.creep.carry[order.resourceType] > 0) {
                        this.creep.withdraw(storage, order.resourceType);
                        this.creep.transfer(terminal, order.resourceType);
                    }
                    else {
                        if (Game.market.calcTransactionCost(terminal.store[order.resourceType] > order.amount ? order.amount : terminal.store[order.resourceType], order.roomName, this.creep.room.name) <= storage.store[RESOURCE_ENERGY])
                            Game.market.deal(order.id, terminal.store[order.resourceType] > order.amount ? order.amount : terminal.store[order.resourceType], this.creep.room.name);
                        else {
                            this.creep.withdraw(storage, RESOURCE_ENERGY);
                            this.creep.transfer(terminal, RESOURCE_ENERGY);
                        }
                    }
                }
            }
        }
        else {
            for (const key in terminal.store) {
                if (terminal.store.hasOwnProperty(key)) {
                    // if (key == RESOURCE_ENERGY) continue;
                    // else {
                    this.creep.withdraw(terminal, key);
                    this.creep.transfer(storage, key);
                    // }
                }
            }
        }
        if (market.buyOrder) {
            let order = Game.market.getOrderById(market.buyOrder);
            if (!order)
                market.buyOrder = '';
            else if (order.amount == 0)
                market.sellOrder = '';
            else {
                if (!order.roomName)
                    return;
                if (Game.market.credits >= order.price * GlobalSettings.market.minAmountPerDeal) {
                    if (Game.market.calcTransactionCost(Game.market.credits / order.price > order.amount ? order.amount : Game.market.credits / order.price, order.roomName, this.creep.room.name) <= storage.store[RESOURCE_ENERGY])
                        Game.market.deal(order.id, Game.market.credits / order.price > order.amount ? order.amount : Game.market.credits / order.price, this.creep.room.name);
                    else {
                        this.creep.withdraw(storage, RESOURCE_ENERGY);
                        this.creep.transfer(terminal, RESOURCE_ENERGY);
                    }
                }
            }
        }
        if (this.creep.room.name != Memory.poorRoom && Memory.poorRoom) {
            if (storage.store[RESOURCE_ENERGY] > 700000 && !Memory.market[this.creep.room.name].transport)
                Memory.market[this.creep.room.name].transport = { type: RESOURCE_ENERGY, amount: 100000, des: Memory.poorRoom };
            let transport = Memory.market[this.creep.room.name].transport;
            if (transport) {
                let store = terminal.store[transport.type];
                this.creep.withdraw(storage, transport.type);
                this.creep.transfer(terminal, transport.type);
                if (store && store >= transport.amount) {
                    let fare = Game.market.calcTransactionCost(transport.amount, this.creep.room.name, transport.des);
                    terminal.send(transport.type, transport.amount - fare, transport.des);
                    // terminal.send(transport.type, transport.amount, transport.des);
                    delete Memory.market[this.creep.room.name].transport;
                    return;
                }
            }
        }
    }
    transfer(creep, target) {
        for (const key in this.creep.carry) {
            if (this.creep.carry.hasOwnProperty(key)) {
                if (this.creep.transfer(target, key) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(target, { visualizePathStyle: { stroke: '#ffaa00' } });
                    return;
                }
            }
        }
    }
}

class RoleWarrior extends Role {
    run() {
        if (this.creep.memory.id <= -1) {
            if (this.creep.room.name != 'E48N22') {
                var exits = this.creep.room.find(this.creep.room.findExitTo('E48N22'));
                let exit = this.creep.pos.findClosestByPath(exits);
                if (!exit)
                    return;
                this.creep.moveTo(exit);
                return;
            }
            //getObjectById('5cb87f9ce90b6111780a5d22').room
            var enemy = Game.rooms['E48N22'].find(FIND_HOSTILE_CREEPS, {
                filter: (enemy) => {
                    for (const body of enemy.body) {
                        // if(body.type == CLAIM || body.type == WORK) 
                        return true;
                    }
                    return false;
                }
            });
            // var enemy = [Game.getObjectById('5cc95bd3389fcd24bc6c872b')];
            var e = this.creep.pos.findClosestByPath(enemy);
            if (!e)
                e = enemy[0];
            // console.log(enemy.length);
            if (e && this.creep.room.name != e.room.name) {
                var exits = this.creep.room.find(this.creep.room.findExitTo(e.room));
                let exit = this.creep.pos.findClosestByPath(exits);
                if (!exit)
                    return;
                this.creep.moveTo(exit);
            }
            else if (!this.creep.pos.isEqualTo(new RoomPosition(6, 30, 'E48N22')) && enemy.length == 0) {
                this.creep.moveTo(new RoomPosition(6, 30, 'E48N22'), { visualizePathStyle: { stroke: '#ffffff' } });
            }
            else {
                if (this.creep.attack(e) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(e);
                }
            }
        }
        else {
            if (!Game.flags['wait' + this.creep.memory.id]) {
                return;
            }
            var flag = Game.flags['attack' + this.creep.memory.id];
            var wait = Game.flags['wait' + this.creep.memory.id];
            if (!flag) {
                this.creep.moveTo(wait);
                return;
            }
            // if(this.creep.room.name != 'E47N21'){
            //     var exits = this.creep.room.find(this.creep.room.findExitTo('E47N21'));
            //     this.creep.moveTo(this.creep.pos.findClosestByPath(exits));
            //     return;
            // }
            var enemy = [];
            // var structure = Game.getObjectById<Structure>('5cc8362de8697a50877c75f3');
            // if(!structure)return;
            if (this.creep.memory.id == 0) {
                var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (enemy) => {
                        if (enemy.name.match('replenisher'))
                            return true;
                        return false;
                    }
                });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                        filter: (enemy) => {
                            if (enemy.name.match('filler'))
                                return true;
                            return false;
                        }
                    });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                        filter: (enemy) => {
                            for (const body of enemy.body) {
                                if (body.type == WORK)
                                    return true;
                            }
                            return false;
                        }
                    });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS);
            }
            if (this.creep.memory.id == 1) {
                var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (enemy) => {
                        if (enemy.name.match('replenisher'))
                            return true;
                        return false;
                    }
                });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                        filter: (enemy) => {
                            if (enemy.name.match('filler'))
                                return true;
                            return false;
                        }
                    });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                        filter: (enemy) => {
                            for (const body of enemy.body) {
                                if (body.type == WORK)
                                    return true;
                            }
                            return false;
                        }
                    });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS);
            }
            if (this.creep.memory.id == 2) {
                var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                    filter: (enemy) => {
                        if (enemy.name.match('replenisher'))
                            return true;
                        return false;
                    }
                });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                        filter: (enemy) => {
                            if (enemy.name.match('filler'))
                                return true;
                            return false;
                        }
                    });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS, {
                        filter: (enemy) => {
                            for (const body of enemy.body) {
                                if (body.type == WORK)
                                    return true;
                            }
                            return false;
                        }
                    });
                if (!enemy.length)
                    var enemy = this.creep.room.find(FIND_HOSTILE_CREEPS);
            }
            // var enemy = [Game.getObjectById('5cc95bd3389fcd24bc6c872b')];
            var e = this.creep.pos.findClosestByPath(enemy);
            // var e = Game.getObjectById('5cc96d475e7f202865eee275');
            if (!this.creep.pos.isEqualTo(flag.pos) && enemy.length == 0) {
                this.creep.moveTo(flag, { visualizePathStyle: { stroke: '#ffffff' } });
            }
            else {
                if (!e)
                    return;
                this.creep.moveTo(e);
                if (this.creep.attack(e) == ERR_NOT_IN_RANGE) {
                    this.creep.moveTo(e);
                }
            }
        }
    }
}

class RoleTough extends Role {
    run() {
        if (this.creep.memory.spawnRoom != 'E49N22' || this.creep.memory.id != 0)
            return;
        this.creep.notifyWhenAttacked(false);
        // if(this.creep.ticksToLive < 10){
        //     Memory.attack.toughId = null;
        //     return;
        // }
        if (!Game.flags['target'] || !Game.flags['wait']) {
            Memory.attack.toughId = '';
            return;
        }
        Memory.attack.toughId = this.creep.id;
        var flag = Game.flags['target'];
        var wait = Game.flags['wait'];
        // if(this.creep.room.name != flag.room.name){
        //     var exits = this.creep.room.find(this.creep.room.findExitTo(flag.room));
        //     this.creep.moveTo(this.creep.pos.findClosestByPath(exits));
        //     return;
        // }
        var attack_heals = _.filter(Game.creeps, (creep) => creep.memory.role == 'attack_heal' && creep.memory.spawnRoom == 'E49N22');
        if (!this.creep.memory.attack) {
            this.creep.memory.attack = attack_heals.length >= 2;
            for (const a of attack_heals) {
                if (this.creep.pos.getRangeTo(a) > 3)
                    this.creep.memory.attack = false;
            }
        }
        if (this.creep.memory.attack)
            this.creep.moveTo(flag);
        else
            this.creep.moveTo(wait);
    }
}

class RoleHeal extends Role {
    run() {
        this.creep.notifyWhenAttacked(false);
        if (!Game.flags['back'])
            return;
        var flag = Game.flags['back'];
        if (!Memory.attack.toughId || Game.getObjectById(Memory.attack.toughId) == null) {
            Memory.attack.toughId = '';
            return;
        }
        var tough = Game.getObjectById(Memory.attack.toughId);
        if (!tough)
            return;
        if (this.creep.room.name != tough.room.name) {
            var exits = this.creep.room.find(this.creep.room.findExitTo(tough.room));
            let exit = this.creep.pos.findClosestByPath(exits);
            if (!exit)
                return;
            this.creep.moveTo(exit);
        }
        var pos;
        switch (this.creep.memory.id) {
            // case 0:
            //     pos = new RoomPosition(tough.pos.x, tough.pos.y - 1, tough.pos.roomName);
            //     break;
            case 0:
                pos = new RoomPosition(tough.pos.x - 1, tough.pos.y - 1, tough.pos.roomName);
                break;
            case 1:
                pos = new RoomPosition(tough.pos.x - 1, tough.pos.y, tough.pos.roomName);
                break;
            case 2:
                pos = new RoomPosition(tough.pos.x - 1, tough.pos.y + 1, tough.pos.roomName);
                break;
            // case 4:
            //     pos = new RoomPosition(tough.pos.x, tough.pos.y + 1, tough.pos.roomName);
            //     break;
            default:
                break;
        }
        if (!pos)
            return;
        if (this.creep.pos.isEqualTo(pos)) {
            this.creep.heal(tough);
        }
        else {
            if (this.creep.pos.x == 1 && this.creep.pos.y <= 13 && this.creep.pos.y >= 7) {
                this.creep.move(TOP);
                return;
            }
            this.creep.moveTo(pos, { reusePath: 0 });
        }
    }
}

class RoleWorker extends Role {
    run() {
        if (this.creep.isIdle)
            this.chooseWork();
        if (this.creep.task)
            this.creep.task.run();
    }
    chooseWork() {
        let spawnRoom = Game.rooms[this.creep.room.name];
        if (this.creep.carry[RESOURCE_ENERGY] > 0) {
            let controller = spawnRoom.controller;
            if (controller && controller.ticksToDowngrade <= (controller.level >= 4 ? 10000 : 2000))
                if (this.upgradeAction())
                    return;
            let repairList = this.creep.room.find(FIND_STRUCTURES, { filter: structure => structure.structureType != STRUCTURE_ROAD
                    && structure.structureType != STRUCTURE_RAMPART && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_CONTAINER
                    && structure.hits < structure.hitsMax });
            if (repairList.length)
                if (this.repairAction(repairList))
                    return;
            let buildSites = this.creep.room.find(FIND_CONSTRUCTION_SITES);
            if (Memory.colonies[this.creep.memory.spawnRoom])
                for (const room of Memory.colonies[this.creep.memory.spawnRoom])
                    if (Game.rooms[room.name])
                        buildSites.push(...Game.rooms[room.name].find(FIND_CONSTRUCTION_SITES));
            if (buildSites.length)
                if (this.buildAction(buildSites))
                    return;
            if (this.upgradeAction())
                return;
        }
        else
            SourceManager.getSource(this.creep);
    }
    buildAction(buildSites) {
        if (!buildSites.length)
            return false;
        let target = this.creep.pos.findClosestByMultiRoomRange(buildSites);
        if (!target)
            return false;
        this.creep.task = Tasks$1.build(target);
        return true;
    }
    repairAction(repairList) {
        if (!repairList.length)
            return false;
        let target = this.creep.pos.findClosestByRange(repairList);
        if (!target)
            return false;
        this.creep.task = Tasks$1.repair(target);
        return true;
    }
    upgradeAction() {
        let controller = Game.rooms[this.creep.memory.spawnRoom].controller;
        if (controller) {
            this.creep.task = Tasks$1.upgrade(controller);
            return true;
        }
        return false;
    }
}

class RolePioneer extends Role {
    run() {
        if (!Memory.spawnRoom) {
            this.creep.suicide();
            return;
        }
        if (!Game.rooms[Memory.spawnRoom]) {
            var exits = this.creep.room.find(this.creep.room.findExitTo(Memory.spawnRoom));
            let exit = this.creep.pos.findClosestByPath(exits);
            if (!exit)
                return;
            this.creep.moveTo(exit);
            return;
        }
        else if (this.creep.room.name != Memory.spawnRoom) {
            var exits = this.creep.room.find(this.creep.room.findExitTo(Memory.spawnRoom));
            let exit = this.creep.pos.findClosestByPath(exits);
            if (!exit)
                return;
            this.creep.moveTo(exit);
            return;
        }
        let pos = Game.flags['spawn_' + Memory.spawnRoom].pos;
        let spawn = pos.findInRange(FIND_MY_SPAWNS, 0)[0];
        let site = pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 0)[0];
        if (spawn) {
            Game.flags['spawn_' + Memory.spawnRoom].remove();
            return;
        }
        if (!site)
            pos.createConstructionSite(STRUCTURE_SPAWN, this.getSPawnName());
        let hasClaim = this.creep.body.filter((value) => value.type == CLAIM).length != 0;
        if (hasClaim) {
            if (this.creep.room.controller && !this.creep.room.controller.owner) {
                Memory.claimed = false;
                if (this.creep.claimController(this.creep.room.controller) == ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(this.creep.room.controller);
                }
                return;
            }
            else {
                Memory.claimed = true;
                this.creep.suicide();
                return;
            }
        }
        if (site) {
            if (this.creep.memory.allotUnit)
                Alloter.refreshDirty(this.creep.memory.allotUnit);
            else
                this.creep.memory.allotUnit = SourceManager.allotSource(this.creep.room);
            if (!this.creep.memory.allotUnit)
                return;
            if (this.creep.memory.building && this.creep.carry.energy == 0) {
                this.creep.memory.building = false;
            }
            if (!this.creep.memory.building && this.creep.carry.energy == this.creep.carryCapacity) {
                this.creep.memory.building = true;
            }
            if (this.creep.memory.building) {
                if (this.creep.build(site) == ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(site);
                }
            }
            else {
                let pos = this.creep.memory.allotUnit.data.pos;
                if (!this.creep.memory.sourceId) {
                    let sources = pos.findInRange(FIND_SOURCES, 0);
                    if (sources.length)
                        this.creep.memory.sourceId = sources[0].id;
                }
                let source = Game.getObjectById(this.creep.memory.sourceId);
                if (!source)
                    return;
                if (this.creep.harvest(source) == ERR_NOT_IN_RANGE) {
                    this.creep.travelTo(source);
                }
            }
        }
    }
    getSPawnName() {
        for (let i = 0; i < 999; i++) {
            var find = false;
            for (const spawn in Game.spawns) {
                if (spawn == 'Spawn_' + i) {
                    find = true;
                    break;
                }
            }
            if (!find)
                return 'Spawn_' + i;
        }
        return '';
    }
}

class RoleFactory {
    static getInstance(creep) {
        switch (creep.memory.role) {
            case 'filler':
                return new RoleFiller(creep);
            case 'transporter':
                return new RoleTransporter(creep);
            case 'stableTransporter':
                return new RoleStableTransporter(creep);
            case 'harvester':
                return new RoleHarvester(creep);
            case 'worker':
                return new RoleWorker(creep);
            case 'defencer':
                return new RoleDefencer(creep);
            case 'hauler':
                return new RoleHauler(creep);
            case 'dismantler':
                return new RoleDismantaler(creep);
            case 'upgrader':
                return new RoleUpgrader(creep);
            case 'reservist':
                return new RoleReservist(creep);
            case 'trader':
                return new RoleTrader(creep);
            case 'pioneer':
                return new RolePioneer(creep);
            case 'attack_warrior':
                return new RoleWarrior(creep);
            case 'attack_tough':
                return new RoleTough(creep);
            case 'attack_heal':
                return new RoleHeal(creep);
            default:
                return null;
        }
    }
}

const lowEnergyLine = 100000;
const towerRepairLine = 800000;

class Tower {
    static run(room) {
        var towers = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.structureType == STRUCTURE_TOWER;
            }
        });
        let injuredCreeps = room.find(FIND_MY_CREEPS, {
            filter: (creep) => {
                return creep.hits < creep.hitsMax;
            }
        });
        let enemies = room.find(FIND_HOSTILE_CREEPS, {
            filter: (enemy) => {
                for (const body of enemy.body)
                    //if(body.type != MOVE && body.type != TOUGH) 
                    return true;
                return false;
            }
        });
        let timeLeft = 0;
        for (const enemy of enemies)
            if (enemy.ticksToLive && enemy.ticksToLive > timeLeft)
                timeLeft = enemy.ticksToLive;
        let buildings = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return structure.hits < structure.hitsMax * 0.5 && structure.structureType != STRUCTURE_WALL && structure.structureType != STRUCTURE_RAMPART
                    || (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART) && structure.hits < 100000;
            }
        });
        let walls = room.find(FIND_STRUCTURES, {
            filter: (structure) => {
                return (structure.structureType == STRUCTURE_WALL || structure.structureType == STRUCTURE_RAMPART)
                    && structure.hits < structure.hitsMax;
            }
        });
        for (const tower of towers) {
            if (!Alloter.exist(ALLOT_TOWER, tower.room.name, 'id1', tower.id)) {
                let unit = new allotUnit(tower.room.name, { id1: tower.id, pos: tower.pos });
                Alloter.addUnit(unit, ALLOT_TOWER);
            }
            if (tower.energy > 600) {
                let unit = Alloter.getUnitWithKeyValue(ALLOT_TOWER, tower.room.name, 'id1', tower.id);
                if (unit)
                    unit.available = false;
            }
            if (enemies.length != 0) {
                let enemy = tower.pos.findClosestByRange(enemies);
                if (enemy)
                    tower.attack(enemy);
                Memory.rooms[tower.pos.roomName].underAttacking = true;
                Memory.rooms[tower.pos.roomName].timeLeft = timeLeft;
                Memory.UnderAttacking = true;
                continue;
            }
            else {
                Memory.rooms[tower.pos.roomName].underAttacking = false;
                Memory.UnderAttacking = false;
            }
            if (injuredCreeps.length != 0) {
                let target = Tower.findSmallestByHit(injuredCreeps);
                if (!target)
                    continue;
                tower.heal(target);
                continue;
            }
            if (buildings.length != 0) {
                let target = Tower.findSmallestByHit(buildings);
                if (!target)
                    continue;
                tower.repair(target);
                continue;
            }
            if (walls.length != 0 && room.memory.storedEnergy > towerRepairLine) {
                let target = Tower.findSmallestByHit(walls);
                if (!target)
                    continue;
                tower.repair(target);
            }
        }
    }
    static findSmallestByHit(targets) {
        var result = targets[0];
        for (const t of targets) {
            if (t.hits < result.hits)
                result = t;
        }
        return result;
    }
}

class Statistics {
    /*
    * filler idle time
    * resource usage
    */
    static run(room) {
        if (!Memory.statistics)
            Memory.statistics = {};
        if (!Memory.statistics[room.name])
            Memory.statistics[room.name] = {};
        // this.visualCreeps(room);
        this.countFillerIdle(room);
        this.countResourceUsage(room);
        // let s1 = Game.cpu.getUsed();
        // let eventLog = room.find(FIND_MY_CREEPS, {filter: c=>c.hits<c.hitsMax});
        // let s2 = Game.cpu.getUsed();
        // Memory.statistics[room.name].averageParseCost = exponentialMovingAverage(s2-s1, Memory.statistics[room.name].averageParseCost, 20);
        // console.log(room.name + ': ' + (s2 - s1));
        // console.log(room.getEventLog(true));
    }
    static visualCreeps(room) {
        let visual = room.visual;
        let spawn = room.find(FIND_MY_SPAWNS)[0];
        let size = 0.4;
        let originY = spawn.pos.y - ((GlobalSettings.roles.length + 1) / 2) * size;
        let total = 0;
        let y = originY;
        for (const role of GlobalSettings.roles) {
            let num = _.filter(Game.creeps, (creep) => creep.memory.role == role && creep.memory.spawnRoom == room.name).length;
            visual.text(role + ': ' + num, spawn.pos.x + 0.5, y, { font: size, align: 'left' });
            total += num;
            y += size;
        }
        visual.text('total: ' + total, spawn.pos.x + 0.5, y, { font: size, align: 'left' });
    }
    static countFillerIdle(room) {
        let data = Memory.statistics[room.name];
        if (data.fillerIdleRecord)
            delete data.fillerIdleRecord;
        if (!data.idleTickPercent)
            data.idleTickPercent = 0;
        let fillers = _.filter(Game.creeps, (creep) => creep.memory.role == 'filler' && creep.memory.spawnRoom == room.name);
        let filler = fillers[0];
        if (filler)
            data.idleTickPercent = exponentialMovingAverage(filler.memory.idle ? 1 : 0, data.idleTickPercent, 1500);
    }
    static countResourceUsage(room) {
        let storage = room.storage;
        if (!storage)
            return;
        let data = Memory.statistics[room.name];
        if (!data.averageResourceUsage)
            data.averageResourceUsage = 0;
        if (!data.lastReserve) {
            data.lastReserve = storage.store[RESOURCE_ENERGY];
            return;
        }
        data.averageResourceUsage = exponentialMovingAverage(storage.store[RESOURCE_ENERGY] - data.lastReserve, data.averageResourceUsage, 1500);
        data.lastReserve = storage.store[RESOURCE_ENERGY];
    }
}
/**
 * Compute an exponential moving average
 */
function exponentialMovingAverage(current, avg, window) {
    return (current + (avg || 0) * (window - 1)) / window;
}

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

var intToCharMap = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'.split('');

/**
 * Encode an integer in the range of 0 to 63 to a single base 64 digit.
 */
var encode = function (number) {
  if (0 <= number && number < intToCharMap.length) {
    return intToCharMap[number];
  }
  throw new TypeError("Must be between 0 and 63: " + number);
};

/**
 * Decode a single base 64 character code digit to an integer. Returns -1 on
 * failure.
 */
var decode = function (charCode) {
  var bigA = 65;     // 'A'
  var bigZ = 90;     // 'Z'

  var littleA = 97;  // 'a'
  var littleZ = 122; // 'z'

  var zero = 48;     // '0'
  var nine = 57;     // '9'

  var plus = 43;     // '+'
  var slash = 47;    // '/'

  var littleOffset = 26;
  var numberOffset = 52;

  // 0 - 25: ABCDEFGHIJKLMNOPQRSTUVWXYZ
  if (bigA <= charCode && charCode <= bigZ) {
    return (charCode - bigA);
  }

  // 26 - 51: abcdefghijklmnopqrstuvwxyz
  if (littleA <= charCode && charCode <= littleZ) {
    return (charCode - littleA + littleOffset);
  }

  // 52 - 61: 0123456789
  if (zero <= charCode && charCode <= nine) {
    return (charCode - zero + numberOffset);
  }

  // 62: +
  if (charCode == plus) {
    return 62;
  }

  // 63: /
  if (charCode == slash) {
    return 63;
  }

  // Invalid base64 digit.
  return -1;
};

var base64 = {
	encode: encode,
	decode: decode
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 *
 * Based on the Base 64 VLQ implementation in Closure Compiler:
 * https://code.google.com/p/closure-compiler/source/browse/trunk/src/com/google/debugging/sourcemap/Base64VLQ.java
 *
 * Copyright 2011 The Closure Compiler Authors. All rights reserved.
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *  * Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 *  * Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials provided
 *    with the distribution.
 *  * Neither the name of Google Inc. nor the names of its
 *    contributors may be used to endorse or promote products derived
 *    from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */



// A single base 64 digit can contain 6 bits of data. For the base 64 variable
// length quantities we use in the source map spec, the first bit is the sign,
// the next four bits are the actual value, and the 6th bit is the
// continuation bit. The continuation bit tells us whether there are more
// digits in this value following this digit.
//
//   Continuation
//   |    Sign
//   |    |
//   V    V
//   101011

var VLQ_BASE_SHIFT = 5;

// binary: 100000
var VLQ_BASE = 1 << VLQ_BASE_SHIFT;

// binary: 011111
var VLQ_BASE_MASK = VLQ_BASE - 1;

// binary: 100000
var VLQ_CONTINUATION_BIT = VLQ_BASE;

/**
 * Converts from a two-complement value to a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   1 becomes 2 (10 binary), -1 becomes 3 (11 binary)
 *   2 becomes 4 (100 binary), -2 becomes 5 (101 binary)
 */
function toVLQSigned(aValue) {
  return aValue < 0
    ? ((-aValue) << 1) + 1
    : (aValue << 1) + 0;
}

/**
 * Converts to a two-complement value from a value where the sign bit is
 * placed in the least significant bit.  For example, as decimals:
 *   2 (10 binary) becomes 1, 3 (11 binary) becomes -1
 *   4 (100 binary) becomes 2, 5 (101 binary) becomes -2
 */
function fromVLQSigned(aValue) {
  var isNegative = (aValue & 1) === 1;
  var shifted = aValue >> 1;
  return isNegative
    ? -shifted
    : shifted;
}

/**
 * Returns the base 64 VLQ encoded value.
 */
var encode$1 = function base64VLQ_encode(aValue) {
  var encoded = "";
  var digit;

  var vlq = toVLQSigned(aValue);

  do {
    digit = vlq & VLQ_BASE_MASK;
    vlq >>>= VLQ_BASE_SHIFT;
    if (vlq > 0) {
      // There are still more digits in this value, so we must make sure the
      // continuation bit is marked.
      digit |= VLQ_CONTINUATION_BIT;
    }
    encoded += base64.encode(digit);
  } while (vlq > 0);

  return encoded;
};

/**
 * Decodes the next base 64 VLQ value from the given string and returns the
 * value and the rest of the string via the out parameter.
 */
var decode$1 = function base64VLQ_decode(aStr, aIndex, aOutParam) {
  var strLen = aStr.length;
  var result = 0;
  var shift = 0;
  var continuation, digit;

  do {
    if (aIndex >= strLen) {
      throw new Error("Expected more digits in base 64 VLQ value.");
    }

    digit = base64.decode(aStr.charCodeAt(aIndex++));
    if (digit === -1) {
      throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
    }

    continuation = !!(digit & VLQ_CONTINUATION_BIT);
    digit &= VLQ_BASE_MASK;
    result = result + (digit << shift);
    shift += VLQ_BASE_SHIFT;
  } while (continuation);

  aOutParam.value = fromVLQSigned(result);
  aOutParam.rest = aIndex;
};

var base64Vlq = {
	encode: encode$1,
	decode: decode$1
};

var util = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

/**
 * This is a helper function for getting values from parameter/options
 * objects.
 *
 * @param args The object we are extracting values from
 * @param name The name of the property we are getting.
 * @param defaultValue An optional value to return if the property is missing
 * from the object. If this is not specified and the property is missing, an
 * error will be thrown.
 */
function getArg(aArgs, aName, aDefaultValue) {
  if (aName in aArgs) {
    return aArgs[aName];
  } else if (arguments.length === 3) {
    return aDefaultValue;
  } else {
    throw new Error('"' + aName + '" is a required argument.');
  }
}
exports.getArg = getArg;

var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
var dataUrlRegexp = /^data:.+\,.+$/;

function urlParse(aUrl) {
  var match = aUrl.match(urlRegexp);
  if (!match) {
    return null;
  }
  return {
    scheme: match[1],
    auth: match[2],
    host: match[3],
    port: match[4],
    path: match[5]
  };
}
exports.urlParse = urlParse;

function urlGenerate(aParsedUrl) {
  var url = '';
  if (aParsedUrl.scheme) {
    url += aParsedUrl.scheme + ':';
  }
  url += '//';
  if (aParsedUrl.auth) {
    url += aParsedUrl.auth + '@';
  }
  if (aParsedUrl.host) {
    url += aParsedUrl.host;
  }
  if (aParsedUrl.port) {
    url += ":" + aParsedUrl.port;
  }
  if (aParsedUrl.path) {
    url += aParsedUrl.path;
  }
  return url;
}
exports.urlGenerate = urlGenerate;

/**
 * Normalizes a path, or the path portion of a URL:
 *
 * - Replaces consecutive slashes with one slash.
 * - Removes unnecessary '.' parts.
 * - Removes unnecessary '<dir>/..' parts.
 *
 * Based on code in the Node.js 'path' core module.
 *
 * @param aPath The path or url to normalize.
 */
function normalize(aPath) {
  var path = aPath;
  var url = urlParse(aPath);
  if (url) {
    if (!url.path) {
      return aPath;
    }
    path = url.path;
  }
  var isAbsolute = exports.isAbsolute(path);

  var parts = path.split(/\/+/);
  for (var part, up = 0, i = parts.length - 1; i >= 0; i--) {
    part = parts[i];
    if (part === '.') {
      parts.splice(i, 1);
    } else if (part === '..') {
      up++;
    } else if (up > 0) {
      if (part === '') {
        // The first part is blank if the path is absolute. Trying to go
        // above the root is a no-op. Therefore we can remove all '..' parts
        // directly after the root.
        parts.splice(i + 1, up);
        up = 0;
      } else {
        parts.splice(i, 2);
        up--;
      }
    }
  }
  path = parts.join('/');

  if (path === '') {
    path = isAbsolute ? '/' : '.';
  }

  if (url) {
    url.path = path;
    return urlGenerate(url);
  }
  return path;
}
exports.normalize = normalize;

/**
 * Joins two paths/URLs.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be joined with the root.
 *
 * - If aPath is a URL or a data URI, aPath is returned, unless aPath is a
 *   scheme-relative URL: Then the scheme of aRoot, if any, is prepended
 *   first.
 * - Otherwise aPath is a path. If aRoot is a URL, then its path portion
 *   is updated with the result and aRoot is returned. Otherwise the result
 *   is returned.
 *   - If aPath is absolute, the result is aPath.
 *   - Otherwise the two paths are joined with a slash.
 * - Joining for example 'http://' and 'www.example.com' is also supported.
 */
function join(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }
  if (aPath === "") {
    aPath = ".";
  }
  var aPathUrl = urlParse(aPath);
  var aRootUrl = urlParse(aRoot);
  if (aRootUrl) {
    aRoot = aRootUrl.path || '/';
  }

  // `join(foo, '//www.example.org')`
  if (aPathUrl && !aPathUrl.scheme) {
    if (aRootUrl) {
      aPathUrl.scheme = aRootUrl.scheme;
    }
    return urlGenerate(aPathUrl);
  }

  if (aPathUrl || aPath.match(dataUrlRegexp)) {
    return aPath;
  }

  // `join('http://', 'www.example.com')`
  if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
    aRootUrl.host = aPath;
    return urlGenerate(aRootUrl);
  }

  var joined = aPath.charAt(0) === '/'
    ? aPath
    : normalize(aRoot.replace(/\/+$/, '') + '/' + aPath);

  if (aRootUrl) {
    aRootUrl.path = joined;
    return urlGenerate(aRootUrl);
  }
  return joined;
}
exports.join = join;

exports.isAbsolute = function (aPath) {
  return aPath.charAt(0) === '/' || urlRegexp.test(aPath);
};

/**
 * Make a path relative to a URL or another path.
 *
 * @param aRoot The root path or URL.
 * @param aPath The path or URL to be made relative to aRoot.
 */
function relative(aRoot, aPath) {
  if (aRoot === "") {
    aRoot = ".";
  }

  aRoot = aRoot.replace(/\/$/, '');

  // It is possible for the path to be above the root. In this case, simply
  // checking whether the root is a prefix of the path won't work. Instead, we
  // need to remove components from the root one by one, until either we find
  // a prefix that fits, or we run out of components to remove.
  var level = 0;
  while (aPath.indexOf(aRoot + '/') !== 0) {
    var index = aRoot.lastIndexOf("/");
    if (index < 0) {
      return aPath;
    }

    // If the only part of the root that is left is the scheme (i.e. http://,
    // file:///, etc.), one or more slashes (/), or simply nothing at all, we
    // have exhausted all components, so the path is not relative to the root.
    aRoot = aRoot.slice(0, index);
    if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
      return aPath;
    }

    ++level;
  }

  // Make sure we add a "../" for each component we removed from the root.
  return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
}
exports.relative = relative;

var supportsNullProto = (function () {
  var obj = Object.create(null);
  return !('__proto__' in obj);
}());

function identity (s) {
  return s;
}

/**
 * Because behavior goes wacky when you set `__proto__` on objects, we
 * have to prefix all the strings in our set with an arbitrary character.
 *
 * See https://github.com/mozilla/source-map/pull/31 and
 * https://github.com/mozilla/source-map/issues/30
 *
 * @param String aStr
 */
function toSetString(aStr) {
  if (isProtoString(aStr)) {
    return '$' + aStr;
  }

  return aStr;
}
exports.toSetString = supportsNullProto ? identity : toSetString;

function fromSetString(aStr) {
  if (isProtoString(aStr)) {
    return aStr.slice(1);
  }

  return aStr;
}
exports.fromSetString = supportsNullProto ? identity : fromSetString;

function isProtoString(s) {
  if (!s) {
    return false;
  }

  var length = s.length;

  if (length < 9 /* "__proto__".length */) {
    return false;
  }

  if (s.charCodeAt(length - 1) !== 95  /* '_' */ ||
      s.charCodeAt(length - 2) !== 95  /* '_' */ ||
      s.charCodeAt(length - 3) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 4) !== 116 /* 't' */ ||
      s.charCodeAt(length - 5) !== 111 /* 'o' */ ||
      s.charCodeAt(length - 6) !== 114 /* 'r' */ ||
      s.charCodeAt(length - 7) !== 112 /* 'p' */ ||
      s.charCodeAt(length - 8) !== 95  /* '_' */ ||
      s.charCodeAt(length - 9) !== 95  /* '_' */) {
    return false;
  }

  for (var i = length - 10; i >= 0; i--) {
    if (s.charCodeAt(i) !== 36 /* '$' */) {
      return false;
    }
  }

  return true;
}

/**
 * Comparator between two mappings where the original positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same original source/line/column, but different generated
 * line and column the same. Useful when searching for a mapping with a
 * stubbed out mapping.
 */
function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
  var cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0 || onlyCompareOriginal) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByOriginalPositions = compareByOriginalPositions;

/**
 * Comparator between two mappings with deflated source and name indices where
 * the generated positions are compared.
 *
 * Optionally pass in `true` as `onlyCompareGenerated` to consider two
 * mappings with the same generated line and column, but different
 * source/name/original line and column the same. Useful when searching for a
 * mapping with a stubbed out mapping.
 */
function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0 || onlyCompareGenerated) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;

function strcmp(aStr1, aStr2) {
  if (aStr1 === aStr2) {
    return 0;
  }

  if (aStr1 === null) {
    return 1; // aStr2 !== null
  }

  if (aStr2 === null) {
    return -1; // aStr1 !== null
  }

  if (aStr1 > aStr2) {
    return 1;
  }

  return -1;
}

/**
 * Comparator between two mappings with inflated source and name strings where
 * the generated positions are compared.
 */
function compareByGeneratedPositionsInflated(mappingA, mappingB) {
  var cmp = mappingA.generatedLine - mappingB.generatedLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.generatedColumn - mappingB.generatedColumn;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = strcmp(mappingA.source, mappingB.source);
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalLine - mappingB.originalLine;
  if (cmp !== 0) {
    return cmp;
  }

  cmp = mappingA.originalColumn - mappingB.originalColumn;
  if (cmp !== 0) {
    return cmp;
  }

  return strcmp(mappingA.name, mappingB.name);
}
exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;

/**
 * Strip any JSON XSSI avoidance prefix from the string (as documented
 * in the source maps specification), and then parse the string as
 * JSON.
 */
function parseSourceMapInput(str) {
  return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ''));
}
exports.parseSourceMapInput = parseSourceMapInput;

/**
 * Compute the URL of a source given the the source root, the source's
 * URL, and the source map's URL.
 */
function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
  sourceURL = sourceURL || '';

  if (sourceRoot) {
    // This follows what Chrome does.
    if (sourceRoot[sourceRoot.length - 1] !== '/' && sourceURL[0] !== '/') {
      sourceRoot += '/';
    }
    // The spec says:
    //   Line 4: An optional source root, useful for relocating source
    //   files on a server or removing repeated values in the
    //   “sources” entry.  This value is prepended to the individual
    //   entries in the “source” field.
    sourceURL = sourceRoot + sourceURL;
  }

  // Historically, SourceMapConsumer did not take the sourceMapURL as
  // a parameter.  This mode is still somewhat supported, which is why
  // this code block is conditional.  However, it's preferable to pass
  // the source map URL to SourceMapConsumer, so that this function
  // can implement the source URL resolution algorithm as outlined in
  // the spec.  This block is basically the equivalent of:
  //    new URL(sourceURL, sourceMapURL).toString()
  // ... except it avoids using URL, which wasn't available in the
  // older releases of node still supported by this library.
  //
  // The spec says:
  //   If the sources are not absolute URLs after prepending of the
  //   “sourceRoot”, the sources are resolved relative to the
  //   SourceMap (like resolving script src in a html document).
  if (sourceMapURL) {
    var parsed = urlParse(sourceMapURL);
    if (!parsed) {
      throw new Error("sourceMapURL could not be parsed");
    }
    if (parsed.path) {
      // Strip the last path component, but keep the "/".
      var index = parsed.path.lastIndexOf('/');
      if (index >= 0) {
        parsed.path = parsed.path.substring(0, index + 1);
      }
    }
    sourceURL = join(urlGenerate(parsed), sourceURL);
  }

  return normalize(sourceURL);
}
exports.computeSourceURL = computeSourceURL;
});
var util_1 = util.getArg;
var util_2 = util.urlParse;
var util_3 = util.urlGenerate;
var util_4 = util.normalize;
var util_5 = util.join;
var util_6 = util.isAbsolute;
var util_7 = util.relative;
var util_8 = util.toSetString;
var util_9 = util.fromSetString;
var util_10 = util.compareByOriginalPositions;
var util_11 = util.compareByGeneratedPositionsDeflated;
var util_12 = util.compareByGeneratedPositionsInflated;
var util_13 = util.parseSourceMapInput;
var util_14 = util.computeSourceURL;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */


var has = Object.prototype.hasOwnProperty;
var hasNativeMap = typeof Map !== "undefined";

/**
 * A data structure which is a combination of an array and a set. Adding a new
 * member is O(1), testing for membership is O(1), and finding the index of an
 * element is O(1). Removing elements from the set is not supported. Only
 * strings are supported for membership.
 */
function ArraySet() {
  this._array = [];
  this._set = hasNativeMap ? new Map() : Object.create(null);
}

/**
 * Static method for creating ArraySet instances from an existing array.
 */
ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
  var set = new ArraySet();
  for (var i = 0, len = aArray.length; i < len; i++) {
    set.add(aArray[i], aAllowDuplicates);
  }
  return set;
};

/**
 * Return how many unique items are in this ArraySet. If duplicates have been
 * added, than those do not count towards the size.
 *
 * @returns Number
 */
ArraySet.prototype.size = function ArraySet_size() {
  return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
};

/**
 * Add the given string to this set.
 *
 * @param String aStr
 */
ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
  var sStr = hasNativeMap ? aStr : util.toSetString(aStr);
  var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
  var idx = this._array.length;
  if (!isDuplicate || aAllowDuplicates) {
    this._array.push(aStr);
  }
  if (!isDuplicate) {
    if (hasNativeMap) {
      this._set.set(aStr, idx);
    } else {
      this._set[sStr] = idx;
    }
  }
};

/**
 * Is the given string a member of this set?
 *
 * @param String aStr
 */
ArraySet.prototype.has = function ArraySet_has(aStr) {
  if (hasNativeMap) {
    return this._set.has(aStr);
  } else {
    var sStr = util.toSetString(aStr);
    return has.call(this._set, sStr);
  }
};

/**
 * What is the index of the given string in the array?
 *
 * @param String aStr
 */
ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
  if (hasNativeMap) {
    var idx = this._set.get(aStr);
    if (idx >= 0) {
        return idx;
    }
  } else {
    var sStr = util.toSetString(aStr);
    if (has.call(this._set, sStr)) {
      return this._set[sStr];
    }
  }

  throw new Error('"' + aStr + '" is not in the set.');
};

/**
 * What is the element at the given index?
 *
 * @param Number aIdx
 */
ArraySet.prototype.at = function ArraySet_at(aIdx) {
  if (aIdx >= 0 && aIdx < this._array.length) {
    return this._array[aIdx];
  }
  throw new Error('No element indexed by ' + aIdx);
};

/**
 * Returns the array representation of this set (which has the proper indices
 * indicated by indexOf). Note that this is a copy of the internal array used
 * for storing the members so that no one can mess with internal state.
 */
ArraySet.prototype.toArray = function ArraySet_toArray() {
  return this._array.slice();
};

var ArraySet_1 = ArraySet;

var arraySet = {
	ArraySet: ArraySet_1
};

var binarySearch = createCommonjsModule(function (module, exports) {
/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

exports.GREATEST_LOWER_BOUND = 1;
exports.LEAST_UPPER_BOUND = 2;

/**
 * Recursive implementation of binary search.
 *
 * @param aLow Indices here and lower do not contain the needle.
 * @param aHigh Indices here and higher do not contain the needle.
 * @param aNeedle The element being searched for.
 * @param aHaystack The non-empty array being searched.
 * @param aCompare Function which takes two elements and returns -1, 0, or 1.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 */
function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
  // This function terminates when one of the following is true:
  //
  //   1. We find the exact element we are looking for.
  //
  //   2. We did not find the exact element, but we can return the index of
  //      the next-closest element.
  //
  //   3. We did not find the exact element, and there is no next-closest
  //      element than the one we are searching for, so we return -1.
  var mid = Math.floor((aHigh - aLow) / 2) + aLow;
  var cmp = aCompare(aNeedle, aHaystack[mid], true);
  if (cmp === 0) {
    // Found the element we are looking for.
    return mid;
  }
  else if (cmp > 0) {
    // Our needle is greater than aHaystack[mid].
    if (aHigh - mid > 1) {
      // The element is in the upper half.
      return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
    }

    // The exact needle element was not found in this haystack. Determine if
    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return aHigh < aHaystack.length ? aHigh : -1;
    } else {
      return mid;
    }
  }
  else {
    // Our needle is less than aHaystack[mid].
    if (mid - aLow > 1) {
      // The element is in the lower half.
      return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
    }

    // we are in termination case (3) or (2) and return the appropriate thing.
    if (aBias == exports.LEAST_UPPER_BOUND) {
      return mid;
    } else {
      return aLow < 0 ? -1 : aLow;
    }
  }
}

/**
 * This is an implementation of binary search which will always try and return
 * the index of the closest element if there is no exact hit. This is because
 * mappings between original and generated line/col pairs are single points,
 * and there is an implicit region between each of them, so a miss just means
 * that you aren't on the very start of a region.
 *
 * @param aNeedle The element you are looking for.
 * @param aHaystack The array that is being searched.
 * @param aCompare A function which takes the needle and an element in the
 *     array and returns -1, 0, or 1 depending on whether the needle is less
 *     than, equal to, or greater than the element, respectively.
 * @param aBias Either 'binarySearch.GREATEST_LOWER_BOUND' or
 *     'binarySearch.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'binarySearch.GREATEST_LOWER_BOUND'.
 */
exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
  if (aHaystack.length === 0) {
    return -1;
  }

  var index = recursiveSearch(-1, aHaystack.length, aNeedle, aHaystack,
                              aCompare, aBias || exports.GREATEST_LOWER_BOUND);
  if (index < 0) {
    return -1;
  }

  // We have found either the exact element, or the next-closest element than
  // the one we are searching for. However, there may be more than one such
  // element. Make sure we always return the smallest of these.
  while (index - 1 >= 0) {
    if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
      break;
    }
    --index;
  }

  return index;
};
});
var binarySearch_1 = binarySearch.GREATEST_LOWER_BOUND;
var binarySearch_2 = binarySearch.LEAST_UPPER_BOUND;
var binarySearch_3 = binarySearch.search;

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */

// It turns out that some (most?) JavaScript engines don't self-host
// `Array.prototype.sort`. This makes sense because C++ will likely remain
// faster than JS when doing raw CPU-intensive sorting. However, when using a
// custom comparator function, calling back and forth between the VM's C++ and
// JIT'd JS is rather slow *and* loses JIT type information, resulting in
// worse generated code for the comparator function than would be optimal. In
// fact, when sorting with a comparator, these costs outweigh the benefits of
// sorting in C++. By using our own JS-implemented Quick Sort (below), we get
// a ~3500ms mean speed-up in `bench/bench.html`.

/**
 * Swap the elements indexed by `x` and `y` in the array `ary`.
 *
 * @param {Array} ary
 *        The array.
 * @param {Number} x
 *        The index of the first item.
 * @param {Number} y
 *        The index of the second item.
 */
function swap(ary, x, y) {
  var temp = ary[x];
  ary[x] = ary[y];
  ary[y] = temp;
}

/**
 * Returns a random integer within the range `low .. high` inclusive.
 *
 * @param {Number} low
 *        The lower bound on the range.
 * @param {Number} high
 *        The upper bound on the range.
 */
function randomIntInRange(low, high) {
  return Math.round(low + (Math.random() * (high - low)));
}

/**
 * The Quick Sort algorithm.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 * @param {Number} p
 *        Start index of the array
 * @param {Number} r
 *        End index of the array
 */
function doQuickSort(ary, comparator, p, r) {
  // If our lower bound is less than our upper bound, we (1) partition the
  // array into two pieces and (2) recurse on each half. If it is not, this is
  // the empty array and our base case.

  if (p < r) {
    // (1) Partitioning.
    //
    // The partitioning chooses a pivot between `p` and `r` and moves all
    // elements that are less than or equal to the pivot to the before it, and
    // all the elements that are greater than it after it. The effect is that
    // once partition is done, the pivot is in the exact place it will be when
    // the array is put in sorted order, and it will not need to be moved
    // again. This runs in O(n) time.

    // Always choose a random pivot so that an input array which is reverse
    // sorted does not cause O(n^2) running time.
    var pivotIndex = randomIntInRange(p, r);
    var i = p - 1;

    swap(ary, pivotIndex, r);
    var pivot = ary[r];

    // Immediately after `j` is incremented in this loop, the following hold
    // true:
    //
    //   * Every element in `ary[p .. i]` is less than or equal to the pivot.
    //
    //   * Every element in `ary[i+1 .. j-1]` is greater than the pivot.
    for (var j = p; j < r; j++) {
      if (comparator(ary[j], pivot) <= 0) {
        i += 1;
        swap(ary, i, j);
      }
    }

    swap(ary, i + 1, j);
    var q = i + 1;

    // (2) Recurse on each half.

    doQuickSort(ary, comparator, p, q - 1);
    doQuickSort(ary, comparator, q + 1, r);
  }
}

/**
 * Sort the given array in-place with the given comparator function.
 *
 * @param {Array} ary
 *        An array to sort.
 * @param {function} comparator
 *        Function to use to compare two items.
 */
var quickSort_1 = function (ary, comparator) {
  doQuickSort(ary, comparator, 0, ary.length - 1);
};

var quickSort = {
	quickSort: quickSort_1
};

/* -*- Mode: js; js-indent-level: 2; -*- */
/*
 * Copyright 2011 Mozilla Foundation and contributors
 * Licensed under the New BSD license. See LICENSE or:
 * http://opensource.org/licenses/BSD-3-Clause
 */



var ArraySet$2 = arraySet.ArraySet;

var quickSort$1 = quickSort.quickSort;

function SourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  return sourceMap.sections != null
    ? new IndexedSourceMapConsumer(sourceMap, aSourceMapURL)
    : new BasicSourceMapConsumer(sourceMap, aSourceMapURL);
}

SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
  return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
};

/**
 * The version of the source mapping spec that we are consuming.
 */
SourceMapConsumer.prototype._version = 3;

// `__generatedMappings` and `__originalMappings` are arrays that hold the
// parsed mapping coordinates from the source map's "mappings" attribute. They
// are lazily instantiated, accessed via the `_generatedMappings` and
// `_originalMappings` getters respectively, and we only parse the mappings
// and create these arrays once queried for a source location. We jump through
// these hoops because there can be many thousands of mappings, and parsing
// them is expensive, so we only want to do it if we must.
//
// Each object in the arrays is of the form:
//
//     {
//       generatedLine: The line number in the generated code,
//       generatedColumn: The column number in the generated code,
//       source: The path to the original source file that generated this
//               chunk of code,
//       originalLine: The line number in the original source that
//                     corresponds to this chunk of generated code,
//       originalColumn: The column number in the original source that
//                       corresponds to this chunk of generated code,
//       name: The name of the original symbol which generated this chunk of
//             code.
//     }
//
// All properties except for `generatedLine` and `generatedColumn` can be
// `null`.
//
// `_generatedMappings` is ordered by the generated positions.
//
// `_originalMappings` is ordered by the original positions.

SourceMapConsumer.prototype.__generatedMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_generatedMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__generatedMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__generatedMappings;
  }
});

SourceMapConsumer.prototype.__originalMappings = null;
Object.defineProperty(SourceMapConsumer.prototype, '_originalMappings', {
  configurable: true,
  enumerable: true,
  get: function () {
    if (!this.__originalMappings) {
      this._parseMappings(this._mappings, this.sourceRoot);
    }

    return this.__originalMappings;
  }
});

SourceMapConsumer.prototype._charIsMappingSeparator =
  function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
    var c = aStr.charAt(index);
    return c === ";" || c === ",";
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
SourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    throw new Error("Subclasses must implement _parseMappings");
  };

SourceMapConsumer.GENERATED_ORDER = 1;
SourceMapConsumer.ORIGINAL_ORDER = 2;

SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
SourceMapConsumer.LEAST_UPPER_BOUND = 2;

/**
 * Iterate over each mapping between an original source/line/column and a
 * generated line/column in this source map.
 *
 * @param Function aCallback
 *        The function that is called with each mapping.
 * @param Object aContext
 *        Optional. If specified, this object will be the value of `this` every
 *        time that `aCallback` is called.
 * @param aOrder
 *        Either `SourceMapConsumer.GENERATED_ORDER` or
 *        `SourceMapConsumer.ORIGINAL_ORDER`. Specifies whether you want to
 *        iterate over the mappings sorted by the generated file's line/column
 *        order or the original's source/line/column order, respectively. Defaults to
 *        `SourceMapConsumer.GENERATED_ORDER`.
 */
SourceMapConsumer.prototype.eachMapping =
  function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
    var context = aContext || null;
    var order = aOrder || SourceMapConsumer.GENERATED_ORDER;

    var mappings;
    switch (order) {
    case SourceMapConsumer.GENERATED_ORDER:
      mappings = this._generatedMappings;
      break;
    case SourceMapConsumer.ORIGINAL_ORDER:
      mappings = this._originalMappings;
      break;
    default:
      throw new Error("Unknown order of iteration.");
    }

    var sourceRoot = this.sourceRoot;
    mappings.map(function (mapping) {
      var source = mapping.source === null ? null : this._sources.at(mapping.source);
      source = util.computeSourceURL(sourceRoot, source, this._sourceMapURL);
      return {
        source: source,
        generatedLine: mapping.generatedLine,
        generatedColumn: mapping.generatedColumn,
        originalLine: mapping.originalLine,
        originalColumn: mapping.originalColumn,
        name: mapping.name === null ? null : this._names.at(mapping.name)
      };
    }, this).forEach(aCallback, context);
  };

/**
 * Returns all generated line and column information for the original source,
 * line, and column provided. If no column is provided, returns all mappings
 * corresponding to a either the line we are searching for or the next
 * closest line that has any mappings. Otherwise, returns all mappings
 * corresponding to the given line and either the column we are searching for
 * or the next closest column that has any offsets.
 *
 * The only argument is an object with the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number is 1-based.
 *   - column: Optional. the column number in the original source.
 *    The column number is 0-based.
 *
 * and an array of objects is returned, each with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *    line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *    The column number is 0-based.
 */
SourceMapConsumer.prototype.allGeneratedPositionsFor =
  function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
    var line = util.getArg(aArgs, 'line');

    // When there is no exact match, BasicSourceMapConsumer.prototype._findMapping
    // returns the index of the closest mapping less than the needle. By
    // setting needle.originalColumn to 0, we thus find the last mapping for
    // the given line, provided such a mapping exists.
    var needle = {
      source: util.getArg(aArgs, 'source'),
      originalLine: line,
      originalColumn: util.getArg(aArgs, 'column', 0)
    };

    needle.source = this._findSourceIndex(needle.source);
    if (needle.source < 0) {
      return [];
    }

    var mappings = [];

    var index = this._findMapping(needle,
                                  this._originalMappings,
                                  "originalLine",
                                  "originalColumn",
                                  util.compareByOriginalPositions,
                                  binarySearch.LEAST_UPPER_BOUND);
    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (aArgs.column === undefined) {
        var originalLine = mapping.originalLine;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we found. Since
        // mappings are sorted, this is guaranteed to find all mappings for
        // the line we found.
        while (mapping && mapping.originalLine === originalLine) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      } else {
        var originalColumn = mapping.originalColumn;

        // Iterate until either we run out of mappings, or we run into
        // a mapping for a different line than the one we were searching for.
        // Since mappings are sorted, this is guaranteed to find all mappings for
        // the line we are searching for.
        while (mapping &&
               mapping.originalLine === line &&
               mapping.originalColumn == originalColumn) {
          mappings.push({
            line: util.getArg(mapping, 'generatedLine', null),
            column: util.getArg(mapping, 'generatedColumn', null),
            lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
          });

          mapping = this._originalMappings[++index];
        }
      }
    }

    return mappings;
  };

var SourceMapConsumer_1 = SourceMapConsumer;

/**
 * A BasicSourceMapConsumer instance represents a parsed source map which we can
 * query for information about the original file positions by giving it a file
 * position in the generated source.
 *
 * The first parameter is the raw source map (either as a JSON string, or
 * already parsed to an object). According to the spec, source maps have the
 * following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - sources: An array of URLs to the original source files.
 *   - names: An array of identifiers which can be referrenced by individual mappings.
 *   - sourceRoot: Optional. The URL root from which all sources are relative.
 *   - sourcesContent: Optional. An array of contents of the original source files.
 *   - mappings: A string of base64 VLQs which contain the actual mappings.
 *   - file: Optional. The generated file this source map is associated with.
 *
 * Here is an example source map, taken from the source map spec[0]:
 *
 *     {
 *       version : 3,
 *       file: "out.js",
 *       sourceRoot : "",
 *       sources: ["foo.js", "bar.js"],
 *       names: ["src", "maps", "are", "fun"],
 *       mappings: "AA,AB;;ABCDE;"
 *     }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?pli=1#
 */
function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sources = util.getArg(sourceMap, 'sources');
  // Sass 3.3 leaves out the 'names' array, so we deviate from the spec (which
  // requires the array) to play nice here.
  var names = util.getArg(sourceMap, 'names', []);
  var sourceRoot = util.getArg(sourceMap, 'sourceRoot', null);
  var sourcesContent = util.getArg(sourceMap, 'sourcesContent', null);
  var mappings = util.getArg(sourceMap, 'mappings');
  var file = util.getArg(sourceMap, 'file', null);

  // Once again, Sass deviates from the spec and supplies the version as a
  // string rather than a number, so we use loose equality checking here.
  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  if (sourceRoot) {
    sourceRoot = util.normalize(sourceRoot);
  }

  sources = sources
    .map(String)
    // Some source maps produce relative source paths like "./foo.js" instead of
    // "foo.js".  Normalize these first so that future comparisons will succeed.
    // See bugzil.la/1090768.
    .map(util.normalize)
    // Always ensure that absolute sources are internally stored relative to
    // the source root, if the source root is absolute. Not doing this would
    // be particularly problematic when the source root is a prefix of the
    // source (valid, but why??). See github issue #199 and bugzil.la/1188982.
    .map(function (source) {
      return sourceRoot && util.isAbsolute(sourceRoot) && util.isAbsolute(source)
        ? util.relative(sourceRoot, source)
        : source;
    });

  // Pass `true` below to allow duplicate names and sources. While source maps
  // are intended to be compressed and deduplicated, the TypeScript compiler
  // sometimes generates source maps with duplicates in them. See Github issue
  // #72 and bugzil.la/889492.
  this._names = ArraySet$2.fromArray(names.map(String), true);
  this._sources = ArraySet$2.fromArray(sources, true);

  this._absoluteSources = this._sources.toArray().map(function (s) {
    return util.computeSourceURL(sourceRoot, s, aSourceMapURL);
  });

  this.sourceRoot = sourceRoot;
  this.sourcesContent = sourcesContent;
  this._mappings = mappings;
  this._sourceMapURL = aSourceMapURL;
  this.file = file;
}

BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;

/**
 * Utility function to find the index of a source.  Returns -1 if not
 * found.
 */
BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
  var relativeSource = aSource;
  if (this.sourceRoot != null) {
    relativeSource = util.relative(this.sourceRoot, relativeSource);
  }

  if (this._sources.has(relativeSource)) {
    return this._sources.indexOf(relativeSource);
  }

  // Maybe aSource is an absolute URL as returned by |sources|.  In
  // this case we can't simply undo the transform.
  var i;
  for (i = 0; i < this._absoluteSources.length; ++i) {
    if (this._absoluteSources[i] == aSource) {
      return i;
    }
  }

  return -1;
};

/**
 * Create a BasicSourceMapConsumer from a SourceMapGenerator.
 *
 * @param SourceMapGenerator aSourceMap
 *        The source map that will be consumed.
 * @param String aSourceMapURL
 *        The URL at which the source map can be found (optional)
 * @returns BasicSourceMapConsumer
 */
BasicSourceMapConsumer.fromSourceMap =
  function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
    var smc = Object.create(BasicSourceMapConsumer.prototype);

    var names = smc._names = ArraySet$2.fromArray(aSourceMap._names.toArray(), true);
    var sources = smc._sources = ArraySet$2.fromArray(aSourceMap._sources.toArray(), true);
    smc.sourceRoot = aSourceMap._sourceRoot;
    smc.sourcesContent = aSourceMap._generateSourcesContent(smc._sources.toArray(),
                                                            smc.sourceRoot);
    smc.file = aSourceMap._file;
    smc._sourceMapURL = aSourceMapURL;
    smc._absoluteSources = smc._sources.toArray().map(function (s) {
      return util.computeSourceURL(smc.sourceRoot, s, aSourceMapURL);
    });

    // Because we are modifying the entries (by converting string sources and
    // names to indices into the sources and names ArraySets), we have to make
    // a copy of the entry or else bad things happen. Shared mutable state
    // strikes again! See github issue #191.

    var generatedMappings = aSourceMap._mappings.toArray().slice();
    var destGeneratedMappings = smc.__generatedMappings = [];
    var destOriginalMappings = smc.__originalMappings = [];

    for (var i = 0, length = generatedMappings.length; i < length; i++) {
      var srcMapping = generatedMappings[i];
      var destMapping = new Mapping;
      destMapping.generatedLine = srcMapping.generatedLine;
      destMapping.generatedColumn = srcMapping.generatedColumn;

      if (srcMapping.source) {
        destMapping.source = sources.indexOf(srcMapping.source);
        destMapping.originalLine = srcMapping.originalLine;
        destMapping.originalColumn = srcMapping.originalColumn;

        if (srcMapping.name) {
          destMapping.name = names.indexOf(srcMapping.name);
        }

        destOriginalMappings.push(destMapping);
      }

      destGeneratedMappings.push(destMapping);
    }

    quickSort$1(smc.__originalMappings, util.compareByOriginalPositions);

    return smc;
  };

/**
 * The version of the source mapping spec that we are consuming.
 */
BasicSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(BasicSourceMapConsumer.prototype, 'sources', {
  get: function () {
    return this._absoluteSources.slice();
  }
});

/**
 * Provide the JIT with a nice shape / hidden class.
 */
function Mapping() {
  this.generatedLine = 0;
  this.generatedColumn = 0;
  this.source = null;
  this.originalLine = null;
  this.originalColumn = null;
  this.name = null;
}

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
BasicSourceMapConsumer.prototype._parseMappings =
  function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    var generatedLine = 1;
    var previousGeneratedColumn = 0;
    var previousOriginalLine = 0;
    var previousOriginalColumn = 0;
    var previousSource = 0;
    var previousName = 0;
    var length = aStr.length;
    var index = 0;
    var cachedSegments = {};
    var temp = {};
    var originalMappings = [];
    var generatedMappings = [];
    var mapping, str, segment, end, value;

    while (index < length) {
      if (aStr.charAt(index) === ';') {
        generatedLine++;
        index++;
        previousGeneratedColumn = 0;
      }
      else if (aStr.charAt(index) === ',') {
        index++;
      }
      else {
        mapping = new Mapping();
        mapping.generatedLine = generatedLine;

        // Because each offset is encoded relative to the previous one,
        // many segments often have the same encoding. We can exploit this
        // fact by caching the parsed variable length fields of each segment,
        // allowing us to avoid a second parse if we encounter the same
        // segment again.
        for (end = index; end < length; end++) {
          if (this._charIsMappingSeparator(aStr, end)) {
            break;
          }
        }
        str = aStr.slice(index, end);

        segment = cachedSegments[str];
        if (segment) {
          index += str.length;
        } else {
          segment = [];
          while (index < end) {
            base64Vlq.decode(aStr, index, temp);
            value = temp.value;
            index = temp.rest;
            segment.push(value);
          }

          if (segment.length === 2) {
            throw new Error('Found a source, but no line and column');
          }

          if (segment.length === 3) {
            throw new Error('Found a source and line, but no column');
          }

          cachedSegments[str] = segment;
        }

        // Generated column.
        mapping.generatedColumn = previousGeneratedColumn + segment[0];
        previousGeneratedColumn = mapping.generatedColumn;

        if (segment.length > 1) {
          // Original source.
          mapping.source = previousSource + segment[1];
          previousSource += segment[1];

          // Original line.
          mapping.originalLine = previousOriginalLine + segment[2];
          previousOriginalLine = mapping.originalLine;
          // Lines are stored 0-based
          mapping.originalLine += 1;

          // Original column.
          mapping.originalColumn = previousOriginalColumn + segment[3];
          previousOriginalColumn = mapping.originalColumn;

          if (segment.length > 4) {
            // Original name.
            mapping.name = previousName + segment[4];
            previousName += segment[4];
          }
        }

        generatedMappings.push(mapping);
        if (typeof mapping.originalLine === 'number') {
          originalMappings.push(mapping);
        }
      }
    }

    quickSort$1(generatedMappings, util.compareByGeneratedPositionsDeflated);
    this.__generatedMappings = generatedMappings;

    quickSort$1(originalMappings, util.compareByOriginalPositions);
    this.__originalMappings = originalMappings;
  };

/**
 * Find the mapping that best matches the hypothetical "needle" mapping that
 * we are searching for in the given "haystack" of mappings.
 */
BasicSourceMapConsumer.prototype._findMapping =
  function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName,
                                         aColumnName, aComparator, aBias) {
    // To return the position we are searching for, we must first find the
    // mapping for the given position and then return the opposite position it
    // points to. Because the mappings are sorted, we can use binary search to
    // find the best mapping.

    if (aNeedle[aLineName] <= 0) {
      throw new TypeError('Line must be greater than or equal to 1, got '
                          + aNeedle[aLineName]);
    }
    if (aNeedle[aColumnName] < 0) {
      throw new TypeError('Column must be greater than or equal to 0, got '
                          + aNeedle[aColumnName]);
    }

    return binarySearch.search(aNeedle, aMappings, aComparator, aBias);
  };

/**
 * Compute the last column for each generated mapping. The last column is
 * inclusive.
 */
BasicSourceMapConsumer.prototype.computeColumnSpans =
  function SourceMapConsumer_computeColumnSpans() {
    for (var index = 0; index < this._generatedMappings.length; ++index) {
      var mapping = this._generatedMappings[index];

      // Mappings do not contain a field for the last generated columnt. We
      // can come up with an optimistic estimate, however, by assuming that
      // mappings are contiguous (i.e. given two consecutive mappings, the
      // first mapping ends where the second one starts).
      if (index + 1 < this._generatedMappings.length) {
        var nextMapping = this._generatedMappings[index + 1];

        if (mapping.generatedLine === nextMapping.generatedLine) {
          mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
          continue;
        }
      }

      // The last mapping for each line spans the entire line.
      mapping.lastGeneratedColumn = Infinity;
    }
  };

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
BasicSourceMapConsumer.prototype.originalPositionFor =
  function SourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._generatedMappings,
      "generatedLine",
      "generatedColumn",
      util.compareByGeneratedPositionsDeflated,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._generatedMappings[index];

      if (mapping.generatedLine === needle.generatedLine) {
        var source = util.getArg(mapping, 'source', null);
        if (source !== null) {
          source = this._sources.at(source);
          source = util.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
        }
        var name = util.getArg(mapping, 'name', null);
        if (name !== null) {
          name = this._names.at(name);
        }
        return {
          source: source,
          line: util.getArg(mapping, 'originalLine', null),
          column: util.getArg(mapping, 'originalColumn', null),
          name: name
        };
      }
    }

    return {
      source: null,
      line: null,
      column: null,
      name: null
    };
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
BasicSourceMapConsumer.prototype.hasContentsOfAllSources =
  function BasicSourceMapConsumer_hasContentsOfAllSources() {
    if (!this.sourcesContent) {
      return false;
    }
    return this.sourcesContent.length >= this._sources.size() &&
      !this.sourcesContent.some(function (sc) { return sc == null; });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
BasicSourceMapConsumer.prototype.sourceContentFor =
  function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    if (!this.sourcesContent) {
      return null;
    }

    var index = this._findSourceIndex(aSource);
    if (index >= 0) {
      return this.sourcesContent[index];
    }

    var relativeSource = aSource;
    if (this.sourceRoot != null) {
      relativeSource = util.relative(this.sourceRoot, relativeSource);
    }

    var url;
    if (this.sourceRoot != null
        && (url = util.urlParse(this.sourceRoot))) {
      // XXX: file:// URIs and absolute paths lead to unexpected behavior for
      // many users. We can help them out when they expect file:// URIs to
      // behave like it would if they were running a local HTTP server. See
      // https://bugzilla.mozilla.org/show_bug.cgi?id=885597.
      var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
      if (url.scheme == "file"
          && this._sources.has(fileUriAbsPath)) {
        return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)]
      }

      if ((!url.path || url.path == "/")
          && this._sources.has("/" + relativeSource)) {
        return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
      }
    }

    // This function is used recursively from
    // IndexedSourceMapConsumer.prototype.sourceContentFor. In that case, we
    // don't want to throw if we can't find the source - we just want to
    // return null, so we provide a flag to exit gracefully.
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + relativeSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *   - bias: Either 'SourceMapConsumer.GREATEST_LOWER_BOUND' or
 *     'SourceMapConsumer.LEAST_UPPER_BOUND'. Specifies whether to return the
 *     closest element that is smaller than or greater than the one we are
 *     searching for, respectively, if the exact element cannot be found.
 *     Defaults to 'SourceMapConsumer.GREATEST_LOWER_BOUND'.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
BasicSourceMapConsumer.prototype.generatedPositionFor =
  function SourceMapConsumer_generatedPositionFor(aArgs) {
    var source = util.getArg(aArgs, 'source');
    source = this._findSourceIndex(source);
    if (source < 0) {
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    }

    var needle = {
      source: source,
      originalLine: util.getArg(aArgs, 'line'),
      originalColumn: util.getArg(aArgs, 'column')
    };

    var index = this._findMapping(
      needle,
      this._originalMappings,
      "originalLine",
      "originalColumn",
      util.compareByOriginalPositions,
      util.getArg(aArgs, 'bias', SourceMapConsumer.GREATEST_LOWER_BOUND)
    );

    if (index >= 0) {
      var mapping = this._originalMappings[index];

      if (mapping.source === needle.source) {
        return {
          line: util.getArg(mapping, 'generatedLine', null),
          column: util.getArg(mapping, 'generatedColumn', null),
          lastColumn: util.getArg(mapping, 'lastGeneratedColumn', null)
        };
      }
    }

    return {
      line: null,
      column: null,
      lastColumn: null
    };
  };

var BasicSourceMapConsumer_1 = BasicSourceMapConsumer;

/**
 * An IndexedSourceMapConsumer instance represents a parsed source map which
 * we can query for information. It differs from BasicSourceMapConsumer in
 * that it takes "indexed" source maps (i.e. ones with a "sections" field) as
 * input.
 *
 * The first parameter is a raw source map (either as a JSON string, or already
 * parsed to an object). According to the spec for indexed source maps, they
 * have the following attributes:
 *
 *   - version: Which version of the source map spec this map is following.
 *   - file: Optional. The generated file this source map is associated with.
 *   - sections: A list of section definitions.
 *
 * Each value under the "sections" field has two fields:
 *   - offset: The offset into the original specified at which this section
 *       begins to apply, defined as an object with a "line" and "column"
 *       field.
 *   - map: A source map definition. This source map could also be indexed,
 *       but doesn't have to be.
 *
 * Instead of the "map" field, it's also possible to have a "url" field
 * specifying a URL to retrieve a source map from, but that's currently
 * unsupported.
 *
 * Here's an example source map, taken from the source map spec[0], but
 * modified to omit a section which uses the "url" field.
 *
 *  {
 *    version : 3,
 *    file: "app.js",
 *    sections: [{
 *      offset: {line:100, column:10},
 *      map: {
 *        version : 3,
 *        file: "section.js",
 *        sources: ["foo.js", "bar.js"],
 *        names: ["src", "maps", "are", "fun"],
 *        mappings: "AAAA,E;;ABCDE;"
 *      }
 *    }],
 *  }
 *
 * The second parameter, if given, is a string whose value is the URL
 * at which the source map was found.  This URL is used to compute the
 * sources array.
 *
 * [0]: https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit#heading=h.535es3xeprgt
 */
function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
  var sourceMap = aSourceMap;
  if (typeof aSourceMap === 'string') {
    sourceMap = util.parseSourceMapInput(aSourceMap);
  }

  var version = util.getArg(sourceMap, 'version');
  var sections = util.getArg(sourceMap, 'sections');

  if (version != this._version) {
    throw new Error('Unsupported version: ' + version);
  }

  this._sources = new ArraySet$2();
  this._names = new ArraySet$2();

  var lastOffset = {
    line: -1,
    column: 0
  };
  this._sections = sections.map(function (s) {
    if (s.url) {
      // The url field will require support for asynchronicity.
      // See https://github.com/mozilla/source-map/issues/16
      throw new Error('Support for url field in sections not implemented.');
    }
    var offset = util.getArg(s, 'offset');
    var offsetLine = util.getArg(offset, 'line');
    var offsetColumn = util.getArg(offset, 'column');

    if (offsetLine < lastOffset.line ||
        (offsetLine === lastOffset.line && offsetColumn < lastOffset.column)) {
      throw new Error('Section offsets must be ordered and non-overlapping.');
    }
    lastOffset = offset;

    return {
      generatedOffset: {
        // The offset fields are 0-based, but we use 1-based indices when
        // encoding/decoding from VLQ.
        generatedLine: offsetLine + 1,
        generatedColumn: offsetColumn + 1
      },
      consumer: new SourceMapConsumer(util.getArg(s, 'map'), aSourceMapURL)
    }
  });
}

IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;

/**
 * The version of the source mapping spec that we are consuming.
 */
IndexedSourceMapConsumer.prototype._version = 3;

/**
 * The list of original sources.
 */
Object.defineProperty(IndexedSourceMapConsumer.prototype, 'sources', {
  get: function () {
    var sources = [];
    for (var i = 0; i < this._sections.length; i++) {
      for (var j = 0; j < this._sections[i].consumer.sources.length; j++) {
        sources.push(this._sections[i].consumer.sources[j]);
      }
    }
    return sources;
  }
});

/**
 * Returns the original source, line, and column information for the generated
 * source's line and column positions provided. The only argument is an object
 * with the following properties:
 *
 *   - line: The line number in the generated source.  The line number
 *     is 1-based.
 *   - column: The column number in the generated source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - source: The original source file, or null.
 *   - line: The line number in the original source, or null.  The
 *     line number is 1-based.
 *   - column: The column number in the original source, or null.  The
 *     column number is 0-based.
 *   - name: The original identifier, or null.
 */
IndexedSourceMapConsumer.prototype.originalPositionFor =
  function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
    var needle = {
      generatedLine: util.getArg(aArgs, 'line'),
      generatedColumn: util.getArg(aArgs, 'column')
    };

    // Find the section containing the generated position we're trying to map
    // to an original position.
    var sectionIndex = binarySearch.search(needle, this._sections,
      function(needle, section) {
        var cmp = needle.generatedLine - section.generatedOffset.generatedLine;
        if (cmp) {
          return cmp;
        }

        return (needle.generatedColumn -
                section.generatedOffset.generatedColumn);
      });
    var section = this._sections[sectionIndex];

    if (!section) {
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    }

    return section.consumer.originalPositionFor({
      line: needle.generatedLine -
        (section.generatedOffset.generatedLine - 1),
      column: needle.generatedColumn -
        (section.generatedOffset.generatedLine === needle.generatedLine
         ? section.generatedOffset.generatedColumn - 1
         : 0),
      bias: aArgs.bias
    });
  };

/**
 * Return true if we have the source content for every source in the source
 * map, false otherwise.
 */
IndexedSourceMapConsumer.prototype.hasContentsOfAllSources =
  function IndexedSourceMapConsumer_hasContentsOfAllSources() {
    return this._sections.every(function (s) {
      return s.consumer.hasContentsOfAllSources();
    });
  };

/**
 * Returns the original source content. The only argument is the url of the
 * original source file. Returns null if no original source content is
 * available.
 */
IndexedSourceMapConsumer.prototype.sourceContentFor =
  function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      var content = section.consumer.sourceContentFor(aSource, true);
      if (content) {
        return content;
      }
    }
    if (nullOnMissing) {
      return null;
    }
    else {
      throw new Error('"' + aSource + '" is not in the SourceMap.');
    }
  };

/**
 * Returns the generated line and column information for the original source,
 * line, and column positions provided. The only argument is an object with
 * the following properties:
 *
 *   - source: The filename of the original source.
 *   - line: The line number in the original source.  The line number
 *     is 1-based.
 *   - column: The column number in the original source.  The column
 *     number is 0-based.
 *
 * and an object is returned with the following properties:
 *
 *   - line: The line number in the generated source, or null.  The
 *     line number is 1-based. 
 *   - column: The column number in the generated source, or null.
 *     The column number is 0-based.
 */
IndexedSourceMapConsumer.prototype.generatedPositionFor =
  function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];

      // Only consider this section if the requested source is in the list of
      // sources of the consumer.
      if (section.consumer._findSourceIndex(util.getArg(aArgs, 'source')) === -1) {
        continue;
      }
      var generatedPosition = section.consumer.generatedPositionFor(aArgs);
      if (generatedPosition) {
        var ret = {
          line: generatedPosition.line +
            (section.generatedOffset.generatedLine - 1),
          column: generatedPosition.column +
            (section.generatedOffset.generatedLine === generatedPosition.line
             ? section.generatedOffset.generatedColumn - 1
             : 0)
        };
        return ret;
      }
    }

    return {
      line: null,
      column: null
    };
  };

/**
 * Parse the mappings in a string in to a data structure which we can easily
 * query (the ordered arrays in the `this.__generatedMappings` and
 * `this.__originalMappings` properties).
 */
IndexedSourceMapConsumer.prototype._parseMappings =
  function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
    this.__generatedMappings = [];
    this.__originalMappings = [];
    for (var i = 0; i < this._sections.length; i++) {
      var section = this._sections[i];
      var sectionMappings = section.consumer._generatedMappings;
      for (var j = 0; j < sectionMappings.length; j++) {
        var mapping = sectionMappings[j];

        var source = section.consumer._sources.at(mapping.source);
        source = util.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
        this._sources.add(source);
        source = this._sources.indexOf(source);

        var name = null;
        if (mapping.name) {
          name = section.consumer._names.at(mapping.name);
          this._names.add(name);
          name = this._names.indexOf(name);
        }

        // The mappings coming from the consumer for the section have
        // generated positions relative to the start of the section, so we
        // need to offset them to be relative to the start of the concatenated
        // generated file.
        var adjustedMapping = {
          source: source,
          generatedLine: mapping.generatedLine +
            (section.generatedOffset.generatedLine - 1),
          generatedColumn: mapping.generatedColumn +
            (section.generatedOffset.generatedLine === mapping.generatedLine
            ? section.generatedOffset.generatedColumn - 1
            : 0),
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: name
        };

        this.__generatedMappings.push(adjustedMapping);
        if (typeof adjustedMapping.originalLine === 'number') {
          this.__originalMappings.push(adjustedMapping);
        }
      }
    }

    quickSort$1(this.__generatedMappings, util.compareByGeneratedPositionsDeflated);
    quickSort$1(this.__originalMappings, util.compareByOriginalPositions);
  };

var IndexedSourceMapConsumer_1 = IndexedSourceMapConsumer;

var sourceMapConsumer = {
	SourceMapConsumer: SourceMapConsumer_1,
	BasicSourceMapConsumer: BasicSourceMapConsumer_1,
	IndexedSourceMapConsumer: IndexedSourceMapConsumer_1
};

var SourceMapConsumer$1 = sourceMapConsumer.SourceMapConsumer;

// tslint:disable:no-conditional-assignment
class ErrorMapper {
    static get consumer() {
        if (this._consumer == null) {
            this._consumer = new SourceMapConsumer$1(require("main.js.map"));
        }
        return this._consumer;
    }
    /**
     * Generates a stack trace using a source map generate original symbol names.
     *
     * WARNING - EXTREMELY high CPU cost for first call after reset - >30 CPU! Use sparingly!
     * (Consecutive calls after a reset are more reasonable, ~0.1 CPU/ea)
     *
     * @param {Error | string} error The error or original stack trace
     * @returns {string} The source-mapped stack trace
     */
    static sourceMappedStackTrace(error) {
        const stack = error instanceof Error ? error.stack : error;
        if (this.cache.hasOwnProperty(stack)) {
            return this.cache[stack];
        }
        const re = /^\s+at\s+(.+?\s+)?\(?([0-z._\-\\\/]+):(\d+):(\d+)\)?$/gm;
        let match;
        let outStack = error.toString();
        while ((match = re.exec(stack))) {
            if (match[2] === "main") {
                const pos = this.consumer.originalPositionFor({
                    column: parseInt(match[4], 10),
                    line: parseInt(match[3], 10)
                });
                if (pos.line != null) {
                    if (pos.name) {
                        outStack += `\n    at ${pos.name} (${pos.source}:${pos.line}:${pos.column})`;
                    }
                    else {
                        if (match[1]) {
                            // no original source file name known - use file name from given trace
                            outStack += `\n    at ${match[1]} (${pos.source}:${pos.line}:${pos.column})`;
                        }
                        else {
                            // no original source file name known or in given trace - omit name
                            outStack += `\n    at ${pos.source}:${pos.line}:${pos.column}`;
                        }
                    }
                }
                else {
                    // no known position
                    break;
                }
            }
            else {
                // no more parseable lines
                break;
            }
        }
        this.cache[stack] = outStack;
        return outStack;
    }
    static wrapLoop(loop) {
        return () => {
            try {
                loop();
            }
            catch (e) {
                if (e instanceof Error) {
                    if ("sim" in Game.rooms) {
                        const message = `Source maps don't work in the simulator - displaying original error`;
                        console.log(`<span style='color:red'>${message}<br>${_.escape(e.stack)}</span>`);
                    }
                    else {
                        console.log(`<span style='color:red'>${_.escape(this.sourceMappedStackTrace(e))}</span>`);
                    }
                }
                else {
                    // can't handle it
                    throw e;
                }
            }
        };
    }
}
// Cache previously mapped traces to improve performance
ErrorMapper.cache = {};

class Traveler {
    /**
     * move creep to destination
     * @param creep
     * @param destination
     * @param options
     * @returns {number}
     */
    static travelTo(creep, destination, options = {}) {
        // uncomment if you would like to register hostile rooms entered
        // this.updateRoomStatus(creep.room);
        if (!destination) {
            return ERR_INVALID_ARGS;
        }
        if (creep.fatigue > 0) {
            Traveler.circle(creep.pos, "aqua", .3);
            return ERR_TIRED;
        }
        destination = this.normalizePos(destination);
        // manage case where creep is nearby destination
        let rangeToDestination = creep.pos.getRangeTo(destination);
        if (options.range && rangeToDestination <= options.range) {
            return OK;
        }
        else if (rangeToDestination <= 1) {
            if (rangeToDestination === 1 && !options.range) {
                let direction = creep.pos.getDirectionTo(destination);
                if (options.returnData) {
                    options.returnData.nextPos = destination;
                    options.returnData.path = direction.toString();
                }
                return creep.move(direction);
            }
            return OK;
        }
        // initialize data object
        if (!creep.memory._trav) {
            delete creep.memory._travel;
            creep.memory._trav = {};
        }
        let travelData = creep.memory._trav;
        let state = this.deserializeState(travelData, destination);
        // uncomment to visualize destination
        // this.circle(destination.pos, "orange");
        // check if creep is stuck
        if (this.isStuck(creep, state)) {
            state.stuckCount++;
            Traveler.circle(creep.pos, "magenta", state.stuckCount * .2);
        }
        else {
            state.stuckCount = 0;
        }
        // handle case where creep is stuck
        if (!options.stuckValue) {
            options.stuckValue = DEFAULT_STUCK_VALUE;
        }
        if (state.stuckCount >= options.stuckValue && Math.random() > .5) {
            options.ignoreCreeps = false;
            options.freshMatrix = true;
            delete travelData.path;
        }
        // TODO:handle case where creep moved by some other function, but destination is still the same
        // delete path cache if destination is different
        if (!this.samePos(state.destination, destination)) {
            if (options.movingTarget && state.destination.isNearTo(destination)) {
                travelData.path += state.destination.getDirectionTo(destination);
                state.destination = destination;
            }
            else {
                delete travelData.path;
            }
        }
        if (options.repath && Math.random() < options.repath) {
            // add some chance that you will find a new path randomly
            delete travelData.path;
        }
        // pathfinding
        let newPath = false;
        if (!travelData.path) {
            newPath = true;
            if (creep.spawning) {
                return ERR_BUSY;
            }
            state.destination = destination;
            let cpu = Game.cpu.getUsed();
            let ret = this.findTravelPath(creep.pos, destination, options);
            let cpuUsed = Game.cpu.getUsed() - cpu;
            state.cpu = _.round(cpuUsed + state.cpu);
            if (state.cpu > REPORT_CPU_THRESHOLD) {
                // see note at end of file for more info on this
                console.log(`TRAVELER: heavy cpu use: ${creep.name}, cpu: ${state.cpu} origin: ${creep.pos}, dest: ${destination}`);
            }
            let color = "orange";
            if (ret.incomplete) {
                // uncommenting this is a great way to diagnose creep behavior issues
                // console.log(`TRAVELER: incomplete path for ${creep.name}`);
                color = "red";
            }
            if (options.returnData) {
                options.returnData.pathfinderReturn = ret;
            }
            travelData.path = Traveler.serializePath(creep.pos, ret.path, color);
            state.stuckCount = 0;
        }
        this.serializeState(creep, destination, state, travelData);
        if (!travelData.path || travelData.path.length === 0) {
            return ERR_NO_PATH;
        }
        // consume path
        if (state.stuckCount === 0 && !newPath) {
            travelData.path = travelData.path.substr(1);
        }
        let nextDirection = parseInt(travelData.path[0], 10);
        if (options.returnData) {
            if (nextDirection) {
                let nextPos = Traveler.positionAtDirection(creep.pos, nextDirection);
                if (nextPos) {
                    options.returnData.nextPos = nextPos;
                }
            }
            options.returnData.state = state;
            options.returnData.path = travelData.path;
        }
        return creep.move(nextDirection);
    }
    /**
     * make position objects consistent so that either can be used as an argument
     * @param destination
     * @returns {any}
     */
    static normalizePos(destination) {
        if (!(destination instanceof RoomPosition)) {
            return destination.pos;
        }
        return destination;
    }
    /**
     * check if room should be avoided by findRoute algorithm
     * @param roomName
     * @returns {RoomMemory|number}
     */
    static checkAvoid(roomName) {
        return Memory.rooms && Memory.rooms[roomName] && Memory.rooms[roomName].avoid;
    }
    /**
     * check if a position is an exit
     * @param pos
     * @returns {boolean}
     */
    static isExit(pos) {
        return pos.x === 0 || pos.y === 0 || pos.x === 49 || pos.y === 49;
    }
    /**
     * check two coordinates match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
    static sameCoord(pos1, pos2) {
        return pos1.x === pos2.x && pos1.y === pos2.y;
    }
    /**
     * check if two positions match
     * @param pos1
     * @param pos2
     * @returns {boolean}
     */
    static samePos(pos1, pos2) {
        return this.sameCoord(pos1, pos2) && pos1.roomName === pos2.roomName;
    }
    /**
     * draw a circle at position
     * @param pos
     * @param color
     * @param opacity
     */
    static circle(pos, color, opacity) {
        new RoomVisual(pos.roomName).circle(pos, {
            radius: .45, fill: "transparent", stroke: color, strokeWidth: .15, opacity: opacity
        });
    }
    /**
     * update memory on whether a room should be avoided based on controller owner
     * @param room
     */
    static updateRoomStatus(room) {
        if (!room) {
            return;
        }
        if (room.controller) {
            if (room.controller.owner && !room.controller.my) {
                room.memory.avoid = 1;
            }
            else {
                delete room.memory.avoid;
            }
        }
    }
    /**
     * find a path from origin to destination
     * @param origin
     * @param destination
     * @param options
     * @returns {PathfinderReturn}
     */
    static findTravelPath(origin, destination, options = {}) {
        _.defaults(options, {
            ignoreCreeps: true,
            maxOps: DEFAULT_MAXOPS,
            range: 1,
        });
        if (options.movingTarget) {
            options.range = 0;
        }
        origin = this.normalizePos(origin);
        destination = this.normalizePos(destination);
        let originRoomName = origin.roomName;
        let destRoomName = destination.roomName;
        // check to see whether findRoute should be used
        let roomDistance = Game.map.getRoomLinearDistance(origin.roomName, destination.roomName);
        let allowedRooms = options.route;
        if (!allowedRooms && (options.useFindRoute || (options.useFindRoute === undefined && roomDistance > 2))) {
            let route = this.findRoute(origin.roomName, destination.roomName, options);
            if (route) {
                allowedRooms = route;
            }
        }
        let callback = (roomName) => {
            if (allowedRooms) {
                if (!allowedRooms[roomName]) {
                    return false;
                }
            }
            else if (!options.allowHostile && Traveler.checkAvoid(roomName)
                && roomName !== destRoomName && roomName !== originRoomName) {
                return false;
            }
            let matrix;
            let room = Game.rooms[roomName];
            if (room) {
                if (options.ignoreStructures) {
                    matrix = new PathFinder.CostMatrix();
                    if (!options.ignoreCreeps) {
                        Traveler.addCreepsToMatrix(room, matrix);
                    }
                }
                else if (options.ignoreCreeps || roomName !== originRoomName) {
                    matrix = this.getStructureMatrix(room, options.freshMatrix);
                }
                else {
                    matrix = this.getCreepMatrix(room);
                }
                if (options.obstacles) {
                    matrix = matrix.clone();
                    for (let obstacle of options.obstacles) {
                        if (obstacle.pos.roomName !== roomName) {
                            continue;
                        }
                        matrix.set(obstacle.pos.x, obstacle.pos.y, 0xff);
                    }
                }
            }
            if (options.roomCallback) {
                if (!matrix) {
                    matrix = new PathFinder.CostMatrix();
                }
                let outcome = options.roomCallback(roomName, matrix.clone());
                if (outcome !== undefined) {
                    return outcome;
                }
            }
            return matrix;
        };
        let ret = PathFinder.search(origin, { pos: destination, range: options.range }, {
            maxOps: options.maxOps,
            maxRooms: options.maxRooms,
            plainCost: options.offRoad ? 1 : options.ignoreRoads ? 1 : 2,
            swampCost: options.offRoad ? 1 : options.ignoreRoads ? 5 : 10,
            roomCallback: callback,
        });
        if (ret.incomplete && options.ensurePath) {
            if (options.useFindRoute === undefined) {
                // handle case where pathfinder failed at a short distance due to not using findRoute
                // can happen for situations where the creep would have to take an uncommonly indirect path
                // options.allowedRooms and options.routeCallback can also be used to handle this situation
                if (roomDistance <= 2) {
                    console.log(`TRAVELER: path failed without findroute, trying with options.useFindRoute = true`);
                    console.log(`from: ${origin}, destination: ${destination}`);
                    options.useFindRoute = true;
                    ret = this.findTravelPath(origin, destination, options);
                    console.log(`TRAVELER: second attempt was ${ret.incomplete ? "not " : ""}successful`);
                    return ret;
                }
                // TODO: handle case where a wall or some other obstacle is blocking the exit assumed by findRoute
            }
        }
        return ret;
    }
    /**
     * find a viable sequence of rooms that can be used to narrow down pathfinder's search algorithm
     * @param origin
     * @param destination
     * @param options
     * @returns {{}}
     */
    static findRoute(origin, destination, options = {}) {
        let restrictDistance = options.restrictDistance || Game.map.getRoomLinearDistance(origin, destination) + 10;
        let allowedRooms = { [origin]: true, [destination]: true };
        let highwayBias = 1;
        if (options.preferHighway) {
            highwayBias = 2.5;
            if (options.highwayBias) {
                highwayBias = options.highwayBias;
            }
        }
        let ret = Game.map.findRoute(origin, destination, {
            routeCallback: (roomName) => {
                if (options.routeCallback) {
                    let outcome = options.routeCallback(roomName);
                    if (outcome !== undefined) {
                        return outcome;
                    }
                }
                let rangeToRoom = Game.map.getRoomLinearDistance(origin, roomName);
                if (rangeToRoom > restrictDistance) {
                    // room is too far out of the way
                    return Number.POSITIVE_INFINITY;
                }
                if (!options.allowHostile && Traveler.checkAvoid(roomName) &&
                    roomName !== destination && roomName !== origin) {
                    // room is marked as "avoid" in room memory
                    return Number.POSITIVE_INFINITY;
                }
                let parsed;
                if (options.preferHighway) {
                    parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    let isHighway = (parsed[1] % 10 === 0) || (parsed[2] % 10 === 0);
                    if (isHighway) {
                        return 1;
                    }
                }
                // SK rooms are avoided when there is no vision in the room, harvested-from SK rooms are allowed
                if (!options.allowSK && !Game.rooms[roomName]) {
                    if (!parsed) {
                        parsed = /^[WE]([0-9]+)[NS]([0-9]+)$/.exec(roomName);
                    }
                    let fMod = parsed[1] % 10;
                    let sMod = parsed[2] % 10;
                    let isSK = !(fMod === 5 && sMod === 5) &&
                        ((fMod >= 4) && (fMod <= 6)) &&
                        ((sMod >= 4) && (sMod <= 6));
                    if (isSK) {
                        return 10 * highwayBias;
                    }
                }
                return highwayBias;
            },
        });
        if (!_.isArray(ret)) {
            console.log(`couldn't findRoute to ${destination}`);
            return;
        }
        for (let value of ret) {
            allowedRooms[value.room] = true;
        }
        return allowedRooms;
    }
    /**
     * check how many rooms were included in a route returned by findRoute
     * @param origin
     * @param destination
     * @returns {number}
     */
    static routeDistance(origin, destination) {
        let linearDistance = Game.map.getRoomLinearDistance(origin, destination);
        if (linearDistance >= 32) {
            return linearDistance;
        }
        let allowedRooms = this.findRoute(origin, destination);
        if (allowedRooms) {
            return Object.keys(allowedRooms).length;
        }
    }
    /**
     * build a cost matrix based on structures in the room. Will be cached for more than one tick. Requires vision.
     * @param room
     * @param freshMatrix
     * @returns {any}
     */
    static getStructureMatrix(room, freshMatrix) {
        if (!this.structureMatrixCache[room.name] || (freshMatrix && Game.time !== this.structureMatrixTick)) {
            this.structureMatrixTick = Game.time;
            let matrix = new PathFinder.CostMatrix();
            this.structureMatrixCache[room.name] = Traveler.addStructuresToMatrix(room, matrix, 1);
        }
        return this.structureMatrixCache[room.name];
    }
    /**
     * build a cost matrix based on creeps and structures in the room. Will be cached for one tick. Requires vision.
     * @param room
     * @returns {any}
     */
    static getCreepMatrix(room) {
        if (!this.creepMatrixCache[room.name] || Game.time !== this.creepMatrixTick) {
            this.creepMatrixTick = Game.time;
            this.creepMatrixCache[room.name] = Traveler.addCreepsToMatrix(room, this.getStructureMatrix(room, true).clone());
        }
        return this.creepMatrixCache[room.name];
    }
    /**
     * add structures to matrix so that impassible structures can be avoided and roads given a lower cost
     * @param room
     * @param matrix
     * @param roadCost
     * @returns {CostMatrix}
     */
    static addStructuresToMatrix(room, matrix, roadCost) {
        let impassibleStructures = [];
        for (let structure of room.find(FIND_STRUCTURES)) {
            if (structure instanceof StructureRampart) {
                if (!structure.my && !structure.isPublic) {
                    impassibleStructures.push(structure);
                }
            }
            else if (structure instanceof StructureRoad) {
                matrix.set(structure.pos.x, structure.pos.y, roadCost);
            }
            else if (structure instanceof StructureContainer) {
                matrix.set(structure.pos.x, structure.pos.y, 5);
            }
            else {
                impassibleStructures.push(structure);
            }
        }
        for (let site of room.find(FIND_MY_CONSTRUCTION_SITES)) {
            if (site.structureType === STRUCTURE_CONTAINER || site.structureType === STRUCTURE_ROAD
                || site.structureType === STRUCTURE_RAMPART) {
                continue;
            }
            matrix.set(site.pos.x, site.pos.y, 0xff);
        }
        for (let structure of impassibleStructures) {
            matrix.set(structure.pos.x, structure.pos.y, 0xff);
        }
        return matrix;
    }
    /**
     * add creeps to matrix so that they will be avoided by other creeps
     * @param room
     * @param matrix
     * @returns {CostMatrix}
     */
    static addCreepsToMatrix(room, matrix) {
        room.find(FIND_CREEPS).forEach((creep) => matrix.set(creep.pos.x, creep.pos.y, 0xff));
        return matrix;
    }
    /**
     * serialize a path, traveler style. Returns a string of directions.
     * @param startPos
     * @param path
     * @param color
     * @returns {string}
     */
    static serializePath(startPos, path, color = "orange") {
        let serializedPath = "";
        let lastPosition = startPos;
        this.circle(startPos, color);
        for (let position of path) {
            if (position.roomName === lastPosition.roomName) {
                new RoomVisual(position.roomName)
                    .line(position, lastPosition, { color: color, lineStyle: "dashed" });
                serializedPath += lastPosition.getDirectionTo(position);
            }
            lastPosition = position;
        }
        return serializedPath;
    }
    /**
     * returns a position at a direction relative to origin
     * @param origin
     * @param direction
     * @returns {RoomPosition}
     */
    static positionAtDirection(origin, direction) {
        let offsetX = [0, 0, 1, 1, 1, 0, -1, -1, -1];
        let offsetY = [0, -1, -1, 0, 1, 1, 1, 0, -1];
        let x = origin.x + offsetX[direction];
        let y = origin.y + offsetY[direction];
        if (x > 49 || x < 0 || y > 49 || y < 0) {
            return;
        }
        return new RoomPosition(x, y, origin.roomName);
    }
    /**
     * convert room avoidance memory from the old pattern to the one currently used
     * @param cleanup
     */
    static patchMemory(cleanup = false) {
        if (!Memory.empire) {
            return;
        }
        if (!Memory.empire.hostileRooms) {
            return;
        }
        let count = 0;
        for (let roomName in Memory.empire.hostileRooms) {
            if (Memory.empire.hostileRooms[roomName]) {
                if (!Memory.rooms[roomName]) {
                    Memory.rooms[roomName] = {};
                }
                Memory.rooms[roomName].avoid = 1;
                count++;
            }
            if (cleanup) {
                delete Memory.empire.hostileRooms[roomName];
            }
        }
        if (cleanup) {
            delete Memory.empire.hostileRooms;
        }
        console.log(`TRAVELER: room avoidance data patched for ${count} rooms`);
    }
    static deserializeState(travelData, destination) {
        let state = {};
        if (travelData.state) {
            state.lastCoord = { x: travelData.state[STATE_PREV_X], y: travelData.state[STATE_PREV_Y] };
            state.cpu = travelData.state[STATE_CPU];
            state.stuckCount = travelData.state[STATE_STUCK];
            state.destination = new RoomPosition(travelData.state[STATE_DEST_X], travelData.state[STATE_DEST_Y], travelData.state[STATE_DEST_ROOMNAME]);
        }
        else {
            state.cpu = 0;
            state.destination = destination;
        }
        return state;
    }
    static serializeState(creep, destination, state, travelData) {
        travelData.state = [creep.pos.x, creep.pos.y, state.stuckCount, state.cpu, destination.x, destination.y,
            destination.roomName];
    }
    static isStuck(creep, state) {
        let stuck = false;
        if (state.lastCoord !== undefined) {
            if (this.sameCoord(creep.pos, state.lastCoord)) {
                // didn't move
                stuck = true;
            }
            else if (this.isExit(creep.pos) && this.isExit(state.lastCoord)) {
                // moved against exit
                stuck = true;
            }
        }
        return stuck;
    }
}
Traveler.structureMatrixCache = {};
Traveler.creepMatrixCache = {};
// this might be higher than you wish, setting it lower is a great way to diagnose creep behavior issues. When creeps
// need to repath to often or they aren't finding valid paths, it can sometimes point to problems elsewhere in your code
const REPORT_CPU_THRESHOLD = 1000;
const DEFAULT_MAXOPS = 20000;
const DEFAULT_STUCK_VALUE = 2;
const STATE_PREV_X = 0;
const STATE_PREV_Y = 1;
const STATE_STUCK = 2;
const STATE_CPU = 3;
const STATE_DEST_X = 4;
const STATE_DEST_Y = 5;
const STATE_DEST_ROOMNAME = 6;
// assigns a function to Creep.prototype: creep.travelTo(destination)
Creep.prototype.travelTo = function (destination, options) {
    return Traveler.travelTo(this, destination, options);
};

class Command {
    static run() {
        let hasPoorFlag = false;
        let hasDismantleFlag = false;
        let hasHaulFlag = false;
        let hasSpawn = false;
        for (const flagName in Game.flags) {
            if (Game.flags.hasOwnProperty(flagName)) {
                const flag = Game.flags[flagName];
                if (flag.name == 'diamantle') {
                    hasDismantleFlag = true;
                    let smallestName, smallestRange = 999;
                    for (const spawnName in Game.spawns) {
                        const spawn = Game.spawns[spawnName];
                        if (spawn.pos.getRoomRangeTo(flag.pos) < smallestRange) {
                            smallestName = spawn.room.name;
                            smallestRange = spawn.pos.getRoomRangeTo(flag.pos);
                        }
                    }
                    Memory.dismantlerRoom = smallestName;
                }
                if (flag.name == 'haul') {
                    hasHaulFlag = true;
                    let smallestName, smallestRange = 999;
                    for (const spawnName in Game.spawns) {
                        const spawn = Game.spawns[spawnName];
                        if (spawn.pos.getRoomRangeTo(flag.pos) < smallestRange) {
                            smallestName = spawn.room.name;
                            smallestRange = spawn.pos.getRoomRangeTo(flag.pos);
                        }
                    }
                    Memory.haulerRoom = smallestName;
                }
                if (flag.name.match('colony')) {
                    let roomName = flag.name.split('_')[1];
                    let targetName = flag.name.split('_')[2];
                    if (Memory.colonies[roomName]) {
                        let isExist = false;
                        for (const c of Memory.colonies[roomName]) {
                            if (c.name == targetName)
                                isExist = true;
                        }
                        if (!isExist)
                            Memory.colonies[roomName].push({ name: targetName, controller: '' });
                    }
                }
                if (flag.name.match('poor')) {
                    Memory.poorRoom = flag.name.split('_')[1];
                    hasPoorFlag = true;
                    continue;
                }
                if (flag.name.match('spawn')) {
                    Memory.spawnRoom = flag.name.split('_')[1];
                    hasSpawn = true;
                    let smallestName, smallestRange = 999;
                    for (const spawnName in Game.spawns) {
                        const spawn = Game.spawns[spawnName];
                        if (spawn.pos.getRoomRangeTo(flag.pos) < smallestRange) {
                            smallestName = spawn.room.name;
                            smallestRange = spawn.pos.getRoomRangeTo(flag.pos);
                        }
                    }
                    Memory.expandRoom = smallestName;
                    continue;
                }
                if (!flag.room)
                    continue;
                if (flag.name.match('trader')) {
                    if (!Memory.rooms[flag.room.name])
                        return;
                    Memory.rooms[flag.room.name].traderPos = flag.pos;
                    continue;
                }
                if (flag.name.match('stable')) {
                    if (!Memory.rooms[flag.room.name])
                        return;
                    Memory.rooms[flag.room.name].stableTransporterPos = flag.pos;
                    continue;
                }
            }
        }
        if (!hasPoorFlag)
            delete Memory.poorRoom;
        if (!hasSpawn) {
            delete Memory.spawnRoom;
            delete Memory.expandRoom;
        }
        if (!hasDismantleFlag) {
            Memory.gotoDismantle = true;
            delete Memory.dismantlerRoom;
        }
        if (!hasHaulFlag) {
            Memory.gotoHaul = true;
            delete Memory.haulerRoom;
        }
    }
    static checkRoomEnvirounment(room) {
        for (const name in Game.flags) {
            const flag = Game.flags[name];
            if (!flag.room)
                continue;
            if (flag.room.name != room.name)
                continue;
            if (flag.name.match('filler')) {
                room.memory.fillerIdlePos = flag.pos;
            }
            if (flag.name.match('idle')) {
                room.memory.lowEnergyIdlePos = flag.pos;
            }
        }
        if (!room.memory.fillerIdlePos || !room.memory.lowEnergyIdlePos)
            return false;
        return true;
    }
}

// This is a modified version of screeps-profiler taken from https://github.com/samogot/screeps-profiler


let usedOnStart = 0;
let enabled = false;
let depth = 0;
let parentFn = '(tick)';

function AlreadyWrappedError() {
    this.name = 'AlreadyWrappedError';
    this.message = 'Error attempted to double wrap a function.';
    this.stack = ((new Error())).stack;
}

function setupProfiler() {
    depth = 0; // reset depth, this needs to be done each tick.
    parentFn = '(tick)';
    Game.profiler = {
        stream(duration, filter) {
            setupMemory('stream', duration || 10, filter);
        },
        email(duration, filter) {
            setupMemory('email', duration || 100, filter);
        },
        profile(duration, filter) {
            setupMemory('profile', duration || 100, filter);
        },
        background(filter) {
            setupMemory('background', false, filter);
        },
        callgrind() {
            const id = `id${Math.random()}`;
            /* eslint-disable */
            const download = `
<script>
  var element = document.getElementById('${id}');
  if (!element) {
    element = document.createElement('a');
    element.setAttribute('id', '${id}');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,${encodeURIComponent(Profiler.callgrind())}');
    element.setAttribute('download', 'callgrind.out.${Game.time}');
  
    element.style.display = 'none';
    document.body.appendChild(element);
  
    element.click();
  }
</script>
      `;
            /* eslint-enable */
            console.log(download.split('\n').map((s) => s.trim()).join(''));
        },
        restart() {
            if (Profiler.isProfiling()) {
                const filter = Memory.profiler.filter;
                let duration = false;
                if (!!Memory.profiler.disableTick) {
                    // Calculate the original duration, profile is enabled on the tick after the first call,
                    // so add 1.
                    duration = Memory.profiler.disableTick - Memory.profiler.enabledTick + 1;
                }
                const type = Memory.profiler.type;
                setupMemory(type, duration, filter);
            }
        },
        reset: resetMemory,
        output: Profiler.output,
    };

    overloadCPUCalc();
}

function setupMemory(profileType, duration, filter) {
    resetMemory();
    const disableTick = Number.isInteger(duration) ? Game.time + duration : false;
    if (!Memory.profiler) {
        Memory.profiler = {
            map: {},
            totalTime: 0,
            enabledTick: Game.time + 1,
            disableTick,
            type: profileType,
            filter,
        };
    }
}

function resetMemory() {
    Memory.profiler = null;
}

function overloadCPUCalc() {
    if (Game.rooms.sim) {
        usedOnStart = 0; // This needs to be reset, but only in the sim.
        Game.cpu.getUsed = function getUsed() {
            return performance.now() - usedOnStart;
        };
    }
}

function getFilter() {
    return Memory.profiler.filter;
}

const functionBlackList = [
    'getUsed', // Let's avoid wrapping this... may lead to recursion issues and should be inexpensive.
    'constructor', // es6 class constructors need to be called with `new`
];

const commonProperties = ['length', 'name', 'arguments', 'caller', 'prototype'];

function wrapFunction(name, originalFunction) {
    if (originalFunction.profilerWrapped) {
        throw new AlreadyWrappedError();
    }

    function wrappedFunction() {
        if (Profiler.isProfiling()) {
            const nameMatchesFilter = name === getFilter();
            const start = Game.cpu.getUsed();
            if (nameMatchesFilter) {
                depth++;
            }
            const curParent = parentFn;
            parentFn = name;
            let result;
            if (this && this.constructor === wrappedFunction) {
                // eslint-disable-next-line new-cap
                result = new originalFunction(...arguments);
            } else {
                result = originalFunction.apply(this, arguments);
            }
            parentFn = curParent;
            if (depth > 0 || !getFilter()) {
                const end = Game.cpu.getUsed();
                Profiler.record(name, end - start, parentFn);
            }
            if (nameMatchesFilter) {
                depth--;
            }
            return result;
        }

        if (this && this.constructor === wrappedFunction) {
            // eslint-disable-next-line new-cap
            return new originalFunction(...arguments);
        }
        return originalFunction.apply(this, arguments);
    }

    wrappedFunction.profilerWrapped = true;
    wrappedFunction.toString = () =>
        `// screeps-profiler wrapped function:\n${originalFunction.toString()}`;

    Object.getOwnPropertyNames(originalFunction).forEach(property => {
        if (!commonProperties.includes(property)) {
            wrappedFunction[property] = originalFunction[property];
        }
    });

    return wrappedFunction;
}

function hookUpPrototypes() {
    Profiler.prototypes.forEach(proto => {
        profileObjectFunctions(proto.val, proto.name);
    });
}

function profileObjectFunctions(object, label) {
    if (object.prototype) {
        profileObjectFunctions(object.prototype, label);
    }
    const objectToWrap = object;

    Object.getOwnPropertyNames(objectToWrap).forEach(functionName => {
        const extendedLabel = `${label}.${functionName}`;

        const isBlackListed = functionBlackList.indexOf(functionName) !== -1;
        if (isBlackListed) {
            return;
        }

        const descriptor = Object.getOwnPropertyDescriptor(objectToWrap, functionName);
        if (!descriptor) {
            return;
        }

        const hasAccessor = descriptor.get || descriptor.set;
        if (hasAccessor) {
            const configurable = descriptor.configurable;
            if (!configurable) {
                return;
            }

            const profileDescriptor = {};

            if (descriptor.get) {
                const extendedLabelGet = `${extendedLabel}:get`;
                profileDescriptor.get = profileFunction(descriptor.get, extendedLabelGet);
            }

            if (descriptor.set) {
                const extendedLabelSet = `${extendedLabel}:set`;
                profileDescriptor.set = profileFunction(descriptor.set, extendedLabelSet);
            }

            Object.defineProperty(objectToWrap, functionName, profileDescriptor);
            return;
        }

        const isFunction = typeof descriptor.value === 'function';
        if (!isFunction || !descriptor.writable) {
            return;
        }
        const originalFunction = objectToWrap[functionName];
        objectToWrap[functionName] = profileFunction(originalFunction, extendedLabel);
    });

    return objectToWrap;
}

function profileFunction(fn, functionName) {
    const fnName = functionName || fn.name;
    if (!fnName) {
        console.log('Couldn\'t find a function name for - ', fn);
        console.log('Will not profile this function.');
        return fn;
    }

    return wrapFunction(fnName, fn);
}

const Profiler = {
    printProfile() {
        console.log(Profiler.output());
    },

    emailProfile() {
        Game.notify(Profiler.output(1000));
    },

    callgrind() {
        const elapsedTicks = Game.time - Memory.profiler.enabledTick + 1;
        Memory.profiler.map['(tick)'].calls = elapsedTicks;
        Memory.profiler.map['(tick)'].time = Memory.profiler.totalTime;
        Profiler.checkMapItem('(root)');
        Memory.profiler.map['(root)'].calls = 1;
        Memory.profiler.map['(root)'].time = Memory.profiler.totalTime;
        Profiler.checkMapItem('(tick)', Memory.profiler.map['(root)'].subs);
        Memory.profiler.map['(root)'].subs['(tick)'].calls = elapsedTicks;
        Memory.profiler.map['(root)'].subs['(tick)'].time = Memory.profiler.totalTime;
        let body = `events: ns\nsummary: ${Math.round(Memory.profiler.totalTime * 1000000)}\n`;
        for (const fnName of Object.keys(Memory.profiler.map)) {
            const fn = Memory.profiler.map[fnName];
            let callsBody = '';
            let callsTime = 0;
            for (const callName of Object.keys(fn.subs)) {
                const call = fn.subs[callName];
                const ns = Math.round(call.time * 1000000);
                callsBody += `cfn=${callName}\ncalls=${call.calls} 1\n1 ${ns}\n`;
                callsTime += call.time;
            }
            body += `\nfn=${fnName}\n1 ${Math.round((fn.time - callsTime) * 1000000)}\n${callsBody}`;
        }
        return body;
    },

    output(passedOutputLengthLimit) {
        const outputLengthLimit = passedOutputLengthLimit || 1000;
        if (!Memory.profiler || !Memory.profiler.enabledTick) {
            return 'Profiler not active.';
        }

        const endTick = Math.min(Memory.profiler.disableTick || Game.time, Game.time);
        const startTick = Memory.profiler.enabledTick + 1;
        const elapsedTicks = endTick - startTick;
        const header = 'calls\t\ttime\t\tavg\t\tfunction';
        const footer = [
            `Avg: ${(Memory.profiler.totalTime / elapsedTicks).toFixed(2)}`,
            `Total: ${Memory.profiler.totalTime.toFixed(2)}`,
            `Ticks: ${elapsedTicks}`,
        ].join('\t');

        const lines = [header];
        let currentLength = header.length + 1 + footer.length;
        const allLines = Profiler.lines();
        let done = false;
        while (!done && allLines.length) {
            const line = allLines.shift();
            // each line added adds the line length plus a new line character.
            if (currentLength + line.length + 1 < outputLengthLimit) {
                lines.push(line);
                currentLength += line.length + 1;
            } else {
                done = true;
            }
        }
        lines.push(footer);
        return lines.join('\n');
    },

    lines() {
        const stats = Object.keys(Memory.profiler.map).map(functionName => {
            const functionCalls = Memory.profiler.map[functionName];
            return {
                name: functionName,
                calls: functionCalls.calls,
                totalTime: functionCalls.time,
                averageTime: functionCalls.time / functionCalls.calls,
            };
        }).sort((val1, val2) => {
            return val2.totalTime - val1.totalTime;
        });

        const lines = stats.map(data => {
            return [
                data.calls,
                data.totalTime.toFixed(1),
                data.averageTime.toFixed(3),
                data.name,
            ].join('\t\t');
        });

        return lines;
    },

    prototypes: [
        {name: 'Game', val: commonjsGlobal.Game},
        {name: 'Map', val: commonjsGlobal.Game.map},
        {name: 'Market', val: commonjsGlobal.Game.market},
        {name: 'PathFinder', val: commonjsGlobal.PathFinder},
        {name: 'RawMemory', val: commonjsGlobal.RawMemory},
        {name: 'ConstructionSite', val: commonjsGlobal.ConstructionSite},
        {name: 'Creep', val: commonjsGlobal.Creep},
        {name: 'Flag', val: commonjsGlobal.Flag},
        {name: 'Mineral', val: commonjsGlobal.Mineral},
        {name: 'Nuke', val: commonjsGlobal.Nuke},
        {name: 'OwnedStructure', val: commonjsGlobal.OwnedStructure},
        {name: 'CostMatrix', val: commonjsGlobal.PathFinder.CostMatrix},
        {name: 'Resource', val: commonjsGlobal.Resource},
        {name: 'Room', val: commonjsGlobal.Room},
        {name: 'RoomObject', val: commonjsGlobal.RoomObject},
        {name: 'RoomPosition', val: commonjsGlobal.RoomPosition},
        {name: 'RoomVisual', val: commonjsGlobal.RoomVisual},
        {name: 'Source', val: commonjsGlobal.Source},
        {name: 'Structure', val: commonjsGlobal.Structure},
        {name: 'StructureContainer', val: commonjsGlobal.StructureContainer},
        {name: 'StructureController', val: commonjsGlobal.StructureController},
        {name: 'StructureExtension', val: commonjsGlobal.StructureExtension},
        {name: 'StructureExtractor', val: commonjsGlobal.StructureExtractor},
        {name: 'StructureKeeperLair', val: commonjsGlobal.StructureKeeperLair},
        {name: 'StructureLab', val: commonjsGlobal.StructureLab},
        {name: 'StructureLink', val: commonjsGlobal.StructureLink},
        {name: 'StructureNuker', val: commonjsGlobal.StructureNuker},
        {name: 'StructureObserver', val: commonjsGlobal.StructureObserver},
        {name: 'StructurePowerBank', val: commonjsGlobal.StructurePowerBank},
        {name: 'StructurePowerSpawn', val: commonjsGlobal.StructurePowerSpawn},
        {name: 'StructurePortal', val: commonjsGlobal.StructurePortal},
        {name: 'StructureRampart', val: commonjsGlobal.StructureRampart},
        {name: 'StructureRoad', val: commonjsGlobal.StructureRoad},
        {name: 'StructureSpawn', val: commonjsGlobal.StructureSpawn},
        {name: 'StructureStorage', val: commonjsGlobal.StructureStorage},
        {name: 'StructureTerminal', val: commonjsGlobal.StructureTerminal},
        {name: 'StructureTower', val: commonjsGlobal.StructureTower},
        {name: 'StructureWall', val: commonjsGlobal.StructureWall},
    ],

    checkMapItem(functionName, map = Memory.profiler.map) {
        if (!map[functionName]) {
            // eslint-disable-next-line no-param-reassign
            map[functionName] = {
                time: 0,
                calls: 0,
                subs: {},
            };
        }
    },

    record(functionName, time, parent) {
        this.checkMapItem(functionName);
        Memory.profiler.map[functionName].calls++;
        Memory.profiler.map[functionName].time += time;
        if (parent) {
            this.checkMapItem(parent);
            this.checkMapItem(functionName, Memory.profiler.map[parent].subs);
            Memory.profiler.map[parent].subs[functionName].calls++;
            Memory.profiler.map[parent].subs[functionName].time += time;
        }
    },

    endTick() {
        if (Game.time >= Memory.profiler.enabledTick) {
            const cpuUsed = Game.cpu.getUsed();
            Memory.profiler.totalTime += cpuUsed;
            Profiler.report();
        }
    },

    report() {
        if (Profiler.shouldPrint()) {
            Profiler.printProfile();
        } else if (Profiler.shouldEmail()) {
            Profiler.emailProfile();
        }
    },

    isProfiling() {
        if (!enabled || !Memory.profiler) {
            return false;
        }
        return !Memory.profiler.disableTick || Game.time <= Memory.profiler.disableTick;
    },

    type() {
        return Memory.profiler.type;
    },

    shouldPrint() {
        const streaming = Profiler.type() === 'stream';
        const profiling = Profiler.type() === 'profile';
        const onEndingTick = Memory.profiler.disableTick === Game.time;
        return streaming || (profiling && onEndingTick);
    },

    shouldEmail() {
        return Profiler.type() === 'email' && Memory.profiler.disableTick === Game.time;
    },
};

var screepsProfiler = {
    wrap(callback) {
        if (enabled) {
            setupProfiler();
        }

        if (Profiler.isProfiling()) {
            usedOnStart = Game.cpu.getUsed();

            // Commented lines are part of an on going experiment to keep the profiler
            // performant, and measure certain types of overhead.

            // var callbackStart = Game.cpu.getUsed();
            const returnVal = callback();
            // var callbackEnd = Game.cpu.getUsed();
            Profiler.endTick();
            // var end = Game.cpu.getUsed();

            // var profilerTime = (end - start) - (callbackEnd - callbackStart);
            // var callbackTime = callbackEnd - callbackStart;
            // var unaccounted = end - profilerTime - callbackTime;
            // console.log('total-', end, 'profiler-', profilerTime, 'callbacktime-',
            // callbackTime, 'start-', start, 'unaccounted', unaccounted);
            return returnVal;
        }

        return callback();
    },

    enable() {
        enabled = true;
        hookUpPrototypes();
    },

    output: Profiler.output,
    callgrind: Profiler.callgrind,

    registerObject: profileObjectFunctions,
    registerFN: profileFunction,
    registerClass: profileObjectFunctions,
};

const loop = ErrorMapper.wrapLoop(() => {
    screepsProfiler.enable();
    // let t1 = Game.cpu.getUsed();
    CreepManager.clearUnexistingCreep(); //if(1)return
    rebuildMemory();
    Command.run();
    Alloter.setDirty();
    for (const roomName in Game.rooms) {
        if (!Game.rooms.hasOwnProperty(roomName))
            continue;
        // console.log(k);
        const room = Game.rooms[roomName];
        if (room.memory)
            room.memory.isClaimed = false;
        if (!room.controller)
            continue;
        if (!room.controller.my)
            continue;
        if (room.memory)
            room.memory.isClaimed = true;
        if (!Memory.colonies[roomName])
            Memory.colonies[roomName] = [];
        if (!room.memory) {
            SourceManager.analyzeRoom(room.name);
        }
        if (!Command.checkRoomEnvirounment(room)) {
            console.log(`<span style='color:red'>Room ${roomName} missed some settings! </span>`);
            continue;
        }
        SourceManager.refreshRoom(room);
        var storage = Game.getObjectById(room.memory.storage);
        if (storage)
            room.memory.storedEnergy = storage.store[RESOURCE_ENERGY];
        if (room.memory.storedEnergy < lowEnergyLine || Memory.UnderAttacking)
            room.memory.lowEnergy = true;
        else
            room.memory.lowEnergy = false;
        CreepManager.run(room);
        Tower.run(room);
    }
    CreepManager.refreshObstacles();
    // let t2 = Game.cpu.getUsed();
    // console.log('t1 to t2: ', t2 - t1);
    // let s: any = {};
    for (const name in Game.creeps) {
        // let t = Game.cpu.getUsed();
        if (Game.creeps.hasOwnProperty(name)) {
            const creep = Game.creeps[name];
            try {
                // if(!s[creep.memory.role]) s[creep.memory.role] = 0;
                var role = RoleFactory.getInstance(creep);
                if (role && role.creep.room.memory.underAttacking) {
                    if (!role.creep.room.controller) {
                        role.creep.suicide();
                        continue;
                    }
                    if (!role.creep.room.controller.my) {
                        role.creep.suicide();
                        continue;
                    }
                    if (!role.creep.room.find(FIND_MY_STRUCTURES, { filter: structure => structure.structureType == STRUCTURE_TOWER }).length) {
                        let enemies = role.creep.room.find(FIND_HOSTILE_CREEPS);
                        if (enemies.length) {
                            let longest = 0;
                            for (const enemy of enemies) {
                                if (enemy.ticksToLive && enemy.ticksToLive > longest)
                                    longest = enemy.ticksToLive;
                            }
                            Memory.rooms[role.creep.pos.roomName].underAttacking = true;
                            Memory.rooms[role.creep.pos.roomName].timeLeft = longest;
                            role.creep.suicide();
                            continue;
                        }
                        else
                            role.creep.room.memory.underAttacking = false;
                    }
                }
                if (role)
                    role.run();
            }
            catch (error) {
                console.log(`<span style='color:red'>${_.escape(ErrorMapper.sourceMappedStackTrace(error))}</span>`);
            }
            // s[creep.memory.role] += Game.cpu.getUsed() - t;            
        }
    }
    // console.log(JSON.stringify(s));
    // let t3 = Game.cpu.getUsed();
    // console.log('t2 to t3: ', t3 - t2);
    Alloter.checkDirty();
    for (const k in Game.rooms) {
        if (!Game.rooms.hasOwnProperty(k))
            continue;
        // console.log(k);
        const room = Game.rooms[k];
        if (!room.controller)
            continue;
        if (!room.controller.my)
            continue;
        Statistics.run(room);
        // Visualizer.infoBox('cost', [['E49N22', Memory.statistics['E49N22'].averageParseCost.toFixed(3)],
        //     ['E51N21', Memory.statistics['E51N21'].averageParseCost.toFixed(3)]], {x: 1, y:7, roomName: k}, 10);
    }
    // console.log('t3 to end: ', Game.cpu.getUsed() - t3);
});
function rebuildMemory() {
    if (!Memory.rooms)
        Memory.rooms = {};
    if (!Memory.colonies)
        Memory.colonies = {};
    if (!Memory.obstacles)
        Memory.obstacles = [];
    if (!Memory.market)
        Memory.market = {};
    if (!Memory.statistics)
        Memory.statistics = {};
    for (const roomName in Memory.rooms) {
        const room = Memory.rooms[roomName];
        if (room.stableTransporterPos)
            room.stableTransporterPos = rebuildRoomPosition(room.stableTransporterPos);
        if (room.traderPos)
            room.traderPos = rebuildRoomPosition(room.traderPos);
        if (room.lowEnergyIdlePos)
            room.lowEnergyIdlePos = rebuildRoomPosition(room.lowEnergyIdlePos);
        if (room.fillerIdlePos)
            room.fillerIdlePos = rebuildRoomPosition(room.fillerIdlePos);
        for (const typeIndex in room.allot) {
            const type = room.allot[typeIndex];
            for (const unit of type) {
                if (unit && unit.data && unit.data.pos)
                    unit.data.pos = rebuildRoomPosition(unit.data.pos);
            }
        }
    }
    for (let index = 0; index < Memory.obstacles.length; index++)
        Memory.obstacles[index].pos = rebuildRoomPosition(Memory.obstacles[index].pos);
    for (const name in Memory.creeps) {
        let memory = Game.creeps[name].memory;
        if (memory.lastPos)
            memory.lastPos = rebuildRoomPosition(memory.lastPos);
        if (memory.allotUnit && memory.allotUnit.data && memory.allotUnit.data.pos)
            memory.allotUnit.data.pos = rebuildRoomPosition(memory.allotUnit.data.pos);
    }
}
function rebuildRoomPosition(pos) {
    // if(!pos.x || !pos.y || !pos.roomName) return {} as RoomPosition;
    return new RoomPosition(pos.x, pos.y, pos.roomName);
}

exports.loop = loop;
//# sourceMappingURL=main.js.map

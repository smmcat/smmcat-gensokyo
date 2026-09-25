import { monsterData } from "./data/initMonster";

interface AreaItem {
    areaName: string;
    type: string;
    needLv: number;
    info?: string;
    npc?: string[];
    monster?: { name: string; lv: number }[];
    top?: string;
    left?: string;
    right?: string;
    down?: string;
}

interface MapData {
    [key: string]: AreaItem;
}

interface GridCell {
    area: AreaItem;
    key: string;
    row: number;
    col: number;
    connections: {
        top: boolean;
        left: boolean;
        right: boolean;
        down: boolean;
    };
}

export function generateMapHTML(mapData: MapData, currentAreaName?: string): string {
    const centerKey = Object.keys(mapData).find(key => mapData[key].type === "传送门");

    if (!centerKey) {
        return `
      <div style="
        padding: 24px;
        color: #5a3517;
        background: #f1d9a3;
        border: 4px solid #8a5a25;
        font-family: serif;
      ">
        未找到传送门区域
      </div>
    `;
    }

    const visited = new Set<string>();
    const grid: { [row: number]: { [col: number]: GridCell } } = {};

    let minRow = 0;
    let maxRow = 0;
    let minCol = 0;
    let maxCol = 0;

    function placeArea(key: string, row: number, col: number) {
        if (visited.has(key)) return;

        const area = mapData[key];
        if (!area) return;

        visited.add(key);

        const connections = {
            top: false,
            left: false,
            right: false,
            down: false,
        };

        if (!grid[row]) grid[row] = {};

        grid[row][col] = {
            area,
            key,
            row,
            col,
            connections,
        };

        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);

        if (area.top) {
            placeArea(area.top, row - 1, col);
            connections.top = true;

            if (grid[row - 1]?.[col]) {
                grid[row - 1][col].connections.down = true;
            }
        }

        if (area.left) {
            placeArea(area.left, row, col - 1);
            connections.left = true;

            if (grid[row]?.[col - 1]) {
                grid[row][col - 1].connections.right = true;
            }
        }

        if (area.right) {
            placeArea(area.right, row, col + 1);
            connections.right = true;

            if (grid[row]?.[col + 1]) {
                grid[row][col + 1].connections.left = true;
            }
        }

        if (area.down) {
            placeArea(area.down, row + 1, col);
            connections.down = true;

            if (grid[row + 1]?.[col]) {
                grid[row + 1][col].connections.top = true;
            }
        }
    }

    placeArea(centerKey, 0, 0);

    const cellWidth = 184;
    const cellMinHeight = 150;

    const escapeHTML = (value: unknown) => {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };

    const escapeAttr = (value: unknown) => {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    };

    const getMonsterPic = (monsterName: string) => {
        return monsterData?.[monsterName]?.pic || "";
    };

    const getTypeClass = (type: string) => {
        if (type === "安全区") return "safe";
        if (type === "BOSS区") return "boss";
        if (type === "冒险区") return "adventure";
        if (type === "银行") return "bank";
        if (type === "传送门") return "portal";
        return "unknown";
    };

    const getTypeIcon = (type: string) => {
        if (type === "安全区") return "🏕";
        if (type === "BOSS区") return "☠";
        if (type === "冒险区") return "⚔";
        if (type === "银行") return "◆";
        if (type === "传送门") return "◎";
        return "◇";
    };

    let html = `
<style>
* {
  box-sizing: border-box;
}

.map-container {
  position: relative;
  min-width: 100vw;
  min-height: 100vh;
  padding: 56px;

  display: flex;
  justify-content: center;
  align-items: center;

  color: #3f2512;

  font-family:
    "Courier New",
    "Lucida Console",
    "SimSun",
    "宋体",
    monospace;

  background-color: #c58a47;
  background-image:
    radial-gradient(circle at 14% 16%, rgba(255, 236, 172, 0.65) 0, transparent 22%),
    radial-gradient(circle at 86% 20%, rgba(109, 63, 24, 0.22) 0, transparent 26%),
    radial-gradient(circle at 30% 82%, rgba(91, 49, 21, 0.18) 0, transparent 24%),
    radial-gradient(circle at 70% 76%, rgba(255, 238, 185, 0.42) 0, transparent 24%),
    linear-gradient(135deg, #b97938 0%, #e8bd75 35%, #c68642 70%, #8a4f25 100%);

  overflow: auto;
}

.map-container::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;

  background-image:
    repeating-linear-gradient(
      0deg,
      rgba(84, 49, 18, 0.06) 0px,
      rgba(84, 49, 18, 0.06) 1px,
      transparent 1px,
      transparent 5px
    ),
    repeating-linear-gradient(
      90deg,
      rgba(84, 49, 18, 0.045) 0px,
      rgba(84, 49, 18, 0.045) 1px,
      transparent 1px,
      transparent 7px
    );

  opacity: 0.9;
}

.map-container::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;

  box-shadow:
    inset 0 0 80px rgba(80, 39, 14, 0.48),
    inset 0 0 180px rgba(91, 44, 16, 0.28);
}

.map-board {
  position: relative;
  z-index: 2;

  padding: 34px 38px 38px;
  min-width: max-content;

  background:
    linear-gradient(135deg, rgba(255, 239, 189, 0.92), rgba(225, 171, 91, 0.9)),
    #edc984;

  border: 6px solid #6f3d18;
  outline: 4px solid #d9a358;

  box-shadow:
    0 14px 0 #5c3215,
    0 22px 34px rgba(58, 31, 12, 0.45),
    inset 0 0 0 4px rgba(255, 244, 190, 0.38),
    inset 0 0 32px rgba(92, 51, 21, 0.18);

  image-rendering: pixelated;
}

.map-board::before {
  content: "";
  position: absolute;
  inset: -10px;
  pointer-events: none;

  background:
    linear-gradient(90deg, #6f3d18 8px, transparent 8px) top left / 28px 8px repeat-x,
    linear-gradient(90deg, transparent 10px, #6f3d18 10px 18px, transparent 18px) bottom left / 34px 8px repeat-x,
    linear-gradient(0deg, #6f3d18 8px, transparent 8px) top left / 8px 28px repeat-y,
    linear-gradient(0deg, transparent 10px, #6f3d18 10px 18px, transparent 18px) top right / 8px 34px repeat-y;

  opacity: 0.9;
}

.map-title {
  position: relative;
  z-index: 2;

  margin-bottom: 24px;
  text-align: center;

  color: #4b270d;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: 4px;

  text-shadow:
    2px 2px 0 #f8dc99,
    3px 3px 0 rgba(94, 51, 18, 0.28);
}

.map-subtitle {
  margin-top: 7px;

  color: #7a481d;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 2px;

  text-shadow: 1px 1px 0 rgba(255, 242, 199, 0.8);
}

.map-table {
  position: relative;
  z-index: 2;

  border-collapse: separate;
  border-spacing: 30px 44px;
}

.map-cell {
  position: relative;

  width: ${cellWidth}px;
  min-width: ${cellWidth}px;
  max-width: ${cellWidth}px;
  min-height: ${cellMinHeight}px;

  padding: 12px 11px 11px;

  vertical-align: top;
  text-align: center;

  color: #3f2512;

  background:
    linear-gradient(135deg, rgba(255, 238, 185, 0.96), rgba(226, 178, 100, 0.96)),
    #efc77a;

  border: 4px solid #6c3b17;
  outline: 2px solid rgba(255, 246, 199, 0.8);

  box-shadow:
    0 6px 0 #744018,
    0 10px 14px rgba(80, 43, 15, 0.28),
    inset 0 0 0 2px rgba(118, 66, 24, 0.12),
    inset 0 0 18px rgba(97, 53, 20, 0.10);

  image-rendering: pixelated;
}

.map-cell::before {
  content: "";
  position: absolute;
  inset: 5px;
  pointer-events: none;

  border: 2px dashed rgba(121, 72, 28, 0.35);
}

.map-cell:hover {
  transform: translateY(-4px);
  box-shadow:
    0 10px 0 #744018,
    0 16px 20px rgba(80, 43, 15, 0.32),
    inset 0 0 0 2px rgba(118, 66, 24, 0.12),
    inset 0 0 18px rgba(97, 53, 20, 0.10);
}

.empty-cell {
  background: transparent !important;
  border: none !important;
  outline: none !important;
  box-shadow: none !important;
  pointer-events: none;
}

.map-cell.conn-right::after {
  content: "";
  position: absolute;
  top: 50%;
  right: -34px;

  width: 34px;
  height: 8px;

  transform: translateY(-50%);

  background:
    repeating-linear-gradient(
      90deg,
      #7a481d 0px,
      #7a481d 8px,
      transparent 8px,
      transparent 13px
    );

  filter: drop-shadow(0 2px 0 rgba(255, 238, 185, 0.55));
}

.down-line {
  position: absolute;
  left: 50%;
  bottom: -44px;

  width: 8px;
  height: 44px;

  transform: translateX(-50%);

  background:
    repeating-linear-gradient(
      180deg,
      #7a481d 0px,
      #7a481d 8px,
      transparent 8px,
      transparent 13px
    );

  filter: drop-shadow(2px 0 0 rgba(255, 238, 185, 0.55));
}

.route-dot-right,
.route-dot-down {
  position: absolute;
  width: 12px;
  height: 12px;

  background: #f9d77b;
  border: 3px solid #6f3d18;
  box-shadow: 0 2px 0 #9a5c24;
}

.route-dot-right {
  right: -21px;
  top: 50%;
  transform: translateY(-50%);
}

.route-dot-down {
  left: 50%;
  bottom: -26px;
  transform: translateX(-50%);
}

.type-icon {
  position: relative;
  z-index: 2;

  width: 34px;
  height: 34px;
  margin: 0 auto 6px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #fff3ca;
  font-size: 18px;
  font-weight: 900;

  background: #8a5121;
  border: 3px solid #4e2b10;
  box-shadow:
    0 3px 0 #5c3215,
    inset 0 0 0 2px rgba(255, 234, 177, 0.22);
}

.area-name {
  position: relative;
  z-index: 2;

  margin-bottom: 7px;

  color: #3a200d;
  font-size: 15px;
  line-height: 1.25;
  font-weight: 900;

  text-shadow:
    1px 1px 0 #ffe7a8;

  word-break: keep-all;
  overflow-wrap: break-word;
}

.area-type {
  position: relative;
  z-index: 2;

  display: inline-block;

  margin-bottom: 7px;
  padding: 3px 7px;

  color: #fff2c2;
  font-size: 11px;
  font-weight: 900;

  background: #7e491d;
  border: 2px solid #4f2d12;
  box-shadow: 0 2px 0 #5c3215;

  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.35);
}

.area-info {
  position: relative;
  z-index: 2;

  margin: 4px 0 6px;
  padding: 5px 6px;

  color: #4d2d13;
  font-size: 11px;
  line-height: 1.35;
  font-weight: 700;
  text-align: left;

  background: rgba(255, 235, 174, 0.56);
  border: 2px solid rgba(123, 72, 28, 0.28);

  text-shadow: 1px 1px 0 rgba(255, 246, 205, 0.65);
}

.npc-list,
.monster-list {
  position: relative;
  z-index: 2;

  margin-top: 7px;
  padding: 6px;

  text-align: left;

  background: rgba(255, 236, 180, 0.72);
  border: 3px solid #75441a;
  box-shadow:
    0 3px 0 #9b6028,
    inset 0 0 0 2px rgba(255, 249, 212, 0.45);
}

.npc-list {
  color: #24522d;
  font-size: 11px;
  line-height: 1.4;
  font-weight: 900;

  border-color: #4d7a34;
  background: rgba(220, 244, 174, 0.78);
}

.monster-list {
  display: flex;
  flex-direction: column;
  gap: 6px;

  color: #65201a;

  border-color: #9b3529;
  background: rgba(255, 222, 176, 0.82);
}

.monster-item {
  display: flex;
  align-items: center;
  gap: 7px;

  min-height: 42px;
  padding: 5px;

  background:
    linear-gradient(90deg, rgba(255, 199, 160, 0.92), rgba(255, 233, 184, 0.88));

  border: 2px solid #9b4a2b;
  box-shadow:
    0 2px 0 #ba6a35,
    inset 0 0 0 1px rgba(255, 246, 210, 0.5);
}

.monster-avatar-wrap {
  flex: 0 0 auto;

  width: 38px;
  height: 38px;

  padding: 2px;

  background: #6f2d1d;
  border: 3px solid #3d1c10;
  box-shadow:
    0 2px 0 #9b4a2b,
    inset 0 0 0 1px rgba(255, 230, 180, 0.35);

  image-rendering: pixelated;
}

.monster-avatar {
  display: block;

  width: 100%;
  height: 100%;

  object-fit: cover;

  background: #e6b36e;

  image-rendering: pixelated;
}

.monster-avatar-fallback {
  width: 100%;
  height: 100%;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #ffe3a6;
  font-size: 18px;
  font-weight: 900;

  background: #7a2e22;
  text-shadow: 1px 1px 0 #2f120b;
}

.monster-meta {
  flex: 1;
  min-width: 0;
}

.monster-name {
  color: #5a1d16;
  font-size: 11px;
  line-height: 1.25;
  font-weight: 900;

  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;

  text-shadow: 1px 1px 0 rgba(255, 235, 189, 0.9);
}

.monster-lv {
  display: inline-block;

  margin-top: 3px;
  padding: 1px 5px;

  color: #fff0c4;
  font-size: 10px;
  line-height: 1.2;
  font-weight: 900;

  background: #a23a2b;
  border: 2px solid #632016;

  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.35);
}

.safe {
  background:
    linear-gradient(135deg, rgba(232, 248, 177, 0.98), rgba(171, 210, 101, 0.96)),
    #cbe687;
  border-color: #4d7a34;
}

.safe .type-icon,
.safe .area-type {
  background: #4f8a38;
  border-color: #2f551f;
}

.adventure {
  background:
    linear-gradient(135deg, rgba(255, 238, 175, 0.98), rgba(218, 159, 78, 0.96)),
    #e7b66c;
  border-color: #7a481d;
}

.adventure .type-icon,
.adventure .area-type {
  background: #8a5121;
  border-color: #4e2b10;
}

.boss {
  background:
    linear-gradient(135deg, rgba(255, 205, 175, 0.98), rgba(196, 74, 54, 0.92)),
    #d46a4b;
  border-color: #8f251c;

  box-shadow:
    0 6px 0 #711b15,
    0 10px 18px rgba(90, 22, 15, 0.34),
    inset 0 0 0 2px rgba(255, 235, 199, 0.2),
    inset 0 0 18px rgba(100, 20, 12, 0.13);
}

.boss .type-icon,
.boss .area-type {
  background: #a72e24;
  border-color: #5e1712;
}

.boss .area-name {
  color: #45140f;
}

.bank {
  background:
    linear-gradient(135deg, rgba(207, 237, 255, 0.98), rgba(110, 171, 216, 0.94)),
    #9ed1f0;
  border-color: #366a8f;
}

.bank .type-icon,
.bank .area-type {
  background: #386f9b;
  border-color: #20435f;
}

.portal {
  background:
    linear-gradient(135deg, rgba(230, 213, 255, 0.98), rgba(155, 112, 218, 0.94)),
    #c5a7ef;
  border-color: #68409d;
}

.portal .type-icon,
.portal .area-type {
  background: #6b45a3;
  border-color: #3d2364;
}

.unknown {
  background:
    linear-gradient(135deg, rgba(235, 226, 200, 0.98), rgba(188, 166, 127, 0.94)),
    #d3bd8e;
}

/* 当前所在位置 */
.current {
  z-index: 8;

  transform: translateY(-3px);

  border-color: #d98a16 !important;
  outline: 4px solid #fff1a6 !important;

  box-shadow:
    0 8px 0 #9a5a17,
    0 0 0 4px rgba(255, 246, 180, 0.72),
    0 0 22px rgba(255, 191, 54, 0.74),
    0 14px 20px rgba(92, 49, 16, 0.35),
    inset 0 0 0 2px rgba(255, 250, 204, 0.5) !important;

  animation: currentBounce 1.8s steps(2, end) infinite;
  scroll-margin: 160px;
}

@keyframes currentBounce {
  0%, 100% {
    transform: translateY(-3px);
  }
  50% {
    transform: translateY(-7px);
  }
}

.current .area-name {
  color: #3b1d07;
}

.current-marker {
  display: inline-block;

  width: 12px;
  height: 12px;
  margin-right: 5px;

  background: #e43724;
  border: 3px solid #7d1d14;
  box-shadow:
    0 2px 0 #a72e24,
    0 0 0 2px rgba(255, 238, 160, 0.8);

  vertical-align: -1px;
}

.current-tag {
  display: inline-block;

  margin-top: 5px;
  padding: 2px 6px;

  color: #fff5c8;
  font-size: 10px;
  font-weight: 900;

  background: #d26f16;
  border: 2px solid #7a3d0e;
  box-shadow: 0 2px 0 #9a5a17;

  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.35);
}

/* 玩家当前位置锚点 */
.player-anchor {
  position: absolute;
  z-index: 20;

  left: 50%;
  top: -48px;

  transform: translateX(-50%);

  display: flex;
  flex-direction: column;
  align-items: center;

  pointer-events: none;
  animation: anchorFloat 1.1s steps(2, end) infinite;
}

@keyframes anchorFloat {
  0%, 100% {
    transform: translateX(-50%) translateY(0);
  }
  50% {
    transform: translateX(-50%) translateY(-6px);
  }
}

.player-anchor-label {
  position: relative;

  padding: 4px 8px;
  margin-bottom: 5px;

  color: #fff8c8;
  font-size: 12px;
  line-height: 1;
  font-weight: 900;
  white-space: nowrap;

  background: #d73724;
  border: 3px solid #6f1b12;
  box-shadow:
    0 3px 0 #9e271a,
    0 0 0 2px rgba(255, 238, 153, 0.95),
    0 0 18px rgba(255, 78, 45, 0.55);

  text-shadow:
    1px 1px 0 rgba(0, 0, 0, 0.45);
}

.player-anchor-label::before,
.player-anchor-label::after {
  content: "";
  position: absolute;
  top: 50%;

  width: 6px;
  height: 6px;

  background: #fff2a6;
  border: 2px solid #6f1b12;

  transform: translateY(-50%);
}

.player-anchor-label::before {
  left: -9px;
}

.player-anchor-label::after {
  right: -9px;
}

.player-anchor-pin {
  position: relative;

  width: 30px;
  height: 30px;

  background: #e83925;
  border: 4px solid #6f1b12;
  box-shadow:
    0 4px 0 #9e271a,
    0 0 0 3px rgba(255, 242, 166, 0.88),
    0 0 20px rgba(255, 80, 40, 0.62);

  transform: rotate(45deg);
}

.player-anchor-pin::before {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;

  width: 10px;
  height: 10px;

  background: #fff2a6;
  border: 3px solid #6f1b12;

  transform: translate(-50%, -50%);
}

.player-anchor-shadow {
  width: 32px;
  height: 8px;
  margin-top: 6px;

  background: rgba(91, 44, 16, 0.42);
  border-radius: 50%;
  filter: blur(1px);
  animation: anchorShadow 1.1s steps(2, end) infinite;
}

@keyframes anchorShadow {
  0%, 100% {
    transform: scaleX(1);
    opacity: 0.45;
  }
  50% {
    transform: scaleX(0.75);
    opacity: 0.28;
  }
}

.pixel-corner {
  position: absolute;
  width: 24px;
  height: 24px;

  background: #6f3d18;
  box-shadow:
    8px 0 0 #6f3d18,
    0 8px 0 #6f3d18,
    8px 8px 0 #d99d4e;
}

.pixel-corner.lt {
  left: 14px;
  top: 14px;
}

.pixel-corner.rt {
  right: 14px;
  top: 14px;
  transform: scaleX(-1);
}

.pixel-corner.lb {
  left: 14px;
  bottom: 14px;
  transform: scaleY(-1);
}

.pixel-corner.rb {
  right: 14px;
  bottom: 14px;
  transform: scale(-1);
}

.legend {
  position: relative;
  z-index: 2;

  margin-top: 26px;
  padding: 10px 12px;

  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;

  color: #4b270d;
  font-size: 11px;
  font-weight: 900;

  background: rgba(255, 232, 172, 0.58);
  border: 3px solid rgba(111, 61, 24, 0.55);
  box-shadow: inset 0 0 0 2px rgba(255, 249, 215, 0.45);
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.legend-dot {
  width: 13px;
  height: 13px;
  border: 2px solid #4e2b10;
  display: inline-block;
}

.legend-dot.safe-dot {
  background: #7fba4c;
}

.legend-dot.adventure-dot {
  background: #d79b49;
}

.legend-dot.boss-dot {
  background: #c74735;
}

.legend-dot.bank-dot {
  background: #65a8d8;
}

.legend-dot.portal-dot {
  background: #9d78d6;
}

@media (max-width: 900px) {
  .map-container {
    padding: 28px;
  }

  .map-board {
    padding: 28px 24px 30px;
  }

  .map-title {
    font-size: 24px;
  }
}
</style>

<div class="map-container">
  <div class="map-board">
    <div class="pixel-corner lt"></div>
    <div class="pixel-corner rt"></div>
    <div class="pixel-corner lb"></div>
    <div class="pixel-corner rb"></div>

    <div class="map-title">
      冒险者地图
      <div class="map-subtitle">OLD PARCHMENT ADVENTURE MAP</div>
    </div>

    <table class="map-table">
`;

    for (let r = minRow; r <= maxRow; r++) {
        html += `<tr>`;

        for (let c = minCol; c <= maxCol; c++) {
            const cell = grid[r]?.[c];

            if (!cell) {
                html += `<td class="map-cell empty-cell"></td>`;
                continue;
            }

            const { area, connections } = cell;
            const isCurrent = currentAreaName === area.areaName;

            const typeClass = getTypeClass(area.type);
            const currentClass = isCurrent ? "current" : "";

            const connClass = [
                connections.top ? "conn-top" : "",
                connections.left ? "conn-left" : "",
                connections.right ? "conn-right" : "",
                connections.down ? "conn-down" : "",
            ]
                .filter(Boolean)
                .join(" ");

            html += `<td ${isCurrent ? `id="current-area-anchor"` : ""
                } class="map-cell ${typeClass} ${currentClass} ${connClass}">`;

            if (isCurrent) {
                html += `
          <div class="player-anchor" aria-hidden="true">
            <div class="player-anchor-label">冒险者在此</div>
            <div class="player-anchor-pin"></div>
            <div class="player-anchor-shadow"></div>
          </div>
        `;
            }

            if (connections.right) {
                html += `<span class="route-dot-right"></span>`;
            }

            if (connections.down) {
                html += `<span class="down-line"></span><span class="route-dot-down"></span>`;
            }

            html += `<div class="type-icon">${getTypeIcon(area.type)}</div>`;

            html += `<div class="area-name">`;

            if (isCurrent) {
                html += `<span class="current-marker"></span>`;
            }

            html += `${escapeHTML(area.areaName)}`;

            if (isCurrent) {
                html += `<br/><span class="current-tag">当前位置</span>`;
            }

            html += `</div>`;

            html += `<div class="area-type">${escapeHTML(area.type)} Lv.${escapeHTML(area.needLv)}+</div>`;

            if (area.info) {
                html += `<div class="area-info">${escapeHTML(area.info)}</div>`;
            }

            if (area.npc && area.npc.length > 0) {
                html += `<div class="npc-list">`;
                html += `村民/NPC：${area.npc.map(n => escapeHTML(n)).join("，")}`;
                html += `</div>`;
            }

            if (area.monster && area.monster.length > 0) {
                html += `<div class="monster-list">`;

                area.monster.forEach(monster => {
                    const pic = getMonsterPic(monster.name);

                    html += `
            <div class="monster-item">
              <div class="monster-avatar-wrap">
                ${pic
                            ? `<img
                        class="monster-avatar"
                        src="${escapeAttr(pic)}"
                        alt="${escapeAttr(monster.name)}"
                      />`
                            : `<div class="monster-avatar-fallback">☠</div>`
                        }
              </div>

              <div class="monster-meta">
                <div class="monster-name">${escapeHTML(monster.name)}</div>
                <div class="monster-lv">Lv.${escapeHTML(monster.lv)}</div>
              </div>
            </div>
          `;
                });

                html += `</div>`;
            }

            html += `</td>`;
        }

        html += `</tr>`;
    }

    html += `
    </table>

    <div class="legend">
      <span class="legend-item"><span class="legend-dot safe-dot"></span>安全区</span>
      <span class="legend-item"><span class="legend-dot adventure-dot"></span>冒险区</span>
      <span class="legend-item"><span class="legend-dot boss-dot"></span>BOSS区</span>
      <span class="legend-item"><span class="legend-dot bank-dot"></span>银行</span>
      <span class="legend-item"><span class="legend-dot portal-dot"></span>传送门</span>
    </div>
  </div>
</div>
`;

    return html;
}


interface MiniGridCell {
    area: AreaItem;
    key: string;
    row: number;
    col: number;
    connections: {
        top: boolean;
        left: boolean;
        right: boolean;
        down: boolean;
    };
}

export function generateMiniMapHTML(
  mapData: MapData,
  currentAreaName?: string
): string {
  const centerKey = Object.keys(mapData).find(
    key => mapData[key].type === "传送门"
  );

  if (!centerKey) {
    return `
      <div style="
        width: 800px;
        height: 800px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7a2f1b;
        font-family: monospace;
        font-size: 32px;
        font-weight: 900;
        background: transparent;
      ">
        未找到传送门
      </div>
    `;
  }

  const visited = new Set<string>();

  const grid: {
    [row: number]: {
      [col: number]: MiniGridCell;
    };
  } = {};

  function placeArea(key: string, row: number, col: number) {
    if (visited.has(key)) return;

    const area = mapData[key];
    if (!area) return;

    visited.add(key);

    const connections = {
      top: false,
      left: false,
      right: false,
      down: false,
    };

    if (!grid[row]) grid[row] = {};

    grid[row][col] = {
      area,
      key,
      row,
      col,
      connections,
    };

    if (area.top) {
      placeArea(area.top, row - 1, col);
      connections.top = true;

      if (grid[row - 1]?.[col]) {
        grid[row - 1][col].connections.down = true;
      }
    }

    if (area.left) {
      placeArea(area.left, row, col - 1);
      connections.left = true;

      if (grid[row]?.[col - 1]) {
        grid[row][col - 1].connections.right = true;
      }
    }

    if (area.right) {
      placeArea(area.right, row, col + 1);
      connections.right = true;

      if (grid[row]?.[col + 1]) {
        grid[row][col + 1].connections.left = true;
      }
    }

    if (area.down) {
      placeArea(area.down, row + 1, col);
      connections.down = true;

      if (grid[row + 1]?.[col]) {
        grid[row + 1][col].connections.top = true;
      }
    }
  }

  placeArea(centerKey, 0, 0);

  const escapeHTML = (value: unknown) => {
    return String(value ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  const getTypeClass = (type: string) => {
    if (type === "安全区") return "mini-safe";
    if (type === "BOSS区") return "mini-boss";
    if (type === "冒险区") return "mini-adventure";
    if (type === "银行") return "mini-bank";
    if (type === "传送门") return "mini-portal";
    return "mini-unknown";
  };

  const getTypeIcon = (type: string) => {
    if (type === "安全区") return "🏕";
    if (type === "BOSS区") return "☠";
    if (type === "冒险区") return "⚔";
    if (type === "银行") return "◆";
    if (type === "传送门") return "◎";
    return "◇";
  };

  let currentCell: MiniGridCell | undefined;

  Object.keys(grid).forEach(rowKey => {
    const row = Number(rowKey);

    Object.keys(grid[row]).forEach(colKey => {
      const col = Number(colKey);
      const cell = grid[row][col];

      if (cell.area.areaName === currentAreaName) {
        currentCell = cell;
      }
    });
  });

  if (!currentCell) {
    return `
      <div style="
        width: 1280px;
        height: 800px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7a2f1b;
        font-family: monospace;
        font-size: 32px;
        font-weight: 900;
        background: transparent;
      ">
        未找到当前位置
      </div>
    `;
  }

  const centerRow = currentCell.row;
  const centerCol = currentCell.col;

  const hasConnection = (
    cell: MiniGridCell,
    direction: "top" | "left" | "right" | "down"
  ) => {
    return cell.connections[direction];
  };

  let html = `
<style>
.mini-map-square-root,
.mini-map-square-root * {
  box-sizing: border-box;
}

.mini-map-square-root {
  width: 1280px;
  height: 800px;

  display: flex;
  align-items: center;
  justify-content: center;

  background: transparent;

  color: #3f2512;

  font-family:
    "Courier New",
    "Lucida Console",
    "SimSun",
    "宋体",
    monospace;

  image-rendering: pixelated;
}

.mini-map-square-table {
  width: 750px;
  height: 750px;

  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 18px;

  background: transparent;
}

.mini-square-cell {
  position: relative;

  width: 226px;
  height: 226px;

  padding: 16px;

  text-align: center;
  vertical-align: middle;

  background:
    linear-gradient(135deg, rgba(255, 238, 185, 0.96), rgba(226, 178, 100, 0.96)),
    #efc77a;

  border: 9px solid #6c3b17;
  outline: 3px solid rgba(255, 246, 199, 0.75);

  box-shadow:
    0 9px 0 #744018,
    0 16px 25px rgba(80, 43, 15, 0.24),
    inset 0 0 0 3px rgba(118, 66, 24, 0.1);

  overflow: visible;
}

.mini-square-cell::before {
  content: "";
  position: absolute;
  inset: 13px;

  pointer-events: none;

  border: 3px dashed rgba(121, 72, 28, 0.32);
}

.mini-square-empty {
  background: transparent;
  border: 6px dashed rgba(111, 61, 24, 0.22);
  outline: none;
  box-shadow: none;
}

.mini-square-empty::before {
  display: none;
}

.mini-square-empty-mark {
  position: relative;
  z-index: 2;

  color: rgba(88, 50, 20, 0.35);
  font-size: 50px;
  line-height: 1;
  font-weight: 900;
}

.mini-square-icon {
  position: relative;
  z-index: 2;

  width: 68px;
  height: 68px;
  margin: 0 auto 10px;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #fff3ca;
  font-size: 40px;
  font-weight: 900;

  background: #8a5121;
  border: 6px solid #4e2b10;

  box-shadow:
    0 6px 0 #5c3215,
    inset 0 0 0 3px rgba(255, 234, 177, 0.22);
}

.mini-square-name {
  position: relative;
  z-index: 2;

  color: #3a200d;

  font-size: 31px;
  line-height: 1.15;
  font-weight: 900;

  text-shadow: 3px 3px 0 rgba(255, 231, 168, 0.8);

  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;

  overflow: hidden;
  word-break: break-all;
}

.mini-square-lv {
  position: relative;
  z-index: 2;

  display: inline-block;

  margin-top: 7px;
  padding: 3px 10px;

  color: #fff2c2;
  font-size: 25px;
  line-height: 1.1;
  font-weight: 900;

  background: #7e491d;
  border: 3px solid #4f2d12;

  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.32);
}

/* 横向连接线，只画右边 */
.mini-square-cell.mini-square-conn-right::after {
  content: "";
  position: absolute;

  right: -27px;
  top: 50%;

  width: 27px;
  height: 16px;

  transform: translateY(-50%);

  background:
    repeating-linear-gradient(
      90deg,
      #7a481d 0px,
      #7a481d 15px,
      transparent 15px,
      transparent 24px
    );

  z-index: 1;
}

/* 纵向连接线，只画下边 */
.mini-square-down-line {
  position: absolute;

  left: 50%;
  bottom: -27px;

  width: 16px;
  height: 27px;

  transform: translateX(-50%);

  background:
    repeating-linear-gradient(
      180deg,
      #7a481d 0px,
      #7a481d 15px,
      transparent 15px,
      transparent 24px
    );

  z-index: 1;
}

/* 类型颜色 */
.mini-safe {
  background:
    linear-gradient(135deg, rgba(232, 248, 177, 0.98), rgba(171, 210, 101, 0.96)),
    #cbe687;
  border-color: #4d7a34;
}

.mini-safe .mini-square-icon,
.mini-safe .mini-square-lv {
  background: #4f8a38;
  border-color: #2f551f;
}

.mini-adventure {
  background:
    linear-gradient(135deg, rgba(255, 238, 175, 0.98), rgba(218, 159, 78, 0.96)),
    #e7b66c;
  border-color: #7a481d;
}

.mini-adventure .mini-square-icon,
.mini-adventure .mini-square-lv {
  background: #8a5121;
  border-color: #4e2b10;
}

.mini-boss {
  background:
    linear-gradient(135deg, rgba(255, 205, 175, 0.98), rgba(196, 74, 54, 0.92)),
    #d46a4b;
  border-color: #8f251c;
}

.mini-boss .mini-square-icon,
.mini-boss .mini-square-lv {
  background: #a72e24;
  border-color: #5e1712;
}

.mini-bank {
  background:
    linear-gradient(135deg, rgba(207, 237, 255, 0.98), rgba(110, 171, 216, 0.94)),
    #9ed1f0;
  border-color: #366a8f;
}

.mini-bank .mini-square-icon,
.mini-bank .mini-square-lv {
  background: #386f9b;
  border-color: #20435f;
}

.mini-portal {
  background:
    linear-gradient(135deg, rgba(230, 213, 255, 0.98), rgba(155, 112, 218, 0.94)),
    #c5a7ef;
  border-color: #68409d;
}

.mini-portal .mini-square-icon,
.mini-portal .mini-square-lv {
  background: #6b45a3;
  border-color: #3d2364;
}

.mini-unknown {
  background:
    linear-gradient(135deg, rgba(235, 226, 200, 0.98), rgba(188, 166, 127, 0.94)),
    #d3bd8e;
}

/* 当前玩家位置 */
.mini-square-current {
  z-index: 10;

  border-color: #d73724 !important;
  outline: 9px solid #fff1a6 !important;

  box-shadow:
    0 13px 0 #9e271a,
    0 0 0 6px rgba(255, 246, 180, 0.8),
    0 0 44px rgba(255, 78, 45, 0.78),
    inset 0 0 0 6px rgba(255, 250, 204, 0.45) !important;

  animation: miniSquareCurrentBlink 1.1s steps(2, end) infinite;
}

@keyframes miniSquareCurrentBlink {
  0%, 100% {
    transform: translateY(0);
  }

  50% {
    transform: translateY(-9px);
  }
}

.mini-square-player-pin {
  position: absolute;
  z-index: 20;

  left: 50%;
  top: -25px;

  width: 63px;
  height: 63px;

  background: #e83925;
  border: 9px solid #6f1b12;

  box-shadow:
    0 6px 0 #9e271a,
    0 0 0 6px rgba(255, 242, 166, 0.9),
    0 0 31px rgba(255, 80, 40, 0.72);

  transform: translateX(-50%) rotate(45deg);
}

.mini-square-player-pin::before {
  content: "";
  position: absolute;

  left: 50%;
  top: 50%;

  width: 19px;
  height: 19px;

  background: #fff2a6;
  border: 6px solid #6f1b12;

  transform: translate(-50%, -50%);
}

.mini-square-current-text {
  position: absolute;
  z-index: 21;

  left: 50%;
  bottom: 9px;

  transform: translateX(-50%);

  padding: 3px 13px;

  color: #fff8c8;
  font-size: 25px;
  line-height: 1.1;
  font-weight: 900;
  white-space: nowrap;

  background: #d73724;
  border: 3px solid #6f1b12;

  text-shadow: 3px 3px 0 rgba(0, 0, 0, 0.36);
}
</style>

<div class="mini-map-square-root">
  <table class="mini-map-square-table">
`;

  for (let r = centerRow - 1; r <= centerRow + 1; r++) {
    html += `<tr>`;

    for (let c = centerCol - 1; c <= centerCol + 1; c++) {
      const cell = grid[r]?.[c];

      if (!cell) {
        html += `
          <td class="mini-square-cell mini-square-empty">
            <div class="mini-square-empty-mark">?</div>
          </td>
        `;
        continue;
      }

      const isCurrent = cell.row === centerRow && cell.col === centerCol;
      const typeClass = getTypeClass(cell.area.type);

      const rightCell = grid[r]?.[c + 1];
      const downCell = grid[r + 1]?.[c];

      const canDrawRight =
        c + 1 <= centerCol + 1 &&
        Boolean(rightCell) &&
        hasConnection(cell, "right");

      const canDrawDown =
        r + 1 <= centerRow + 1 &&
        Boolean(downCell) &&
        hasConnection(cell, "down");

      const className = [
        "mini-square-cell",
        typeClass,
        canDrawRight ? "mini-square-conn-right" : "",
        isCurrent ? "mini-square-current" : "",
      ]
        .filter(Boolean)
        .join(" ");

      html += `<td class="${className}" title="${escapeHTML(cell.area.areaName)}">`;

      if (isCurrent) {
        html += `<div class="mini-square-player-pin"></div>`;
      }

      if (canDrawDown) {
        html += `<span class="mini-square-down-line"></span>`;
      }

      html += `
        <div class="mini-square-icon">${getTypeIcon(cell.area.type)}</div>
        <div class="mini-square-name">${escapeHTML(cell.area.areaName)}</div>
        <div class="mini-square-lv">Lv.${escapeHTML(cell.area.needLv)}</div>
      `;

      if (isCurrent) {
        html += `<div class="mini-square-current-text">当前位置</div>`;
      }

      html += `</td>`;
    }

    html += `</tr>`;
  }

  html += `
  </table>
</div>
`;

  return html;
}
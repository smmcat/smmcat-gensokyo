import { AreaItem } from "./map";


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
        return "<div>未找到传送门区域</div>";
    }

    const visited = new Set<string>();
    const grid: { [row: number]: { [col: number]: GridCell } } = {};
    let minRow = 0, maxRow = 0, minCol = 0, maxCol = 0;

    // 递归放置区域到网格
    function placeArea(key: string, row: number, col: number) {
        if (visited.has(key)) return;
        visited.add(key);
        const area = mapData[key];
        if (!area) return;

        // 检查连接关系
        const connections = {
            top: false,
            left: false,
            right: false,
            down: false
        };

        if (!grid[row]) grid[row] = {};
        grid[row][col] = { area, key, row, col, connections };

        minRow = Math.min(minRow, row);
        maxRow = Math.max(maxRow, row);
        minCol = Math.min(minCol, col);
        maxCol = Math.max(maxCol, col);

        // 递归放置相邻区域并记录连接关系
        if (area.top) {
            placeArea(area.top, row - 1, col);
            connections.top = true;
            // 双向连接
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

    // 计算表格尺寸
    const cellWidth = 160;
    const cellHeight = 120;
    const svgWidth = (maxCol - minCol + 1) * cellWidth;
    const svgHeight = (maxRow - minRow + 1) * cellHeight;

    // 生成 HTML 表格和 SVG 连接线
    let html = `
<style>
.map-container {
        display: flex;
        justify-content: center;
        align-items: center;
    position: relative;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-size: 12px;
    background-color: transparent;
    padding: 20px;
    border-radius: 12px;
    min-width: 100vw;
    min-height:100vh;
}
.map-table {
    border-collapse: separate;
    border-spacing: 0;
    position: relative;
    z-index: 2;
}
.map-cell {
    width: ${cellWidth}px;
    height: ${cellHeight}px;
    border: none;
    padding: 12px;
    vertical-align: top;
    text-align: center;
    background: rgba(255, 255, 255, 0.95);
    border-radius: 8px;
    transition: all 0.3s ease;
    position: relative;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    backdrop-filter: blur(10px);
}
.map-cell:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
}
.empty-cell {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
}
.area-name {
    font-weight: 700;
    margin-bottom: 6px;
    color: #2d3748;
    font-size: 14px;
    letter-spacing: 0.5px;
}
.area-type {
    font-size: 11px;
    color: #718096;
    margin-bottom: 6px;
    padding: 2px 8px;
    background: rgba(237, 242, 247, 0.8);
    border-radius: 12px;
    display: inline-block;
}
.area-info {
    font-size: 10px;
    color: #4a5568;
    margin-bottom: 6px;
    font-style: italic;
}
.monster-list, .npc-list {
    font-size: 10px;
    color: #2d3748;
    text-align: left;
    margin-top: 6px;
    padding-left: 8px;
}
.monster-list {
    border-left: 2px solid #e53e3e;
}
.npc-list {
    border-left: 2px solid #38a169;
}
.safe { 
    background: linear-gradient(135deg, rgba(224, 247, 250, 0.95), rgba(129, 230, 217, 0.95));
    border: 2px solid #38b2ac;
}
.boss { 
    background: linear-gradient(135deg, rgba(255, 235, 238, 0.95), rgba(254, 178, 178, 0.95));
    border: 2px solid #e53e3e;
}
.adventure { 
    background: linear-gradient(135deg, rgba(241, 248, 233, 0.95), rgba(154, 230, 180, 0.95));
    border: 2px solid #38a169;
}
.portal { 
    background: linear-gradient(135deg, rgba(255, 243, 224, 0.95), rgba(251, 211, 141, 0.95));
    border: 2px solid #ed8936;
}
.current {
    background: linear-gradient(135deg, rgba(255, 249, 196, 0.95), rgba(254, 240, 138, 0.95)) !important;
    border: 3px solid #d69e2e !important;
    box-shadow: 0 0 20px rgba(214, 158, 46, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2);
    transform: scale(1.08);
    z-index: 10;
    animation: glow 2s ease-in-out infinite alternate;
}
@keyframes glow {
    from {
        box-shadow: 0 0 20px rgba(214, 158, 46, 0.4), 0 8px 16px rgba(0, 0, 0, 0.2);
    }
    to {
        box-shadow: 0 0 30px rgba(214, 158, 46, 0.6), 0 10px 20px rgba(0, 0, 0, 0.3);
    }
}
.current .area-name {
    color: #744210;
    font-weight: 900;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}
.current-marker {
    display: inline-block;
    width: 10px;
    height: 10px;
    background: linear-gradient(135deg, #d69e2e, #744210);
    border-radius: 50%;
    margin-right: 6px;
    animation: pulse 1.5s ease-in-out infinite;
    box-shadow: 0 0 8px rgba(214, 158, 46, 0.8);
}
@keyframes pulse {
    0% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.4); opacity: 0.8; }
    100% { transform: scale(1); opacity: 1; }
}
.connection-lines {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    pointer-events: none;
}
.connection-line {
    stroke: rgba(255, 255, 255, 0.7);
    stroke-width: 3;
    stroke-linecap: round;
    filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}
.connection-line-dotted {
    stroke-dasharray: 5, 5;
}
.connection-line-solid {
    stroke-dasharray: none;
}
.connection-dot {
    fill: rgba(255, 255, 255, 0.9);
    stroke: #4a5568;
    stroke-width: 1;
    filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.2));
}
</style>
<div class="map-container">
<svg class="connection-lines" width="${svgWidth}" height="${svgHeight}">
`;

    html += `<table class="map-table">`;

    // 生成表格单元格
    for (let r = minRow; r <= maxRow; r++) {
        html += "<tr>";
        for (let c = minCol; c <= maxCol; c++) {
            const cell = grid[r]?.[c];
            if (cell) {
                const { area, key } = cell;
                const isCurrent = currentAreaName === area.areaName;
                const typeClass = area.type === "安全区" ? "safe" :
                                 area.type === "BOSS区" ? "boss" :
                                 area.type === "冒险区" ? "adventure" :
                                 area.type === "传送门" ? "portal" : "";
                const currentClass = isCurrent ? "current" : "";
                
                html += `<td class="map-cell ${typeClass} ${currentClass}">`;
                
                // 区域名称，如果是当前位置则添加标记
                html += `<div class="area-name">`;
                if (isCurrent) {
                    html += `<span class="current-marker"></span>`;
                }
                html += `${area.areaName}`;
                if (isCurrent) {
                    html += ` <span style="color:#744210;font-size:11px;font-weight:600;">(当前位置)</span>`;
                }
                html += `</div>`;
                
                html += `<div class="area-type">${area.type} (Lv.${area.needLv}+)</div>`;
                if (area.info) {
                    html += `<div class="area-info">${area.info}</div>`;
                }
                if (area.npc && area.npc.length > 0) {
                    html += `<div class="npc-list">NPC: ${area.npc.join(", ")}</div>`;
                }
                if (area.monster && area.monster.length > 0) {
                    html += `<div class="monster-list">`;
                    area.monster.forEach(m => {
                        html += `<div style="margin: 2px 0;">${m.name} <span style="color:#e53e3e">Lv.${m.lv}</span></div>`;
                    });
                    html += `</div>`;
                }
                html += `</td>`;
            } else {
                // 非可访问区域设置为透明
                html += `<td class="map-cell empty-cell"></td>`;
            }
        }
        html += "</tr>";
    }

    html += `
</table>
</div>
`;
    return html;
}
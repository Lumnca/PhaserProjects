export class City {
    /**
     * @param {object} data - 城市数据，包含 id, name, x, y, neighbor 等
     * @param {Map<number, City>} cityMap - 所有城市的映射（id -> City）
     */
    constructor(data, cityMap) {
        this.id = data.id;
        this.name = data.name;
        this.x = data.x;
        this.y = data.y;
        this.neighbor = data.neighbor || [];
        this.cityMap = cityMap; // 用于查找邻居
    }

    /**
     * 获取所有邻接城市对象
     * @returns {City[]}
     */
    getNeighbors() {
        return this.neighbor.map(id => this.cityMap.get(id)).filter(Boolean);
    }

    /**
     * 计算到目标城市的最短路径（BFS，返回城市id数组）
     * @param {number} targetId
     * @returns {number[]} 路径上的城市id数组（含自身和目标），找不到返回空数组
     */
    findRouteTo(targetId) {
        if (this.id === targetId) return [this.id];
        const visited = new Set();
        const queue = [[this.id]];
        while (queue.length > 0) {
            const path = queue.shift();
            const last = path[path.length - 1];
            if (last === targetId) return path;
            if (visited.has(last)) continue;
            visited.add(last);
            const city = this.cityMap.get(last);
            if (!city) continue;
            for (const nId of city.neighbor) {
                if (!visited.has(nId)) {
                    queue.push([...path, nId]);
                }
            }
        }
        return [];
    }
}

const fn = [{ name: '垂死挣扎', prob: 1 },{ name: '垂死挣扎11', prob: 0 }]

function useAtkFn(fnList: { name: string; prob: number }[]): string {
    const totalProb = fnList.reduce((sum, item) => sum + item.prob, 0);
    const random = Math.random() * totalProb;
    let currentProb = 0;
    for (const item of fnList) {
        currentProb += item.prob;
        if (random < currentProb) {
            return item.name;
        }
    }
    return fnList[fnList.length - 1].name;
}

console.log(useAtkFn(fn));

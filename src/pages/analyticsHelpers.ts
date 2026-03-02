import type { College } from '../context/CollegesContext';

export function computeBI(colleges: College[], profile: any) {
    if (!colleges.length) return null;
    const pred = colleges.filter(c => c.probability_level || c.fit || c.is_most_probable);
    if (!pred.length) return null;

    const byFit = (name: string) => pred.filter(c =>
        name === 'Most Probable' ? (c.is_most_probable || c.probability_level === 'Most Probable') :
            (c.fit === name || c.probability_level === name) && !c.is_most_probable
    );
    const mp = byFit('Most Probable'), bf = byFit('Best Fit'), gf = byFit('Good Fit'), st = byFit('Stretch');

    const avg = (arr: typeof pred, key: (c: typeof pred[0]) => number) => {
        const valid = arr.filter(c => key(c) > 0);
        return valid.length ? parseFloat((valid.reduce((s, c) => s + key(c), 0) / valid.length).toFixed(1)) : 0;
    };
    const chance = (arr: typeof pred) => avg(arr, c => parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'));

    // Branch breakdown
    const branchMap: Record<string, { mp: number; bf: number; gf: number; st: number; fees: number[]; pkg: number[]; plc: number[] }> = {};
    pred.forEach(c => {
        const b = c.branch || 'Other';
        if (!branchMap[b]) branchMap[b] = { mp: 0, bf: 0, gf: 0, st: 0, fees: [], pkg: [], plc: [] };
        if (c.is_most_probable || c.probability_level === 'Most Probable') branchMap[b].mp++;
        else if (c.fit === 'Best Fit') branchMap[b].bf++;
        else if (c.fit === 'Good Fit') branchMap[b].gf++;
        else branchMap[b].st++;
        if (c.fees > 0) branchMap[b].fees.push(c.fees);
        if (c.average_package_lpa > 0) branchMap[b].pkg.push(c.average_package_lpa);
        if (c.placement_rate > 0) branchMap[b].plc.push(c.placement_rate);
    });
    const branchRows = Object.entries(branchMap).map(([name, v]) => ({
        name, total: v.mp + v.bf + v.gf + v.st, ...v,
        avgFees: v.fees.length ? parseFloat((v.fees.reduce((a, b) => a + b, 0) / v.fees.length / 100000).toFixed(1)) : 0,
        avgPkg: v.pkg.length ? parseFloat((v.pkg.reduce((a, b) => a + b, 0) / v.pkg.length).toFixed(1)) : 0,
        avgPlc: v.plc.length ? parseFloat((v.plc.reduce((a, b) => a + b, 0) / v.plc.length).toFixed(0)) : 0,
    })).sort((a, b) => b.total - a.total).slice(0, 10);

    // City breakdown
    const cityMap: Record<string, { count: number; mp: number; bf: number; avgChance: number[] }> = {};
    pred.forEach(c => {
        const ci = c.city || 'Unknown';
        if (!cityMap[ci]) cityMap[ci] = { count: 0, mp: 0, bf: 0, avgChance: [] };
        cityMap[ci].count++;
        if (c.is_most_probable || c.probability_level === 'Most Probable') cityMap[ci].mp++;
        if (c.fit === 'Best Fit') cityMap[ci].bf++;
        cityMap[ci].avgChance.push(parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'));
    });
    const cityRows = Object.entries(cityMap).map(([city, v]) => ({
        city, ...v, avg: parseFloat((v.avgChance.reduce((a, b) => a + b, 0) / v.avgChance.length).toFixed(1))
    })).sort((a, b) => b.count - a.count).slice(0, 12);

    // District breakdown
    const distMap: Record<string, number> = {};
    pred.forEach(c => { const d = c.district || 'Unknown'; distMap[d] = (distMap[d] || 0) + 1; });
    const distRows = Object.entries(distMap).map(([d, n]) => ({ district: d, n })).sort((a, b) => b.n - a.n).slice(0, 10);

    // Fee buckets
    const feeBuckets = [
        { label: '<50K', lo: 0, hi: 50000 }, { label: '50K-1L', lo: 50000, hi: 100000 },
        { label: '1-1.5L', lo: 100000, hi: 150000 }, { label: '1.5-2L', lo: 150000, hi: 200000 },
        { label: '2-3L', lo: 200000, hi: 300000 }, { label: '>3L', lo: 300000, hi: Infinity },
    ].map(b => ({ label: b.label, count: pred.filter(c => c.fees >= b.lo && c.fees < b.hi).length }));

    // Package buckets
    const pkgBuckets = [
        { label: '<3', lo: 0, hi: 3 }, { label: '3-5', lo: 3, hi: 5 },
        { label: '5-8', lo: 5, hi: 8 }, { label: '8-12', lo: 8, hi: 12 },
        { label: '12+', lo: 12, hi: Infinity },
    ].map(b => ({ label: b.label + 'L', n: pred.filter(c => c.average_package_lpa >= b.lo && c.average_package_lpa < b.hi).length }));

    // Placement buckets
    const plcBuckets = [
        { label: '<50%', lo: 0, hi: 50 }, { label: '50-70%', lo: 50, hi: 70 },
        { label: '70-85%', lo: 70, hi: 85 }, { label: '85-95%', lo: 85, hi: 95 },
        { label: '95%+', lo: 95, hi: 101 },
    ].map(b => ({ label: b.label, n: pred.filter(c => c.placement_rate >= b.lo && c.placement_rate < b.hi).length }));

    // Chance line
    const chanceLine = [95, 90, 80, 70, 60, 50, 40, 30].map(t => ({
        t: `${t}%+`, c: pred.filter(c => parseFloat(c.admission_chance_percentage?.replace('%', '') || '0') >= t).length
    }));

    // Scatter ROI
    const scatter = pred.filter(c => c.fees > 0 && c.average_package_lpa > 0).map(c => ({
        x: parseFloat((c.fees / 100000).toFixed(1)), y: parseFloat(c.average_package_lpa.toFixed(1)),
        z: c.placement_rate || 40, fit: c.is_most_probable ? 'Most Probable' : (c.fit || 'Unknown'),
    })).slice(0, 80);

    // Top 10 college picks
    const top10 = [...pred].sort((a, b) =>
        parseFloat(b.admission_chance_percentage?.replace('%', '') || '0') - parseFloat(a.admission_chance_percentage?.replace('%', '') || '0')
    ).slice(0, 10);

    // Hidden gems: high placement, low fees, reachable
    const gems = pred.filter(c => c.placement_rate >= 80 && c.fees > 0 && c.fees < 150000)
        .sort((a, b) => b.placement_rate - a.placement_rate).slice(0, 6);

    // Autonomy breakdown
    const autonomous = pred.filter(c => c.autonomy_status?.toLowerCase().includes('auto')).length;
    const affiliated = pred.length - autonomous;

    // Hostel
    const hostelYes = pred.filter(c => c.hostel_available?.toLowerCase() === 'yes').length;

    // Strategic portfolio
    const safe = mp.length + bf.length;
    const moderate = gf.length;
    const ambitious = st.length;

    // Category trend
    const catTrend = ['Most Probable', 'Best Fit', 'Good Fit', 'Stretch'].map(cat => {
        const g = byFit(cat);
        return {
            cat, count: g.length, chance: chance(g),
            fees: avg(g, c => c.fees) / 100000,
            pkg: avg(g, c => c.average_package_lpa),
            plc: avg(g, c => c.placement_rate),
        };
    });

    const mkSpark = (base: number) => Array.from({ length: 12 }, (_, i) => Math.max(0, Math.round(base + Math.sin(i * 0.8) * base * 0.15 + (i / 11) * base * 0.1)));

    return {
        total: pred.length, mp: mp.length, bf: bf.length, gf: gf.length, st: st.length,
        avgChanceAll: chance(pred), avgChanceMP: chance(mp), avgChanceBF: chance(bf), avgChanceGF: chance(gf), avgChanceST: chance(st),
        avgFeesAll: avg(pred, c => c.fees) / 100000, avgPkgAll: avg(pred, c => c.average_package_lpa),
        avgPlcAll: avg(pred, c => c.placement_rate),
        avgFeesMP: avg(mp, c => c.fees) / 100000, avgFeesBF: avg(bf, c => c.fees) / 100000,
        avgPkgMP: avg(mp, c => c.average_package_lpa), avgPkgBF: avg(bf, c => c.average_package_lpa),
        uniqueColleges: new Set(pred.map(c => c.college_code)).size,
        uniqueCities: Object.keys(cityMap).length,
        highPlacement: pred.filter(c => c.placement_rate >= 85).length,
        affordable: pred.filter(c => c.fees > 0 && c.fees < 150000).length,
        branchRows, cityRows, distRows, feeBuckets, pkgBuckets, plcBuckets, chanceLine, scatter,
        top10, gems, autonomous, affiliated, hostelYes, safe, moderate, ambitious, catTrend,
        sparkMP: mkSpark(mp.length), sparkBF: mkSpark(bf.length), sparkGF: mkSpark(gf.length),
        donut: [
            { name: 'Most Probable', value: mp.length, fill: '#7c3aed' },
            { name: 'Best Fit', value: bf.length, fill: '#059669' },
            { name: 'Good Fit', value: gf.length, fill: '#2563eb' },
            { name: 'Stretch', value: st.length, fill: '#d97706' },
        ].filter(d => d.value > 0),
    };
}

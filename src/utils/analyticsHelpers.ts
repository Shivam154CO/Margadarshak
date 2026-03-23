import type { College } from '../types/college';

export const getCategoryColor = (category: string) => {
    const map: Record<string, string> = {
        'OPEN': '#3B82F6',
        'OBC': '#10B981',
        'SC': '#F59E0B',
        'ST': '#EF4444',
    };
    return map[category] || '#6B7280';
};

export function computeBI(colleges: College[], _profile: any) {
    if (!colleges || !colleges.length) return null;
    
    const pred = colleges.some(c => c.probability_level || c.fit || c.is_most_probable)
        ? colleges.filter(c => c.probability_level || c.fit || c.is_most_probable)
        : colleges;
    
    if (!pred.length) return null;

    const byFit = (name: string) => pred.filter(c =>
        name === 'Most Probable' ? (c.is_most_probable || c.probability_level === 'Most Probable') :
            (c.fit === name || c.probability_level === name) && !c.is_most_probable
    );
    
    const mp = byFit('Most Probable'), bf = byFit('Best Fit'), gf = byFit('Good Fit'), st = byFit('Stretch');

    const avg = (arr: College[], key: (c: College) => number) => {
        const valid = arr.filter(c => key(c) > 0);
        return valid.length ? parseFloat((valid.reduce((s, c) => s + key(c), 0) / valid.length).toFixed(1)) : 0;
    };

    // 1. Branch Data
    const branchMap: Record<string, { mp: number; bf: number; gf: number; st: number; fees: number[]; pkg: number[]; plc: number[] }> = {};
    pred.forEach(c => {
        const b = c.branch || 'Other';
        if (!branchMap[b]) branchMap[b] = { mp: 0, bf: 0, gf: 0, st: 0, fees: [], pkg: [], plc: [] };
        if (c.probability_level === 'Most Probable') branchMap[b].mp++;
        else if (c.fit === 'Best Fit') branchMap[b].bf++;
        else if (c.fit === 'Good Fit') branchMap[b].gf++;
        else branchMap[b].st++;
        if ((c.fees || 0) > 0) branchMap[b].fees.push(c.fees || 0);
        if ((c.average_package_lpa || 0) > 0) branchMap[b].pkg.push(c.average_package_lpa || 0);
        if ((c.placement_rate || 0) > 0) branchMap[b].plc.push(c.placement_rate || 0);
    });
    
    const branchRows = Object.entries(branchMap).map(([name, v]) => ({
        name, total: v.mp + v.bf + v.gf + v.st, ...v,
        avgFees: v.fees.length ? parseFloat((v.fees.reduce((a, b) => a + b, 0) / v.fees.length / 100000).toFixed(1)) : 0,
        avgPkg: v.pkg.length ? parseFloat((v.pkg.reduce((a, b) => a + b, 0) / v.pkg.length).toFixed(1)) : 0,
        avgPlc: v.plc.length ? parseFloat((v.plc.reduce((a, b) => a + b, 0) / v.plc.length).toFixed(0)) : 0,
    })).sort((a, b) => b.total - a.total).slice(0, 10);

    // 2. City Data
    const cityMap: Record<string, { count: number; mp: number; bf: number; avgChance: number[] }> = {};
    pred.forEach(c => {
        const ci = c.city || 'Unknown';
        if (!cityMap[ci]) cityMap[ci] = { count: 0, mp: 0, bf: 0, avgChance: [] };
        cityMap[ci].count++;
        if (c.probability_level === 'Most Probable') cityMap[ci].mp++;
        if (c.fit === 'Best Fit') cityMap[ci].bf++;
        cityMap[ci].avgChance.push(parseFloat(c.admission_chance_percentage?.replace('%', '') || '0'));
    });
    const cityRows = Object.entries(cityMap).map(([city, v]) => ({
        city, ...v, avg: parseFloat((v.avgChance.reduce((a, b) => a + b, 0) / v.avgChance.length).toFixed(1))
    })).sort((a, b) => b.count - a.count).slice(0, 15);

    // 3. District Data
    const dMap: Record<string, number> = {};
    pred.forEach(c => { const d = c.district || 'Other'; dMap[d] = (dMap[d] || 0) + 1; });
    const distRows = Object.entries(dMap).map(([district, count]) => ({ district, count })).sort((a, b) => b.count - a.count);

    // 4. University Split
    const uMap: Record<string, number> = {};
    pred.forEach(c => { const u = c.university || 'Other'; uMap[u] = (uMap[u] || 0) + 1; });
    const univData = Object.entries(uMap).map(([name, value]) => ({ name: name.split('Unit')[0].trim(), value })).sort((a, b) => b.value - a.value).slice(0, 5);

    // 5. Fee Buckets
    const feeBuckets = [
        { label: '<50K', lo: 0, hi: 50000 }, { label: '50-1L', lo: 50000, hi: 100000 },
        { label: '1-1.5L', lo: 100000, hi: 150000 }, { label: '1.5-2L', lo: 150000, hi: 200000 },
        { label: '2-3L', lo: 200000, hi: 300000 }, { label: '>3L', lo: 300000, hi: Infinity },
    ].map(b => ({ label: b.label, count: pred.filter(c => (c.fees || 0) >= b.lo && (c.fees || 0) < b.hi).length }));

    // 6. Placement readiness velocity
    const velocity = [
        { name: 'Placement Velocity', value: avg(pred, c => c.placement_rate || 0), fill: '#10b981' },
        { name: 'Package Heat', value: (avg(pred, c => c.average_package_lpa || 0) / 12) * 100, fill: '#6366f1' },
    ];

    // 7. Amenities Stacked
    const amenityStack = [
        { name: 'WiFi', val: (pred.filter(c => c.wifi_available || c.wifi_campus).length / pred.length) * 100 },
        { name: 'Hostel', val: (pred.filter(c => c.hostel_available?.toLowerCase() === 'yes').length / pred.length) * 100 },
        { name: 'Transport', val: (pred.filter(c => c.transport_facility || c.transport_facilities).length / pred.length) * 100 },
        { name: 'Clubs', val: (pred.filter(c => c.clubs?.length || c.clubs_count).length / pred.length) * 100 },
    ];

    // 8. Heatmap Grid (36 districts or clusters)
    const districts = [
        'Pune', 'Mumbai', 'Nagpur', 'Nashik', 'Aurangabad', 'Solapur', 'Amravati', 'Kolhapur',
        'Sangli', 'Jalgaon', 'Akola', 'Latur', 'Dhule', 'Ahmednagar', 'Chandrapur', 'Parbhani',
        'Nanded', 'Satara', 'Bhandara', 'Beed', 'Gondia', 'Washim', 'Ratnagiri', 'Sindhudurg'
    ];
    const mapGrid = districts.map(d => ({
        id: d, name: d, val: pred.filter(c => c.district?.toLowerCase().includes(d.toLowerCase())).length
    })).sort((a, b) => b.val - a.val);

    const gems = pred.filter(c => (c.placement_rate || 0) >= 80 && (c.fees || 0) > 0 && (c.fees || 0) < 150000)
        .sort((a, b) => (b.placement_rate || 0) - (a.placement_rate || 0)).slice(0, 5);

    const catTrend = ['Most Probable', 'Best Fit', 'Good Fit', 'Stretch'].map(cat => {
        const g = byFit(cat);
        return { cat, pkg: avg(g, c => c.average_package_lpa || 0), fees: avg(g, c => c.fees || 0) / 100000 };
    });

    const scatter = pred.filter(c => (c.fees || 0) > 0 && (c.average_package_lpa || 0) > 0).map(c => ({
        x: (c.fees || 0) / 100000,
        y: c.average_package_lpa || 0,
        z: (c.placement_rate || 0),
        name: c.college_name,
        fit: c.probability_level || c.fit
    }));

    return {
        total: pred.length, mp: mp.length, bf: bf.length, gf: gf.length, st: st.length,
        moderate: bf.length + gf.length,
        avgFeesAll: avg(pred, c => c.fees || 0) / 100000,
        avgPkgAll: avg(pred, c => c.average_package_lpa || 0), avgPlcAll: avg(pred, c => c.placement_rate || 0),
        uniqueColleges: new Set(pred.map(c => c.college_code)).size, uniqueCities: Object.keys(cityMap).length,
        autonomous: pred.filter(c => c.autonomy_status?.toLowerCase().includes('auto')).length,
        affiliated: pred.length - pred.filter(c => c.autonomy_status?.toLowerCase().includes('auto')).length,
        branchRows, cityRows, distRows, feeBuckets, catTrend, gems, velocity, amenityStack, univData, mapGrid, scatter,
        safe: mp.length + bf.length, insight: `Concentrated in ${cityRows[0]?.city || 'N/A'}. ${branchRows[0]?.name || 'N/A'} is leading ROI.`,
        donut: [{ name: 'Probable', value: mp.length, fill: '#7c3aed' }, { name: 'Others', value: pred.length - mp.length, fill: '#e2e8f0' }]
    };
}

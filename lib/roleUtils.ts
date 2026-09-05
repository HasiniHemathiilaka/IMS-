import { UserRole } from '@/lib/types';

/**
 * Maps any DB role string to the canonical UserRole used by the frontend.
 *
 * The database may store roles using different conventions than the frontend
 * (e.g. "TO" instead of "LAB_TO"). This function is the single source of
 * truth for that mapping and must be used everywhere a role is persisted or
 * used for navigation.
 */
export function normalizeRole(rawRole: string): UserRole {
    const r = rawRole.toUpperCase().trim();

    // ── ADMIN ─────────────────────────────────────────────────────────────────
    if (r === 'ADMIN') return 'ADMIN';

    // ── IMO ───────────────────────────────────────────────────────────────────
    if (r === 'IMO' || r === 'INVENTORY_MANAGEMENT_OFFICER' ||
        r.startsWith('IMO')) return 'IMO';

    // ── HOD ───────────────────────────────────────────────────────────────────
    // Handles: HOD, HEAD, HEAD_OF_DEPT, HEAD_OF_DEPARTMENT, HEADOFDEPT, etc.
    if (r === 'HOD' || r === 'HEAD' || r === 'HEAD_OF_DEPT' ||
        r === 'HEAD_OF_DEPARTMENT' || r === 'HEADOFDEPT' ||
        r === 'HEADOFDEPARTMENT' || r === 'HOD_ROLE' ||
        r.includes('HEAD') || r.startsWith('HOD')) {
        return 'HOD';
    }

    // ── MA ────────────────────────────────────────────────────────────────────
    // Handles: MA, MANAGEMENT_ASSISTANT, MGT_ASST, etc.
    if (r === 'MA' || r === 'MANAGEMENT_ASSISTANT' || r === 'MGT_ASST' ||
        r === 'MGMT_ASSISTANT' || r.startsWith('MA_')) {
        return 'MA';
    }

    // ── LAB_TO (Technical Officer) ────────────────────────────────────────────
    // Handles: TO, LAB_TO, LABTO, TECH_OFFICER, LAB_TECH, etc.
    if (r === 'TO' || r === 'LAB_TO' || r === 'LABTO' ||
        r === 'TECH_OFFICER' || r === 'TECHNICAL_OFFICER' ||
        r === 'LAB_TECH' || r === 'LABTECH' ||
        (r.includes('LAB') && (r.includes('TO') || r.includes('TECH')))) {
        return 'LAB_TO';
    }

    // ── LAB_IN_CHARGE ─────────────────────────────────────────────────────────
    // Handles: IN, LIC, INCHARGE, LAB_IN_CHARGE, LAB_INCHARGE, etc.
    if (r === 'IN' || r === 'LIC' || r === 'INCHARGE' || r === 'IN_CHARGE' ||
        r === 'LAB_IN_CHARGE' || r === 'LAB_INCHARGE' ||
        r.includes('CHARGE')) {
        return 'LAB_IN_CHARGE';
    }

    // Fallback — the warn will print the exact DB string so you can add it above
    console.warn(`[normalizeRole] Unknown role: "${rawRole}" — treating as-is. Add this to roleUtils.ts normalizer.`);
    return r as UserRole;

}

/**
 * Returns the correct dashboard route for a given (already-normalized) role.
 */
export function dashboardRouteForRole(role: UserRole): string {
    const routes: Record<string, string> = {
        ADMIN: '/admin/dashboard',
        IMO: '/admin/dashboard',
        HOD: '/hod/dashboard',
        LAB_IN_CHARGE: '/lab-incharge/dashboard',
        MA: '/ma/dashboard',
        LAB_TO: '/lab-to/dashboard',
    };
    return routes[role] ?? '/login';
}

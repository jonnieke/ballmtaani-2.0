/**
 * BallMtaani Incident & Degraded State Manager
 * Ensures cached football scores, fixtures, and news render gracefully during upstream provider outages.
 */

export interface SystemIncidentState {
  footballApiDown: boolean;
  supabaseReadOnly: boolean;
  aiProviderDown: boolean;
  activeDegradedReason?: string;
}

const DEFAULT_INCIDENT_STATE: SystemIncidentState = {
  footballApiDown: false,
  supabaseReadOnly: false,
  aiProviderDown: false,
};

export function getIncidentState(): SystemIncidentState {
  if (typeof window === "undefined") return DEFAULT_INCIDENT_STATE;
  try {
    const raw = sessionStorage.getItem("ballmtaani_incident_state");
    return raw ? JSON.parse(raw) : DEFAULT_INCIDENT_STATE;
  } catch (err) {
    return DEFAULT_INCIDENT_STATE;
  }
}

export function setIncidentState(state: Partial<SystemIncidentState>): SystemIncidentState {
  const current = getIncidentState();
  const updated = { ...current, ...state };
  if (typeof window !== "undefined") {
    try {
      sessionStorage.setItem("ballmtaani_incident_state", JSON.stringify(updated));
    } catch (err) {
      console.error("Failed to set incident state:", err);
    }
  }
  return updated;
}

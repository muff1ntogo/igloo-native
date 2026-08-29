const fs = require("fs");
const f = "c:\\Users\\AJ TAN\\Desktop\\igloo-native-main\\src\\lib\\igloo-store.tsx";
let c = fs.readFileSync(f, "utf8");
const lines = c.split("\n");

// 1. Add profileReady/profileLoading to Store type
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "authLoading: boolean;") {
    lines[i] = "  authLoading: boolean;\n  profileReady: boolean;\n  profileLoading: boolean;";
    break;
  }
}

// 2. Add state variables after wantsHealthSync
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("const [wantsHealthSync, setWantsHealthSync]")) {
    lines.splice(i + 1, 0,
      "  const [profileReady, setProfileReady] = useState(false);",
      "  const [profileLoading, setProfileLoading] = useState(true);",
      "  const [familyConnections, setFamilyConnections] = useState<Array<{ inviteeId: string; relation: string; inviteeName: string; inviteeInitials: string }>>([]);",
      "  const [familyLoading, setFamilyLoading] = useState(false);"
    );
    break;
  }
}

// 3. Update profile loading useEffect - add .finally()
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes(".single()")) {
    lines[i] = lines[i].replace(".single()", ".single()\n      .then(({ data, error }) => {\n        if (error) { console.warn(\"[Igloo] Load profile error:\", error.message); return; }\n        if (data) {\n          setProfile(data);\n          if (!data.dob) setOnboardingComplete(false);\n          else setOnboardingComplete(true);\n        }\n      })\n      .finally(() => { setProfileReady(true); setProfileLoading(false); });");
    // Remove the old lines that are now replaced
    for (let j = i + 1; j < lines.length && j < i + 12; j++) {
      if (lines[j].includes("if (error)") || lines[j].includes("if (data)") || lines[j].includes("setProfile(data)") || lines[j].includes("setOnboardingComplete") || lines[j].includes("});")) {
        lines.splice(j, 1);
        j--;
      }
    }
    break;
  }
}

// 4. Add loadFamily after the useEffect that calls loadReadings/loadMeds
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("}, [user?.id, loadReadings, loadMeds]);")) {
    lines.splice(i + 1, 0,
      "",
      "  const loadFamily = useCallback(async () => {",
      "    if (!user?.id) { setFamilyConnections([]); setFamilyLoading(false); return; }",
      "    setFamilyLoading(true);",
      "    const { data: conns, error: connErr } = await supabase",
      "      .from(\"family_connections\")",
      "      .select(\"invitee_id, relation\")",
      "      .eq(\"inviter_id\", user.id);",
      "    if (connErr) { console.warn(\"[Igloo] Load family:\", connErr.message); setFamilyLoading(false); return; }",
      "    if (!conns || conns.length === 0) { setFamilyConnections([]); setFamilyLoading(false); return; }",
      "    const ids = conns.map((x) => x.invitee_id);",
      "    const { data: profiles } = await supabase.from(\"profiles\").select(\"id, name\").in(\"id\", ids);",
      "    const map = {};",
      "    (profiles ?? []).forEach((p) => { map[p.id] = p.name; });",
      "    setFamilyConnections(conns.map((x) => ({",
      "      inviteeId: x.invitee_id,",
      "      relation: x.relation,",
      "      inviteeName: map[x.invitee_id] ?? \"Unknown\",",
      "      inviteeInitials: (map[x.invitee_id] ?? \"U\").split(\" \").map((w) => w[0]).join(\"\").toUpperCase().slice(0, 2),",
      "    })));",
      "    setFamilyLoading(false);",
      "  }, [user?.id]);",
      "",
      "  useEffect(() => { loadFamily(); }, [loadFamily]);"
    );
    break;
  }
}

// 5. Update toggleShared in value object
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("toggleShared: (m) => setShared")) {
    lines[i] = "    shared,";
    lines.splice(i + 1, 0,
      "    toggleShared: async (m) => {",
      "      const current = shared[m];",
      "      setShared((p) => ({ ...p, [m]: !p[m] }));",
      "      if (!user?.id || familyConnections.length === 0) return;",
      "      const { error } = await supabase",
      "        .from(\"sharing_permissions\")",
      "        .upsert(familyConnections.map((fc) => ({",
      "          inviter_id: user.id,",
      "          family_id: fc.inviteeId,",
      "          metric: m,",
      "          shared: !current,",
      "        })), { onConflict: \"inviter_id,family_id,metric\" });",
      "      if (error) console.warn(\"[Igloo] Toggle shared:\", error.message);",
      "    },"
    );
    break;
  }
}

// 6. Add family fields after wantsHealthSync in value object
for (let i = 0; i < lines.length; i++) {
  if (lines[i].trim() === "wantsHealthSync,") {
    lines.splice(i + 1, 0,
      "    familyConnections,",
      "    familyLoading,",
      "    inviteFamily: async (email, relation) => {",
      "      if (!user?.id) return { success: false, error: \"Not authenticated\" };",
      "      const { data: uid } = await supabase.rpc(\"find_user_id_by_email\", { lookup_email: email });",
      "      if (!uid) return { success: false, error: \"No Igloo account with that email\" };",
      "      const { error: e1 } = await supabase.from(\"family_connections\").insert({ inviter_id: user.id, invitee_id: uid, relation });",
      "      if (e1) return { success: false, error: e1.message };",
      "      const { error: e2 } = await supabase.from(\"sharing_permissions\").upsert(",
      "        METRIC_ORDER.map((m) => ({ inviter_id: user.id, family_id: uid, metric: m, shared: shared[m] ?? true })),",
      "        { onConflict: \"inviter_id,family_id,metric\" }",
      "      );",
      "      if (e2) console.warn(\"[Igloo] Seed permissions:\", e2.message);",
      "      await loadFamily();",
      "      return { success: true };",
      "    },",
      "    removeFamily: async (inviteeId) => {",
      "      if (!user?.id) return;",
      "      await supabase.from(\"family_connections\").delete().match({ inviter_id: user.id, invitee_id: inviteeId });",
      "      await supabase.from(\"sharing_permissions\").delete().match({ inviter_id: user.id, family_id: inviteeId });",
      "      setFamilyConnections((prev) => prev.filter((fc) => fc.inviteeId !== inviteeId));",
      "    },"
    );
    break;
  }
}

// 7. Update useMemo deps
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes("wantsHealthSync, signOut, preferences]")) {
    lines[i] = lines[i].replace("wantsHealthSync, signOut, preferences]", "wantsHealthSync, signOut, preferences, familyConnections, loadFamily]");
    break;
  }
}

fs.writeFileSync(f, lines.join("\n"), "utf8");
console.log("Done, lines:", lines.length);

import { getRuntimeSettings } from "./runtimeSettings.js";

function apiBase(panelUrl) {
  return panelUrl.replace(/\/$/, "") + "/api/application";
}

async function pteroCall(path, method, body) {
  const settings = await getRuntimeSettings();
  const url = apiBase(settings.pterodactyl.panelUrl) + path;
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
      "Accept": "Application/vnd.pterodactyl.v1+json",
      "Authorization": `Bearer ${settings.pterodactyl.appApiKey}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(`Pterodactyl API error ${res.status}: ${JSON.stringify(json)}`);
  }
  return json;
}

export function randomPassword(len = 12) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%";
  let out = "";
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function createPanelUser({ username, email, firstName, lastName, password, isAdmin = false }) {
  const body = {
    email,
    username,
    first_name: firstName || "Elaina",
    last_name: lastName || "Store",
    password,
    root_admin: Boolean(isAdmin),
  };
  const json = await pteroCall("/users", "POST", body);
  return json?.attributes || null;
}

export async function createPanelServer({ userId, eggId, name, memory, disk, cpu, allocationId, nestId }) {
  const settings = await getRuntimeSettings();
  const def = settings.pterodactyl.defaultServer;

  const body = {
    name: name || "Elaina Server",
    user: userId,
    egg: eggId,
    docker_image: "ghcr.io/pterodactyl/yolks:nodejs_20", // default; egg may override on panel side
    startup: "",
    environment: {},
    limits: {
      memory: memory ?? def.memory,
      swap: def.swap,
      disk: disk ?? def.disk,
      io: def.io,
      cpu: cpu ?? def.cpu,
      threads: def.threads,
    },
    feature_limits: {
      databases: def.databases,
      allocations: def.allocations,
      backups: def.backups,
    },
    allocation: {
      default: allocationId ?? settings.pterodactyl.allocationId,
    },
    deploy: {
      locations: [settings.pterodactyl.locationId],
      dedicated_ip: false,
      port_range: [],
    },
  };

  const json = await pteroCall("/servers", "POST", body);
  return json?.attributes || null;
}
